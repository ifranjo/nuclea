/**
 * NUCLEA POC — Capsule Media Features QA Test
 *
 * Comprehensive Playwright tests for the capsule detail page media modals:
 * photo upload, video upload, note editor, audio recorder, content summary,
 * capsule type navigation, and interactive capsule area.
 *
 * Run: node tests/test_media_features.mjs
 * Requires: Next.js dev server on http://localhost:3001
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE = 'http://localhost:3001';
const SCREENSHOT_DIR = path.resolve('screenshots/qa');

const TEST_IMAGES = [
  'C:\\Users\\Kaos\\Pictures\\Screenshots\\Captura de pantalla 2026-02-07 133520.png',
  'C:\\Users\\Kaos\\Pictures\\Screenshots\\Captura de pantalla 2026-02-08 093900.png',
  'C:\\Users\\Kaos\\Pictures\\Screenshots\\Captura de pantalla 2026-02-09 191024.png',
];

const CAPSULE_TYPES = ['legacy', 'together', 'social', 'pet', 'life-chapter', 'origin'];

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const tag = passed ? 'PASS' : 'FAIL';
  const msg = detail ? ` — ${detail}` : '';
  console.log(`  [${tag}] ${name}${msg}`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** Click a quick-action button by label text */
async function clickQuickAction(page, label) {
  // Quick action bar buttons contain a span with the label text
  const btn = page.locator('section.flex.gap-2 button', { hasText: label });
  await btn.click();
  await sleep(600); // wait for modal animation
}

