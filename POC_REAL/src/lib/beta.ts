import { createHash, randomBytes } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

// --- Token utilities ---

export function generateBetaToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// --- Audit logging ---

export type BetaEvent =
  | 'invited'
  | 'accepted'
  | 'revoked'
  | 'login_failed'
  | 'access_granted'
  | 'access_revoked'
  | 'token_expired'

export async function logBetaEvent(
  supabase: SupabaseClient,
  event: BetaEvent,
  details: {
    email?: string
    userId?: string
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }
) {
  await supabase.from('beta_audit_log').insert({
    event,
    email: details.email,
    user_id: details.userId,
    ip_address: details.ipAddress,
    user_agent: details.userAgent,
    metadata: details.metadata || null,
  })
}

// --- Invitation management ---

export async function createInvitation(
  supabase: SupabaseClient,
  email: string,
  options: {
    cohort?: string
    expiresInHours?: number
    createdBy?: string
  } = {}
) {
  const normalizedEmail = email.trim().toLowerCase()
  const token = generateBetaToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(
    Date.now() + (options.expiresInHours || 72) * 60 * 60 * 1000
  ).toISOString()

  const { data, error } = await supabase.from('beta_invitations').insert({
    email: normalizedEmail,
    token_hash: tokenHash,
    cohort: options.cohort || 'c1',
    expires_at: expiresAt,
    created_by: options.createdBy || null,
  }).select().single()

  if (error) return { invitation: null, token: null, error }

  await logBetaEvent(supabase, 'invited', {
    email: normalizedEmail,
    metadata: { cohort: options.cohort || 'c1', invitationId: data.id },
  })

  return { invitation: data, token, error: null }
}

export async function validateToken(
  supabase: SupabaseClient,
  token: string
): Promise<{
  valid: boolean
  invitation: { id: string; email: string; cohort: string } | null
  reason?: string
}> {
  const tokenHash = hashToken(token)

  const { data: invitation } = await supabase
    .from('beta_invitations')
    .select('id, email, status, expires_at, cohort')
    .eq('token_hash', tokenHash)
    .single()

  if (!invitation) return { valid: false, invitation: null, reason: 'invalid_token' }
  if (invitation.status !== 'pending') return { valid: false, invitation: null, reason: 'already_used' }
  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from('beta_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)
    await logBetaEvent(supabase, 'token_expired', { email: invitation.email })
    return { valid: false, invitation: null, reason: 'expired' }
  }

  return {
    valid: true,
    invitation: { id: invitation.id, email: invitation.email, cohort: invitation.cohort },
  }
}

export async function acceptInvitation(
  supabase: SupabaseClient,
  invitationId: string,
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
) {
  // Get invitation details
  const { data: invitation } = await supabase
    .from('beta_invitations')
    .select('cohort')
    .eq('id', invitationId)
    .single()

  // Mark invitation accepted
  await supabase
    .from('beta_invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitationId)

  // Grant beta access
  await supabase.from('beta_access').upsert({
    user_id: userId,
    enabled: true,
    cohort: invitation?.cohort || 'c1',
    granted_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  await logBetaEvent(supabase, 'accepted', { email, userId, ipAddress, userAgent })
  await logBetaEvent(supabase, 'access_granted', { email, userId, metadata: { cohort: invitation?.cohort } })
}

export async function checkBetaAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('beta_access')
    .select('enabled')
    .eq('user_id', userId)
    .eq('enabled', true)
    .single()

  return !!data
}

export async function revokeBetaAccess(
  supabase: SupabaseClient,
  userId: string,
  reason?: string
) {
  const { error: updateError } = await supabase
    .from('beta_access')
    .update({ enabled: false, revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (updateError) {
    return { error: updateError }
  }

  await logBetaEvent(supabase, 'access_revoked', {
    userId,
    metadata: { reason },
  })

  return { error: null }
}
