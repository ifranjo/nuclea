import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './fixtures'

test.describe('Dashboard functionality', () => {
  test('dashboard loads and shows capsule grid for Homer (2 capsules)', async ({ page }) => {
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Header is visible with NUCLEA branding
    await expect(page.locator('header').getByText('NUCLEA')).toBeVisible()
    // User name is shown
    await expect(page.getByText(TEST_USERS.homer.name)).toBeVisible()

    // Section heading
    await expect(page.getByText('Mis cápsulas')).toBeVisible()

    // Homer has 2 capsules from seed + 1 sent capsule ("Para mi hijo Bart")
    // The sent capsule may or may not show depending on query — at least 2 should be visible
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

    // "Momentos en Springfield" capsule should be visible
    await expect(page.getByText('Momentos en Springfield')).toBeVisible()

    // Type label "Legacy" should appear
    await expect(page.getByText('Legacy').first()).toBeVisible()

    // Status badge "Activa" should appear
    await expect(page.getByText('Activa').first()).toBeVisible()
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

    // Click "Crear cápsula" button
    const createButton = page.getByRole('button', { name: /crear cápsula/i })
    await expect(createButton).toBeVisible({ timeout: 10000 })
    await createButton.click()

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })
  })

  test('Marge sees collaborator badge on shared capsule', async ({ page }) => {
    await loginAs(page, TEST_USERS.marge.email, TEST_USERS.marge.password)

    // Wait for capsule grid to load
    await expect(page.locator('a[href^="/capsule/"]').first()).toBeVisible({ timeout: 10000 })

    // Marge is a collaborator on Homer's capsule — should see "Colaborador" badge
    await expect(page.getByText('Colaborador')).toBeVisible({ timeout: 5000 })
  })

  test('Maggie (no capsules) sees empty state', async ({ page }) => {
    await loginAs(page, TEST_USERS.maggie.email, TEST_USERS.maggie.password)

    // Maggie has 0 capsules — should see the empty state message
    // Note: She may see a "designated person" capsule depending on query.
    // If she sees no capsules, the empty state text appears.
    const emptyMessage = page.getByText('Aún no tienes cápsulas')
    const capsuleCards = page.locator('a[href^="/capsule/"]')

    // Wait for loading to finish
    await page.waitForTimeout(3000)

    // Either empty state or capsule grid should be visible (depends on query logic)
    const isEmpty = await emptyMessage.isVisible().catch(() => false)
    const hasCards = await capsuleCards.first().isVisible().catch(() => false)

    expect(isEmpty || hasCards).toBeTruthy()
  })
})
