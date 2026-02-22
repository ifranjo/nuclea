import { type Page } from '@playwright/test'

/**
 * Reusable login helper for E2E tests.
 * Uses form-based login which properly sets Supabase SSR cookies.
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()

  // Login uses window.location.href redirect — wait for dashboard URL
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  // Wait for capsule data to load (dashboard shows loading skeleton first)
  await page.waitForLoadState('networkidle')
}

/** Test user credentials (from seed.ts) */
export const TEST_USERS = {
  homer: { email: 'homer@nuclea.test', password: 'nuclea123', name: 'Homer Simpson' },
  marge: { email: 'marge@nuclea.test', password: 'nuclea123', name: 'Marge Simpson' },
  bart: { email: 'bart@nuclea.test', password: 'nuclea123', name: 'Bart Simpson' },
  lisa: { email: 'lisa@nuclea.test', password: 'nuclea123', name: 'Lisa Simpson' },
  maggie: { email: 'maggie@nuclea.test', password: 'nuclea123', name: 'Maggie Simpson' },
} as const
