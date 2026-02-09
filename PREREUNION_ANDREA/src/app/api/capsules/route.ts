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
    console.log('Firebase admin init error:', error)
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

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const db = getFirestore()

    const snapshot = await db
      .collection('capsules')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get()

    const capsules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ capsules })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Get capsules error:', error)
    return NextResponse.json(
      { error: 'Error al obtener capsulas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const { type, title, description } = await request.json()

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Tipo y titulo son requeridos' },
        { status: 400 }
      )
    }

    const db = getFirestore()

    // Check user's plan limits
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    const planLimits: Record<string, number> = {
      free: 1,
      esencial: 2,
      familiar: 10,
      premium: 1 // EverLife only
    }

    const userPlan = userData?.plan || 'free'
    const currentCount = userData?.capsuleCount || 0

    if (currentCount >= planLimits[userPlan]) {
      return NextResponse.json(
        { error: 'Has alcanzado el limite de capsulas de tu plan' },
        { status: 403 }
      )
    }

    // Create capsule
    const capsuleData = {
      userId,
      type,
      title,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      sharedWith: [],
      contents: [],
      tags: []
    }

    const docRef = await db.collection('capsules').add(capsuleData)

    // Update user's capsule count
    await db.collection('users').doc(userId).update({
      capsuleCount: currentCount + 1
    })

    return NextResponse.json(
      {
        message: 'Capsula creada correctamente',
        id: docRef.id,
        capsule: { id: docRef.id, ...capsuleData }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Create capsule error:', error)
    return NextResponse.json(
      { error: 'Error al crear capsula' },
      { status: 500 }
    )
  }
}
