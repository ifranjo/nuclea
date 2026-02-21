import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { applyLifecycleEvent, computeClaimDeadline, type GiftLifecycleState } from '@/lib/lifecycle/state-machine'

function normalizeState(value: unknown): GiftLifecycleState {
  const allowed: GiftLifecycleState[] = [
    'draft',
    'sent',
    'claimed',
    'continued',
    'video_purchased',
    'video_downloaded',
    'video_purged',
    'expired',
    'deleted',
  ]
  return typeof value === 'string' && allowed.includes(value as GiftLifecycleState)
    ? value as GiftLifecycleState
    : 'sent'
}

async function resolveCurrentUserProfileId(): Promise<string | null> {
  const serverClient = await createServerSupabaseClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  return profile?.id || null
}

export async function POST(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const profileId = await resolveCurrentUserProfileId()
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const capsuleId = context.params?.id
    if (!capsuleId) {
      return NextResponse.json({ error: 'Capsula invalida' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: capsule } = await admin
      .from('capsules')
      .select('id, owner_id, gift_state')
      .eq('id', capsuleId)
      .maybeSingle()

    if (!capsule?.id) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }

    if (capsule.owner_id !== profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const deadline = computeClaimDeadline(now)
    const currentState = normalizeState(capsule.gift_state)

    let nextState = currentState
    try {
      nextState = applyLifecycleEvent(currentState, 'claim')
    } catch {
      nextState = 'claimed'
    }

    await admin
      .from('capsules')
      .update({
        gift_state: nextState,
        gift_claimed_at: now.toISOString(),
        gift_expires_at: deadline.toISOString(),
        lifecycle_last_activity_at: now.toISOString(),
      })
      .eq('id', capsuleId)

    return NextResponse.json({
      ok: true,
      state: nextState,
      claimedAt: now.toISOString(),
      expiresAt: deadline.toISOString(),
    })
  } catch (error) {
    console.error('Supabase capsule claim error:', error)
    return NextResponse.json({ error: 'No se pudo reclamar la capsula' }, { status: 500 })
  }
}

