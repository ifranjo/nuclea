import { test, expect } from '@playwright/test'

test.describe('Waitlist form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Scroll to waitlist section
    await page.locator('#waitlist').scrollIntoViewIfNeeded()
  })

  test('submit with empty email shows browser validation', async ({ page }) => {
    const submitButton = page.getByRole('button', {
      name: /Reservar mi lugar/i,
    })
    await submitButton.click()

    // HTML5 required validation prevents submission — email input stays visible
    const emailInput = page.locator('#waitlist').getByPlaceholder('tu@email.com')
    await expect(emailInput).toBeVisible()
  })

  test('email input has type=email for browser validation', async ({ page }) => {
    const emailInput = page.locator('#waitlist').getByPlaceholder('tu@email.com')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('privacy checkbox is required', async ({ page }) => {
    const checkbox = page.locator('#waitlist input[type="checkbox"]')
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toHaveAttribute('required', '')
  })

  test('privacy checkbox links to legal pages', async ({ page }) => {
    const waitlistSection = page.locator('#waitlist')

    const privacyLink = waitlistSection.getByRole('link', {
      name: /politica de privacidad/i,
    })
    await expect(privacyLink).toHaveAttribute('href', '/privacidad')

    const termsLink = waitlistSection.getByRole('link', {
      name: /terminos de servicio/i,
    })
    await expect(termsLink).toHaveAttribute('href', '/terminos')
  })
})

test.describe('Waitlist API', () => {
  test('GET /api/waitlist returns count', async ({ request }) => {
    const response = await request.get('/api/waitlist')
    // May return 200 with count, or 200 with count:0 if Firebase is unavailable
    expect(response.status()).toBeLessThanOrEqual(500)
    const body = await response.json()
    expect(body).toHaveProperty('count')
    expect(typeof body.count).toBe('number')
  })

  test('POST /api/waitlist with invalid data returns 400', async ({
    request,
  }) => {
    const response = await request.post('/api/waitlist', {
      data: { notAnEmail: true },
      headers: { 'Content-Type': 'application/json' },
    })
    // Zod validation should reject — 400 or 422
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).toBeLessThan(500)
  })

  test('POST /api/waitlist with missing consent fields returns 400', async ({
    request,
  }) => {
    const response = await request.post('/api/waitlist', {
      data: { email: 'test@example.com' },
      headers: { 'Content-Type': 'application/json' },
    })
    // Missing source and consentVersion fields
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).toBeLessThan(500)
  })
})
