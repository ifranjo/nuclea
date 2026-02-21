/**
 * CEO Bug Verification Test Suite v3
 * Fixed: Use fill() to type credentials instead of quick-fill buttons
 * Run: node tests/ceo_bug_verification_v3.mjs
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

async function loginAs(page, name) {
  const email = `${name.toLowerCase()}@nuclea.test`;
  const password = 'nuclea123';

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await sleep(500);

  // Click the quick-fill button first (sets React state)
  const quickBtn = await page.$(`button:has-text("${name}")`);
  if (quickBtn) {
    await quickBtn.click();
    await sleep(300);
  }

  // Then also fill the inputs directly to be sure
  const emailInput = await page.$('input[type="email"]');
  const pwInput = await page.$('input[type="password"]');
  if (emailInput) {
    await emailInput.fill(email);
  }
  if (pwInput) {
    await pwInput.fill(password);
  }
  await sleep(300);

  // Click Entrar
  await page.click('button[type="submit"]');

  // Wait for navigation away from /login
  try {
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
  } catch {
    // may have stayed on login due to error
  }

  // Wait for content to load
  try {
    await page.waitForFunction(() => {
      const body = document.body.textContent || '';
      return !body.includes('Cargando...');
    }, { timeout: 10000 });
  } catch {}

  await sleep(1000);
}

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

    await loginAs(page, 'Homer');
    await screenshot(page, 'T1_02_dashboard_homer');

    const url = page.url();
    const pageText = await page.textContent('body');
    const hasCargando = pageText.includes('Cargando...');
    const isDashboard = url.includes('/dashboard');
    const capsuleLinks = await page.$$('a[href*="/capsule/"]');
    const hasContent = pageText.includes('Mis cápsulas') || pageText.includes('primera cápsula');

    if (isDashboard && !hasCargando && (capsuleLinks.length > 0 || hasContent)) {
      report(1, 'Login works (baseline)', true,
        `Dashboard loaded at ${url}. ${capsuleLinks.length} capsule links. Content visible.`);
    } else {
      report(1, 'Login works (baseline)', false,
        `URL: ${url}, Dashboard: ${isDashboard}, Cargando: ${hasCargando}, Links: ${capsuleLinks.length}, Content: ${hasContent}. Body: "${pageText.substring(0, 150)}"`);
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

    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
    } catch {}
    await sleep(1000);
    await screenshot(page, 'T2_01_settings_page');

    const bodyText = await page.textContent('body');
    const url = page.url();

    // Check if we got redirected to login (means session lost)
    if (url.includes('/login')) {
      report(2, 'Settings page loads (BUG #3)', false,
        `Redirected to login — session not persisting. URL: ${url}`);
    } else {
      const hasCargando = bodyText.includes('Cargando...');
      const hasCerrarSesion = bodyText.includes('Cerrar sesión');
      const hasAjustes = bodyText.includes('Ajustes');

      if (!hasCargando && hasCerrarSesion) {
        report(2, 'Settings page loads (BUG #3)', true,
          `Settings loaded. "Cerrar sesión" visible. Ajustes header: ${hasAjustes}.`);
      } else {
        report(2, 'Settings page loads (BUG #3)', false,
          `Cargando: ${hasCargando}, Cerrar sesión: ${hasCerrarSesion}, Ajustes: ${hasAjustes}. Body: "${bodyText.substring(0, 150)}"`);
      }
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

    const url = page.url();
    if (url.includes('/login')) {
      // Re-login
      await loginAs(page, 'Homer');
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
      } catch {}
      await sleep(1000);
    }

    const capsuleLink = await page.$('a[href*="/capsule/"]');
    if (capsuleLink) {
      const href = await capsuleLink.getAttribute('href');
      console.log(`  Found capsule link: ${href}`);
      await capsuleLink.click();
      await page.waitForURL('**/capsule/**', { timeout: 10000 });

      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
      } catch {}
      await sleep(1000);
      await screenshot(page, 'T3_01_capsule_detail');

      // Look for Compartir/Share button
      const compartirBtn = await page.$('button:has-text("Compartir")');
      if (compartirBtn) {
        await compartirBtn.scrollIntoViewIfNeeded();
        await compartirBtn.click();
        await sleep(2000);
        await screenshot(page, 'T3_02_share_clicked');

        const bodyText = await page.textContent('body');
        const hasShareUrl = bodyText.includes('/share/') || bodyText.includes('copiado') || bodyText.includes('Copiado');
        const shareInput = await page.$('input[readonly], input[value*="share"]');

        if (hasShareUrl || shareInput) {
          report(3, 'Capsule detail + Share (BUG #1)', true,
            `Share button clicked. Share URL or confirmation visible.`);
        } else {
          report(3, 'Capsule detail + Share (BUG #1)', false,
            `Share clicked but no URL/confirmation. Body: "${bodyText.substring(0, 200)}"`);
        }
      } else {
        const allBtns = await page.$$eval('button', bs => bs.map(b => b.textContent.trim()));
        report(3, 'Capsule detail + Share (BUG #1)', false,
          `No "Compartir" button. Buttons: [${allBtns.join(', ')}]`);
      }
    } else {
      const bodyText = await page.textContent('body');
      report(3, 'Capsule detail + Share (BUG #1)', false,
        `No capsule link found. Body: "${bodyText.substring(0, 150)}"`);
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
    const settingsUrl = page.url();

    if (settingsUrl.includes('/login')) {
      await loginAs(page, 'Homer');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    }

    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 10000 });
    } catch {}
    await sleep(1000);

    const logoutBtn = await page.$('button:has-text("Cerrar sesión")');
    if (logoutBtn) {
      await logoutBtn.click();

      // Wait for navigation — could go to /login via router or window.location
      await sleep(3000);
      // Also wait for any page load
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {}

      await screenshot(page, 'T4_01_after_logout');

      const url = page.url();
      const bodyText = await page.textContent('body');
      const isLoginPage = url.includes('/login');
      const hasServerError = bodyText.includes('Internal Server Error');
      const hasNuclea = bodyText.includes('NUCLEA');

      if (isLoginPage && !hasServerError && hasNuclea) {
        report(4, 'Logout works (BUG #5/#6/#7)', true,
          `Redirected to ${url}. Login renders with NUCLEA. No server error.`);
      } else {
        report(4, 'Logout works (BUG #5/#6/#7)', false,
          `URL: ${url}, Login: ${isLoginPage}, Error: ${hasServerError}, NUCLEA: ${hasNuclea}. Body: "${bodyText.substring(0, 100)}"`);
      }
    } else {
      await screenshot(page, 'T4_no_btn');
      const bodyText = await page.textContent('body');
      report(4, 'Logout works (BUG #5/#6/#7)', false,
        `No logout button on ${page.url()}. Body: "${bodyText.substring(0, 100)}"`);
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

    // Ensure on login page
    if (!page.url().includes('/login')) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    }
    await sleep(500);

    await loginAs(page, 'Bart');
    await screenshot(page, 'T5_01_dashboard_bart');

    const url = page.url();
    const bodyText = await page.textContent('body');
    const hasCargando = bodyText.includes('Cargando...');
    const hasError = bodyText.includes('Internal Server Error');
    const isDashboard = url.includes('/dashboard');

    if (isDashboard && !hasCargando && !hasError) {
      report(5, 'Login again after logout (BUG #6/#7)', true,
        `Bart's dashboard loaded at ${url}. No stuck loading, no errors.`);
    } else {
      report(5, 'Login again after logout (BUG #6/#7)', false,
        `URL: ${url}, Cargando: ${hasCargando}, Error: ${hasError}. Body: "${bodyText.substring(0, 100)}"`);
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

    // Should be on dashboard
    if (!page.url().includes('/dashboard')) {
      await loginAs(page, 'Bart');
    }

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
        `Dashboard reloaded at ${url}. No stuck loading.`);
    } else {
      report(6, 'Navigate away and back (BUG #4)', false,
        `URL: ${url}, Cargando: ${hasCargando}. Body: "${bodyText.substring(0, 100)}"`);
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
    console.log(`  Page content: "${bodyText.substring(0, 250)}"`);

    // Click the first capsule type card — look for the actual card elements
    let clicked = false;

    // Try clicking by the card text content
    const legacyCard = await page.$('text="Cápsula Legacy"');
    if (legacyCard) {
      await legacyCard.click();
      clicked = true;
      console.log('  Clicked "Cápsula Legacy" text');
    }

    if (!clicked) {
      // Try clicking parent of text
      const cards = await page.$$('div >> text=/Legacy|Legado/');
      if (cards.length > 0) {
        await cards[0].click();
        clicked = true;
        console.log('  Clicked Legacy card via text match');
      }
    }

    if (!clicked) {
      // Broad: click first link or button-like element in the capsule grid
      const gridItems = await page.$$('div[class*="grid"] > div, div[class*="grid"] > button, div[class*="grid"] > a');
      if (gridItems.length > 0) {
        await gridItems[0].click();
        clicked = true;
        console.log(`  Clicked first grid item (of ${gridItems.length})`);
      }
    }

    if (clicked) {
      await sleep(4000);
      await screenshot(page, 'T7_02_after_click');
      const url = page.url();
      const stuckOnP4 = url.includes('step=4');

      if (!stuckOnP4) {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
          `Capsule type clicked. Navigated to ${url}.`);
      } else {
        // Check if something happened on the page (modal, feedback, etc)
        const newBody = await page.textContent('body');
        const changed = newBody !== bodyText;
        report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
          `Still on step=4 after click. Page content changed: ${changed}. URL: ${url}`);
      }
    } else {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
        `Could not find capsule type card to click.`);
    }
  } catch (e) {
    await screenshot(page, 'T7_ERROR');
    report(7, 'Onboarding P4 capsule selection (BUG #2)', false, `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('              FINAL RESULTS SUMMARY');
  console.log('══════════════════════════════════════════════════════\n');

  let passCount = 0;
  for (const r of results) {
    const mark = r.status === 'PASS' ? '[PASS]' : '[FAIL]';
    console.log(`  ${mark} TEST ${r.testNum}: ${r.name}`);
    console.log(`         ${r.details}\n`);
    if (r.status === 'PASS') passCount++;
  }

  console.log(`══════════════════════════════════════════════════════`);
  console.log(`  SCORE: ${passCount}/7 PASS, ${7 - passCount}/7 FAIL`);
  console.log(`══════════════════════════════════════════════════════\n`);

  if (consoleErrors.length > 0) {
    console.log(`  Browser console errors (${consoleErrors.length}):`);
    const unique = [...new Set(consoleErrors.map(e => e.substring(0, 120)))];
    for (const e of unique.slice(0, 10)) {
      console.log(`    - ${e}`);
    }
  }

  // Save results JSON
  const resultsPath = path.join(SCREENSHOT_DIR, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({ results, consoleErrors: consoleErrors.slice(0, 20) }, null, 2));
  console.log(`\n  Results saved to ${resultsPath}`);

  await browser.close();
})();
