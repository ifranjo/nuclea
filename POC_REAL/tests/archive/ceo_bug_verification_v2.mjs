/**
 * CEO Bug Verification Test Suite v2 — with more wait time and diagnostics
 * Run: node tests/ceo_bug_verification_v2.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'ceo_qa');
const BASE_URL = 'http://localhost:3002';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];

function report(testNum, name, pass, details) {
  const status = pass ? 'PASS' : 'FAIL';
  results.push({ testNum, name, status, details });
  console.log(`\nTEST ${testNum}: ${name} — ${status}`);
  console.log(`  What happened: ${details}`);
}

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  Screenshot: ${name}.png`);
  return filepath;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ═══════════════════════════════════════════════════════
  // TEST 1: Login works (baseline)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 1: Login works (baseline)');
    console.log('══════════════════════════════════════');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await screenshot(page, 'T1_01_login_page');

    // Click Homer quick-fill button
    await page.click('button:has-text("Homer")');
    await sleep(500);

    // Click Entrar
    await page.click('button:has-text("Entrar")');

    // Wait for redirect to dashboard — longer timeout
    await page.waitForURL('**/dashboard**', { timeout: 15000 });

    // Wait for content to load (auth + capsules)
    // Try waiting for either the capsule grid OR the "no capsules" message OR "Cargando" to disappear
    try {
      await page.waitForFunction(() => {
        const body = document.body.textContent || '';
        return !body.includes('Cargando...');
      }, { timeout: 10000 });
    } catch {
      console.log('  Warning: "Cargando..." still visible after 10s');
    }

    await sleep(1000);
    await screenshot(page, 'T1_02_dashboard_homer');

    const pageText = await page.textContent('body');
    const hasCargando = pageText.includes('Cargando...');
    const url = page.url();
    const isDashboard = url.includes('/dashboard');

    // More robust capsule detection
    const capsuleLinks = await page.$$('a[href*="/capsule/"]');
    const hasContent = pageText.includes('Mis cápsulas') || pageText.includes('primera cápsula');

    if (isDashboard && !hasCargando && (capsuleLinks.length > 0 || hasContent)) {
      report(1, 'Login works (baseline)', true,
        `Dashboard loaded at ${url}. Found ${capsuleLinks.length} capsule links. Content visible. No stuck "Cargando...".`);
    } else {
      report(1, 'Login works (baseline)', false,
        `Dashboard: ${isDashboard}, Cargando stuck: ${hasCargando}, Capsule links: ${capsuleLinks.length}, Has content: ${hasContent}. Page text start: "${pageText.substring(0, 100)}"`);
    }
  } catch (e) {
    await screenshot(page, 'T1_ERROR');
    report(1, 'Login works (baseline)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // TEST 2: Settings page loads (BUG #3 fix)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 2: Settings page loads (BUG #3)');
    console.log('══════════════════════════════════════');

    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });

    // Wait for loading to finish
    try {
      await page.waitForFunction(() => {
        const body = document.body.textContent || '';
        return !body.includes('Cargando...');
      }, { timeout: 10000 });
    } catch {
      console.log('  Warning: Still loading after 10s');
    }

    await sleep(1000);
    await screenshot(page, 'T2_01_settings_page');

    const bodyText = await page.textContent('body');
    const hasCargando = bodyText.includes('Cargando...');
    const hasCerrarSesion = bodyText.includes('Cerrar sesión');
    const hasAjustes = bodyText.includes('Ajustes');

    if (!hasCargando && hasCerrarSesion) {
      report(2, 'Settings page loads (BUG #3)', true,
        `Settings loaded. "Cerrar sesión" visible. "Ajustes" header: ${hasAjustes}. No stuck loading.`);
    } else {
      report(2, 'Settings page loads (BUG #3)', false,
        `Cargando stuck: ${hasCargando}, Cerrar sesión: ${hasCerrarSesion}, Ajustes: ${hasAjustes}. Body start: "${bodyText.substring(0, 100)}"`);
    }
  } catch (e) {
    await screenshot(page, 'T2_ERROR');
    report(2, 'Settings page loads (BUG #3)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // TEST 3: Capsule detail + Share button (BUG #1 fix)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 3: Capsule detail + Share (BUG #1)');
    console.log('══════════════════════════════════════');

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });

    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
    } catch {}
    await sleep(1000);

    // Click first capsule link
    const capsuleLink = await page.$('a[href*="/capsule/"]');
    if (capsuleLink) {
      await capsuleLink.click();
      await page.waitForURL('**/capsule/**', { timeout: 10000 });

      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
      } catch {}
      await sleep(1000);
      await screenshot(page, 'T3_01_capsule_detail');

      // Look for Compartir button
      const compartirBtn = await page.$('button:has-text("Compartir")');
      if (compartirBtn) {
        await compartirBtn.scrollIntoViewIfNeeded();
        await compartirBtn.click();
        await sleep(2000);
        await screenshot(page, 'T3_02_share_clicked');

        const bodyText = await page.textContent('body');
        const hasShareUrl = bodyText.includes('/share/') || bodyText.includes('copiado');
        const shareInput = await page.$('input[readonly], input[value*="share"]');

        if (hasShareUrl || shareInput) {
          report(3, 'Capsule detail + Share (BUG #1)', true,
            `Share button clicked. Share URL/confirmation visible.`);
        } else {
          report(3, 'Capsule detail + Share (BUG #1)', false,
            `Share clicked but no URL/confirmation. Body snippet: "${bodyText.substring(0, 200)}"`);
        }
      } else {
        const allButtons = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()));
        report(3, 'Capsule detail + Share (BUG #1)', false,
          `No "Compartir" button. Available buttons: ${allButtons.join(', ')}`);
      }
    } else {
      const bodyText = await page.textContent('body');
      report(3, 'Capsule detail + Share (BUG #1)', false,
        `No capsule link on dashboard. Body: "${bodyText.substring(0, 150)}"`);
    }
  } catch (e) {
    await screenshot(page, 'T3_ERROR');
    report(3, 'Capsule detail + Share (BUG #1)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // TEST 4: Logout works WITHOUT crashing (BUG #5/#6/#7)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 4: Logout works (BUG #5/#6/#7)');
    console.log('══════════════════════════════════════');

    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });

    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
    } catch {}
    await sleep(1000);

    // Click Cerrar sesión
    const logoutBtn = await page.$('button:has-text("Cerrar sesión")');
    if (logoutBtn) {
      await logoutBtn.click();

      // Wait for navigation to login
      try {
        await page.waitForURL('**/login**', { timeout: 10000 });
      } catch {}
      await sleep(2000);
      await screenshot(page, 'T4_01_after_logout');

      const url = page.url();
      const bodyText = await page.textContent('body');
      const isLoginPage = url.includes('/login');
      const hasServerError = bodyText.includes('Internal Server Error');
      const hasNuclea = bodyText.includes('NUCLEA');

      if (isLoginPage && !hasServerError && hasNuclea) {
        report(4, 'Logout works (BUG #5/#6/#7)', true,
          `Redirected to ${url}. Login page with NUCLEA branding. No server error.`);
      } else {
        report(4, 'Logout works (BUG #5/#6/#7)', false,
          `URL: ${url}, Login: ${isLoginPage}, Server error: ${hasServerError}, NUCLEA: ${hasNuclea}`);
      }
    } else {
      // Maybe redirected to login already (middleware)
      const url = page.url();
      const bodyText = await page.textContent('body');
      await screenshot(page, 'T4_01_no_logout_btn');
      report(4, 'Logout works (BUG #5/#6/#7)', false,
        `No "Cerrar sesión" button found on ${url}. Body: "${bodyText.substring(0, 100)}"`);
    }
  } catch (e) {
    await screenshot(page, 'T4_ERROR');
    report(4, 'Logout works (BUG #5/#6/#7)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // TEST 5: Login again after logout (BUG #6/#7)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 5: Login again after logout (BUG #6/#7)');
    console.log('══════════════════════════════════════');

    // Ensure we're on login page
    if (!page.url().includes('/login')) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    }
    await sleep(1000);

    // Check if login buttons are visible
    const bartBtn = await page.$('button:has-text("Bart")');
    if (!bartBtn) {
      await screenshot(page, 'T5_no_bart_btn');
      const bodyText = await page.textContent('body');
      report(5, 'Login again after logout (BUG #6/#7)', false,
        `No "Bart" button found. Page URL: ${page.url()}. Body: "${bodyText.substring(0, 100)}"`);
    } else {
      await bartBtn.click();
      await sleep(500);
      await page.click('button:has-text("Entrar")');

      try {
        await page.waitForURL('**/dashboard**', { timeout: 15000 });
      } catch {}

      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
      } catch {}

      await sleep(1000);
      await screenshot(page, 'T5_01_dashboard_bart');

      const bodyText = await page.textContent('body');
      const hasCargando = bodyText.includes('Cargando...');
      const hasError = bodyText.includes('Internal Server Error');
      const url = page.url();

      if (url.includes('/dashboard') && !hasCargando && !hasError) {
        report(5, 'Login again after logout (BUG #6/#7)', true,
          `Bart's dashboard loaded at ${url}. No stuck loading, no errors.`);
      } else {
        report(5, 'Login again after logout (BUG #6/#7)', false,
          `URL: ${url}, Cargando: ${hasCargando}, Error: ${hasError}. Body: "${bodyText.substring(0, 100)}"`);
      }
    }
  } catch (e) {
    await screenshot(page, 'T5_ERROR');
    report(5, 'Login again after logout (BUG #6/#7)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // TEST 6: Navigate away and back to dashboard (BUG #4)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 6: Navigate away and back (BUG #4)');
    console.log('══════════════════════════════════════');

    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await sleep(2000);

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });

    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
    } catch {}

    await sleep(1000);
    await screenshot(page, 'T6_01_dashboard_return');

    const bodyText = await page.textContent('body');
    const hasCargando = bodyText.includes('Cargando...');
    const url = page.url();

    if (url.includes('/dashboard') && !hasCargando) {
      report(6, 'Navigate away and back (BUG #4)', true,
        `Dashboard reloaded at ${url}. No stuck "Cargando...".`);
    } else {
      report(6, 'Navigate away and back (BUG #4)', false,
        `URL: ${url}, Cargando stuck: ${hasCargando}. Body: "${bodyText.substring(0, 100)}"`);
    }
  } catch (e) {
    await screenshot(page, 'T6_ERROR');
    report(6, 'Navigate away and back (BUG #4)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // TEST 7: Onboarding P4 capsule selection (BUG #2)
  // ═══════════════════════════════════════════════════════
  try {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 7: Onboarding P4 capsule selection (BUG #2)');
    console.log('══════════════════════════════════════');

    await page.goto(`${BASE_URL}/onboarding?step=4`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, 'T7_01_onboarding_p4');

    const bodyText = await page.textContent('body');
    console.log(`  Page text: "${bodyText.substring(0, 200)}"`);

    // Try multiple selectors for capsule type cards
    let clicked = false;

    // Try clicking any card-like element with capsule type names
    const typeNames = ['Legacy', 'Legado', 'Together', 'Social', 'Mascota', 'Origen', 'Capítulo'];
    for (const name of typeNames) {
      const el = await page.$(`text="${name}"`);
      if (el) {
        await el.click();
        clicked = true;
        console.log(`  Clicked card with text "${name}"`);
        break;
      }
    }

    if (!clicked) {
      // Try any button or clickable div
      const clickable = await page.$('button, [role="button"], div[class*="cursor-pointer"], div[class*="hover\\:"]');
      if (clickable) {
        await clickable.click();
        clicked = true;
        console.log('  Clicked first clickable element');
      }
    }

    if (clicked) {
      await sleep(3000);
      await screenshot(page, 'T7_02_after_click');

      const url = page.url();
      const stuckOnP4 = url.includes('step=4');
      const redirectedCapsule = url.includes('/capsule/');
      const redirectedLogin = url.includes('/login');
      const redirectedDashboard = url.includes('/dashboard');

      if (redirectedCapsule || redirectedLogin || redirectedDashboard || !stuckOnP4) {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
          `Capsule type clicked. Navigated to ${url}. Not stuck on selection.`);
      } else {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
          `Stuck on ${url} after clicking capsule type.`);
      }
    } else {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
        `Could not find any capsule type card to click. Page content: "${bodyText.substring(0, 200)}"`);
    }
  } catch (e) {
    await screenshot(page, 'T7_ERROR');
    report(7, 'Onboarding P4 capsule selection (BUG #2)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════
  console.log('\n\n══════════════════════════════════════');
  console.log('        FINAL RESULTS SUMMARY');
  console.log('══════════════════════════════════════\n');

  let passCount = 0;
  for (const r of results) {
    console.log(`  TEST ${r.testNum}: ${r.name} — ${r.status}`);
    console.log(`    ${r.details}\n`);
    if (r.status === 'PASS') passCount++;
  }

  console.log(`══════════════════════════════════════`);
  console.log(`  TOTAL: ${passCount}/7 PASS, ${7 - passCount}/7 FAIL`);
  console.log(`══════════════════════════════════════\n`);

  if (consoleErrors.length > 0) {
    console.log(`  Console errors (${consoleErrors.length}):`);
    for (const e of consoleErrors.slice(0, 15)) {
      console.log(`    - ${e.substring(0, 200)}`);
    }
  }

  await browser.close();
})();
