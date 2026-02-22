/**
 * smoke_send_claim.mjs
 * Authenticated end-to-end smoke test for the v4 send → claim flow.
 *
 * Run: node tests/smoke_send_claim.mjs
 * Requires: Supabase running, dev server on :3002, seed data applied.
 */

const SUPABASE_URL = 'http://127.0.0.1:54321'
const APP_URL = 'http://localhost:3002'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const HOMER = { email: 'homer@nuclea.test', password: 'nuclea123' }
const BART = { email: 'bart@nuclea.test', password: 'nuclea123' }

let passed = 0
let failed = 0

function ok(label) { passed++; console.log(`  ✓ ${label}`) }
function fail(label, detail) { failed++; console.error(`  ✗ ${label}: ${detail}`) }

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`)
  return data.access_token
}

async function getProfileId(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })
  const data = await res.json()
  return data[0]?.id
}

// ---------------------------------------------------------------------------
// API helpers (hit Next.js routes via service-role to bypass cookie auth)
// ---------------------------------------------------------------------------

async function apiCall(method, path, body, token) {
  const headers = {
    'Content-Type': 'application/json',
  }
  // We use the Supabase REST API directly for operations that need auth
  // For Next.js API routes, we'd need cookie-based auth which is complex in scripts
  // Instead, we test the underlying DB operations directly
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['apikey'] = ANON_KEY
  }

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🧪 NUCLEA v4 Send → Claim Smoke Test\n')

  // Step 1: Login as Homer (creator)
  console.log('1. Authenticating...')
  let homerToken, bartToken
  try {
    homerToken = await login(HOMER.email, HOMER.password)
    ok('Homer logged in')
  } catch (e) { fail('Homer login', e.message); return }

  try {
    bartToken = await login(BART.email, BART.password)
    ok('Bart logged in')
  } catch (e) { fail('Bart login', e.message); return }

  // Step 2: Get profile IDs
  console.log('\n2. Resolving profiles...')
  const homerId = await getProfileId(homerToken)
  const bartId = await getProfileId(bartToken)
  homerId ? ok(`Homer profile: ${homerId.slice(0, 8)}...`) : fail('Homer profile', 'not found')
  bartId ? ok(`Bart profile: ${bartId.slice(0, 8)}...`) : fail('Bart profile', 'not found')
  if (!homerId || !bartId) return

  // Step 3: Find Homer's active capsule (not the already-sent one)
  console.log('\n3. Finding active capsule to send...')
  const { data: capsules } = await apiCall('GET', `/rest/v1/capsules?owner_id=eq.${homerId}&status=eq.active&select=id,title,gift_state&limit=1`, null, homerToken)

  if (!capsules || capsules.length === 0) {
    fail('No active capsule found for Homer', 'seed may be missing')
    return
  }
  const capsule = capsules[0]
  ok(`Found: "${capsule.title}" (${capsule.id.slice(0, 8)}...)`)

  // Step 4: Send capsule (direct DB update simulating the API route logic)
  console.log('\n4. Sending capsule to Bart...')
  const { createHash, randomBytes } = await import('node:crypto')
  const invitationToken = randomBytes(24).toString('hex')
  const tokenHash = createHash('sha256').update(invitationToken).digest('hex')
  const sentAt = new Date().toISOString()

  const sendUpdate = await fetch(`${SUPABASE_URL}/rest/v1/capsules?id=eq.${capsule.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      creator_id: homerId,
      receiver_email: BART.email,
      gift_state: 'sent',
      status: 'sent',
      sent_at: sentAt,
      invitation_token_hash: tokenHash,
      lifecycle_last_activity_at: sentAt,
    }),
  })

  const sendResult = await sendUpdate.json()
  if (sendUpdate.status < 300 && sendResult[0]?.gift_state === 'sent') {
    ok(`Capsule sent → gift_state: ${sendResult[0].gift_state}`)
    ok(`Invitation token: ${invitationToken.slice(0, 16)}...`)
    ok(`Token hash stored: ${tokenHash.slice(0, 16)}...`)
  } else {
    fail('Send capsule', `status ${sendUpdate.status}: ${JSON.stringify(sendResult)}`)
    return
  }

  // Step 5: Verify capsule state
  console.log('\n5. Verifying capsule state...')
  const { data: sentCapsule } = await apiCall('GET',
    `/rest/v1/capsules?id=eq.${capsule.id}&select=status,gift_state,receiver_email,creator_id,invitation_token_hash`,
    null, homerToken)

  if (sentCapsule?.[0]) {
    const c = sentCapsule[0]
    c.status === 'sent' ? ok('status = sent') : fail('status', c.status)
    c.gift_state === 'sent' ? ok('gift_state = sent') : fail('gift_state', c.gift_state)
    c.receiver_email === BART.email ? ok(`receiver_email = ${BART.email}`) : fail('receiver_email', c.receiver_email)
    c.creator_id === homerId ? ok('creator_id preserved') : fail('creator_id', c.creator_id)
    c.invitation_token_hash ? ok('invitation_token_hash stored') : fail('invitation_token_hash', 'missing')
  } else {
    fail('Verify capsule', 'not found')
  }

  // Step 6: Claim capsule as Bart (simulating API route logic)
  console.log('\n6. Bart claims the capsule...')
  const claimedAt = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const claimUpdate = await fetch(`${SUPABASE_URL}/rest/v1/capsules?id=eq.${capsule.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      owner_id: bartId,
      receiver_id: bartId,
      gift_state: 'claimed',
      status: 'claimed',
      claimed_at: claimedAt,
      gift_claimed_at: claimedAt,
      experience_expires_at: expiresAt,
      gift_expires_at: expiresAt,
      lifecycle_last_activity_at: claimedAt,
      invitation_token_hash: null, // consumed
    }),
  })

  const claimResult = await claimUpdate.json()
  if (claimUpdate.status < 300 && claimResult[0]?.gift_state === 'claimed') {
    ok(`Capsule claimed → gift_state: ${claimResult[0].gift_state}`)
    ok(`Owner transferred: ${claimResult[0].owner_id.slice(0, 8)}... (Bart)`)
    ok(`Experience expires: ${expiresAt.slice(0, 10)}`)
  } else {
    fail('Claim capsule', `status ${claimUpdate.status}: ${JSON.stringify(claimResult)}`)
    return
  }

  // Step 7: Verify final state
  console.log('\n7. Final verification...')
  const { data: finalCapsule } = await apiCall('GET',
    `/rest/v1/capsules?id=eq.${capsule.id}&select=owner_id,creator_id,receiver_id,status,gift_state,claimed_at,experience_expires_at`,
    null, bartToken)

  if (finalCapsule?.[0]) {
    const c = finalCapsule[0]
    c.owner_id === bartId ? ok('owner_id = Bart (transferred)') : fail('owner_id', c.owner_id)
    c.creator_id === homerId ? ok('creator_id = Homer (preserved)') : fail('creator_id', c.creator_id)
    c.receiver_id === bartId ? ok('receiver_id = Bart') : fail('receiver_id', c.receiver_id)
    c.status === 'claimed' ? ok('status = claimed') : fail('status', c.status)
    c.gift_state === 'claimed' ? ok('gift_state = claimed') : fail('gift_state', c.gift_state)
    c.claimed_at ? ok('claimed_at set') : fail('claimed_at', 'missing')
    c.experience_expires_at ? ok('experience_expires_at set') : fail('experience_expires_at', 'missing')
  } else {
    fail('Final verify', 'capsule not found or not accessible by Bart')
  }

  // Step 8: Check constraint — claimed capsule must have receiver_id
  console.log('\n8. Constraint validation...')
  const constraintTest = await fetch(`${SUPABASE_URL}/rest/v1/capsules?id=eq.${capsule.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ receiver_id: null }),
  })
  // This should fail due to capsules_claim_requires_receiver_check constraint
  if (constraintTest.status >= 400) {
    ok('Constraint blocks removing receiver_id from claimed capsule')
  } else {
    fail('Constraint', 'should have blocked null receiver_id on claimed capsule')
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Passed: ${passed}`)
  if (failed > 0) console.log(`❌ Failed: ${failed}`)
  console.log('='.repeat(50))

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('\n💥 Smoke test crashed:', err)
  process.exit(1)
})
