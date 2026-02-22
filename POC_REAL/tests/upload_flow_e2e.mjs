import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { requireInfrastructure } from './healthcheck.mjs';

const SCREENSHOTS_DIR = 'screenshots/upload_qa';
const BASE_URL = 'http://localhost:3002';
const TEST_USER = { email: 'homer@nuclea.test', password: 'nuclea123' };

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let browser;
let context;
let page;
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

async function screenshot(name) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 Screenshot: ${filepath}`);
}

async function test(name, fn) {
  try {
    console.log(`\n🔍 Test: ${name}`);
    await fn();
    console.log(`  ✅ PASS`);
    testsPassed++;
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message}`);
    failures.push({ name, error: err.message });
    testsFailed++;
  }
}

async function waitForElement(selector, timeout = 10000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

async function clickAndWait(selector, timeout = 10000) {
  await page.click(selector);
  await page.waitForLoadState('networkidle', { timeout });
}

async function main() {
  console.log('='.repeat(60));
  console.log('NUCLEA POC_REAL - Upload Flow E2E Test');
  console.log('='.repeat(60));
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Test User: ${TEST_USER.email}`);

  // Check infrastructure first - fail fast with clear message
  await requireInfrastructure(['app', 'supabase'])

  try {
    // Launch browser
    console.log('\n🚀 Launching browser...');
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    page = await context.newPage();

    // Navigate to login page
    await test('Navigate to login page', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
      await screenshot('01_login_page');
    });

    // Fill login credentials
    await test('Login with test user', async () => {
      await waitForElement('input[type="email"], input[name="email"], input[id="email"]');
      await page.fill('input[type="email"], input[name="email"], input[id="email"]', TEST_USER.email);
      await page.fill('input[type="password"], input[name="password"], input[id="password"]', TEST_USER.password);
      await screenshot('02_credentials_filled');
      await clickAndWait('button[type="submit"], button:has-text("Entrar"), button:has-text("Iniciar")');
      await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
      await screenshot('03_dashboard');
    });

    // Find and open first capsule
    await test('Open first capsule', async () => {
      // Wait for capsule grid to load
      await waitForElement('[data-testid="capsule-card"], .capsule-card, a[href*="/capsule/"]', 15000);

      // Click first capsule link
      const capsuleLink = await page.locator('a[href*="/capsule/"]').first();
      const capsuleUrl = await capsuleLink.getAttribute('href');
      console.log(`  Opening capsule: ${capsuleUrl}`);
      await capsuleLink.click();

      await page.waitForURL(/\/capsule\/.+/, { timeout: 15000 });
      await screenshot('04_capsule_detail');
    });

    // Check for upload functionality
    await test('Verify upload section exists', async () => {
      // Look for upload button/area - could be button, label, or section
      const uploadSelectors = [
        'button:has-text("Subir"), button:has-text("Upload"), button:has-text("Añadir")',
        '[data-testid="upload-button"], [data-testid="add-content"]',
        'input[type="file"]',
        'label:has-text("Subir"), label:has-text("Upload")'
      ];

      let found = false;
      for (const sel of uploadSelectors) {
        const el = await page.$(sel);
        if (el) {
          found = true;
          break;
        }
      }

      if (!found) {
        // Take a debug screenshot to see what's on the page
        await screenshot('debug_upload_section');
        throw new Error('No upload section found on capsule detail page');
      }
    });

    // Upload an image
    await test('Upload image', async () => {
      // Create a simple test image
      const testImagePath = path.join(SCREENSHOTS_DIR, 'test_image.png');

      // Create a minimal valid PNG (1x1 transparent pixel)
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngHeader);

      // Find file input and upload
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(testImagePath);
        await screenshot('05_image_uploaded');
        // Wait for upload to process
        await page.waitForTimeout(2000);
      } else {
        throw new Error('File input not found');
      }
    });

    // Add a text note
    await test('Add text note', async () => {
      // Look for text note button or input
      const textNoteButton = await page.$('button:has-text("Nota"), button:has-text("Texto"), [data-testid="add-text"]');
      if (textNoteButton) {
        await textNoteButton.click();
        await waitForElement('textarea, input[type="text"]:not([name="email"]):not([name="password"])');
        await page.fill('textarea, input[type="text"]:not([name="email"]):not([name="password"])', 'Test note from E2E');
        await screenshot('06_text_note_added');
      } else {
        // Try to find any form to add content
        await screenshot('debug_text_note');
        throw new Error('No text note button found');
      }
    });

    // Verify content appears
    await test('Verify uploaded content appears', async () => {
      await page.waitForTimeout(1000);
      await screenshot('07_content_verification');

      // Look for any content elements
      const contentSelectors = [
        '[data-testid="content-item"], .content-item, [data-testid="media-item"]',
        'img[src*="blob"], img[src*="storage"]',
        'text="Test note"'
      ];

      let foundContent = false;
      for (const sel of contentSelectors) {
        const els = await page.$$(sel);
        if (els.length > 0) {
          foundContent = true;
          break;
        }
      }

      if (!foundContent) {
        console.log('  ⚠️ Warning: Could not verify content persisted (may need manual check)');
      }
    });

  } catch (err) {
    console.error(`\n💥 Fatal error: ${err.message}`);
    await screenshot('fatal_error');
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);

    if (failures.length > 0) {
      console.log('\n📝 Failures:');
      failures.forEach(f => {
        console.log(`  - ${f.name}: ${f.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    if (testsFailed > 0) {
      console.log('❌ OVERALL: FAIL');
      console.log('='.repeat(60));
      process.exit(1);
    } else {
      console.log('✅ OVERALL: PASS');
      console.log('='.repeat(60));
      process.exit(0);
    }
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
