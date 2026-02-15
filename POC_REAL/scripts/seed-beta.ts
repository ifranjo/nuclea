/**
 * Seed beta invitations and grant access to existing test users.
 *
 * Usage: npx tsx scripts/seed-beta.ts
 *
 * This script:
 * 1. Creates beta_access entries for all 5 Simpson test users (so they can still log in)
 * 2. Creates a sample invitation for a new email (demo@nuclea.test)
 * 3. Prints the invite URL
 */

import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'

const supabase = createClient(
  'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function main() {
  console.log('=== Beta System Seed ===\n')

  // 1. Grant beta access to all existing test users
  const { data: users } = await supabase.from('users').select('id, email')
  if (!users || users.length === 0) {
    console.log('No users found. Run seed.ts first.')
    return
  }

  console.log(`Found ${users.length} users. Granting beta access...`)
  for (const user of users) {
    const { error } = await supabase.from('beta_access').upsert({
      user_id: user.id,
      enabled: true,
      cohort: 'c0-test',
      granted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) {
      console.log(`  ✗ ${user.email}: ${error.message}`)
    } else {
      console.log(`  ✓ ${user.email}: beta access granted (cohort: c0-test)`)
    }
  }

  // 2. Create a sample invitation
  const demoEmail = 'demo@nuclea.test'
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const { error: inviteError } = await supabase.from('beta_invitations').upsert({
    email: demoEmail,
    token_hash: tokenHash,
    status: 'pending',
    cohort: 'c1',
    expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'email' })

  if (inviteError) {
    console.log(`\n✗ Demo invitation error: ${inviteError.message}`)
  } else {
    console.log(`\n✓ Demo invitation created for ${demoEmail}`)
    console.log(`  URL: http://localhost:3002/beta/accept?t=${token}`)
    console.log(`  Expires: ${new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()}`)
  }

  // 3. Log seed event
  await supabase.from('beta_audit_log').insert({
    event: 'invited',
    email: demoEmail,
    metadata: { source: 'seed-beta.ts', cohort: 'c1' },
  })

  console.log('\n=== Beta seed complete ===')
}

main().catch(console.error)
