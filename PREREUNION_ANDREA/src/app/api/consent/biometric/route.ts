import { FieldValue } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminDb, verifyBearerToken } from '@/lib/firebase-admin'
import {
  ApiValidationError,
  biometricConsentSchema,
  revokeConsentSchema,
  validateWithSchema,
} from '@/lib/api-validation'
import { CURRENT_CONSENT_VERSION } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toIsoString(value: unknown): string | null {
  if (!value) return null

  if (value instanceof Date) return value.toISOString()

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => unknown }).toDate === 'function'
  ) {
    const converted = (value as { toDate: () => unknown }).toDate()
    if (converted instanceof Date) return converted.toISOString()
  }

  if (typeof value === 'string') return value

  return null
}

// ---------------------------------------------------------------------------
// POST — Sign biometric consent
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const body = await request.json()
    const parsed = validateWithSchema(biometricConsentSchema, body, 'request body')

    const db = getAdminDb('consent POST')

    const consentData = {
      userId,
      type: 'biometric_art9',
      voiceConsent: parsed.voiceConsent,
      faceConsent: parsed.faceConsent,
      personalityConsent: parsed.personalityConsent,
      consentVersion: CURRENT_CONSENT_VERSION,
      signedAt: FieldValue.serverTimestamp(),
      revokedAt: null,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('consents')
      .add(consentData)

    return NextResponse.json(
      {
        consentId: docRef.id,
        signedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.issues },
        { status: error.status }
      )
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Consent POST error:', error)
    return NextResponse.json(
      { error: 'Error al registrar el consentimiento' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE — Revoke biometric consent
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const body = await request.json()
    const parsed = validateWithSchema(revokeConsentSchema, body, 'request body')

    const db = getAdminDb('consent DELETE')

    const consentRef = db
      .collection('users')
      .doc(userId)
      .collection('consents')
      .doc(parsed.consentId)

    const consentDoc = await consentRef.get()

    if (!consentDoc.exists) {
      return NextResponse.json(
        { error: 'Consentimiento no encontrado' },
        { status: 404 }
      )
    }

    const consentData = consentDoc.data()

    if (consentData?.userId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para revocar este consentimiento' },
        { status: 403 }
      )
    }

    if (consentData?.revokedAt !== null) {
      return NextResponse.json(
        { error: 'Este consentimiento ya ha sido revocado' },
        { status: 409 }
      )
    }

    // Revoke the consent document
    const updatePayload: Record<string, unknown> = {
      revokedAt: FieldValue.serverTimestamp(),
    }
    if (parsed.reason) {
      updatePayload.revocationReason = parsed.reason
    }

    await consentRef.update(updatePayload)

    // Also update user's AIAvatar consentWithdrawnAt if an avatar exists
    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()
    const userData = userDoc.data()

    if (userData?.aiAvatar) {
      await userRef.update({
        'aiAvatar.consentWithdrawnAt': FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json({
      revokedAt: new Date().toISOString(),
      message: 'Consentimiento revocado',
    })
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.issues },
        { status: error.status }
      )
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Consent DELETE error:', error)
    return NextResponse.json(
      { error: 'Error al revocar el consentimiento' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// GET — Get current consent status
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const db = getAdminDb('consent GET')

    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('consents')
      .where('type', '==', 'biometric_art9')
      .where('revokedAt', '==', null)
      .orderBy('signedAt', 'desc')
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ hasActiveConsent: false })
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    return NextResponse.json({
      hasActiveConsent: true,
      consent: {
        consentId: doc.id,
        voiceConsent: data.voiceConsent,
        faceConsent: data.faceConsent,
        personalityConsent: data.personalityConsent,
        consentVersion: data.consentVersion,
        signedAt: toIsoString(data.signedAt),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Consent GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el estado del consentimiento' },
      { status: 500 }
    )
  }
}
