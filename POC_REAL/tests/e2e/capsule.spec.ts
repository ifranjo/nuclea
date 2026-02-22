import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './fixtures'

test.describe('Capsule detail page', () => {
  test.describe('Page structure', () => {
    test('capsule detail loads with header, calendar, and content grid', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      // Navigate to first capsule
      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Header shows capsule title
      await expect(page.locator('header h1')).toBeVisible({ timeout: 10000 })

      // Type label visible in header
      await expect(page.locator('header').getByText(/Legacy|Together|Social|Mascota|Origen/)).toBeVisible()

      // Calendar section should be present
      await expect(page.getByText(/enero|febrero|Enero|Febrero|lun|mar/i).first()).toBeVisible({ timeout: 10000 })

      // Upload action buttons (Foto, Video, Audio, Nota)
      await expect(page.getByText('Foto')).toBeVisible()
      await expect(page.getByText('Nota')).toBeVisible()
    })

    test('capsule shows content list with items', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      // Navigate to "Momentos en Springfield" — it has notes and images
      const capsuleLink = page.getByText('Momentos en Springfield')
      await expect(capsuleLink).toBeVisible({ timeout: 10000 })
      await capsuleLink.click()

      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Content section should show count
      await expect(page.getByText(/Contenido \(\d+\)/)).toBeVisible({ timeout: 10000 })
    })

    test('capsule detail shows designated persons section', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const capsuleLink = page.getByText('Momentos en Springfield')
      await expect(capsuleLink).toBeVisible({ timeout: 10000 })
      await capsuleLink.click()

      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Designated persons section
      await expect(page.getByText('Personas designadas')).toBeVisible({ timeout: 10000 })

      // "Maggie Simpson" was added as designated person in seed
      await expect(page.getByText('Maggie Simpson')).toBeVisible()
    })
  })

  test.describe('Add text note', () => {
    test('clicking Nota opens inline form, filling and submitting adds a note', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      // Navigate to a capsule
      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Click "Nota" button to open the inline form
      await page.getByText('Nota').click()

      // Note form should appear
      await expect(page.getByText('Nueva nota')).toBeVisible()
      await expect(page.getByPlaceholder('Título de la nota')).toBeVisible()
      await expect(page.getByPlaceholder('Escribe tu nota aquí...')).toBeVisible()

      // Fill note form
      const noteTitle = `Test note ${Date.now()}`
      await page.getByPlaceholder('Título de la nota').fill(noteTitle)
      await page.getByPlaceholder('Escribe tu nota aquí...').fill('This is a test note from Playwright E2E.')

      // Submit
      await page.getByRole('button', { name: /guardar/i }).click()

      // Form should close and note should appear in content list
      await expect(page.getByText('Nueva nota')).not.toBeVisible({ timeout: 5000 })
      await expect(page.getByText(noteTitle)).toBeVisible({ timeout: 10000 })
    })

    test('note form cancel button closes the form without adding', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Open note form
      await page.getByText('Nota').click()
      await expect(page.getByText('Nueva nota')).toBeVisible()

      // Click cancel
      await page.getByRole('button', { name: /cancelar/i }).click()

      // Form should close
      await expect(page.getByText('Nueva nota')).not.toBeVisible({ timeout: 3000 })
    })

    test('note form Guardar button is disabled when fields are empty', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Open note form
      await page.getByText('Nota').click()

      // Guardar button should be disabled when fields are empty
      const saveButton = page.getByRole('button', { name: /guardar/i })
      await expect(saveButton).toBeDisabled()
    })
  })

  test.describe('Add designated person modal', () => {
    test('clicking "+ Añadir persona" opens the modal with form fields', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Click the add person button
      await page.getByText('+ Añadir persona').click()

      // Modal should appear
      await expect(page.getByText('Añadir persona designada')).toBeVisible()
      await expect(page.getByLabel('Nombre completo')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Relación')).toBeVisible()
    })

    test('add person modal validates email format', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      await page.getByText('+ Añadir persona').click()
      await expect(page.getByText('Añadir persona designada')).toBeVisible()

      // Fill with invalid email
      await page.getByLabel('Nombre completo').fill('Test Person')
      await page.getByLabel('Email').fill('invalid-email')
      await page.getByLabel('Relación').fill('Amigo')

      // Submit — should show email validation error
      await page.getByRole('button', { name: /guardar/i }).click()
      await expect(page.getByText(/email válido/i)).toBeVisible({ timeout: 5000 })
    })

    test('add person modal closes on X button', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      await page.getByText('+ Añadir persona').click()
      await expect(page.getByText('Añadir persona designada')).toBeVisible()

      // Close modal using the X button (located in the modal header)
      const closeButton = page.locator('.fixed button').first()
      await closeButton.click()

      await expect(page.getByText('Añadir persona designada')).not.toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Share functionality', () => {
    test('share button generates and shows share link', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Click share button
      const shareButton = page.getByRole('button', { name: /compartir/i })
      await expect(shareButton).toBeVisible()
      await shareButton.click()

      // Share URL input should appear with a share link
      const shareInput = page.locator('input[readonly]')
      await expect(shareInput).toBeVisible({ timeout: 10000 })
      const shareUrl = await shareInput.inputValue()
      expect(shareUrl).toContain('/share/')
    })
  })

  test.describe('Capsule status badge', () => {
    test('active capsule shows "Activa" status in header', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const capsuleLink = page.getByText('Momentos en Springfield')
      await expect(capsuleLink).toBeVisible({ timeout: 10000 })
      await capsuleLink.click()

      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Check for view mode text (indicates the page loaded correctly)
      await expect(page.getByText('Vista creador')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Close capsule flow', () => {
    test('"Cerrar y descargar" button opens inline confirmation dialog', async ({ page }) => {
      await loginAs(page, TEST_USERS.homer.email, TEST_USERS.homer.password)

      const firstCard = page.locator('a[href^="/capsule/"]').first()
      await expect(firstCard).toBeVisible({ timeout: 10000 })
      await firstCard.click()
      await expect(page).toHaveURL(/\/capsule\/[a-f0-9-]+/, { timeout: 10000 })

      // Click "Cerrar y descargar"
      const closeButton = page.getByRole('button', { name: /cerrar y descargar/i })
      await expect(closeButton).toBeVisible()
      await closeButton.click()

      // Inline confirmation dialog should appear
      await expect(page.getByText('Cerrar esta cápsula')).toBeVisible()
      await expect(page.getByText(/no se puede deshacer/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /confirmar cierre/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible()

      // Cancel — should dismiss the dialog
      await page.getByRole('button', { name: /cancelar/i }).click()
      await expect(page.getByText('Cerrar esta cápsula')).not.toBeVisible({ timeout: 3000 })
    })
  })
})
