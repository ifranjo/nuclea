import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { deleteBiometricFiles, deleteElevenLabsVoice } from '@/lib/elevenlabs'

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${secret}`) return true

  return request.headers.get('x-cron-secret') === secret
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb('cron biometric-cleanup')
  const thirtyDaysAgo = Timestamp.fromDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )

  const revokedSnapshot = await db
    .collectionGroup('consents')
    .where('type', '==', 'biometric_art9')
    .where('revokedAt', '<=', thirtyDaysAgo)
    .where('deletedFromProcessors', '==', null)
    .limit(200)
    .get()

  let processed = 0
  let retriableFailures = 0
  let permanentFailures = 0
  let skipped = 0

  for (const consentDoc of revokedSnapshot.docs) {
    const userRef = consentDoc.ref.parent.parent
    if (!userRef) {
      skipped += 1
      continue
    }

    try {
      const userDoc = await userRef.get()
      const userData = userDoc.data() as { aiAvatar?: { voiceId?: string } } | undefined
      const voiceId = userData?.aiAvatar?.voiceId

      const deleteResult = await deleteElevenLabsVoice(voiceId)
      await deleteBiometricFiles(userRef.id)

      if (deleteResult.ok) {
        await consentDoc.ref.update({
          deletedFromProcessors: FieldValue.serverTimestamp(),
          deletedFromProcessorsProvider: 'elevenlabs',
          deletedFromStorage: true,
          processorDeleteAttempts: FieldValue.increment(1),
          processorDeleteLastError: null,
          processorDeleteLastAttemptAt: FieldValue.serverTimestamp(),
        })

        if (userData?.aiAvatar) {
          await userRef.update({
            'aiAvatar.isActive': false,
            'aiAvatar.deletedFromProcessorsAt': FieldValue.serverTimestamp(),
          })
        }

        processed += 1
        continue
      }

      const updatePayload: Record<string, unknown> = {
        processorDeleteAttempts: FieldValue.increment(1),
        processorDeleteLastError: deleteResult.message,
        processorDeleteLastStatus: deleteResult.status ?? null,
        processorDeleteLastAttemptAt: FieldValue.serverTimestamp(),
      }

      if (deleteResult.retryable) {
        updatePayload.processorDeleteNextAttemptAt = Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        )
        retriableFailures += 1
      } else {
        permanentFailures += 1
      }

      await consentDoc.ref.update(updatePayload)
    } catch (error) {
      retriableFailures += 1
      await consentDoc.ref.update({
        processorDeleteAttempts: FieldValue.increment(1),
        processorDeleteLastError: error instanceof Error ? error.message : 'Unknown cleanup error',
        processorDeleteLastAttemptAt: FieldValue.serverTimestamp(),
        processorDeleteNextAttemptAt: Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        ),
      })
    }
  }

  return NextResponse.json({
    scanned: revokedSnapshot.size,
    processed,
    retriableFailures,
    permanentFailures,
    skipped,
  })
}
