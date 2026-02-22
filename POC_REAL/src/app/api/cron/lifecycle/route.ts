import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueNotification } from '@/lib/lifecycle/notifications'
import { applyLifecycleEvent, type GiftLifecycleState } from '@/lib/lifecycle/state-machine'
import {
  computeNextRetryAt,
  isRetryableStorageError,
  shouldGiveUpRetrying,
} from '@/lib/lifecycle/video-purge-retry'
import { computeTrustContactNotifyBeforeIso } from '@/lib/lifecycle/trust-contact-window'

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  return secret === header || secret === bearer
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
  return typeof value === 'string' && allowed.includes(value as GiftLifecycleState)
    ? value as GiftLifecycleState
    : 'claimed'
}

async function runExpirySweep(nowIso: string): Promise<number> {
  const admin = createAdminClient()
  const { data: due } = await admin
    .from('capsules')
    .select('id, owner_id, title, trust_contacts_notified_at')
    .lte('gift_expires_at', nowIso)
    .in('gift_state', ['sent', 'claimed', 'continued', 'video_purchased'])
    .limit(200)

  const dueCapsules = due || []
  let expired = 0

  for (const capsule of dueCapsules) {
    if (!capsule.id) continue

    if (!capsule.trust_contacts_notified_at) {
      const { data: contacts } = await admin
        .from('designated_persons')
        .select('id, full_name, email, phone, whatsapp_opt_in_at')
        .eq('capsule_id', capsule.id)

      for (const contact of contacts || []) {
        const contactName = contact.full_name || 'contacto'
        if (contact.email) {
          await queueNotification(admin, {
            userId: capsule.owner_id,
            capsuleId: capsule.id,
            channel: 'email',
            recipient: contact.email,
            template: 'trust-contact-expiry',
            payload: { capsuleTitle: capsule.title || 'Capsula', contactName },
          })
        }

        if (contact.phone) {
          await queueNotification(admin, {
            userId: capsule.owner_id,
            capsuleId: capsule.id,
            channel: 'sms',
            recipient: contact.phone,
            template: 'trust-contact-expiry',
            payload: { capsuleTitle: capsule.title || 'Capsula', contactName },
          })

          if (contact.whatsapp_opt_in_at) {
            await queueNotification(admin, {
              userId: capsule.owner_id,
              capsuleId: capsule.id,
              channel: 'whatsapp',
              recipient: contact.phone,
              template: 'trust-contact-expiry',
              payload: { capsuleTitle: capsule.title || 'Capsula', contactName },
            })
          }
        }
      }
    }

    await admin
      .from('capsules')
      .update({
        gift_state: 'expired',
        trust_contacts_notified_at: nowIso,
        lifecycle_last_activity_at: nowIso,
      })
      .eq('id', capsule.id)
    expired += 1
  }

  return expired
}

async function runVideoPurgeQueue(now: Date): Promise<number> {
  const admin = createAdminClient()
  const nowIso = now.toISOString()
  const { data: jobs } = await admin
    .from('video_purge_jobs')
    .select('id, capsule_id, storage_path, attempts, max_attempts')
    .eq('status', 'pending')
    .lte('next_attempt_at', nowIso)
    .limit(200)

  let completed = 0

  for (const job of jobs || []) {
    const attempts = Number(job.attempts || 0) + 1
    const maxAttempts = Number(job.max_attempts || 5)

    const { error: removeError } = await admin.storage
      .from('capsule-contents')
      .remove([job.storage_path])

    if (!removeError) {
      const { data: capsule } = await admin
        .from('capsules')
        .select('gift_state')
        .eq('id', job.capsule_id)
        .maybeSingle()

      const current = normalizeState(capsule?.gift_state)
      let nextState = current
      try {
        nextState = applyLifecycleEvent(current, 'purge_video_copy')
      } catch {
        nextState = 'video_purged'
      }

      await admin
        .from('capsules')
        .update({
          gift_state: nextState,
          lifecycle_last_activity_at: nowIso,
          video_purge_status: 'deleted',
          video_purged_at: nowIso,
        })
        .eq('id', job.capsule_id)

      await admin
        .from('video_purge_jobs')
        .update({
          status: 'completed',
          attempts,
          completed_at: nowIso,
        })
        .eq('id', job.id)
      completed += 1
      continue
    }

    const retryable = isRetryableStorageError(removeError)
    if (retryable && !shouldGiveUpRetrying(attempts, maxAttempts)) {
      await admin
        .from('video_purge_jobs')
        .update({
          attempts,
          status: 'pending',
          next_attempt_at: computeNextRetryAt(now, attempts).toISOString(),
          last_error: removeError.message,
        })
        .eq('id', job.id)
    } else {
      await admin
        .from('video_purge_jobs')
        .update({
          attempts,
          status: 'failed',
          last_error: removeError.message,
        })
        .eq('id', job.id)
    }
  }

  return completed
}

