import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './fixtures'

test.describe('Dashboard functionality', () => {
  test('dashboard loads and shows capsule grid for Homer', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Header is visible with NUCLEA branding
    await expect(page.locator('header').getByText('NUCLEA')).toBeVisible()
    // User name is shown
    await expect(page.getByText(TEST_USERS.homer.name)).toBeVisible()

    // Section heading
    await expect(page.getByText('Mis cápsulas')).toBeVisible()

    // Homer has 2 active capsules + 1 sent ("Para mi hijo Bart") from seed
    // At least 2 should be visible as capsule links
    const capsuleCards = page.locator('a[href^="/capsule/"]')
    await expect(capsuleCards.first()).toBeVisible({ timeout: 10000 })
    const count = await capsuleCards.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('each capsule card shows title, type label, and status badge', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Wait for capsules to load
    const firstCard = page.locator('a[href^="/capsule/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Homer's capsules: "Momentos en Springfield" and "Homer y Marge"
    // At least one of them should be visible
    const momentos = page.getByText('Momentos en Springfield')
    const homerMarge = page.getByText('Homer y Marge')
    const hasMomentos = await momentos.isVisible().catch(() => false)
    const hasHomerMarge = await homerMarge.isVisible().catch(() => false)
    expect(hasMomentos || hasHomerMarge).toBeTruthy()

    // Type label should appear (Legacy or Together)
    const hasLegacy = await page.getByText('Legacy').first().isVisible().catch(() => false)
    const hasTogether = await page.getByText('Together').first().isVisible().catch(() => false)
    expect(hasLegacy || hasTogether).toBeTruthy()

    // Status badge "Activa" or "Enviada" should appear
    const hasActiva = await page.getByText('Activa').first().isVisible().catch(() => false)
    const hasEnviada = await page.getByText('Enviada').first().isVisible().catch(() => false)
    expect(hasActiva || hasEnviada).toBeTruthy()
  })

  test('capsule card shows storage indicator', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Wait for capsules to load
    await expect(page.locator('a[href^="/capsule/"]').first()).toBeVisible({ timeout: 10000 })

    // Storage indicator "de 500 MB" should be present on at least one card
    await expect(page.getByText(/de 500 MB/).first()).toBeVisible()
  })

  test('clicking a capsule card navigates to capsule detail', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Wait for capsules
    const firstCard = page.locator('a[href^="/capsule/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Click the first capsule card
    await firstCard.click()

    // Should navigate to /capsule/[id]
    await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })
  })

  test('"Crear cápsula" button navigates to onboarding', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Wait for dashboard to fully load
    await expect(page.getByText('Mis cápsulas')).toBeVisible({ timeout: 10000 })

    // The "Crear cápsula" button contains a Plus icon + text
    const createButton = page.getByRole('button', { name: /crear cápsula/i })
    await expect(createButton).toBeVisible({ timeout: 10000 })
    await createButton.click()

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })
  })

  test('Marge sees collaborator badge on shared capsule', async ({ page }) => {
    await loginAs(page, TEST_USERS.marge.email, TEST_USERS.marge.password)

    // Wait for capsule grid to load
    await expect(page.locator('a[href^="/capsule/"]').first()).toBeVisible({ timeout: 10000 })

    // Marge owns 1 capsule ("La familia Simpson") and is collaborator on Homer's "Momentos en Springfield"
    // The collaborator badge appears when capsule.owner_id !== profile.id
    await expect(page.getByText('Colaborador')).toBeVisible({ timeout: 5000 })
  })

  test('Maggie (no capsules) sees empty state', async ({ page }) => {
    await loginAs(page, TEST_USERS.maggie.email, TEST_USERS.maggie.password)

    // Maggie has 0 owned capsules and 0 collaborated capsules
    // She is a designated person but that does not give capsule access
    // Wait for loading to finish
    await page.waitForTimeout(3000)

    // Should see the empty state message
    await expect(page.getByText('Aún no tienes cápsulas')).toBeVisible({ timeout: 5000 })
  })
})
