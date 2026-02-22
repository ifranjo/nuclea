import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  buildClaimHandoffUpdate,
  canUserClaimCapsule,
  type ClaimIdentity,
  type ClaimableCapsuleSnapshot,
} from '@/lib/lifecycle/claim-handoff'
import { isInvitationTokenMatch } from '@/lib/lifecycle/send-flow'

interface ClaimBody {
  invitation_token?: string
}

async function resolveCurrentUserIdentity(): Promise<ClaimIdentity | null> {
  const serverClient = await createServerSupabaseClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!profile?.id) return null

  return {
    profileId: profile.id,
    email: user.email || null,
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveCurrentUserIdentity()
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: capsuleId } = await context.params
    if (!capsuleId) {
      return NextResponse.json({ error: 'Capsula invalida' }, { status: 400 })
    }

    let body: ClaimBody = {}
    try {
      body = await request.json() as ClaimBody
    } catch {
      body = {}
    }

    const admin = createAdminClient()
    const { data: capsule } = await admin
      .from('capsules')
      .select('id, owner_id, creator_id, receiver_id, receiver_email, gift_state, gift_claimed_at, gift_expires_at, invitation_token_hash')
      .eq('id', capsuleId)
      .maybeSingle()

    if (!capsule?.id) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }

    const snapshot: ClaimableCapsuleSnapshot = {
      ownerId: capsule.owner_id,
      creatorId: capsule.creator_id,
      receiverId: capsule.receiver_id,
      receiverEmail: capsule.receiver_email,
      giftState: capsule.gift_state,
      giftClaimedAt: capsule.gift_claimed_at,
      giftExpiresAt: capsule.gift_expires_at,
    }

    if (!canUserClaimCapsule(snapshot, identity)) {
      return NextResponse.json({ error: 'No autorizado para reclamar esta capsula' }, { status: 403 })
    }

    if (!isInvitationTokenMatch((body.invitation_token || '').trim(), capsule.invitation_token_hash)) {
      return NextResponse.json({ error: 'Invitacion invalida o expirada' }, { status: 403 })
    }

    const now = new Date()
    const update = buildClaimHandoffUpdate(snapshot, identity, now)
    const updatePayload = {
      ...update,
      invitation_token_hash: null,
    }

    const { error: updateError } = await admin
      .from('capsules')
      .update(updatePayload)
      .eq('id', capsuleId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      ok: true,
      state: update.gift_state,
      claimedAt: update.gift_claimed_at,
      expiresAt: update.gift_expires_at,
      receiverId: update.receiver_id,
      ownershipTransferred: true,
    })
  } catch (error) {
    console.error('Supabase capsule claim error:', error)
    return NextResponse.json({ error: 'No se pudo reclamar la capsula' }, { status: 500 })
  }
}
