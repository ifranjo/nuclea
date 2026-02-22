import { FieldValue } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminDb, getAdminStorage, verifyBearerToken } from '@/lib/firebase-admin'
import { applyLifecycleEvent, type GiftLifecycleState } from '@/lib/lifecycle-state-machine'
import {
  computeNextRetryAt,
  isRetryableStorageError,
  shouldGiveUpRetrying,
} from '@/lib/video-purge-retry'

interface DownloadCompleteBody {
  idempotencyKey: string
  storagePath?: string
}

interface CapsuleTrustContact {
  id?: string
  name?: string
  email?: string
  phone?: string
  whatsappOptInAt?: string
  whatsappOptInSource?: string
}

interface CapsuleDocument {
  userId?: string
  giftLifecycle?: {
    state?: GiftLifecycleState
    claimedAt?: string
    expiresAt?: string
    lastActivityAt?: string
    trustContactsNotifiedAt?: string
  }
  videoGift?: {
    storagePath?: string
    purgeStatus?: string
    downloadedAt?: string
    purgedAt?: string
    lastError?: string | null
    purgeAttempts?: number
  }
  trustContacts?: CapsuleTrustContact[]
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

function normalizeState(state: unknown): GiftLifecycleState {
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

  if (typeof state === 'string' && allowed.includes(state as GiftLifecycleState)) {
    return state as GiftLifecycleState
  }

  return 'video_purchased'
}

function safeDocId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 180)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyBearerToken(request)
    const { id: capsuleId } = await context.params
    if (!capsuleId) {
      return NextResponse.json({ error: 'Capsula invalida' }, { status: 400 })
    }
    const body = parseBody(await request.json())

    const db = getAdminDb('video download complete')
    const capsuleRef = db.collection('capsules').doc(capsuleId)
    const capsuleSnapshot = await capsuleRef.get()

    if (!capsuleSnapshot.exists) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }

    const capsule = (capsuleSnapshot.data() || {}) as CapsuleDocument
    if (capsule.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const receiptId = safeDocId(`${capsuleId}_${body.idempotencyKey}`)
    const receiptRef = db.collection('video_download_receipts').doc(receiptId)
    const existingReceipt = await receiptRef.get()
    if (existingReceipt.exists) {
      return NextResponse.json({
        message: 'Evento ya procesado',
        idempotent: true,
      })
    }

    const now = new Date()
    const storagePath = body.storagePath || capsule.videoGift?.storagePath
    const previousState = normalizeState(capsule.giftLifecycle?.state)

    let purgeStatus: 'deleted' | 'pending_retry' | 'failed' | 'not_configured' = 'not_configured'
    let purgeAttempts = 0
    let purgeError: string | null = null

    if (storagePath) {
      purgeAttempts = 1
      try {
        await getAdminStorage('video download complete').bucket().file(storagePath).delete({ ignoreNotFound: true })
        purgeStatus = 'deleted'
      } catch (error) {
        purgeError = error instanceof Error ? error.message : 'Unknown storage delete error'
        const retryable = isRetryableStorageError(error)
        const maxAttempts = 5

        if (retryable && !shouldGiveUpRetrying(purgeAttempts, maxAttempts)) {
          const nextRetryAt = computeNextRetryAt(now, purgeAttempts)
          await db.collection('video_purge_jobs').doc(receiptId).set({
            capsuleId,
            userId,
            storagePath,
            idempotencyKey: body.idempotencyKey,
            status: 'pending',
            attempts: purgeAttempts,
            maxAttempts,
            lastError: purgeError,
            nextAttemptAt: nextRetryAt.toISOString(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true })
          purgeStatus = 'pending_retry'
        } else {
          purgeStatus = 'failed'
        }
      }
    }

    let newState: GiftLifecycleState = previousState
    try {
      newState = applyLifecycleEvent(previousState, 'download_video')
    } catch {
      newState = 'video_downloaded'
    }

    if (purgeStatus === 'deleted') {
      try {
        newState = applyLifecycleEvent(newState, 'purge_video_copy')
      } catch {
        newState = 'video_purged'
      }
    }

    await capsuleRef.set({
      giftLifecycle: {
        ...(capsule.giftLifecycle || {}),
        state: newState,
        lastActivityAt: now.toISOString(),
      },
      videoGift: {
        ...(capsule.videoGift || {}),
        storagePath: storagePath || null,
        downloadedAt: now.toISOString(),
        purgedAt: purgeStatus === 'deleted' ? now.toISOString() : null,
        purgeStatus,
        purgeAttempts,
        lastError: purgeError,
      },
      updatedAt: now,
    }, { merge: true })

    await receiptRef.set({
      capsuleId,
      userId,
      idempotencyKey: body.idempotencyKey,
      storagePath: storagePath || null,
      purgeStatus,
      purgeAttempts,
      purgeError,
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      message: 'Descarga registrada',
      lifecycleState: newState,
      purgeStatus,
      purgeAttempts,
      noRetentionConfirmed: purgeStatus === 'deleted',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Error && error.message.includes('idempotencyKey invalido')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Video download complete error:', error)
    return NextResponse.json({ error: 'No se pudo registrar la descarga' }, { status: 500 })
  }
}
