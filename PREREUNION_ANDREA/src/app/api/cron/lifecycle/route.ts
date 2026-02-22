import { timingSafeEqual } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin'
import { queueNotification } from '@/lib/lifecycle-notifications'
import { applyLifecycleEvent, type GiftLifecycleState } from '@/lib/lifecycle-state-machine'
import {
  computeNextRetryAt,
  isRetryableStorageError,
  shouldGiveUpRetrying,
} from '@/lib/video-purge-retry'

interface TrustContact {
  id?: string
  name?: string
  email?: string
  phone?: string
  whatsappOptInAt?: string
}

interface CapsuleRecord {
  userId?: string
  type?: string
  title?: string
  giftLifecycle?: {
    state?: GiftLifecycleState
    expiresAt?: string
    lastActivityAt?: string
    trustContactsNotifiedAt?: string
  }
  trustContacts?: TrustContact[]
  videoGift?: {
    storagePath?: string
  }
}

interface VideoPurgeJob {
  capsuleId?: string
  userId?: string
  idempotencyKey?: string
  storagePath?: string
  attempts?: number
  maxAttempts?: number
  status?: string
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function isCronAuthorized(request: NextRequest): boolean {
  const configured = process.env.CRON_SECRET
  if (!configured) return false

  const fromHeader = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (fromHeader && safeEqual(fromHeader, configured)) return true
  if (bearer && safeEqual(bearer, configured)) return true
  return false
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

  return 'claimed'
}

function readIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function resolveTrustContactWindowDays(): number {
  const lookaheadHours = Number(process.env.TRUST_CONTACT_NOTIFY_BEFORE_HOURS)
  if (Number.isFinite(lookaheadHours) && lookaheadHours > 0) {
    return lookaheadHours / 24
  }

  const inactivityDays = Number(process.env.TRUST_CONTACT_INACTIVITY_DAYS || 120)
  if (Number.isFinite(inactivityDays) && inactivityDays > 0) {
    return inactivityDays
  }

  return 120
}

async function runExpirySweep(now: Date): Promise<number> {
  const db = getAdminDb('lifecycle cron expiry')
  const snapshot = await db
    .collection('capsules')
    .where('giftLifecycle.expiresAt', '<=', now.toISOString())
    .limit(200)
    .get()

  let expiredCount = 0

  for (const doc of snapshot.docs) {
    const capsule = (doc.data() || {}) as CapsuleRecord
    const currentState = normalizeState(capsule.giftLifecycle?.state)
    const expirable = ['sent', 'claimed', 'continued', 'video_purchased'].includes(currentState)
    if (!expirable) continue

    let nextState: GiftLifecycleState = 'expired'
    try {
      nextState = applyLifecycleEvent(currentState, 'expire')
    } catch {
      nextState = 'expired'
    }

    await doc.ref.set({
      giftLifecycle: {
        ...(capsule.giftLifecycle || {}),
        state: nextState,
        lastActivityAt: now.toISOString(),
      },
      updatedAt: now,
    }, { merge: true })
    expiredCount += 1
  }

  return expiredCount
}

async function runVideoPurgeQueue(now: Date): Promise<number> {
  const db = getAdminDb('lifecycle cron purge queue')
  const jobs = await db
    .collection('video_purge_jobs')
    .where('status', '==', 'pending')
    .where('nextAttemptAt', '<=', now.toISOString())
    .limit(200)
    .get()

  let completed = 0
  const bucket = getAdminStorage('lifecycle cron purge queue').bucket()

  for (const jobDoc of jobs.docs) {
    const job = (jobDoc.data() || {}) as VideoPurgeJob
    const storagePath = job.storagePath
    if (!storagePath || !job.capsuleId) {
      await jobDoc.ref.set({
        status: 'failed',
        lastError: 'Missing storagePath or capsuleId',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      continue
    }

    const attempts = Number(job.attempts || 0) + 1
    const maxAttempts = Number(job.maxAttempts || 5)

    try {
      await bucket.file(storagePath).delete({ ignoreNotFound: true })

      const capsuleRef = db.collection('capsules').doc(job.capsuleId)
      const capsuleSnap = await capsuleRef.get()
      const capsule = (capsuleSnap.data() || {}) as CapsuleRecord
      const currentState = normalizeState(capsule.giftLifecycle?.state)

      let nextState = currentState
      try {
        nextState = applyLifecycleEvent(currentState, 'purge_video_copy')
      } catch {
        nextState = 'video_purged'
      }

      await capsuleRef.set({
        giftLifecycle: {
          ...(capsule.giftLifecycle || {}),
          state: nextState,
          lastActivityAt: now.toISOString(),
        },
        videoGift: {
          ...(capsule.videoGift || {}),
          storagePath,
          purgeStatus: 'deleted',
          purgedAt: now.toISOString(),
          purgeAttempts: attempts,
          lastError: null,
        },
        updatedAt: now,
      }, { merge: true })

      await jobDoc.ref.set({
        status: 'completed',
        attempts,
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      completed += 1
    } catch (error) {
      const lastError = error instanceof Error ? error.message : 'Unknown purge error'
      const retryable = isRetryableStorageError(error)

      if (retryable && !shouldGiveUpRetrying(attempts, maxAttempts)) {
        const nextRetryAt = computeNextRetryAt(now, attempts)
        await jobDoc.ref.set({
          status: 'pending',
          attempts,
          nextAttemptAt: nextRetryAt.toISOString(),
          lastError,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true })
      } else {
        await jobDoc.ref.set({
          status: 'failed',
          attempts,
          lastError,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true })
      }
    }
  }

  return completed
}

async function runTrustContactsSweep(now: Date): Promise<number> {
  const db = getAdminDb('lifecycle cron trust contacts')
  const windowDays = resolveTrustContactWindowDays()
  const threshold = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000)
  const snapshot = await db
    .collection('capsules')
    .where('giftLifecycle.lastActivityAt', '<=', threshold.toISOString())
    .limit(200)
    .get()

  let notifiedCapsules = 0

  for (const doc of snapshot.docs) {
    const capsule = (doc.data() || {}) as CapsuleRecord
    if (!capsule.userId) continue
    if (capsule.type === 'social') continue

    const alreadyNotifiedAt = readIsoDate(capsule.giftLifecycle?.trustContactsNotifiedAt)
    if (alreadyNotifiedAt) continue

    const contacts = Array.isArray(capsule.trustContacts) ? capsule.trustContacts : []
    if (contacts.length === 0) continue

    for (const contact of contacts) {
      const contactLabel = contact.name || 'contacto'
      if (contact.email) {
        await queueNotification(db, {
          userId: capsule.userId,
          capsuleId: doc.id,
          channel: 'email',
          to: contact.email,
          template: 'trust-contact-inactivity',
          payload: { capsuleTitle: capsule.title || 'Capsula', contactLabel },
        })
      }

      if (contact.phone) {
        await queueNotification(db, {
          userId: capsule.userId,
          capsuleId: doc.id,
          channel: 'sms',
          to: contact.phone,
          template: 'trust-contact-inactivity',
          payload: { capsuleTitle: capsule.title || 'Capsula', contactLabel },
        })

        if (contact.whatsappOptInAt) {
          await queueNotification(db, {
            userId: capsule.userId,
            capsuleId: doc.id,
            channel: 'whatsapp',
            to: contact.phone,
            template: 'trust-contact-inactivity',
            payload: { capsuleTitle: capsule.title || 'Capsula', contactLabel },
          })
        }
      }
    }

    await doc.ref.set({
      giftLifecycle: {
        ...(capsule.giftLifecycle || {}),
        trustContactsNotifiedAt: now.toISOString(),
      },
      updatedAt: now,
    }, { merge: true })
    notifiedCapsules += 1
  }

  return notifiedCapsules
}

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  try {
    const [expired, purged, trustNotified] = await Promise.all([
      runExpirySweep(now),
      runVideoPurgeQueue(now),
      runTrustContactsSweep(now),
    ])

    return NextResponse.json({
      ok: true,
      executedAt: now.toISOString(),
      expiredCapsules: expired,
      completedVideoPurges: purged,
      trustContactNotifications: trustNotified,
    })
  } catch (error) {
    console.error('Lifecycle cron failed:', error)
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 })
  }
}
