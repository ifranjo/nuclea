import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminDb, verifyBearerToken } from '@/lib/firebase-admin'
import { applyLifecycleEvent, computeClaimDeadline, type GiftLifecycleState } from '@/lib/lifecycle-state-machine'

interface CapsuleDocument {
  userId?: string
  giftLifecycle?: {
    state?: GiftLifecycleState
    claimedAt?: string
    expiresAt?: string
    lastActivityAt?: string
  }
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

  return 'sent'
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = await verifyBearerToken(request)
    const capsuleId = context.params?.id
    if (!capsuleId) {
      return NextResponse.json({ error: 'Capsula invalida' }, { status: 400 })
    }

    const db = getAdminDb('capsule claim')
    const capsuleRef = db.collection('capsules').doc(capsuleId)
    const snapshot = await capsuleRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }

    const capsule = (snapshot.data() || {}) as CapsuleDocument
    if (capsule.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const deadline = computeClaimDeadline(now)
    const currentState = normalizeState(capsule.giftLifecycle?.state)

    let nextState: GiftLifecycleState = currentState
    try {
      nextState = applyLifecycleEvent(currentState, 'claim')
    } catch {
      nextState = 'claimed'
    }

    await capsuleRef.set({
      giftLifecycle: {
        ...(capsule.giftLifecycle || {}),
        state: nextState,
        claimedAt: now.toISOString(),
        expiresAt: deadline.toISOString(),
        lastActivityAt: now.toISOString(),
      },
      updatedAt: now,
    }, { merge: true })

    return NextResponse.json({
      ok: true,
      state: nextState,
      claimedAt: now.toISOString(),
      expiresAt: deadline.toISOString(),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Capsule claim error:', error)
    return NextResponse.json({ error: 'No se pudo reclamar la capsula' }, { status: 500 })
  }
}

