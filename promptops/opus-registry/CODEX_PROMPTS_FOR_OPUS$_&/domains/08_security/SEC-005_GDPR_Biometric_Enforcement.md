# GDPR Biometric Data Lifecycle Enforcement

## Metadata

- Prompt ID: `PRM-SEC-005`
- Version: `1.0.0`
- Owner: `CTO / DPO (pending)`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P0 CRITICAL`
- Target App: `PREREUNION_ANDREA`
- Legal: `Art. 9.2.a RGPD, Art. 17, Art. 7.3, Art. 28`

## Purpose

The biometric consent API stores `revokedAt` timestamp but **never enforces** the revocation. After consent withdrawal:
- AI Avatar remains active (should be disabled)
- Biometric data stays in ElevenLabs (should be deleted within 30 days)
- No scheduled cleanup job exists
- `consentWithdrawnAt` field is written but never read

This violates Art. 7.3 (effective withdrawal), Art. 17 (right to erasure), and Art. 5.1.e (storage limitation).

## Output Contract

### 1. Avatar Disablement Guard

Add to every avatar interaction point:

```typescript
// src/lib/avatar-guard.ts (NEW)
export function assertAvatarActive(user: User): void {
  if (user.aiAvatar?.consentWithdrawnAt) {
    throw new AvatarDisabledError(
      'Tu avatar IA ha sido desactivado porque retiraste el consentimiento biométrico.'
    )
  }
}

export class AvatarDisabledError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AvatarDisabledError'
  }
}
```

Apply guard in:
- Any future avatar generation endpoint
- Any avatar interaction UI component
- Dashboard avatar preview section

### 2. Biometric Cleanup Scheduled Job

```typescript
// src/app/api/cron/biometric-cleanup/route.ts (NEW)
// Triggered daily by Vercel Cron or external scheduler

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Find revoked consents older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Query consents collection group
  const revokedConsents = await db.collectionGroup('consents')
    .where('type', '==', 'biometric_art9')
    .where('revokedAt', '<=', Timestamp.fromDate(thirtyDaysAgo))
    .where('deletedFromProcessors', '==', null)
    .get()

  for (const doc of revokedConsents.docs) {
    const consent = doc.data()

    // 1. Delete from ElevenLabs (if voice ID exists)
    if (consent.voiceConsent) {
      await deleteElevenLabsVoice(consent.userId)
    }

    // 2. Delete biometric files from Storage
    await deleteBiometricFiles(consent.userId)

    // 3. Mark as processed
    await doc.ref.update({
      deletedFromProcessors: FieldValue.serverTimestamp(),
      deletionLog: {
        elevenLabs: true,
        storage: true,
        processedAt: new Date().toISOString()
      }
    })
  }

  return Response.json({ processed: revokedConsents.size })
}
```

### 3. ElevenLabs API Integration

```typescript
// src/lib/elevenlabs.ts (NEW)
export async function deleteElevenLabsVoice(userId: string): Promise<void> {
  // Look up voice ID from user's avatar data
  const userDoc = await db.collection('users').doc(userId).get()
  const voiceId = userDoc.data()?.aiAvatar?.voiceId

  if (!voiceId) return

  // ElevenLabs DELETE /v1/voices/{voice_id}
  const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
  })

  if (!response.ok && response.status !== 404) {
    throw new Error(`ElevenLabs deletion failed: ${response.status}`)
  }
}
```

### 4. Vercel Cron Configuration

```json
// vercel.json (add or update)
{
  "crons": [
    {
      "path": "/api/cron/biometric-cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 5. Audit Enhancement

Update `DELETE /api/consent/biometric` to also log:
- IP address of revocation request
- Scheduled deletion date (30 days from now)
- Processing status

## Quality Gates

- Gate 1: After consent revocation, avatar interactions return 403
- Gate 2: Cron job processes 30-day-old revocations correctly
- Gate 3: ElevenLabs API called with correct voice ID
- Gate 4: Consent doc updated with `deletedFromProcessors` timestamp
- Gate 5: Audit trail captures full lifecycle (sign → revoke → delete)

## Dependencies

- `ELEVENLABS_API_KEY` env var (currently not in .env.local)
- `CRON_SECRET` env var for Vercel Cron auth
- ElevenLabs voice IDs must be stored in user profile (verify current schema)

## DPIA Note

Art. 35 RGPD requires a Data Protection Impact Assessment for biometric processing. This is a **documentation task** (not code) that should be completed before collecting real biometric data. Template: https://www.aepd.es/guias/modelo-evaluacion-impacto.pdf
