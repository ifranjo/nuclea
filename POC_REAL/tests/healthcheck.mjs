import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * healthcheck.mjs
 * Shared health-check utility for NUCLEA tests.
 * Provides clear error messages when Supabase or app is unavailable.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'http://127.0.0.1:54321'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3002'

/**
 * Check if Supabase is available
 * @returns {Promise<{available: boolean, error?: string}>}
 */
export async function checkSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      return { available: true }
    }
    return { available: false, error: `Supabase health check returned ${res.status}` }
  } catch (err) {
    const message = err.name === 'AbortError' ? 'timeout' : err.message
    return { available: false, error: `Cannot connect to Supabase: ${message}` }
  }
}

/**
 * Check if the Next.js app is available
 * @returns {Promise<{available: boolean, error?: string}>}
 */
export async function checkApp() {
  try {
    const res = await fetch(`${APP_URL}/login`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    })
    // Accept any HTTP response as "app is running" - even 500 means server is up
    // Only network errors mean the app is down
    return { available: true }
  } catch (err) {
    const message = err.name === 'AbortError' ? 'timeout' : err.message
    return { available: false, error: `Cannot connect to app: ${message}` }
  }
}

/**
 * Check both Supabase and app availability
 * @returns {Promise<{ready: boolean, supabase: {available: boolean, error?: string}, app: {available: boolean, error?: string}}>}
 */
export async function checkInfrastructure() {
  const [supabase, app] = await Promise.all([checkSupabase(), checkApp()])
  return {
    ready: supabase.available && app.available,
    supabase,
    app,
  }
}

/**
 * Assert that infrastructure is available, otherwise exit with clear error
 * @param {string[]} required - Which services to check: ['supabase', 'app']
 */
export async function requireInfrastructure(required = ['supabase', 'app']) {
  const infra = await checkInfrastructure()
  const errors = []

  if (required.includes('supabase') && !infra.supabase.available) {
    errors.push(`❌ Supabase unavailable: ${infra.supabase.error}`)
  }

  if (required.includes('app') && !infra.app.available) {
    errors.push(`❌ App unavailable: ${infra.app.error}`)
  }

  if (errors.length > 0) {
    console.error('\n🛑 Infrastructure check FAILED\n')
    errors.forEach(e => console.error(e))
    console.error('\n📋 To start infrastructure:')
    console.error('   1. Start Docker (for Supabase)')
    console.error('   2. Run: npx supabase start')
    console.error('   3. Run: npm run dev')
    console.error('')
    throw new Error('Infrastructure not ready')
  }

  return infra
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo() {
  return {
    supabaseUrl: SUPABASE_URL,
    appUrl: APP_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  }
}

function isCliRun() {
  const entry = process.argv[1]
  if (!entry) return false
  return path.resolve(fileURLToPath(import.meta.url)) === path.resolve(entry)
}

// CLI mode: just check and report
if (isCliRun()) {
  console.log('🔍 Checking infrastructure...\n')
  const infra = await checkInfrastructure()

  console.log(`Supabase: ${infra.supabase.available ? '✅ Available' : '❌ Unavailable'}`)
  if (infra.supabase.error) console.error(`  Error: ${infra.supabase.error}`)

  console.log(`App: ${infra.app.available ? '✅ Available' : '❌ Unavailable'}`)
  if (infra.app.error) console.error(`  Error: ${infra.app.error}`)

  console.log(`\nEnvironment: ${getEnvInfo().nodeEnv}`)

  process.exitCode = infra.ready ? 0 : 1
}
