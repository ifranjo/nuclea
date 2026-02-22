import { test, expect } from '@playwright/test'

test.describe('Legal pages', () => {
  test('/privacidad loads with privacy policy content', async ({ page }) => {
    await page.goto('/privacidad')

    await expect(
      page.getByRole('heading', { name: /Privacidad/i, level: 1 })
    ).toBeVisible()

    // Has version info
    await expect(page.getByText(/2\.0/)).toBeVisible()

    // Has table of contents
    await expect(
      page.getByText(/Responsable del tratamiento/i)
    ).toBeVisible()

    // Has back link
    const backLink = page.getByRole('link', { name: /Volver al inicio/i })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/')
  })

  test('/terminos loads with terms of service content', async ({ page }) => {
    await page.goto('/terminos')

    await expect(
      page.getByRole('heading', { name: /rminos de Servicio/i, level: 1 })
    ).toBeVisible()

    // Has version info
    await expect(page.getByText(/2\.0/)).toBeVisible()

    // Has table of contents
    await expect(page.getByText(/Objeto del servicio/i)).toBeVisible()

    // Has back link
    const backLink = page.getByRole('link', { name: /Volver al inicio/i })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/')
  })

  test('/contacto loads with contact info', async ({ page }) => {
    await page.goto('/contacto')

    await expect(
      page.getByRole('heading', { name: /Contacto/i, level: 1 })
    ).toBeVisible()

    // Shows contact emails
    await expect(page.getByText('soporte@nuclea.app')).toBeVisible()
    await expect(page.getByText('privacidad@nuclea.app')).toBeVisible()

    // Has back link
    const backLink = page.getByRole('link', { name: /Volver al inicio/i })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/')
  })

  test('/consentimiento loads (auth-gated page)', async ({ page }) => {
    await page.goto('/consentimiento')

    // Page should load — either showing auth gate message or the consent form
    // Since user is not authenticated, it may show a loading state or redirect
    await expect(page).toHaveURL(/consentimiento|login/)
  })

  test('back navigation from /privacidad to landing', async ({ page }) => {
    await page.goto('/privacidad')

    const backLink = page.getByRole('link', { name: /Volver al inicio/i })
    await backLink.click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { name: 'NUCLEA', level: 1 })
    ).toBeVisible()
  })

  test('back navigation from /terminos to landing', async ({ page }) => {
    await page.goto('/terminos')

    const backLink = page.getByRole('link', { name: /Volver al inicio/i })
    await backLink.click()

    await expect(page).toHaveURL('/')
  })

  test('back navigation from /contacto to landing', async ({ page }) => {
    await page.goto('/contacto')

    const backLink = page.getByRole('link', { name: /Volver al inicio/i })
    await backLink.click()

    await expect(page).toHaveURL('/')
  })
})
