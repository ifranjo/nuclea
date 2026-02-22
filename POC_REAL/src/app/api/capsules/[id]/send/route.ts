import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  buildSendCapsuleUpdate,
  canUserSendCapsule,
  isValidReceiverEmail,
  type SendableCapsuleSnapshot,
} from '@/lib/lifecycle/send-flow'
import { queueNotification } from '@/lib/lifecycle/notifications'

async function resolveCurrentUser(): Promise<{ profileId: string; email: string | null } | null> {
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
  return { profileId: profile.id, email: user.email || null }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await resolveCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: capsuleId } = await context.params
    if (!capsuleId) {
      return NextResponse.json({ error: 'Capsula invalida' }, { status: 400 })
    }

    // Parse body
    const body = await request.json().catch(() => null)
    const receiverEmail = typeof body?.receiver_email === 'string' ? body.receiver_email.trim() : ''

    if (!receiverEmail || !isValidReceiverEmail(receiverEmail)) {
      return NextResponse.json({ error: 'Email del receptor invalido' }, { status: 400 })
    }

    // Fetch capsule
    const admin = createAdminClient()
    const { data: capsule } = await admin
      .from('capsules')
      .select('id, owner_id, creator_id, receiver_id, gift_state, status, sent_at, share_token, title')
      .eq('id', capsuleId)
      .maybeSingle()

    if (!capsule?.id) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }
    if (!capsule.share_token) {
      return NextResponse.json({ error: 'La capsula necesita un token de compartir' }, { status: 409 })
    }

    const snapshot: SendableCapsuleSnapshot = {
      ownerId: capsule.owner_id,
      creatorId: capsule.creator_id,
      receiverId: capsule.receiver_id,
      giftState: capsule.gift_state,
      status: capsule.status,
      sentAt: capsule.sent_at,
    }

    // Business rule validation
    const canSend = canUserSendCapsule(snapshot, currentUser.profileId, currentUser.email, receiverEmail)
    if (!canSend.ok) {
      return NextResponse.json({ error: canSend.reason }, { status: 409 })
    }

    // Build update + persist
    const now = new Date()
    const invitationToken = randomBytes(24).toString('hex')
    const update = buildSendCapsuleUpdate(snapshot, receiverEmail, invitationToken, now)

    const { error: updateError } = await admin
      .from('capsules')
      .update(update)
      .eq('id', capsuleId)

    if (updateError) {
      throw updateError
    }

    // Queue invitation email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const invitationUrl = `${baseUrl}/share/${capsule.share_token}?invite=${invitationToken}`

    await queueNotification(admin, {
      userId: currentUser.profileId,
      capsuleId,
      channel: 'email',
      recipient: update.receiver_email,
      template: 'capsule-invitation',
      payload: {
        capsuleTitle: capsule.title || 'Capsula',
        senderEmail: currentUser.email,
        invitationUrl,
      },
    })

    return NextResponse.json({
      ok: true,
      state: update.gift_state,
      sentAt: update.sent_at,
      receiverEmail: update.receiver_email,
      invitationUrl,
    })
  } catch (error) {
    console.error('Capsule send error:', error)
    return NextResponse.json({ error: 'No se pudo enviar la capsula' }, { status: 500 })
  }
}
