import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

class AuthError extends Error {
  status: number

  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

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
    console.log('Firebase admin init error (privacy account):', error)
  }
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('No authorization token', 401)
  }

  const token = authHeader.split('Bearer ')[1]
  const auth = getAuth()
  try {
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken.uid
  } catch (_error) {
    throw new AuthError('Invalid authorization token', 401)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const db = getFirestore()
    const auth = getAuth()

    const capsulesSnapshot = await db
      .collection('capsules')
      .where('userId', '==', userId)
      .get()

    const batch = db.batch()

    capsulesSnapshot.docs.forEach((capsuleDoc) => {
      batch.delete(capsuleDoc.ref)
    })
    batch.delete(db.collection('users').doc(userId))

    await batch.commit()
    await auth.deleteUser(userId)

    return NextResponse.json({
      message: 'Cuenta y datos principales eliminados',
      deletedCapsules: capsulesSnapshot.size,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Privacy account delete error:', error)
    return NextResponse.json(
      { error: 'No se pudo completar la eliminacion de cuenta' },
      { status: 500 }
    )
  }
}
