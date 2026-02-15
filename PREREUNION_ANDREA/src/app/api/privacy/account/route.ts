import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminAuth, getAdminDb, getAdminStorage, verifyBearerToken } from '@/lib/firebase-admin'
import { ApiValidationError, strictEmptyQuerySchema, validateSearchParams } from '@/lib/api-validation'

function extractStoragePath(url: string): string | null {
  if (!url) return null

  if (url.startsWith('gs://')) {
    const parts = url.replace('gs://', '').split('/')
    parts.shift()
    const path = parts.join('/')
    return path || null
  }

  if (url.includes('firebasestorage.googleapis.com')) {
    const match = url.match(/\/o\/([^?]+)/)
    if (!match?.[1]) return null
    return decodeURIComponent(match[1])
  }

  return null
}

export async function DELETE(request: NextRequest) {
  try {
    validateSearchParams(strictEmptyQuerySchema, request.nextUrl.searchParams)

    const userId = await verifyBearerToken(request)
    const db = getAdminDb('privacy account DELETE')
    const auth = getAdminAuth('privacy account DELETE')

    const capsulesSnapshot = await db
      .collection('capsules')
      .where('userId', '==', userId)
      .get()

    const storagePaths = new Set<string>()
    capsulesSnapshot.docs.forEach((capsuleDoc) => {
      const data = capsuleDoc.data() as {
        contents?: Array<{ url?: string }>
      }
      data.contents?.forEach((content) => {
        if (!content?.url) return
        const path = extractStoragePath(content.url)
        if (path) storagePaths.add(path)
      })
    })

    const bucket = getAdminStorage('privacy account DELETE').bucket()
    const cleanupResults = await Promise.allSettled(
      [...storagePaths].map((path) => bucket.file(path).delete())
    )

    cleanupResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn('Storage cleanup warning (account delete):', [...storagePaths][index], result.reason)
      }
    })

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
      deletedStorageObjects: storagePaths.size,
    })
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

    console.error('Privacy account delete error:', error)
    return NextResponse.json(
      { error: 'No se pudo completar la eliminacion de cuenta' },
      { status: 500 }
    )
  }
}