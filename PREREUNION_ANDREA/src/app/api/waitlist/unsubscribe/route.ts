import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.log('Firebase admin init error (waitlist unsubscribe):', error)
  }
}

async function markUnsubscribed(token: string) {
  const db = getFirestore()
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
    const token = request.nextUrl.searchParams.get('token')?.trim()
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const result = await markUnsubscribed(token)
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
    const token = typeof payload?.token === 'string' ? payload.token.trim() : ''

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const result = await markUnsubscribed(token)
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
    console.error('Waitlist unsubscribe POST error:', error)
    return NextResponse.json(
      { error: 'No se pudo completar la baja' },
      { status: 500 }
    )
  }
}
