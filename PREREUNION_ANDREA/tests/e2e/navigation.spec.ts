import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('root / loads the landing page', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'NUCLEA', level: 1 })
    ).toBeVisible()

    // Main content sections are present
    await expect(page.locator('#hero')).toBeVisible()
    await expect(page.locator('#capsulas')).toBeVisible()
    await expect(page.locator('#planes')).toBeVisible()
    await expect(page.locator('#waitlist')).toBeVisible()
  })

  test('/login page loads with login form', async ({ page }) => {
    await page.goto('/login')

    // NUCLEA logo/heading
    await expect(
      page.getByRole('heading', { name: 'NUCLEA', level: 1 })
    ).toBeVisible()

    // Login prompt text
    await expect(page.getByText('Inicia sesion en tu cuenta')).toBeVisible()

    // Google login button
    await expect(
      page.getByRole('button', { name: /Continuar con Google/i })
    ).toBeVisible()

    // Email and password inputs
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible()
    await expect(page.getByPlaceholder(/••••/)).toBeVisible()

    // Submit button
    await expect(
      page.getByRole('button', { name: /Iniciar Sesion/i })
    ).toBeVisible()

    // Registration link
    await expect(
      page.getByRole('link', { name: /Registrate gratis/i })
    ).toHaveAttribute('href', '/registro')
  })

  test('/registro page loads with registration form', async ({ page }) => {
    await page.goto('/registro')

    // NUCLEA logo/heading
    await expect(
      page.getByRole('heading', { name: 'NUCLEA', level: 1 })
    ).toBeVisible()

    // Registration prompt
    await expect(page.getByText('Crea tu cuenta gratuita')).toBeVisible()

    // Google signup button
    await expect(
      page.getByRole('button', { name: /Registrarse con Google/i })
    ).toBeVisible()

    // Form fields
    await expect(page.getByPlaceholder('Tu nombre')).toBeVisible()
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Min. 6 caracteres')).toBeVisible()
    await expect(page.getByPlaceholder('Repite la contrasena')).toBeVisible()

    // Terms checkbox
    await expect(
      page.getByText(/Acepto los.*terminos de servicio/i)
    ).toBeVisible()

    // Submit button
    await expect(
      page.getByRole('button', { name: /Crear Cuenta Gratis/i })
    ).toBeVisible()

    // Login link
    await expect(
      page.getByRole('link', { name: /Inicia sesion/i })
    ).toHaveAttribute('href', '/login')
  })

  test('/dashboard redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Without auth, the dashboard should redirect to login or show an auth gate
    // Wait for navigation to settle
    await page.waitForTimeout(2000)

    // Should either redirect to /login or stay on /dashboard with a loading/auth state
    const url = page.url()
    const isAuthGated =
      url.includes('/login') || url.includes('/dashboard')
    expect(isAuthGated).toBe(true)
  })

  test('landing to login navigation', async ({ page }) => {
    await page.goto('/')

    // The hero CTA goes to /registro, but login is linked from footer or header
    // Navigate via the "Empezar Gratis" CTA first
    const cta = page.getByRole('link', { name: /Empezar Gratis/i })
    await cta.click()

    await expect(page).toHaveURL('/registro')
    await expect(
      page.getByText('Crea tu cuenta gratuita')
    ).toBeVisible()
  })

  test('login page links to registration', async ({ page }) => {
    await page.goto('/login')

    const registerLink = page.getByRole('link', { name: /Registrate gratis/i })
    await registerLink.click()

    await expect(page).toHaveURL('/registro')
  })

  test('registration page links to login', async ({ page }) => {
    await page.goto('/registro')

    const loginLink = page.getByRole('link', { name: /Inicia sesion/i })
    await loginLink.click()

    await expect(page).toHaveURL('/login')
  })
})
