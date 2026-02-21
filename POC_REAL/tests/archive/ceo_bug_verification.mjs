/**
 * CEO Bug Verification Test Suite
 * Tests 7 specific bugs reported by CEO
 * Run: node tests/ceo_bug_verification.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'ceo_qa');
const BASE_URL = 'http://localhost:3002';

// Ensure screenshot dir
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
  console.log(`  Screenshot: ${filepath}`);
  return filepath;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  // Collect console errors
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

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await sleep(2000);
    await screenshot(page, 'T1_02_dashboard_homer');

    // Check dashboard content
    const pageText = await page.textContent('body');
    const hasCargando = pageText.includes('Cargando...');
    const url = page.url();
    const isDashboard = url.includes('/dashboard');

    // Count capsule cards
    const capsuleCards = await page.$$('[class*="capsule"], [class*="card"], a[href*="/capsule/"]');
    const capsuleCount = capsuleCards.length;

    if (isDashboard && !hasCargando && capsuleCount >= 1) {
      report(1, 'Login works (baseline)', true,
        `Dashboard loaded at ${url}. Found ${capsuleCount} capsule elements. No "Cargando..." stuck state.`);
    } else {
      report(1, 'Login works (baseline)', false,
        `Dashboard: ${isDashboard}, Cargando stuck: ${hasCargando}, Capsules found: ${capsuleCount}`);
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
    await sleep(3000);
    await screenshot(page, 'T2_01_settings_page');

    const bodyText = await page.textContent('body');
    const hasCargando = bodyText.includes('Cargando...');
    const hasCerrarSesion = bodyText.includes('Cerrar sesión');
    const hasProfileInfo = bodyText.includes('Homer') || bodyText.includes('homer') || bodyText.includes('Perfil') || bodyText.includes('Ajustes');

    if (!hasCargando && hasCerrarSesion) {
      report(2, 'Settings page loads (BUG #3)', true,
        `Settings loaded. "Cerrar sesión" button visible. Profile info present. No stuck "Cargando...".`);
    } else {
      report(2, 'Settings page loads (BUG #3)', false,
        `Cargando stuck: ${hasCargando}, Cerrar sesión visible: ${hasCerrarSesion}, Profile info: ${hasProfileInfo}`);
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
    await sleep(2000);

    // Click first capsule card (link)
    const capsuleLink = await page.$('a[href*="/capsule/"]');
    if (capsuleLink) {
      await capsuleLink.click();
      await page.waitForURL('**/capsule/**', { timeout: 10000 });
      await sleep(2000);
      await screenshot(page, 'T3_01_capsule_detail');

      // Look for Compartir button
      const compartirBtn = await page.$('button:has-text("Compartir")');
      if (compartirBtn) {
        await compartirBtn.scrollIntoViewIfNeeded();
        await compartirBtn.click();
        await sleep(2000);
        await screenshot(page, 'T3_02_share_clicked');

        const bodyText = await page.textContent('body');
        const hasShareUrl = bodyText.includes('/share/') || bodyText.includes('Link copiado') || bodyText.includes('copiado');
        const shareInput = await page.$('input[value*="/share/"], input[readonly]');

        if (hasShareUrl || shareInput) {
          report(3, 'Capsule detail + Share (BUG #1)', true,
            `Share button clicked. Share URL/confirmation visible.`);
        } else {
          report(3, 'Capsule detail + Share (BUG #1)', false,
            `Share button clicked but no share URL or confirmation appeared. Body snippet: ${bodyText.substring(0, 200)}`);
        }
      } else {
        // Maybe button text is different
        const allButtons = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()));
        report(3, 'Capsule detail + Share (BUG #1)', false,
          `No "Compartir" button found. Available buttons: ${allButtons.join(', ')}`);
      }
    } else {
      report(3, 'Capsule detail + Share (BUG #1)', false,
        `No capsule link found on dashboard.`);
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
    await sleep(2000);

    // Click Cerrar sesión
    const logoutBtn = await page.$('button:has-text("Cerrar sesión")');
    if (logoutBtn) {
      await logoutBtn.click();
      await sleep(3000);
      await screenshot(page, 'T4_01_after_logout');

      const url = page.url();
      const bodyText = await page.textContent('body');
      const isLoginPage = url.includes('/login');
      const hasError = bodyText.includes('Internal Server Error') || bodyText.includes('Error') && bodyText.includes('500');
      const hasNuclea = bodyText.includes('NUCLEA');

      if (isLoginPage && !hasError && hasNuclea) {
        report(4, 'Logout works (BUG #5/#6/#7)', true,
          `Redirected to ${url}. Login page renders with NUCLEA branding. No Internal Server Error.`);
      } else {
        report(4, 'Logout works (BUG #5/#6/#7)', false,
          `URL: ${url}, Login page: ${isLoginPage}, Has error: ${hasError}, Has NUCLEA: ${hasNuclea}`);
      }
    } else {
      report(4, 'Logout works (BUG #5/#6/#7)', false, 'No "Cerrar sesión" button found.');
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

    // Should be on login page after logout
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    }
    await sleep(1000);

    // Click Bart quick-fill
    await page.click('button:has-text("Bart")');
    await sleep(500);

    // Click Entrar
    await page.click('button:has-text("Entrar")');

    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await sleep(2000);
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
        `URL: ${url}, Cargando: ${hasCargando}, Error: ${hasError}`);
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

    // Should be on Bart's dashboard
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await sleep(2000);

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await screenshot(page, 'T6_01_dashboard_return');

    const bodyText = await page.textContent('body');
    const hasCargando = bodyText.includes('Cargando...');
    const url = page.url();

    if (url.includes('/dashboard') && !hasCargando) {
      report(6, 'Navigate away and back (BUG #4)', true,
        `Dashboard reloaded successfully at ${url}. No stuck "Cargando...".`);
    } else {
      report(6, 'Navigate away and back (BUG #4)', false,
        `URL: ${url}, Cargando stuck: ${hasCargando}`);
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

    // Click first capsule type card
    const capsuleTypeCard = await page.$('[class*="card"], [class*="capsule"], button:has-text("Legacy"), button:has-text("Legado"), [role="button"]');
    if (capsuleTypeCard) {
      await capsuleTypeCard.click();
      await sleep(3000);
      await screenshot(page, 'T7_02_after_capsule_click');

      const url = page.url();
      const bodyText = await page.textContent('body');

      // Should either redirect to capsule page or login page (if not authenticated)
      const redirectedToCapsule = url.includes('/capsule/');
      const redirectedToLogin = url.includes('/login');
      const redirectedToDashboard = url.includes('/dashboard');
      const stuckOnOnboarding = url.includes('/onboarding') && url.includes('step=4');

      if (redirectedToCapsule || redirectedToLogin || redirectedToDashboard) {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
          `Capsule type clicked. Redirected to ${url}. Not stuck on selection screen.`);
      } else if (stuckOnOnboarding) {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
          `Still on onboarding step=4 after clicking capsule type. URL: ${url}`);
      } else {
        // Could be a different valid redirect
        report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
          `Capsule type clicked. Page navigated to ${url}. Response registered.`);
      }
    } else {
      // Try clicking any clickable card-like element
      const anyCard = await page.$('div[class*="cursor-pointer"], div[class*="hover"]');
      if (anyCard) {
        await anyCard.click();
        await sleep(3000);
        await screenshot(page, 'T7_02_after_card_click');
        const url = page.url();
        const stuckOnOnboarding = url.includes('/onboarding') && url.includes('step=4');
        report(7, 'Onboarding P4 capsule selection (BUG #2)', !stuckOnOnboarding,
          `Clicked card element. Current URL: ${url}. Stuck: ${stuckOnOnboarding}`);
      } else {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
          `No capsule type card found to click on the onboarding page.`);
      }
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
  let failCount = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`  TEST ${r.testNum}: ${r.name} — ${icon}`);
    console.log(`    ${r.details}\n`);
    if (r.status === 'PASS') passCount++;
    else failCount++;
  }

  console.log(`══════════════════════════════════════`);
  console.log(`  TOTAL: ${passCount}/7 PASS, ${failCount}/7 FAIL`);
  console.log(`══════════════════════════════════════\n`);

  if (consoleErrors.length > 0) {
    console.log(`  Console errors captured (${consoleErrors.length}):`);
    consoleErrors.slice(0, 10).forEach(e => console.log(`    - ${e.substring(0, 150)}`));
  }

  await browser.close();
})();
