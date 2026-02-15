import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  ApiValidationError,
  validateSearchParams,
  validateWithSchema,
  waitlistUnsubscribeBodySchema,
  waitlistUnsubscribeQuerySchema,
} from '@/lib/api-validation'

async function markUnsubscribed(token: string) {
  const db = getAdminDb('waitlist unsubscribe')
  const snapshot = await db
    .collection('waitlist')
    .where('unsubscribeToken', '==', token)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return { status: 'not_found' as const }
  }

  const waitlistDoc = snapshot.docs[0]
  const data = waitlistDoc.data()

  if (data.unsubscribedAt) {
    return { status: 'already_unsubscribed' as const, email: data.email }
  }

  await waitlistDoc.ref.update({
    unsubscribedAt: FieldValue.serverTimestamp(),
    notified: false,
  })

  return { status: 'unsubscribed' as const, email: data.email }
}

export async function GET(request: NextRequest) {
  try {
    const parsed = validateSearchParams(waitlistUnsubscribeQuerySchema, request.nextUrl.searchParams)

    const result = await markUnsubscribed(parsed.token)
    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Token invalido' }, { status: 404 })
    }

    return NextResponse.json({
      message:
        result.status === 'already_unsubscribed'
          ? 'Este correo ya estaba dado de baja'
          : 'Suscripcion cancelada correctamente',
      email: result.email,
    })
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: 'Query invalida', details: error.issues },
        { status: error.status }
      )
    }

    console.error('Waitlist unsubscribe GET error:', error)
    return NextResponse.json(
      { error: 'No se pudo completar la baja' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const parsed = validateWithSchema(waitlistUnsubscribeBodySchema, payload, 'request body')

    const result = await markUnsubscribed(parsed.token)
    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Token invalido' }, { status: 404 })
    }

    return NextResponse.json({
      message:
        result.status === 'already_unsubscribed'
          ? 'Este correo ya estaba dado de baja'
          : 'Suscripcion cancelada correctamente',
      email: result.email,
    })
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: 'Payload invalido', details: error.issues },
        { status: error.status }
      )
    }

    console.error('Waitlist unsubscribe POST error:', error)
    return NextResponse.json(
      { error: 'No se pudo completar la baja' },
      { status: 500 }
    )
  }
}