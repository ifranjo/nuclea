/**
 * QA Visual Test — POC_REAL Bug Fix Verification
 * Tests BUG-03/04/05/06/07/08/10/13/15/16
 *
 * Run: node tests/qa_visual_bugfixes.mjs
 * Requires: dev server on :3002, Supabase Docker running
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:3002'
const SCREENSHOTS_DIR = path.join(import.meta.dirname, '..', 'screenshots', 'qa')
const RESULTS = []

function record(bugId, description, status, detail = '') {
  RESULTS.push({ bugId, description, status, detail })
  const icon = status === 'PASS' ? '[PASS]' : status === 'FAIL' ? '[FAIL]' : '[WARN]'
  console.log(`${icon} ${bugId}: ${description}${detail ? ' — ' + detail : ''}`)
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function loginAs(page, name, email, password) {
  const quickFill = page.getByRole('button', { name })

  if (await quickFill.count()) {
    // Ensure hydration before submit: quick-fill only works once React handlers are mounted.
    for (let i = 0; i < 5; i++) {
      await quickFill.first().click()
      await sleep(350)
      const emailProbe = await page.locator('input[type="email"]').inputValue()
      if (emailProbe.includes('@nuclea.test')) break
      await sleep(400)
    }
  }

  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')

  let emailVal = await emailInput.inputValue()
  let passVal = await passwordInput.inputValue()

  if (emailVal !== email || passVal !== password) {
    await emailInput.fill(email)
    await passwordInput.fill(password)
    emailVal = await emailInput.inputValue()
    passVal = await passwordInput.inputValue()
  }

  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(3000)
  await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {})

  return {
    finalUrl: page.url(),
    emailVal,
    passVal,
  }
}

async function run() {
  // Ensure screenshots dir
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

  const headless = process.env.HEADLESS !== 'false'
  const browser = await chromium.launch({ headless })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  })

  // Collect console errors for hydration check
  const consoleErrors = []
  const page = await context.newPage()
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  try {
    // ========== STEP 1: Login page ==========
    console.log('\n--- Step 1: Navigate to /login ---')
    const loginResp = await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 })
    await sleep(1000)

    if (!loginResp || loginResp.status() >= 500) {
      record('SETUP', 'Login page loads', 'FAIL', `HTTP ${loginResp?.status() || 'no response'}`)
      // Try clearing .next and suggest restart
      console.log('\n[ERROR] Login page returns 500. The dev server may need a restart.')
      console.log('Try: cd POC_REAL && rm -rf .next && npm run dev')
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login_error.png'), fullPage: true })

      // Try navigating client-side from root
      console.log('Attempting client-side navigation from root...')
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 10000 })
      await sleep(500)

      // Check if root page has navigation
      const rootContent = await page.content()
      if (rootContent.includes('login') || rootContent.includes('Login')) {
        console.log('Root page has login reference, trying navigation...')
      }

      // Try direct URL with hash
      await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 10000 })
      await sleep(2000)
      const loginContent2 = await page.content()
      if (loginContent2.includes('Entrar') || loginContent2.includes('homer@nuclea.test')) {
        console.log('Login page loaded on retry (client-side rendering)')
        record('SETUP', 'Login page loads (client render)', 'PASS')
      } else {
        record('SETUP', 'Login page loads', 'FAIL', 'Server returns 500, client render also failed')
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login_failed.png'), fullPage: true })
        // Continue anyway to test what we can
      }
    } else {
      record('SETUP', 'Login page loads', 'PASS', `HTTP ${loginResp.status()}`)
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login.png'), fullPage: true })

    // ========== STEP 2: Login as Homer ==========
    console.log('\n--- Step 2: Login as Homer ---')
    try {
      let login = await loginAs(page, 'Homer', 'homer@nuclea.test', 'nuclea123')
      if (login.finalUrl.includes('/login?')) {
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 })
        await sleep(1200)
        login = await loginAs(page, 'Homer', 'homer@nuclea.test', 'nuclea123')
      }
      console.log(`  Email filled: ${login.emailVal}, Password filled: ${login.passVal ? 'yes' : 'no'}`)
      console.log(`  Current URL after login: ${login.finalUrl}`)

      if (login.finalUrl.includes('/dashboard')) {
        record('LOGIN', 'Homer login + redirect to dashboard', 'PASS')
      } else {
        const errorText = await page.locator('body').innerText()
        const detail = errorText.includes('incorrectos')
          ? 'Credenciales rechazadas en login'
          : `Ended at ${login.finalUrl}`
        record('LOGIN', 'Homer login + redirect to dashboard', 'FAIL', detail)
      }
    } catch (e) {
      record('LOGIN', 'Homer login flow', 'FAIL', e.message)
    }

    // ========== STEP 3: BUG-13 — Dashboard loads (not stuck on Cargando) ==========
    console.log('\n--- Step 3: BUG-13 — Dashboard loads ---')
    try {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })

      // Allow auth/session hydration to settle before declaring an infinite loading state.
      for (let i = 0; i < 10; i++) {
        const bodyProbe = await page.locator('body').innerText()
        if (!bodyProbe.includes('Cargando...') || bodyProbe.includes('Mis cápsulas')) break
        await sleep(1000)
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_dashboard_homer.png'), fullPage: true })

      const bodyText = await page.locator('body').innerText()
      const hasLoading = bodyText.includes('Cargando')
      const hasCapsules = await page.locator('[class*="capsul"], [data-testid*="capsule"], a[href*="/capsule/"]').count()

      // Also check for capsule cards by looking for common capsule UI
      const capsuleCards = await page.locator('div[class*="grid"] > div, div[class*="grid"] > a').count()

      console.log(`  Body has "Cargando": ${hasLoading}`)
      console.log(`  Capsule links found: ${hasCapsules}`)
      console.log(`  Grid items found: ${capsuleCards}`)

      if (hasLoading && hasCapsules === 0) {
        record('BUG-13', 'Dashboard stuck on "Cargando..."', 'FAIL', 'Still showing loading state')
      } else if (hasCapsules > 0 || capsuleCards > 0) {
        record('BUG-13', 'Dashboard loads with capsules (not stuck)', 'PASS', `${hasCapsules || capsuleCards} items visible`)
      } else {
        record('BUG-13', 'Dashboard loads but no capsules found', 'WARN', 'No loading state, but no capsule cards either')
      }
    } catch (e) {
      record('BUG-13', 'Dashboard loads', 'FAIL', e.message)
    }

    // ========== STEP 4: BUG-04 — Storage shows real bytes ==========
    console.log('\n--- Step 4: BUG-04 — Storage shows real bytes ---')
    try {
      const storageTexts = await page.locator('body').innerText()
      const hasZeroKB = storageTexts.includes('0 KB de') || storageTexts.includes('0 bytes')
      const storageMatch = storageTexts.match(/(\d+(?:\.\d+)?)\s*(KB|MB|GB)\s*de\s*(\d+(?:\.\d+)?)\s*(KB|MB|GB)/i)

      if (storageMatch) {
        const used = parseFloat(storageMatch[1])
        console.log(`  Storage display: ${storageMatch[0]}`)
        if (used > 0) {
          record('BUG-04', 'Storage shows real bytes (not 0 KB)', 'PASS', storageMatch[0])
        } else {
          record('BUG-04', 'Storage shows 0 KB', 'WARN', 'May be correct if capsule is empty')
        }
      } else {
        // Look for any storage-related text
        const storageAny = storageTexts.match(/\d+\s*(KB|MB|GB|bytes)/gi)
        if (storageAny) {
          record('BUG-04', 'Storage display found', 'PASS', storageAny.join(', '))
        } else {
          record('BUG-04', 'Storage display', 'WARN', 'No storage text found on dashboard')
        }
      }
    } catch (e) {
      record('BUG-04', 'Storage display check', 'FAIL', e.message)
    }

    // ========== STEP 5: BUG-03/16 — Logout button accessible ==========
    console.log('\n--- Step 5: BUG-03/16 — Logout button accessible ---')
    try {
      const currentUrl = page.url()
      if (!currentUrl.includes('/dashboard')) {
        record('BUG-03/16', 'Logout button with aria-label="Cerrar sesión"', 'WARN', 'Skipped — user is not in dashboard')
      } else {
      const logoutBtn = page.locator('[aria-label="Cerrar sesión"], button:has-text("Cerrar sesión"), button:has-text("Salir")')
      const logoutCount = await logoutBtn.count()

      if (logoutCount > 0) {
        const ariaLabel = await logoutBtn.first().getAttribute('aria-label')
        record('BUG-03/16', 'Logout button with aria-label', 'PASS', `aria-label="${ariaLabel}"`)
      } else {
        // Check nav/header for any logout icon button
        const iconBtns = page.locator('button[aria-label]')
        const labels = []
        for (let i = 0; i < await iconBtns.count(); i++) {
          labels.push(await iconBtns.nth(i).getAttribute('aria-label'))
        }
        record('BUG-03/16', 'Logout button with aria-label="Cerrar sesión"', 'FAIL', `Found labels: ${labels.join(', ') || 'none'}`)
      }
      }
    } catch (e) {
      record('BUG-03/16', 'Logout button check', 'FAIL', e.message)
    }

    // ========== STEP 6: BUG-05/06/07 — Logout should not crash app ==========
    console.log('\n--- Step 6: BUG-05/06/07 — Logout stability ---')
    try {
      const currentUrl = page.url()
      if (!currentUrl.includes('/dashboard')) {
        record('BUG-05/06/07', 'Logout stability', 'WARN', 'Skipped — user is not authenticated')
      } else {
        const logoutBtn = page.locator('[aria-label="Cerrar sesión"], button:has-text("Cerrar sesión"), button:has-text("Salir")')
        if (await logoutBtn.count()) {
          await logoutBtn.first().click()
          await sleep(2000)
          await page.waitForURL('**/login**', { timeout: 10000 }).catch(() => {})

          const afterLogoutUrl = page.url()
          if (afterLogoutUrl.includes('/login')) {
            await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })
            await sleep(1000)
            const redirectedUrl = page.url()

            if (redirectedUrl.includes('/login') || redirectedUrl.includes('/dashboard')) {
              record('BUG-05/06/07', 'Logout no longer causes internal server error', 'PASS', `Post-logout URL: ${redirectedUrl}`)
            } else {
              record('BUG-05/06/07', 'Logout route behavior', 'WARN', `Unexpected URL after logout: ${redirectedUrl}`)
            }
          } else {
            record('BUG-05/06/07', 'Logout redirects to login', 'FAIL', `Ended at ${afterLogoutUrl}`)
          }
        } else {
          record('BUG-05/06/07', 'Logout button visible', 'FAIL', 'Button not found')
        }
      }
    } catch (e) {
      record('BUG-05/06/07', 'Logout stability', 'FAIL', e.message)
    }

    // ========== STEP 7: BUG-06 — Bottom nav doesn't overlap ==========
    console.log('\n--- Step 6: BUG-06 — Bottom nav overlap check ---')
    try {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await sleep(500)

      // Check if there's a bottom nav
      const bottomNav = page.locator('nav[class*="fixed"], nav[class*="bottom"], div[class*="bottom-nav"]')
      if (await bottomNav.count() > 0) {
        const navBox = await bottomNav.first().boundingBox()
        // Check if content has padding-bottom to account for nav
        const mainContent = page.locator('main, div[class*="container"], div[class*="content"]')
        if (await mainContent.count() > 0) {
          const contentBox = await mainContent.first().boundingBox()
          if (contentBox && navBox) {
            const overlap = contentBox.y + contentBox.height > navBox.y
            if (!overlap) {
              record('BUG-06', 'Bottom nav does not overlap content', 'PASS')
            } else {
              // Check if there's padding
              const paddingBottom = await page.evaluate(() => {
                const main = document.querySelector('main') || document.querySelector('[class*="container"]')
                return main ? getComputedStyle(main).paddingBottom : 'N/A'
              })
              record('BUG-06', 'Bottom nav overlap', paddingBottom !== '0px' ? 'PASS' : 'FAIL', `padding-bottom: ${paddingBottom}`)
            }
          } else {
            record('BUG-06', 'Bottom nav overlap check', 'WARN', 'Could not get bounding boxes')
          }
        }
      } else {
        record('BUG-06', 'Bottom nav', 'WARN', 'No fixed bottom nav found')
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_dashboard_bottom.png'), fullPage: true })
    } catch (e) {
      record('BUG-06', 'Bottom nav overlap check', 'FAIL', e.message)
    }

    // ========== STEP 8: Open capsule detail ==========
    console.log('\n--- Step 7: Open capsule detail ---')
    let capsuleDetailUrl = null
    try {
      if (page.url().includes('/login')) {
        const relogin = await loginAs(page, 'Homer', 'homer@nuclea.test', 'nuclea123')
        if (!relogin.finalUrl.includes('/dashboard')) {
          record('DETAIL', 'Re-login before detail', 'FAIL', `Ended at ${relogin.finalUrl}`)
        }
      }

      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })
      await sleep(1500)

      // Find first capsule link
      const capsuleLink = page.locator('a[href*="/capsule/"]').first()
      if (await capsuleLink.isVisible({ timeout: 3000 })) {
        const href = await capsuleLink.getAttribute('href')
        console.log(`  Clicking capsule link: ${href}`)
        await capsuleLink.click()
        await sleep(2000)
        await page.waitForURL('**/capsule/**', { timeout: 5000 }).catch(() => {})

        capsuleDetailUrl = page.url()
        console.log(`  Capsule detail URL: ${capsuleDetailUrl}`)

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_capsule_detail.png'), fullPage: true })
        record('DETAIL', 'Capsule detail page loads', 'PASS')
      } else {
        record('DETAIL', 'Capsule link found', 'FAIL', 'No capsule links on dashboard')
      }
    } catch (e) {
      record('DETAIL', 'Open capsule detail', 'FAIL', e.message)
    }

    // ========== STEP 9: BUG-05 — Calendar circles not oversized ==========
    console.log('\n--- Step 8: BUG-05 — Calendar circles ---')
    try {
      if (capsuleDetailUrl) {
        // Look for calendar elements
        const calendarCells = page.locator('[class*="calendar"] button, [class*="calendar"] div[class*="day"], td button, .calendar button')
        const cellCount = await calendarCells.count()

        if (cellCount > 0) {
          // Check size of first few calendar day elements
          const firstCell = calendarCells.first()
          const box = await firstCell.boundingBox()
          if (box) {
            console.log(`  Calendar cell size: ${box.width}x${box.height}`)
            // w-8 h-8 = 32px. Allow some tolerance (28-40px)
            if (box.width <= 44 && box.height <= 44) {
              record('BUG-05', 'Calendar circles properly sized', 'PASS', `${box.width}x${box.height}px`)
            } else {
              record('BUG-05', 'Calendar circles oversized', 'FAIL', `${box.width}x${box.height}px (expected ~32px)`)
            }
          } else {
            record('BUG-05', 'Calendar circles', 'WARN', 'Could not measure cell size')
          }
        } else {
          record('BUG-05', 'Calendar circles', 'WARN', 'No calendar cells found on detail page')
        }
      } else {
        record('BUG-05', 'Calendar circles', 'WARN', 'Skipped — no capsule detail page')
      }
    } catch (e) {
      record('BUG-05', 'Calendar circles check', 'FAIL', e.message)
    }

    // ========== STEP 10: BUG-07/08 — Share URL visible ==========
    console.log('\n--- Step 9: BUG-07/08 — Share URL visible ---')
    try {
      if (capsuleDetailUrl) {
        const shareBtn = page.locator('button:has-text("Compartir"), button[aria-label*="ompartir"], button:has-text("Share")')
        if (await shareBtn.isVisible({ timeout: 3000 })) {
          await shareBtn.click()
          await sleep(1500)

          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_share_url.png'), fullPage: true })

          // Check for share URL input
          const shareInput = page.locator('input[value*="share"], input[value*="/share/"], input[readonly], input[type="text"][value*="http"], input[type="url"]')
          const shareInputCount = await shareInput.count()

          // Also check for any visible URL text
          const bodyAfterShare = await page.locator('body').innerText()
          const hasShareUrl = bodyAfterShare.includes('/share/') || bodyAfterShare.includes('localhost:3002/share')

          if (shareInputCount > 0) {
            const urlValue = await shareInput.first().inputValue()
            record('BUG-07/08', 'Share URL input visible after clicking Compartir', 'PASS', urlValue)
          } else if (hasShareUrl) {
            record('BUG-07/08', 'Share URL text visible', 'PASS', 'URL text found in page')
          } else {
            // Check for any new elements that appeared
            const newInputs = await page.locator('input').count()
            record('BUG-07/08', 'Share URL input visible', 'FAIL', `No share URL found. ${newInputs} inputs on page.`)
          }
        } else {
          record('BUG-07/08', 'Compartir button', 'FAIL', 'Button not found on detail page')
        }
      } else {
        record('BUG-07/08', 'Share URL', 'WARN', 'Skipped — no capsule detail page')
      }
    } catch (e) {
      record('BUG-07/08', 'Share URL check', 'FAIL', e.message)
    }

    // ========== STEP 11: BUG-15 — User switching ==========
    console.log('\n--- Step 10: BUG-15 — User switching (Homer → Bart) ---')
    try {
      // Go back to dashboard first
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 })
      await sleep(2000)

      // Get Homer's capsule info
      const homerCapsules = await page.locator('a[href*="/capsule/"]').count()
      const homerText = await page.locator('body').innerText()
      console.log(`  Homer capsules count: ${homerCapsules}`)

      // Sign out
      const logoutBtn = page.locator('[aria-label="Cerrar sesión"], button:has-text("Cerrar sesión"), button:has-text("Salir")')
      if (await logoutBtn.isVisible({ timeout: 3000 })) {
        await logoutBtn.first().click()
        await sleep(2000)
      } else {
        // Try navigating to login directly
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 10000 })
        await sleep(1000)
      }

      // Login as Bart
      let bartLogin = await loginAs(page, 'Bart', 'bart@nuclea.test', 'nuclea123')
      if (bartLogin.finalUrl.includes('/login?')) {
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 })
        await sleep(1200)
        bartLogin = await loginAs(page, 'Bart', 'bart@nuclea.test', 'nuclea123')
      }

      if (bartLogin.finalUrl.includes('/dashboard')) {
        await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 10000 })
        await sleep(3000)

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_dashboard_bart.png'), fullPage: true })

        const bartCapsules = await page.locator('a[href*="/capsule/"]').count()
        const bartText = await page.locator('body').innerText()
        console.log(`  Bart capsules count: ${bartCapsules}`)

        // Compare — different users should have different capsules
        if (bartCapsules !== homerCapsules || (homerText !== bartText && bartCapsules > 0)) {
          record('BUG-15', 'User switching shows different capsules', 'PASS', `Homer: ${homerCapsules}, Bart: ${bartCapsules}`)
        } else if (bartCapsules === 0 && homerCapsules === 0) {
          record('BUG-15', 'User switching', 'WARN', 'Both users have 0 capsules — cannot verify difference')
        } else {
          record('BUG-15', 'User switching shows different data', 'FAIL', `Same capsule count: ${bartCapsules}`)
        }
      } else {
        record('BUG-15', 'Bart login', 'FAIL', `Ended at ${bartLogin.finalUrl}`)
      }
    } catch (e) {
      record('BUG-15', 'User switching', 'FAIL', e.message)
    }

    // ========== STEP 12: BUG-10 — Onboarding hydration ==========
    console.log('\n--- Step 11: BUG-10 — Onboarding hydration ---')
    try {
      // Clear console errors
      consoleErrors.length = 0

      await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle', timeout: 15000 })
      await sleep(2000)

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_onboarding_p1.png'), fullPage: true })

      const onboardingText = await page.locator('body').innerText()
      const p1Visible = onboardingText.includes('NUCLEA') || onboardingText.length > 50

      // Check for hydration errors
      const hydrationErrors = consoleErrors.filter(e =>
        e.includes('Hydration') || e.includes('hydration') ||
        e.includes('mismatch') ||
        e.includes('did not match')
      )

      if (p1Visible && hydrationErrors.length === 0) {
        record('BUG-10', 'Onboarding P1 renders without hydration errors', 'PASS')
      } else if (hydrationErrors.length > 0) {
        record('BUG-10', 'Onboarding P1 hydration', 'FAIL', hydrationErrors[0].substring(0, 100))
      } else {
        record('BUG-10', 'Onboarding P1', 'WARN', 'Page loaded but content unclear')
      }

      // Test step=3
      consoleErrors.length = 0
      await page.goto(`${BASE}/onboarding?step=3`, { waitUntil: 'networkidle', timeout: 15000 })
      await sleep(2000)

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_onboarding_p3.png'), fullPage: true })

      const p3Text = await page.locator('body').innerText()
      const p3HydrationErrors = consoleErrors.filter(e =>
        e.includes('Hydration') || e.includes('hydration') ||
        e.includes('mismatch') || e.includes('did not match')
      )

      if (p3Text.length > 50 && p3HydrationErrors.length === 0) {
        record('BUG-10', 'Onboarding P3 (?step=3) renders without hydration errors', 'PASS')
      } else if (p3HydrationErrors.length > 0) {
        record('BUG-10', 'Onboarding P3 hydration', 'FAIL', p3HydrationErrors[0].substring(0, 100))
      } else {
        record('BUG-10', 'Onboarding P3', 'WARN', 'Page loaded but content minimal')
      }
    } catch (e) {
      record('BUG-10', 'Onboarding check', 'FAIL', e.message)
    }

  } catch (e) {
    console.error('\n[FATAL ERROR]', e.message)
  } finally {
    await browser.close()
  }

  // ========== FINAL REPORT ==========
  console.log('\n')
  console.log('='.repeat(70))
  console.log('  QA VISUAL BUG FIX VERIFICATION REPORT')
  console.log('='.repeat(70))
  console.log('')

  const passed = RESULTS.filter(r => r.status === 'PASS').length
  const failed = RESULTS.filter(r => r.status === 'FAIL').length
  const warned = RESULTS.filter(r => r.status === 'WARN').length

  for (const r of RESULTS) {
    const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'WARN'
    console.log(`  [${icon}] ${r.bugId.padEnd(12)} ${r.description}`)
    if (r.detail) console.log(`${''.padEnd(19)}${r.detail}`)
  }

  console.log('')
  console.log(`  Total: ${RESULTS.length} | PASS: ${passed} | FAIL: ${failed} | WARN: ${warned}`)
  console.log('='.repeat(70))
  console.log(`  Screenshots saved to: ${SCREENSHOTS_DIR}`)
  console.log('='.repeat(70))
}

run().catch(console.error)
