const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname);
const BASE_URL = 'http://localhost:3001/onboarding';

// iPhone 14 Pro viewport
const VIEWPORT = { width: 390, height: 844 };

/**
 * Fix for 100dvh not computing correctly in Playwright's Chromium.
 * Injects a <style> that replaces dvh references with vh equivalents.
 */
const DVH_FIX_CSS = `
  .h-\\[100dvh\\] {
    height: 100vh !important;
  }
`;

async function injectDvhFix(page) {
  await page.addStyleTag({ content: DVH_FIX_CSS });
  // Also force it via JS for any inline styles
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      const h = window.getComputedStyle(el).height;
      if (h === '0px' || h === 'auto') {
        const cls = el.className.toString();
        if (cls.includes('100dvh')) {
          el.style.height = '100vh';
        }
      }
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();

  // ─── P1: Capsule Closed ───────────────────────────────────────────────
  console.log('[1/4] Navigating to onboarding...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await injectDvhFix(page);

  // Wait for aria-label element + Framer Motion fade-in
  await page.waitForSelector('[aria-label="Toca para abrir la cápsula"]', {
    state: 'visible',
    timeout: 10000,
  });
  await page.waitForTimeout(1000);

  // Debug: verify layout is correct now
  const p1Debug = await page.evaluate(() => {
    const wrapper = document.querySelector('.h-\\[100dvh\\]');
    const rect = wrapper ? wrapper.getBoundingClientRect() : null;
    return {
      wrapperSize: rect ? { w: Math.round(rect.width), h: Math.round(rect.height) } : 'NOT FOUND',
      bodyH: document.body.getBoundingClientRect().height,
    };
  });
  console.log('[1/4] Layout check:', JSON.stringify(p1Debug));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'P1_capsule_closed.png'),
    fullPage: false,
  });
  console.log('[1/4] Saved: P1_capsule_closed.png');

  // ─── P2: Capsule Opening ──────────────────────────────────────────────
  console.log('[2/4] Tapping capsule...');
  await page.click('[aria-label="Toca para abrir la cápsula"]');

  // Wait for P1 exit (300ms) + P2 enter. Look for P2's unique text.
  await page.waitForFunction(() => {
    return document.body.innerText.includes('apertura');
  }, { timeout: 8000 });

  // Re-inject dvh fix (new DOM from React re-render)
  await injectDvhFix(page);
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'P2_capsule_opening.png'),
    fullPage: false,
  });
  console.log('[2/4] Saved: P2_capsule_opening.png');

  // ─── P3: Manifesto ────────────────────────────────────────────────────
  // P2 auto-advances after 4s. Wait for manifesto text.
  console.log('[3/4] Waiting for auto-advance to P3 (4s timer)...');
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Somos las historias');
  }, { timeout: 12000 });

  await injectDvhFix(page);
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'P3_manifesto.png'),
    fullPage: false,
  });
  console.log('[3/4] Saved: P3_manifesto.png');

  // ─── P4: Capsule Selection ────────────────────────────────────────────
  console.log('[4/4] Clicking "Continuar"...');
  await page.click('button:has-text("Continuar")');

  await page.waitForFunction(() => {
    return document.body.innerText.includes('Elige tu');
  }, { timeout: 8000 });

  await injectDvhFix(page);
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'P4_capsule_selection.png'),
    fullPage: false,
  });
  console.log('[4/4] Saved: P4_capsule_selection.png');

  // Full-page for scrollable P4
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  if (scrollHeight > VIEWPORT.height) {
    console.log('[bonus] Capturing P4 full-page...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'P4_capsule_selection_full.png'),
      fullPage: true,
    });
    console.log('[bonus] Saved: P4_capsule_selection_full.png');
  }

  await browser.close();
  console.log('\nAll screenshots saved to:', SCREENSHOT_DIR);
})();
