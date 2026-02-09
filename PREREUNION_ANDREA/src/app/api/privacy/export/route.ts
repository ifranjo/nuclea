import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

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
    console.log('Firebase admin init error (privacy export):', error)
  }
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token')
  }

  const token = authHeader.split('Bearer ')[1]
  const auth = getAuth()
  const decodedToken = await auth.verifyIdToken(token)
  return decodedToken.uid
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const db = getFirestore()

    const userDoc = await db.collection('users').doc(userId).get()
    const capsulesSnapshot = await db
      .collection('capsules')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get()

    const capsules = capsulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(
      {
        exportedAt: new Date().toISOString(),
        user: userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null,
        capsules,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Disposition': 'attachment; filename="nuclea-data-export.json"',
        },
      }
    )
  } catch (error) {
    console.error('Privacy export error:', error)
    return NextResponse.json(
      { error: 'No se pudo generar la exportacion de datos' },
      { status: 500 }
    )
  }
}