async function main() {
  console.log('\n=== NUCLEA Media Features QA Test ===\n');
  console.log(`Target: ${BASE}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  // ── Warmup ──
  console.log('[warmup] Hitting /onboarding/capsule/legacy to trigger compilation...');
  try {
    await page.goto(`${BASE}/onboarding/capsule/legacy`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    console.log('[warmup] Done.\n');
  } catch (e) {
    console.error('[warmup] FAILED — is the dev server running on port 3001?');
    console.error(e.message);
    await browser.close();
    process.exit(1);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 1: Quick action bar exists
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('--- Test 1: Quick action bar exists ---');
    await page.goto(`${BASE}/onboarding/capsule/legacy`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(1500);

    const labels = ['Fotos', 'Voz', 'Video', 'Notas'];
    let allFound = true;
    for (const label of labels) {
      const btn = page.locator('section.flex.gap-2 button', { hasText: label });
      const count = await btn.count();
      if (count === 0) {
        record(`Quick action: "${label}" button`, false, 'not found');
        allFound = false;
      }
    }
    if (allFound) {
      record('Quick action bar — all 4 buttons present', true, 'Fotos, Voz, Video, Notas');
    }
  } catch (e) {
    record('Test 1: Quick action bar', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 2: Photo upload modal opens
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 2: Photo upload modal opens ---');
    await clickQuickAction(page, 'Fotos');

    // Modal title
    const title = page.locator('h3', { hasText: 'Subir fotos' });
    const titleVisible = await title.isVisible();
    record('Photo modal title "Subir fotos"', titleVisible);

    // Drop zone text
    const dropText = page.locator('text=Arrastra tus fotos aquí');
    const dropVisible = await dropText.isVisible();
    record('Photo modal drop zone visible', dropVisible);

    // Close modal via Escape
    await page.keyboard.press('Escape');
    await sleep(400);
  } catch (e) {
    record('Test 2: Photo modal opens', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 3: Photo upload via file input
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 3: Photo upload via file input ---');
    await clickQuickAction(page, 'Fotos');
    await sleep(400);

    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    const inputCount = await fileInput.count();
    record('Hidden file input found', inputCount > 0, `count=${inputCount}`);

    // Upload 3 images
    await fileInput.setInputFiles(TEST_IMAGES);
    await sleep(1500);

    // Check thumbnail grid (grid of aspect-square images)
    const thumbnails = page.locator('.grid img');
    const thumbCount = await thumbnails.count();
    record('Thumbnail grid shows 3 images', thumbCount === 3, `found=${thumbCount}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test3_photo_upload.png'), fullPage: false });
    record('Screenshot: test3_photo_upload.png', true);

    // Close modal
    await page.keyboard.press('Escape');
    await sleep(400);
  } catch (e) {
    record('Test 3: Photo upload', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 4: Photo modal close and badge
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 4: Photo badge after close ---');
    // Modal should be closed now; check for badge "3" on the Fotos button
    const fotosBtn = page.locator('section.flex.gap-2 button', { hasText: 'Fotos' });
    const badge = fotosBtn.locator('span.absolute');
    const badgeText = await badge.textContent();
    record('Fotos badge shows "3"', badgeText?.trim() === '3', `badge="${badgeText?.trim()}"`);
  } catch (e) {
    record('Test 4: Photo badge', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 5: Video upload modal
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 5: Video upload modal ---');
    await clickQuickAction(page, 'Video');

    const title = page.locator('h3', { hasText: 'Subir vídeo' });
    const titleVisible = await title.isVisible();
    record('Video modal title "Subir vídeo"', titleVisible);

    const dropText = page.locator('text=Arrastra un vídeo aquí');
    const dropVisible = await dropText.isVisible();
    record('Video drop zone text visible', dropVisible);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test5_video_modal.png'), fullPage: false });
    record('Screenshot: test5_video_modal.png', true);

    await page.keyboard.press('Escape');
    await sleep(400);
  } catch (e) {
    record('Test 5: Video modal', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 6: Notes modal — write and save
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 6: Notes modal ---');
    await clickQuickAction(page, 'Notas');

    const title = page.locator('h3', { hasText: 'Escribir nota' });
    const titleVisible = await title.isVisible();
    record('Notes modal title "Escribir nota"', titleVisible);

    // Type in textarea
    const noteText = 'Este es mi primer recuerdo en la cápsula Legacy';
    const textarea = page.locator('textarea');
    await textarea.fill(noteText);
    await sleep(300);

    // Check character count
    const charCount = page.locator(`text=${noteText.length} caracteres`);
    const charVisible = await charCount.isVisible();
    record('Character count updates', charVisible, `expected "${noteText.length} caracteres"`);

    // Click "Guardar nota"
    const saveBtn = page.locator('button', { hasText: 'Guardar nota' });
    await saveBtn.click();
    await sleep(600);

    // Verify note appears in saved notes list
    const savedHeader = page.locator('text=Notas guardadas');
    const savedVisible = await savedHeader.isVisible();
    record('"Notas guardadas" section appears', savedVisible);

    // Check note title is in the list
    const savedNote = page.locator('p.truncate', { hasText: noteText.slice(0, 40) });
    const noteInList = await savedNote.count();
    record('Saved note appears in list', noteInList > 0);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test6_notes_saved.png'), fullPage: false });
    record('Screenshot: test6_notes_saved.png', true);

    await page.keyboard.press('Escape');
    await sleep(400);
  } catch (e) {
    record('Test 6: Notes modal', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 7: Audio modal
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 7: Audio modal ---');
    await clickQuickAction(page, 'Voz');

    const title = page.locator('h3', { hasText: 'Grabar audio' });
    const titleVisible = await title.isVisible();
    record('Audio modal title "Grabar audio"', titleVisible);

    // Red record button (bg-red-500 circle)
    const recordBtn = page.locator('button[aria-label="Grabar"]');
    const btnVisible = await recordBtn.isVisible();
    record('Red record button visible', btnVisible);

    // "Pulsa para grabar" text
    const helpText = page.locator('text=Pulsa para grabar');
    const helpVisible = await helpText.isVisible();
    record('"Pulsa para grabar" text visible', helpVisible);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test7_audio_modal.png'), fullPage: false });
    record('Screenshot: test7_audio_modal.png', true);

    await page.keyboard.press('Escape');
    await sleep(400);
  } catch (e) {
    record('Test 7: Audio modal', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 8: Content summary section
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 8: Content summary section ---');
    // After adding 3 photos and 1 note, the summary should appear
    const summaryHeader = page.locator('h2', { hasText: 'Contenido añadido' });
    const headerVisible = await summaryHeader.isVisible();
    record('"Contenido añadido" section visible', headerVisible);

    // Check "3 fotos"
    const fotosLine = page.locator('text=3 fotos');
    const fotosVisible = await fotosLine.isVisible();
    record('Summary shows "3 fotos"', fotosVisible);

    // Check "1 nota"
    const notaLine = page.locator('text=1 nota');
    const notaVisible = await notaLine.isVisible();
    record('Summary shows "1 nota"', notaVisible);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test8_content_summary.png'), fullPage: true });
    record('Screenshot: test8_content_summary.png', true);
  } catch (e) {
    record('Test 8: Content summary', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 9: Capsule type navigation (all 6 types)
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 9: Capsule type navigation ---');
    const expectedTitles = {
      'legacy': 'Legacy Capsule',
      'together': 'Together Capsule',
      'social': 'Social Capsule',
      'pet': 'Pet Capsule',
      'life-chapter': 'Life Chapter Capsule',
      'origin': 'Origin Capsule',
    };

    for (const type of CAPSULE_TYPES) {
      await page.goto(`${BASE}/onboarding/capsule/${type}`, { waitUntil: 'networkidle', timeout: 20000 });
      await sleep(1500);

      const expected = expectedTitles[type];
      const h1 = page.locator('h1');
      const actualTitle = await h1.textContent();
      const matches = actualTitle?.trim() === expected;
      record(`Capsule /${type} title`, matches, `expected="${expected}" got="${actualTitle?.trim()}"`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `test9_capsule_${type}.png`), fullPage: true });
    }
    record('All 6 capsule type screenshots captured', true);
  } catch (e) {
    record('Test 9: Capsule navigation', false, e.message);
  }

  // ════════════════════════════════════════════════════════════════
  // TEST 10: Interactive capsule area — hover icons
  // ════════════════════════════════════════════════════════════════
  try {
    console.log('\n--- Test 10: Interactive capsule area ---');
    await page.goto(`${BASE}/onboarding/capsule/legacy`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(1500);

    // The interactive area is inside a section with "Apertura interactiva" label
    const interactiveArea = page.locator('div[tabindex="0"]');
    const areaExists = await interactiveArea.count();
    record('Interactive capsule area found', areaExists > 0);

    // Before hover — icons should be opacity-0
    // Use group-hover: we need to hover or focus the parent
    await interactiveArea.hover();
    await sleep(500);

    // After hover, check if the icon overlay containers are visible
    // They have class "opacity-0 group-hover:opacity-100"
    const iconOverlays = page.locator('.group-hover\\:opacity-100');
    const overlayCount = await iconOverlays.count();
    record('Hover icon overlays found', overlayCount > 0, `count=${overlayCount}`);

    // Focus the area (tabindex=0) to trigger group-focus-within
    await interactiveArea.focus();
    await sleep(300);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test10_capsule_hover.png'), fullPage: false });
    record('Screenshot: test10_capsule_hover.png', true);

    // Check icon labels are present (Fotos, Voz, Video, Mensajes, Futuro)
    const hoverLabels = ['Fotos', 'Voz', 'Video', 'Mensajes', 'Futuro'];
    for (const label of hoverLabels) {
      const labelEl = interactiveArea.locator(`text=${label}`).first();
      const exists = await labelEl.count();
      record(`Hover icon label "${label}"`, exists > 0);
    }
  } catch (e) {
    record('Test 10: Interactive area', false, e.message);
  }

  // ── Cleanup ──
  await browser.close();

  // ════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log('  QA TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\n  Total:  ${total}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Rate:   ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('  FAILURES:');
    for (const r of results.filter(r => !r.passed)) {
      console.log(`    [FAIL] ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
    }
    console.log('');
  }

  console.log(`  Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(2);
});
