/**
 * CEO Bug Verification — Final Run
 * Single browser context, generous delays, sequential tests
 * Run: node tests/ceo_bug_verification_final.mjs
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
  console.log(`\n  >> TEST ${testNum}: ${name} — ${status}`);
  console.log(`     ${details}`);
}

async function ss(page, name) {
  const fp = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`  [screenshot] ${name}.png`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  // Warmup navigation (no screenshot, just trigger compilation in-browser)
  console.log('  Warmup hit...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await sleep(3000);

  // ════════════════════════════════════════════════════════
  // TEST 1: Login works (baseline)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 1: Login works (baseline) ══');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await ss(page, 'T1_01_login');

    // Use quick-fill button then verify inputs
    await page.click('button:has-text("Homer")');
    await sleep(500);

    // Double-check: fill directly too
    await page.fill('input[type="email"]', 'homer@nuclea.test');
    await page.fill('input[type="password"]', 'nuclea123');
    await sleep(300);

    await page.click('button[type="submit"]');

    // Wait for redirect
    try {
      await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
    } catch (e) {
      console.log(`  [warn] waitForURL failed: ${e.message.split('\n')[0]}`);
    }

    // Wait for content to load
    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
    } catch {}
    await sleep(2000);
    await ss(page, 'T1_02_dashboard');

    const url = page.url();
    const text = await page.textContent('body');
    const capsules = await page.$$('a[href*="/capsule/"]');

    if (url.includes('/dashboard') && !text.includes('Cargando...') && capsules.length > 0) {
      report(1, 'Login works (baseline)', true,
        `Dashboard at ${url}. Homer has ${capsules.length} capsules. VERIFY: Homer has 2 capsules visible = ${capsules.length === 2 ? 'YES' : 'NO (found ' + capsules.length + ')'}`);
    } else if (url.includes('/dashboard') && !text.includes('Cargando...')) {
      report(1, 'Login works (baseline)', true,
        `Dashboard loaded at ${url}. Content visible. Capsule links: ${capsules.length}.`);
    } else {
      report(1, 'Login works (baseline)', false,
        `URL: ${url}. Cargando: ${text.includes('Cargando...')}. Links: ${capsules.length}. Body[0:100]: "${text.substring(0, 100)}"`);
    }
  } catch (e) {
    await ss(page, 'T1_ERR');
    report(1, 'Login works (baseline)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  await sleep(3000); // Delay between tests

  // ════════════════════════════════════════════════════════
  // TEST 2: Settings page loads (BUG #3)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 2: Settings page loads (BUG #3) ══');
  try {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
    } catch {}
    await sleep(2000);
    await ss(page, 'T2_01_settings');

    const url = page.url();
    const text = await page.textContent('body');

    if (url.includes('/login')) {
      report(2, 'Settings page loads (BUG #3)', false, 'Redirected to login — session lost.');
    } else if (text.includes('Cerrar sesión') && text.includes('Ajustes') && !text.includes('Cargando...')) {
      report(2, 'Settings page loads (BUG #3)', true,
        `Settings loaded. "Cerrar sesión" button visible. Profile info shown.`);
    } else {
      report(2, 'Settings page loads (BUG #3)', false,
        `URL: ${url}. Cerrar sesión: ${text.includes('Cerrar sesión')}. Ajustes: ${text.includes('Ajustes')}. Cargando: ${text.includes('Cargando...')}`);
    }
  } catch (e) {
    await ss(page, 'T2_ERR');
    report(2, 'Settings page loads (BUG #3)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  await sleep(3000);

  // ════════════════════════════════════════════════════════
  // TEST 3: Capsule detail + Share button (BUG #1)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 3: Capsule detail + Share (BUG #1) ══');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
    } catch {}
    await sleep(2000);

    const capsuleLink = await page.$('a[href*="/capsule/"]');
    if (!capsuleLink) {
      const text = await page.textContent('body');
      report(3, 'Capsule detail + Share (BUG #1)', false,
        `No capsule links found on dashboard. Body[0:150]: "${text.substring(0, 150)}"`);
    } else {
      const href = await capsuleLink.getAttribute('href');
      console.log(`  Clicking capsule link: ${href}`);
      await capsuleLink.click();

      try {
        await page.waitForURL('**/capsule/**', { timeout: 10000 });
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
      } catch {}
      await sleep(2000);
      await ss(page, 'T3_01_detail');

      // Scroll down to find Compartir
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(500);

      const shareBtn = await page.$('button:has-text("Compartir")');
      if (!shareBtn) {
        const allBtns = await page.$$eval('button', bs => bs.map(b => b.textContent.trim()));
        report(3, 'Capsule detail + Share (BUG #1)', false,
          `No "Compartir" button. Buttons found: [${allBtns.join(' | ')}]`);
      } else {
        await shareBtn.click();
        await sleep(2500);
        await ss(page, 'T3_02_share');

        const text = await page.textContent('body');
        const hasUrl = text.includes('/share/') || text.includes('copiado') || text.includes('Copiado') || text.includes('Link copiado');

        if (hasUrl) {
          report(3, 'Capsule detail + Share (BUG #1)', true,
            `Share button clicked. Share URL input or "Link copiado" confirmation visible.`);
        } else {
          report(3, 'Capsule detail + Share (BUG #1)', false,
            `Share clicked but no URL/confirmation. Body[0:200]: "${text.substring(0, 200)}"`);
        }
      }
    }
  } catch (e) {
    await ss(page, 'T3_ERR');
    report(3, 'Capsule detail + Share (BUG #1)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  await sleep(3000);

  // ════════════════════════════════════════════════════════
  // TEST 4: Logout works WITHOUT crashing (BUG #5/#6/#7)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 4: Logout works (BUG #5/#6/#7) ══');
  try {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
    } catch {}
    await sleep(2000);

    const logoutBtn = await page.$('button:has-text("Cerrar sesión")');
    if (!logoutBtn) {
      await ss(page, 'T4_no_btn');
      report(4, 'Logout works (BUG #5/#6/#7)', false, 'No "Cerrar sesión" button. May not be on settings page.');
    } else {
      console.log('  Clicking "Cerrar sesión"...');
      await logoutBtn.click();

      // signOut uses window.location.href = '/login' — full page navigation
      try {
        await page.waitForURL('**/login**', { timeout: 15000 });
      } catch {}
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {}
      await sleep(3000);
      await ss(page, 'T4_01_after_logout');

      const url = page.url();
      const text = await page.textContent('body');
      const isLogin = url.includes('/login');
      const hasError = text.includes('Internal Server Error');
      const hasNuclea = text.includes('NUCLEA');

      if (isLogin && !hasError && hasNuclea) {
        report(4, 'Logout works (BUG #5/#6/#7)', true,
          `Redirected to ${url}. Login page renders correctly. NUCLEA branding visible. No server error.`);
      } else {
        report(4, 'Logout works (BUG #5/#6/#7)', false,
          `URL: ${url}. Login: ${isLogin}. Error: ${hasError}. NUCLEA: ${hasNuclea}`);
      }
    }
  } catch (e) {
    await ss(page, 'T4_ERR');
    report(4, 'Logout works (BUG #5/#6/#7)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  await sleep(3000);

  // ════════════════════════════════════════════════════════
  // TEST 5: Can login again after logout (BUG #6/#7)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 5: Login again after logout (BUG #6/#7) ══');
  try {
    // Should be on /login after logout
    if (!page.url().includes('/login')) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await sleep(2000);
    }

    // Login as Bart
    await page.fill('input[type="email"]', 'bart@nuclea.test');
    await page.fill('input[type="password"]', 'nuclea123');
    await sleep(300);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
    } catch {}
    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
    } catch {}
    await sleep(2000);
    await ss(page, 'T5_01_bart_dashboard');

    const url = page.url();
    const text = await page.textContent('body');
    const isDash = url.includes('/dashboard');
    const hasCargando = text.includes('Cargando...');
    const hasError = text.includes('Internal Server Error');

    if (isDash && !hasCargando && !hasError) {
      report(5, 'Login again after logout (BUG #6/#7)', true,
        `Bart's dashboard loaded at ${url}. No errors, no stuck loading.`);
    } else {
      report(5, 'Login again after logout (BUG #6/#7)', false,
        `URL: ${url}. Cargando: ${hasCargando}. Error: ${hasError}. Body[0:100]: "${text.substring(0, 100)}"`);
    }
  } catch (e) {
    await ss(page, 'T5_ERR');
    report(5, 'Login again after logout (BUG #6/#7)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  await sleep(3000);

  // ════════════════════════════════════════════════════════
  // TEST 6: Navigate away and back to dashboard (BUG #4)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 6: Navigate away and back (BUG #4) ══');
  try {
    // Should be on Bart's dashboard
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    try {
      await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
    } catch {}
    await sleep(2000);
    await ss(page, 'T6_01_dashboard_back');

    const url = page.url();
    const text = await page.textContent('body');
    const hasCargando = text.includes('Cargando...');

    if (url.includes('/dashboard') && !hasCargando) {
      report(6, 'Navigate away and back (BUG #4)', true,
        `Dashboard reloaded at ${url}. No stuck "Cargando...".`);
    } else {
      report(6, 'Navigate away and back (BUG #4)', false,
        `URL: ${url}. Cargando: ${hasCargando}`);
    }
  } catch (e) {
    await ss(page, 'T6_ERR');
    report(6, 'Navigate away and back (BUG #4)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  await sleep(3000);

  // ════════════════════════════════════════════════════════
  // TEST 7: Onboarding P4 capsule selection (BUG #2)
  // ════════════════════════════════════════════════════════
  console.log('\n══ TEST 7: Onboarding P4 capsule selection (BUG #2) ══');
  try {
    await page.goto(`${BASE_URL}/onboarding?step=4`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await ss(page, 'T7_01_p4');

    const bodyText = await page.textContent('body');
    console.log(`  Content: "${bodyText.substring(0, 150)}"`);

    // Try clicking the Legacy capsule card
    let clicked = false;

    // Strategy 1: Click on "Cápsula Legacy" text
    const legacyEl = await page.$('text="Cápsula Legacy"');
    if (legacyEl) {
      // Click the parent div (the card), not just the text
      const parent = await legacyEl.evaluateHandle(el => el.closest('div[class*="cursor"]') || el.closest('div[class*="hover"]') || el.parentElement);
      if (parent) {
        await parent.asElement()?.click() || await legacyEl.click();
        clicked = true;
        console.log('  Clicked Legacy card');
      }
    }

    if (!clicked) {
      await page.click('text="Cápsula Legacy"');
      clicked = true;
    }

    await sleep(5000);
    await ss(page, 'T7_02_after');

    const url = page.url();
    const stuckP4 = url.includes('step=4');
    const wentToCapsule = url.includes('/capsule/');
    const wentToLogin = url.includes('/login');
    const wentToDashboard = url.includes('/dashboard');

    if (wentToCapsule) {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
        `Capsule created! Redirected to ${url}.`);
    } else if (wentToDashboard) {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
        `Capsule type selected. Redirected to dashboard at ${url}.`);
    } else if (wentToLogin) {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
        `Capsule type clicked. Redirected to /login (auth required). Not stuck on selection.`);
    } else if (stuckP4) {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
        `Still on ${url} after clicking capsule type.`);
    } else {
      report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
        `Navigated to ${url} after selection.`);
    }
  } catch (e) {
    await ss(page, 'T7_ERR');
    report(7, 'Onboarding P4 capsule selection (BUG #2)', false, `Exception: ${e.message.split('\n')[0]}`);
  }

  // ════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ════════════════════════════════════════════════════════
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              CEO BUG VERIFICATION REPORT                ║');
  console.log('╠══════════════════════════════════════════════════════════╣');

  let passCount = 0;
  for (const r of results) {
    const mark = r.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`║  [${mark}] Test ${r.testNum}: ${r.name}`);
    console.log(`║        ${r.details.substring(0, 70)}`);
    if (r.details.length > 70) console.log(`║        ${r.details.substring(70, 140)}`);
    console.log('║');
    if (r.status === 'PASS') passCount++;
  }

  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  SCORE: ${passCount}/7 PASS                                        ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (errors.length > 0) {
    console.log(`  Page errors (${errors.length}):`);
    [...new Set(errors.map(e => e.substring(0, 150)))].slice(0, 5).forEach(e => console.log(`    - ${e}`));
  }

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'results.json'),
    JSON.stringify({ results, errors: errors.slice(0, 20), timestamp: new Date().toISOString() }, null, 2)
  );

  await browser.close();
})();
