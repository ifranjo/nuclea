/**
 * CEO Bug Verification Test Suite v4 — Final
 * Each test is independent: fresh login when needed
 * Run: node tests/ceo_bug_verification_v4.mjs
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
  console.log(`\n  TEST ${testNum}: ${name} — ${status}`);
  console.log(`  What happened: ${details}`);
}

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  Screenshot: ${name}.png`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function loginAs(page, name) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await sleep(1000);

  // Fill form fields directly
  await page.fill('input[type="email"]', `${name.toLowerCase()}@nuclea.test`);
  await page.fill('input[type="password"]', 'nuclea123');
  await sleep(300);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect away from /login
  try {
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
  } catch {}

  // Wait for content to finish loading
  try {
    await page.waitForFunction(() => {
      const body = document.body?.textContent || '';
      return !body.includes('Cargando...');
    }, { timeout: 15000 });
  } catch {}

  await sleep(1500);
  return page.url();
}

(async () => {
  const browser = await chromium.launch({ headless: false });

  // ═══════════════════════════════════════════════════════
  // TEST 1: Login works (baseline)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 1: Login works (baseline)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await sleep(1000);
      await screenshot(page, 'T1_01_login_page');

      // Click Homer quick-fill then fill directly
      const url = await loginAs(page, 'Homer');
      await screenshot(page, 'T1_02_dashboard_homer');

      const pageText = await page.textContent('body');
      const hasCargando = pageText.includes('Cargando...');
      const isDashboard = url.includes('/dashboard');
      const capsuleLinks = await page.$$('a[href*="/capsule/"]');
      const hasHomer = pageText.includes('Homer');

      if (isDashboard && !hasCargando && capsuleLinks.length >= 2) {
        report(1, 'Login works (baseline)', true,
          `Dashboard loaded. Homer has ${capsuleLinks.length} capsules visible. User name: ${hasHomer ? 'Yes' : 'No'}.`);
      } else if (isDashboard && !hasCargando) {
        report(1, 'Login works (baseline)', true,
          `Dashboard loaded. ${capsuleLinks.length} capsule links. Content loaded (no Cargando).`);
      } else {
        report(1, 'Login works (baseline)', false,
          `URL: ${url}, Cargando: ${hasCargando}, Links: ${capsuleLinks.length}`);
      }
    } catch (e) {
      await screenshot(page, 'T1_ERROR');
      report(1, 'Login works (baseline)', false, `Exception: ${e.message}`);
    }
    await context.close();
  }

  // ═══════════════════════════════════════════════════════
  // TEST 2: Settings page loads (BUG #3 fix)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 2: Settings page loads (BUG #3)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      await loginAs(page, 'Homer');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });

      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
      } catch {}
      await sleep(1000);
      await screenshot(page, 'T2_01_settings_page');

      const bodyText = await page.textContent('body');
      const url = page.url();
      const hasCerrarSesion = bodyText.includes('Cerrar sesión');
      const hasAjustes = bodyText.includes('Ajustes');
      const hasCargando = bodyText.includes('Cargando...');

      if (url.includes('/settings') && hasCerrarSesion && !hasCargando) {
        report(2, 'Settings page loads (BUG #3)', true,
          `Settings loaded at ${url}. "Cerrar sesión" visible. "Ajustes" header present.`);
      } else {
        report(2, 'Settings page loads (BUG #3)', false,
          `URL: ${url}, Cargando: ${hasCargando}, Cerrar: ${hasCerrarSesion}, Ajustes: ${hasAjustes}`);
      }
    } catch (e) {
      await screenshot(page, 'T2_ERROR');
      report(2, 'Settings page loads (BUG #3)', false, `Exception: ${e.message}`);
    }
    await context.close();
  }

  // ═══════════════════════════════════════════════════════
  // TEST 3: Capsule detail + Share button (BUG #1 fix)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 3: Capsule detail + Share (BUG #1)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      await loginAs(page, 'Homer');

      // Should be on dashboard now
      await sleep(1000);
      const capsuleLink = await page.$('a[href*="/capsule/"]');
      if (!capsuleLink) {
        // Try explicit navigation
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
        try {
          await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
        } catch {}
        await sleep(1000);
      }

      const link = await page.$('a[href*="/capsule/"]');
      if (link) {
        const href = await link.getAttribute('href');
        console.log(`  Found capsule link: ${href}`);
        await link.click();

        try {
          await page.waitForURL('**/capsule/**', { timeout: 10000 });
          await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
        } catch {}
        await sleep(1500);
        await screenshot(page, 'T3_01_capsule_detail');

        // Find the Compartir button
        const compartirBtn = await page.$('button:has-text("Compartir")');
        if (compartirBtn) {
          await compartirBtn.scrollIntoViewIfNeeded();
          await compartirBtn.click();
          await sleep(2500);
          await screenshot(page, 'T3_02_share_clicked');

          const bodyText = await page.textContent('body');
          const hasShareUrl = bodyText.includes('/share/') || bodyText.includes('copiado') || bodyText.includes('Copiado') || bodyText.includes('Link');

          if (hasShareUrl) {
            report(3, 'Capsule detail + Share (BUG #1)', true,
              `Share button clicked. Share URL or "copiado" confirmation visible.`);
          } else {
            report(3, 'Capsule detail + Share (BUG #1)', false,
              `Share clicked but no URL/confirmation. Body snippet: "${bodyText.substring(0, 250)}"`);
          }
        } else {
          const allBtns = await page.$$eval('button', bs => bs.map(b => b.textContent.trim()));
          report(3, 'Capsule detail + Share (BUG #1)', false,
            `No "Compartir" button. Buttons: [${allBtns.join(' | ')}]`);
        }
      } else {
        const bodyText = await page.textContent('body');
        report(3, 'Capsule detail + Share (BUG #1)', false,
          `No capsule link on dashboard. Body: "${bodyText.substring(0, 200)}"`);
      }
    } catch (e) {
      await screenshot(page, 'T3_ERROR');
      report(3, 'Capsule detail + Share (BUG #1)', false, `Exception: ${e.message}`);
    }
    await context.close();
  }

  // ═══════════════════════════════════════════════════════
  // TEST 4: Logout works WITHOUT crashing (BUG #5/#6/#7)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 4: Logout works (BUG #5/#6/#7)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      await loginAs(page, 'Homer');
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
      } catch {}
      await sleep(1500);

      const logoutBtn = await page.$('button:has-text("Cerrar sesión")');
      if (logoutBtn) {
        await logoutBtn.click();

        // signOut uses window.location.href = '/login' so wait for full page load
        try {
          await page.waitForURL('**/login**', { timeout: 15000 });
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {}
        await sleep(2000);
        await screenshot(page, 'T4_01_after_logout');

        const url = page.url();
        const bodyText = await page.textContent('body');
        const isLoginPage = url.includes('/login');
        const hasServerError = bodyText.includes('Internal Server Error');
        const hasNuclea = bodyText.includes('NUCLEA');
        const hasEntrar = bodyText.includes('Entrar');

        if (isLoginPage && !hasServerError && hasNuclea) {
          report(4, 'Logout works (BUG #5/#6/#7)', true,
            `Redirected to ${url}. Login page renders. NUCLEA branding visible. Entrar button: ${hasEntrar}.`);
        } else {
          report(4, 'Logout works (BUG #5/#6/#7)', false,
            `URL: ${url}, Login: ${isLoginPage}, Error: ${hasServerError}, NUCLEA: ${hasNuclea}`);
        }
      } else {
        await screenshot(page, 'T4_no_btn');
        report(4, 'Logout works (BUG #5/#6/#7)', false, 'No "Cerrar sesión" button found.');
      }
    } catch (e) {
      await screenshot(page, 'T4_ERROR');
      report(4, 'Logout works (BUG #5/#6/#7)', false, `Exception: ${e.message}`);
    }
    await context.close();
  }

  // ═══════════════════════════════════════════════════════
  // TEST 5: Login again after logout (BUG #6/#7)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 5: Login again after logout (BUG #6/#7)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      // First login as Homer
      await loginAs(page, 'Homer');

      // Logout
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
      } catch {}
      await sleep(1000);

      const logoutBtn = await page.$('button:has-text("Cerrar sesión")');
      if (logoutBtn) {
        await logoutBtn.click();
        try {
          await page.waitForURL('**/login**', { timeout: 15000 });
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {}
        await sleep(2000);
      }

      // Now login as Bart
      const url = await loginAs(page, 'Bart');
      await screenshot(page, 'T5_01_dashboard_bart');

      const bodyText = await page.textContent('body');
      const hasCargando = bodyText.includes('Cargando...');
      const hasError = bodyText.includes('Internal Server Error');
      const isDashboard = url.includes('/dashboard');
      const hasBart = bodyText.includes('Bart');

      if (isDashboard && !hasCargando && !hasError) {
        report(5, 'Login again after logout (BUG #6/#7)', true,
          `Bart's dashboard loaded at ${url}. Bart name visible: ${hasBart}. No errors.`);
      } else {
        report(5, 'Login again after logout (BUG #6/#7)', false,
          `URL: ${url}, Cargando: ${hasCargando}, Error: ${hasError}`);
      }
    } catch (e) {
      await screenshot(page, 'T5_ERROR');
      report(5, 'Login again after logout (BUG #6/#7)', false, `Exception: ${e.message}`);
    }
    await context.close();
  }

  // ═══════════════════════════════════════════════════════
  // TEST 6: Navigate away and back to dashboard (BUG #4)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 6: Navigate away and back (BUG #4)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      await loginAs(page, 'Bart');

      // Navigate to settings
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
      await sleep(2000);

      // Navigate back to dashboard
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      try {
        await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
      } catch {}
      await sleep(1500);
      await screenshot(page, 'T6_01_dashboard_return');

      const bodyText = await page.textContent('body');
      const hasCargando = bodyText.includes('Cargando...');
      const url = page.url();
      const hasContent = bodyText.includes('Mis cápsulas') || bodyText.includes('primera cápsula');

      if (url.includes('/dashboard') && !hasCargando) {
        report(6, 'Navigate away and back (BUG #4)', true,
          `Dashboard reloaded at ${url}. Content visible: ${hasContent}. No stuck loading.`);
      } else {
        report(6, 'Navigate away and back (BUG #4)', false,
          `URL: ${url}, Cargando: ${hasCargando}`);
      }
    } catch (e) {
      await screenshot(page, 'T6_ERROR');
      report(6, 'Navigate away and back (BUG #4)', false, `Exception: ${e.message}`);
    }
    await context.close();
  }

  // ═══════════════════════════════════════════════════════
  // TEST 7: Onboarding P4 capsule selection (BUG #2)
  // ═══════════════════════════════════════════════════════
  {
    console.log('\n══════════════════════════════════════');
    console.log('TEST 7: Onboarding P4 capsule selection (BUG #2)');
    console.log('══════════════════════════════════════');

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      // Login first so capsule creation can work
      await loginAs(page, 'Lisa');

      await page.goto(`${BASE_URL}/onboarding?step=4`, { waitUntil: 'networkidle' });
      await sleep(3000);
      await screenshot(page, 'T7_01_onboarding_p4');

      const bodyText = await page.textContent('body');

      // Click the first capsule type card (Legacy)
      let clicked = false;
      const legacyCard = await page.$('text="Cápsula Legacy"');
      if (legacyCard) {
        await legacyCard.click();
        clicked = true;
        console.log('  Clicked "Cápsula Legacy"');
      }

      if (!clicked) {
        // Try any button in the grid
        const cards = await page.$$('div[class*="grid"] > div');
        if (cards.length > 0) {
          await cards[0].click();
          clicked = true;
          console.log(`  Clicked first grid card (${cards.length} total)`);
        }
      }

      if (clicked) {
        await sleep(5000);
        await screenshot(page, 'T7_02_after_click');

        const url = page.url();
        const stuckOnP4 = url.includes('step=4');
        const redirected = url.includes('/capsule/') || url.includes('/dashboard') || url.includes('/login');

        if (!stuckOnP4 || redirected) {
          report(7, 'Onboarding P4 capsule selection (BUG #2)', true,
            `Capsule type clicked. Navigated to ${url}. Not stuck on selection.`);
        } else {
          report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
            `Stuck on ${url} after click.`);
        }
      } else {
        report(7, 'Onboarding P4 capsule selection (BUG #2)', false,
          `No capsule card found. Content: "${bodyText.substring(0, 200)}"`);
      }
    } catch (e) {
      await screenshot(page, 'T7_ERROR');
      report(7, 'Onboarding P4 capsule selection (BUG #2)', false, `Exception: ${e.message}`);
    }
    await context.close();
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

  const resultsPath = path.join(SCREENSHOT_DIR, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({ results, timestamp: new Date().toISOString() }, null, 2));
  console.log(`  Results saved to ${resultsPath}`);

  await browser.close();
})();
