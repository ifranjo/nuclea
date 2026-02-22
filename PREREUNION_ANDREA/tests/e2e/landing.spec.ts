import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with NUCLEA brand in hero', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'NUCLEA', level: 1 })
    await expect(heading).toBeVisible()
  })

  test('hero section shows tagline and CTA', async ({ page }) => {
    await expect(page.getByText('Capsulas Digitales del Tiempo')).toBeVisible()
    await expect(
      page.getByText('Somos las historias que recordamos')
    ).toBeVisible()

    const cta = page.getByRole('link', { name: /Empezar Gratis/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', '/registro')
  })

  test('capsule types section shows 6 types', async ({ page }) => {
    const sectionHeading = page.getByRole('heading', {
      name: /6 Tipos de Capsulas/i,
    })
    await expect(sectionHeading).toBeVisible()

    // The section renders 6 capsule type cards
    const capsuleSection = page.locator('#capsulas')
    const cards = capsuleSection.locator('.card')
    await expect(cards).toHaveCount(6)
  })

  test('pricing section shows plan card', async ({ page }) => {
    const pricingHeading = page.getByRole('heading', {
      name: /Pago unico/i,
    })
    await expect(pricingHeading).toBeVisible()

    await expect(page.getByText('Video Regalo')).toBeVisible()
    await expect(page.getByText('Sin suscripcion mensual ni anual')).toBeVisible()
  })

  test('waitlist section has email input and submit button', async ({ page }) => {
    const waitlistHeading = page.getByRole('heading', {
      name: /Lista de Espera/i,
    })
    await expect(waitlistHeading).toBeVisible()

    const emailInput = page.getByPlaceholder('tu@email.com').first()
    await expect(emailInput).toBeVisible()

    const submitButton = page.getByRole('button', {
      name: /Reservar mi lugar/i,
    })
    await expect(submitButton).toBeVisible()
  })

  test('footer contains legal links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    await expect(
      footer.getByRole('link', { name: /Privacidad/i })
    ).toHaveAttribute('href', '/privacidad')

    await expect(
      footer.getByRole('link', { name: /Terminos de Uso/i })
    ).toHaveAttribute('href', '/terminos')

    await expect(
      footer.getByRole('link', { name: /Contacto/i })
    ).toHaveAttribute('href', '/contacto')

    await expect(
      footer.getByRole('link', { name: /Consentimiento IA/i })
    ).toHaveAttribute('href', '/consentimiento')
  })

  test('footer shows copyright and social links', async ({ page }) => {
    const footer = page.locator('footer')

    await expect(footer.getByText(/NUCLEA. Todos los derechos/)).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Twitter' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Instagram' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toBeVisible()
  })
})
