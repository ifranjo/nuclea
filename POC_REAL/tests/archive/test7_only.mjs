/**
 * Test 7 only: Onboarding P4 capsule selection (BUG #2)
 * Run: node tests/test7_only.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'ceo_qa');
const BASE_URL = 'http://localhost:3002';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  page.on('pageerror', err => console.log(`  [page error] ${err.message.substring(0, 150)}`));

  // Warmup
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await sleep(3000);

  // Login as Bart first (so capsule creation can work)
  console.log('Logging in as Bart...');
  await page.fill('input[type="email"]', 'bart@nuclea.test');
  await page.fill('input[type="password"]', 'nuclea123');
  await sleep(300);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
    await page.waitForFunction(() => !document.body.textContent.includes('Cargando...'), { timeout: 15000 });
  } catch {}
  await sleep(2000);
  console.log(`  Logged in. URL: ${page.url()}`);

  await sleep(2000);

  // Navigate to onboarding P4
  console.log('\nNavigating to /onboarding?step=4...');
  await page.goto(`${BASE_URL}/onboarding?step=4`, { waitUntil: 'networkidle' });
  await sleep(3000);

  const fp1 = path.join(SCREENSHOT_DIR, 'T7_01_p4.png');
  await page.screenshot({ path: fp1, fullPage: true });
  console.log('  Screenshot: T7_01_p4.png');

  // The cards are <button> elements. Click the first one directly.
  console.log('  Looking for capsule type buttons...');
  const buttons = await page.$$('button');
  const buttonTexts = await Promise.all(buttons.map(async b => {
    try { return await b.textContent(); } catch { return ''; }
  }));
  console.log(`  Found ${buttons.length} buttons. Texts: ${buttonTexts.map(t => `"${t.trim().substring(0, 30)}"`).join(', ')}`);

  // Find first button with "Legacy" or "Cápsula"
  let targetBtn = null;
  for (let i = 0; i < buttons.length; i++) {
    const text = buttonTexts[i];
    if (text.includes('Legacy') || text.includes('Legado')) {
      targetBtn = buttons[i];
      console.log(`  Found Legacy button at index ${i}`);
      break;
    }
  }

  if (!targetBtn) {
    // Fallback: use locator approach
    console.log('  Using locator fallback...');
    try {
      await page.locator('button:has-text("Legacy")').first().click();
      console.log('  Clicked via locator');
    } catch (e) {
      console.log(`  Locator failed: ${e.message.split('\n')[0]}`);
    }
  } else {
    await targetBtn.click();
    console.log('  Clicked Legacy button');
  }

  // Wait for result
  await sleep(5000);

  const fp2 = path.join(SCREENSHOT_DIR, 'T7_02_after.png');
  await page.screenshot({ path: fp2, fullPage: true });
  console.log('  Screenshot: T7_02_after.png');

  const url = page.url();
  const stuckOnP4 = url.includes('step=4');
  console.log(`\n  Final URL: ${url}`);
  console.log(`  Stuck on P4: ${stuckOnP4}`);

  if (url.includes('/capsule/')) {
    console.log('\n  TEST 7: PASS — Redirected to new capsule page');
  } else if (url.includes('/dashboard')) {
    console.log('\n  TEST 7: PASS — Redirected to dashboard');
  } else if (url.includes('/login')) {
    console.log('\n  TEST 7: PASS — Redirected to login (auth required for creation)');
  } else if (stuckOnP4) {
    const body = await page.textContent('body');
    const creating = body.includes('Creando');
    console.log(`\n  TEST 7: FAIL — Still on step=4. "Creando" visible: ${creating}`);
  } else {
    console.log(`\n  TEST 7: PASS — Navigated to ${url}`);
  }

  await browser.close();
})();
