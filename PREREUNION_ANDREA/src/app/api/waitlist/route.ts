import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
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
    console.log('Firebase admin init error (may be expected in dev):', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''
    const source = typeof payload?.source === 'string' ? payload.source : 'api'
    const acceptedPrivacy = payload?.acceptedPrivacy === true
    const consentVersion = typeof payload?.consentVersion === 'string' ? payload.consentVersion : '1.0'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const requestIp = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalido' },
        { status: 400 }
      )
    }
    if (!acceptedPrivacy) {
      return NextResponse.json(
        { error: 'Debes aceptar privacidad y terminos para unirte a la lista' },
        { status: 400 }
      )
    }

    const db = getFirestore()

    // Check if email already exists
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

    // Add to waitlist
    const docRef = await db.collection('waitlist').add({
      email,
      source,
      createdAt: FieldValue.serverTimestamp(),
      notified: false,
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
        id: docRef.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return waitlist count (public)
  try {
    const db = getFirestore()
    const snapshot = await db.collection('waitlist').count().get()

    return NextResponse.json({
      count: snapshot.data().count
    })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}
