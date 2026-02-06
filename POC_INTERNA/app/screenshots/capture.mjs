import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
});
const page = await context.newPage();

// P1
await page.goto('http://localhost:3001/onboarding');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'C:/Users/Kaos/scripts/nuclea/POC_INTERNA/app/screenshots/P1_v2.png' });
console.log('P1 done');

// P2 - click to advance
await page.click('div[role="button"]');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'C:/Users/Kaos/scripts/nuclea/POC_INTERNA/app/screenshots/P2_v2.png' });
console.log('P2 done');

// P3 - wait for auto-advance
await page.waitForTimeout(4000);
await page.screenshot({ path: 'C:/Users/Kaos/scripts/nuclea/POC_INTERNA/app/screenshots/P3_v2.png' });
console.log('P3 done');

// P4 - click Continuar
await page.click('button:has-text("Continuar")');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'C:/Users/Kaos/scripts/nuclea/POC_INTERNA/app/screenshots/P4_v2.png' });
console.log('P4 done');

await browser.close();
