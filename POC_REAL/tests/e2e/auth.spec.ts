import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './fixtures'

test.describe('Authentication flows', () => {
  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)
    await expect(page).toHaveURL(/\/dashboard/)
    // Dashboard header shows the user name
    await expect(page.getByText(TEST_USERS.homer.name)).toBeVisible({ timeout: 10000 })
  })

  test('login with invalid credentials shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('invalid@nuclea.test')
    await page.getByLabel('Contraseña').fill('wrongpassword')
    await page.getByRole('button', { name: /entrar/i }).click()

    // Error message should appear
    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible({ timeout: 10000 })
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('registration form validates required fields', async ({ page }) => {
    await page.goto('/registro')

    // Page loads with expected elements
    await expect(page.getByText('Crea tu cuenta')).toBeVisible()
    await expect(page.getByLabel('Nombre completo')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()

    // Checkboxes for terms and privacy should be visible
    await expect(page.getByText('Acepto los Términos de Servicio')).toBeVisible()
    await expect(page.getByText('Acepto la Política de Privacidad')).toBeVisible()

    // Submit button should be disabled when checkboxes are unchecked
    const submitButton = page.getByRole('button', { name: /crear cuenta/i })
    await expect(submitButton).toBeDisabled()
  })

  test('registration form enables submit when both checkboxes checked', async ({ page }) => {
    await page.goto('/registro')

    // Fill in fields
    await page.getByLabel('Nombre completo').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Contraseña').fill('password123')

    // Check both consent checkboxes
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    const privacyCheckbox = page.locator('input[type="checkbox"]').last()
    await termsCheckbox.check()
    await privacyCheckbox.check()

    // Submit button should now be enabled
    const submitButton = page.getByRole('button', { name: /crear cuenta/i })
    await expect(submitButton).toBeEnabled()
  })

  test('logout redirects to login page', async ({ page }) => {
    // Login first
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)
    await expect(page).toHaveURL(/\/dashboard/)

    // Click logout button
    await page.getByRole('button', { name: /cerrar sesión/i }).click()

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('protected route redirects unauthenticated user to login', async ({ page }) => {
    // Try to visit dashboard without being logged in
    await page.goto('/dashboard')

    // Middleware should redirect to /login with a redirect param
    await expect(page).toHaveURL(/\/login/)
  })

  test('protected route preserves redirect param after login', async ({ page }) => {
    // Visit a protected route
    await page.goto('/settings')

    // Should be redirected to login with redirect param
    await expect(page).toHaveURL(/\/login\?redirect/)

    // Login
    await page.getByLabel('Email').fill(TEST_USERS.homer.email)
    await page.getByLabel('Contraseña').fill(TEST_USERS.homer.password)
    await page.getByRole('button', { name: /entrar/i }).click()

    // Should be redirected to the originally requested page
    await expect(page).toHaveURL(/\/settings/, { timeout: 15000 })
  })

  test('authenticated user visiting /login is redirected to /dashboard', async ({ page }) => {
    // Login first
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Visit login page while authenticated
    await page.goto('/login')

    // Middleware should redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })
})
