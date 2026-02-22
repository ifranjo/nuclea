import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './fixtures'

test.describe('Share page (public)', () => {
  test('share page loads with capsule title and contents (no auth required)', async ({ page }) => {
    // First, login to get a share token
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    // Navigate to Homer's first capsule
    const capsuleLink = page.getByText('Momentos en Springfield')
    await expect(capsuleLink).toBeVisible({ timeout: 10000 })
    await capsuleLink.click()
    await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

    // Click share to get the URL
    const shareButton = page.getByRole('button', { name: /compartir/i })
    await expect(shareButton).toBeVisible()
    await shareButton.click()

    // Get the share URL from the readonly input
    const shareInput = page.locator('input[readonly]')
    await expect(shareInput).toBeVisible({ timeout: 10000 })
    const shareUrl = await shareInput.inputValue()
    expect(shareUrl).toContain('/share/')

    // Extract the path portion
    const url = new URL(shareUrl)
    const sharePath = url.pathname

    // Open an incognito-like context (new page, no cookies)
    const newContext = await page.context().browser()!.newContext({
      reducedMotion: 'reduce',
    })
    const publicPage = await newContext.newPage()

    // Visit the share page without authentication
    await publicPage.goto(sharePath)

    // Should see the capsule title
    await expect(publicPage.getByText('Momentos en Springfield')).toBeVisible({ timeout: 15000 })

    // Should see NUCLEA branding
    await expect(publicPage.getByText('NUCLEA')).toBeVisible()

    // Should see "Compartida por" or similar attribution
    await expect(publicPage.getByText(/compartida por|regalo de/i)).toBeVisible()

    // Should see either notes or "no tiene contenido" message
    const hasNotes = await publicPage.getByText('Notas').isVisible().catch(() => false)
    const hasEmpty = await publicPage.getByText('no tiene contenido').isVisible().catch(() => false)
    const hasPhotos = await publicPage.locator('img[alt]').first().isVisible().catch(() => false)

    expect(hasNotes || hasEmpty || hasPhotos).toBeTruthy()

    await newContext.close()
  })

  test('invalid share token shows error page', async ({ page }) => {
    // Visit a non-existent share token
    await page.goto('/share/invalid-token-12345')

    // Should show error message
    await expect(page.getByText(/no existe|enlace ha expirado/i)).toBeVisible({ timeout: 15000 })

    // NUCLEA branding should still be visible
    await expect(page.getByText('NUCLEA')).toBeVisible()
  })

  test('share page shows notes content when capsule has text notes', async ({ page }) => {
    // Login to get share token for Homer's capsule (which has notes)
    await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

    const capsuleLink = page.getByText('Momentos en Springfield')
    await expect(capsuleLink).toBeVisible({ timeout: 10000 })
    await capsuleLink.click()
    await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

    // Get share URL
    await page.getByRole('button', { name: /compartir/i }).click()
    const shareInput = page.locator('input[readonly]')
    await expect(shareInput).toBeVisible({ timeout: 10000 })
    const shareUrl = await shareInput.inputValue()
    const sharePath = new URL(shareUrl).pathname

    // Visit in new context (unauthenticated)
    const newContext = await page.context().browser()!.newContext({ reducedMotion: 'reduce' })
    const publicPage = await newContext.newPage()
    await publicPage.goto(sharePath)

    // Wait for page to load
    await expect(publicPage.getByText('Momentos en Springfield')).toBeVisible({ timeout: 15000 })

    // Homer's capsule has text notes from seed — check for "Notas" heading
    await expect(publicPage.getByText('Notas')).toBeVisible({ timeout: 10000 })

    await newContext.close()
  })
})