async function runTrustContactsSweep(now: Date): Promise<number> {
  const admin = createAdminClient()
  const nowIso = now.toISOString()
  const lookaheadHours = Number(process.env.TRUST_CONTACT_NOTIFY_BEFORE_HOURS || 72)
  const thresholdIso = computeTrustContactNotifyBeforeIso(now, lookaheadHours)

  const { data: capsules } = await admin
    .from('capsules')
    .select('id, owner_id, title, gift_expires_at, gift_state')
    .gt('gift_expires_at', nowIso)
    .lte('gift_expires_at', thresholdIso)
    .in('gift_state', ['claimed', 'continued', 'video_purchased'])
    .neq('type', 'social')
    .is('trust_contacts_notified_at', null)
    .limit(200)

  let notifiedCapsules = 0

  for (const capsule of capsules || []) {
    const { data: contacts } = await admin
      .from('designated_persons')
      .select('id, full_name, email, phone, whatsapp_opt_in_at')
      .eq('capsule_id', capsule.id)

    if (!contacts || contacts.length === 0) continue

    for (const contact of contacts) {
      const contactName = contact.full_name || 'contacto'
      if (contact.email) {
        await queueNotification(admin, {
          userId: capsule.owner_id,
          capsuleId: capsule.id,
          channel: 'email',
          recipient: contact.email,
          template: 'trust-contact-expiry-warning',
          payload: {
            capsuleTitle: capsule.title || 'Capsula',
            contactName,
            expiresAt: capsule.gift_expires_at,
            lookaheadHours,
          },
        })
      }

      if (contact.phone) {
        await queueNotification(admin, {
          userId: capsule.owner_id,
          capsuleId: capsule.id,
          channel: 'sms',
          recipient: contact.phone,
          template: 'trust-contact-expiry-warning',
          payload: {
            capsuleTitle: capsule.title || 'Capsula',
            contactName,
            expiresAt: capsule.gift_expires_at,
            lookaheadHours,
          },
        })

        if (contact.whatsapp_opt_in_at) {
          await queueNotification(admin, {
            userId: capsule.owner_id,
            capsuleId: capsule.id,
            channel: 'whatsapp',
            recipient: contact.phone,
            template: 'trust-contact-expiry-warning',
            payload: {
              capsuleTitle: capsule.title || 'Capsula',
              contactName,
              expiresAt: capsule.gift_expires_at,
              lookaheadHours,
            },
          })
        }
      }
    }

    await admin
      .from('capsules')
      .update({
        trust_contacts_notified_at: nowIso,
      })
      .eq('id', capsule.id)
    notifiedCapsules += 1
  }

  return notifiedCapsules
}

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const nowIso = now.toISOString()
    const trustContactNotifications = await runTrustContactsSweep(now)
    const expiredCapsules = await runExpirySweep(nowIso)
    const completedVideoPurges = await runVideoPurgeQueue(now)

    return NextResponse.json({
      ok: true,
      executedAt: nowIso,
      expiredCapsules,
      completedVideoPurges,
      trustContactNotifications,
    })
  } catch (error) {
    console.error('Supabase lifecycle cron error:', error)
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 })
  }
}
