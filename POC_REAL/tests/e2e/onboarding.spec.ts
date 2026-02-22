import { test, expect } from '@playwright/test'

test.describe('Onboarding flow', () => {
  test('P1 loads and shows "Toca para abrir" hint', async ({ page }) => {
    await page.goto('/onboarding')

    // P1 — capsule closed with hint text
    await expect(page.getByText('Toca para abrir')).toBeVisible({ timeout: 10000 })

    // The capsule image should be present
    await expect(page.getByAltText('Cápsula NUCLEA cerrada')).toBeVisible()
  })

  test('P1 click advances to P2 and URL updates', async ({ page }) => {
    await page.goto('/onboarding')

    // Click the capsule to advance
    const capsuleButton = page.getByRole('button', { name: /toca para abrir/i })
    await expect(capsuleButton).toBeVisible({ timeout: 10000 })
    await capsuleButton.click()

    // URL should update to step=2
    await expect(page).toHaveURL(/step=2/, { timeout: 10000 })
  })

  test('P2 auto-advances to P3 (or has continue mechanism)', async ({ page }) => {
    // Start at P2 directly
    await page.goto('/onboarding?step=2')

    // P2 has an auto-advance timer — wait for it to go to step 3
    // or look for P3 content within a reasonable time
    await expect(page).toHaveURL(/step=3/, { timeout: 15000 })
  })

  test('P3 manifesto shows expected text and continue button', async ({ page }) => {
    await page.goto('/onboarding?step=3')

    // P3 manifesto content
    await expect(page.getByText('Somos las historias que recordamos.')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Haz que las tuyas permanezcan.')).toBeVisible()

    // Continue button
    const continueButton = page.getByRole('button', { name: /continuar/i })
    await expect(continueButton).toBeVisible()
  })

  test('P3 continue button advances to P4', async ({ page }) => {
    await page.goto('/onboarding?step=3')

    await expect(page.getByText('Somos las historias que recordamos.')).toBeVisible({ timeout: 10000 })

    // Click continue
    await page.getByRole('button', { name: /continuar/i }).click()

    // URL should update to step=4
    await expect(page).toHaveURL(/step=4/, { timeout: 10000 })
  })

  test('P4 shows capsule type selection cards', async ({ page }) => {
    await page.goto('/onboarding?step=4')

    // P4 — capsule selection
    await expect(page.getByText('Elige tu cápsula')).toBeVisible({ timeout: 10000 })

    // Should show the 6 capsule type cards (names from CAPSULE_TYPES)
    await expect(page.getByText('Cápsula Legacy').first()).toBeVisible()
  })

  test('full P1 -> P2 -> P3 -> P4 navigation works end-to-end', async ({ page }) => {
    await page.goto('/onboarding')

    // P1: Click capsule
    const capsuleButton = page.getByRole('button', { name: /toca para abrir/i })
    await expect(capsuleButton).toBeVisible({ timeout: 10000 })
    await capsuleButton.click()

    // P2: Wait for auto-advance to P3
    await expect(page).toHaveURL(/step=3/, { timeout: 15000 })

    // P3: Click continue
    await expect(page.getByText('Somos las historias que recordamos.')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /continuar/i }).click()

    // P4: Should show capsule selection
    await expect(page).toHaveURL(/step=4/, { timeout: 10000 })
    await expect(page.getByText('Elige tu cápsula')).toBeVisible({ timeout: 10000 })
  })

  test('direct URL navigation to ?step=N works for all steps', async ({ page }) => {
    // Step 1
    await page.goto('/onboarding?step=1')
    await expect(page.getByText('Toca para abrir')).toBeVisible({ timeout: 10000 })

    // Step 3 (skip 2 since it auto-advances)
    await page.goto('/onboarding?step=3')
    await expect(page.getByText('Somos las historias que recordamos.')).toBeVisible({ timeout: 10000 })

    // Step 4
    await page.goto('/onboarding?step=4')
    await expect(page.getByText('Elige tu cápsula')).toBeVisible({ timeout: 10000 })
  })

  test('invalid step parameter defaults to step 1', async ({ page }) => {
    await page.goto('/onboarding?step=99')

    // Should default to P1
    await expect(page.getByText('Toca para abrir')).toBeVisible({ timeout: 10000 })
  })

  test('onboarding is a public route (no auth required)', async ({ page }) => {
    // Onboarding should be accessible without login
    await page.goto('/onboarding')

    // Should NOT redirect to /login
    await expect(page).toHaveURL(/\/onboarding/)

    // P1 content should be visible
    await expect(page.getByText('Toca para abrir')).toBeVisible({ timeout: 10000 })
  })
})
