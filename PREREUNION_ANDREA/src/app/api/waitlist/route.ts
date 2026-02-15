import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { randomUUID } from 'crypto'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  ApiValidationError,
  strictEmptyQuerySchema,
  validateSearchParams,
  validateWithSchema,
  waitlistPostBodySchema,
} from '@/lib/api-validation'
import { enforceFixedWindowRateLimit, resolveClientIp } from '@/lib/rate-limit'

const WAITLIST_LIMITS = {
  ip: { limit: 8, windowMs: 15 * 60 * 1000 },
  email: { limit: 3, windowMs: 60 * 60 * 1000 },
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const parsed = validateWithSchema(waitlistPostBodySchema, payload, 'request body')

    const email = parsed.email
    const source = parsed.source
    const consentVersion = parsed.consentVersion

    const requestIp = resolveClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const ipGate = await enforceFixedWindowRateLimit({
      namespace: 'waitlist-ip',
      key: `ip:${requestIp}`,
      limit: WAITLIST_LIMITS.ip.limit,
      windowMs: WAITLIST_LIMITS.ip.windowMs,
      context: 'waitlist POST ip',
    })

    if (!ipGate.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes desde esta IP, prueba mas tarde',
          retryAfterSeconds: ipGate.retryAfterSeconds,
        },
        { status: 429 }
      )
    }

    const emailGate = await enforceFixedWindowRateLimit({
      namespace: 'waitlist-email',
      key: `email:${email}`,
      limit: WAITLIST_LIMITS.email.limit,
      windowMs: WAITLIST_LIMITS.email.windowMs,
      context: 'waitlist POST email',
    })

    if (!emailGate.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiados intentos para este correo, prueba mas tarde',
          retryAfterSeconds: emailGate.retryAfterSeconds,
        },
        { status: 429 }
      )
    }

    const db = getAdminDb('waitlist POST')
    const unsubscribeToken = randomUUID()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    const existingQuery = await db
      .collection('waitlist')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (!existingQuery.empty) {
      return NextResponse.json(
        { message: 'Ya estas en la lista de espera', existing: true },
        { status: 200 }
      )
    }

    const docRef = await db.collection('waitlist').add({
      email,
      source,
      createdAt: FieldValue.serverTimestamp(),
      notified: false,
      unsubscribeToken,
      unsubscribedAt: null,
      consentVersion,
      consentSource: source,
      privacyAcceptedAt: FieldValue.serverTimestamp(),
      termsAcceptedAt: FieldValue.serverTimestamp(),
      requestMeta: {
        ip: requestIp,
        userAgent,
      },
    })

    return NextResponse.json(
      {
        message: 'Te has unido a la lista de espera',
        id: docRef.id,
        unsubscribeUrl: `${appUrl}/api/waitlist/unsubscribe?token=${unsubscribeToken}`,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: 'Payload invalido', details: error.issues },
        { status: error.status }
      )
    }

    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    validateSearchParams(strictEmptyQuerySchema, request.nextUrl.searchParams)

    const db = getAdminDb('waitlist GET')
    const snapshot = await db.collection('waitlist').count().get()

    return NextResponse.json({
      count: snapshot.data().count,
    })
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: 'Query invalida', details: error.issues },
        { status: error.status }
      )
    }

    return NextResponse.json({ count: 0 })
  }
}