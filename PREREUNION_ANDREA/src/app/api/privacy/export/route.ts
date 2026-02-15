import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminDb, verifyBearerToken } from '@/lib/firebase-admin'
import { ApiValidationError, strictEmptyQuerySchema, validateSearchParams } from '@/lib/api-validation'

export async function GET(request: NextRequest) {
  try {
    validateSearchParams(strictEmptyQuerySchema, request.nextUrl.searchParams)

    const userId = await verifyBearerToken(request)
    const db = getAdminDb('privacy export GET')

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
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        { error: 'Query invalida', details: error.issues },
        { status: error.status }
      )
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Privacy export error:', error)
    return NextResponse.json(
      { error: 'No se pudo generar la exportacion de datos' },
      { status: 500 }
    )
  }
}