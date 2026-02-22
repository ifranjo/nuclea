import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  applyLifecycleEvent,
  canDownloadPurchasedVideo,
  type GiftLifecycleState,
} from '@/lib/lifecycle/state-machine'
import {
  computeNextRetryAt,
  isRetryableStorageError,
  shouldGiveUpRetrying,
} from '@/lib/lifecycle/video-purge-retry'

interface DownloadCompleteBody {
  idempotencyKey: string
  storagePath?: string
}

function parseBody(payload: unknown): DownloadCompleteBody {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Payload invalido')
  }

  const body = payload as Record<string, unknown>
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : ''
  const storagePath = typeof body.storagePath === 'string' ? body.storagePath.trim() : undefined

  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 120) {
    throw new Error('idempotencyKey invalido')
  }

  return { idempotencyKey, storagePath }
}

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

  if (typeof value === 'string' && allowed.includes(value as GiftLifecycleState)) {
    return value as GiftLifecycleState
  }

  return 'video_purchased'
}

function computePostDownloadState(
  currentState: GiftLifecycleState,
  purgeDeleted: boolean
): GiftLifecycleState {
  let state = currentState
  try {
    state = applyLifecycleEvent(currentState, 'download_video')
  } catch {
    state = 'video_downloaded'
  }

  if (purgeDeleted) {
    try {
      state = applyLifecycleEvent(state, 'purge_video_copy')
    } catch {
      state = 'video_purged'
    }
  }

  return state
}

async function resolveCurrentUserProfileId(): Promise<{ authId: string; profileId: string } | null> {
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
  return { authId: user.id, profileId: profile.id }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveCurrentUserProfileId()
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: capsuleId } = await context.params
    if (!capsuleId) {
      return NextResponse.json({ error: 'Capsula invalida' }, { status: 400 })
    }

    const body = parseBody(await request.json())
    const admin = createAdminClient()

    const { data: capsule } = await admin
      .from('capsules')
      .select('id, owner_id, receiver_id, gift_state, video_gift_path')
      .eq('id', capsuleId)
      .maybeSingle()

    if (!capsule?.id) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }

    if (capsule.owner_id !== identity.profileId && capsule.receiver_id !== identity.profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const storagePath = body.storagePath || capsule.video_gift_path
    const now = new Date()
    const currentState = normalizeState(capsule.gift_state)
    const alreadyUnlocked = ['video_downloaded', 'video_purged'].includes(currentState)

    if (!canDownloadPurchasedVideo(currentState) && !alreadyUnlocked) {
      return NextResponse.json({
        error: 'El Video Regalo requiere pago unico antes de descargar.',
      }, { status: 409 })
    }

    const { data: existingJob } = await admin
      .from('video_purge_jobs')
      .select('status, attempts, max_attempts')
      .eq('capsule_id', capsuleId)
      .eq('idempotency_key', body.idempotencyKey)
      .maybeSingle()

    if (existingJob?.status === 'completed') {
      return NextResponse.json({
        message: 'Evento ya procesado',
        idempotent: true,
        purgeStatus: 'deleted',
        noRetentionConfirmed: true,
      })
    }

    const attempts = Number(existingJob?.attempts || 0) + 1
    const maxAttempts = Number(existingJob?.max_attempts || 5)

    let purgeStatus: 'deleted' | 'pending_retry' | 'failed' | 'not_configured' = 'not_configured'
    let lastError: string | null = null
    let nextAttemptAt: string | null = null

    if (storagePath) {
      const { error: removeError } = await admin.storage
        .from('capsule-contents')
        .remove([storagePath])

      if (!removeError) {
        purgeStatus = 'deleted'
      } else {
        lastError = removeError.message
        const retryable = isRetryableStorageError(removeError)
        if (retryable && !shouldGiveUpRetrying(attempts, maxAttempts)) {
          purgeStatus = 'pending_retry'
          nextAttemptAt = computeNextRetryAt(now, attempts).toISOString()
        } else {
          purgeStatus = 'failed'
        }
      }
    }

    const lifecycleState = computePostDownloadState(currentState, purgeStatus === 'deleted')

    await admin
      .from('video_purge_jobs')
      .upsert({
        capsule_id: capsuleId,
        user_id: identity.profileId,
        storage_bucket: 'capsule-contents',
        storage_path: storagePath || '__missing__',
        idempotency_key: body.idempotencyKey,
        status: purgeStatus === 'deleted' ? 'completed' : purgeStatus === 'pending_retry' ? 'pending' : 'failed',
        attempts,
        max_attempts: maxAttempts,
        next_attempt_at: nextAttemptAt || now.toISOString(),
        last_error: lastError,
        completed_at: purgeStatus === 'deleted' ? now.toISOString() : null,
      }, { onConflict: 'capsule_id,idempotency_key' })

    await admin
      .from('capsules')
      .update({
        gift_state: lifecycleState,
        lifecycle_last_activity_at: now.toISOString(),
        video_gift_path: storagePath || null,
        video_downloaded_at: now.toISOString(),
        video_purged_at: purgeStatus === 'deleted' ? now.toISOString() : null,
        video_purge_status: purgeStatus,
      })
      .eq('id', capsuleId)

    return NextResponse.json({
      message: 'Descarga registrada',
      lifecycleState,
      purgeStatus,
      attempts,
      noRetentionConfirmed: purgeStatus === 'deleted',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('idempotencyKey invalido')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Supabase video download complete error:', error)
    return NextResponse.json({ error: 'No se pudo registrar la descarga' }, { status: 500 })
  }
}
