import { FieldValue } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminDb, verifyBearerToken } from '@/lib/firebase-admin'
import {
  ApiValidationError,
  capsulesCreateBodySchema,
  capsulesListQuerySchema,
  validateSearchParams,
  validateWithSchema,
} from '@/lib/api-validation'
import { decodeCapsulesCursor, encodeCapsulesCursor, sanitizeCapsulePageSize } from '@/lib/capsule-pagination'
import { normalizeCapsuleType } from '@/types'

class PlanLimitError extends Error {
  status: number

  constructor(message: string) {
    super(message)
    this.status = 403
  }
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => unknown }).toDate === 'function'
  ) {
    const converted = (value as { toDate: () => unknown }).toDate()
    if (converted instanceof Date) {
      return converted.toISOString()
    }
  }

  if (typeof value === 'string') {
    return value
  }

  return new Date(0).toISOString()
}

function serializeCapsule(doc: { id: string; data: () => Record<string, unknown> }) {
  const data = doc.data()

  return {
    id: doc.id,
    ...data,
    type: normalizeCapsuleType(typeof data.type === 'string' ? data.type : undefined),
    createdAt: toIsoDate(data.createdAt),
    updatedAt: toIsoDate(data.updatedAt),
    contents: Array.isArray(data.contents) ? data.contents : [],
    sharedWith: Array.isArray(data.sharedWith) ? data.sharedWith : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const queryInput = validateSearchParams(capsulesListQuerySchema, request.nextUrl.searchParams)

    const limit = sanitizeCapsulePageSize(queryInput.limit ?? 12)
    const decodedCursor = queryInput.cursor ? decodeCapsulesCursor(queryInput.cursor) : null

    const db = getAdminDb('capsules GET')

    let capsulesQuery = db
      .collection('capsules')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')

    if (decodedCursor) {
      const cursorSnapshot = await db.collection('capsules').doc(decodedCursor).get()
      if (!cursorSnapshot.exists) {
        throw new ApiValidationError('Invalid cursor', ['cursor: documento no encontrado'])
      }

      const cursorUserId = cursorSnapshot.data()?.userId
      if (cursorUserId !== userId) {
        throw new ApiValidationError('Invalid cursor', ['cursor: no pertenece al usuario'])
      }

      capsulesQuery = capsulesQuery.startAfter(cursorSnapshot)
    }

    const snapshot = await capsulesQuery.limit(limit + 1).get()

    const docs = snapshot.docs
    const hasMore = docs.length > limit
    const pageDocs = hasMore ? docs.slice(0, limit) : docs

    const capsules = pageDocs.map(serializeCapsule)
    const nextCursor = hasMore && pageDocs.length > 0
      ? encodeCapsulesCursor(pageDocs[pageDocs.length - 1].id)
      : null

    return NextResponse.json({
      capsules,
      pagination: {
        limit,
        hasMore,
        nextCursor,
      },
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

    console.error('Get capsules error:', error)
    return NextResponse.json(
      { error: 'Error al obtener capsulas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const body = await request.json()
    const parsed = validateWithSchema(capsulesCreateBodySchema, body, 'request body')

    const db = getAdminDb('capsules POST')

    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    const planLimits: Record<string, number> = {
      free: 1,
      esencial: 2,
      familiar: 10,
      premium: 1,
    }

    const userPlan = typeof userData?.plan === 'string' ? userData.plan : 'free'
    const currentCount = Number(userData?.capsuleCount ?? 0)
    const maxAllowed = planLimits[userPlan] ?? planLimits.free

    if (currentCount >= maxAllowed) {
      throw new PlanLimitError('Has alcanzado el limite de capsulas de tu plan')
    }

    const now = new Date()
    const capsuleData = {
      userId,
      type: normalizeCapsuleType(parsed.type),
      title: parsed.title,
      description: parsed.description,
      createdAt: now,
      updatedAt: now,
      isPublic: false,
      sharedWith: [],
      contents: [],
      tags: [],
    }

    const docRef = await db.collection('capsules').add(capsuleData)

    await db.collection('users').doc(userId).update({
      capsuleCount: FieldValue.increment(1),
    })

    return NextResponse.json(
      {
        message: 'Capsula creada correctamente',
        id: docRef.id,
        capsule: {
          id: docRef.id,
          ...capsuleData,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
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

    if (error instanceof PlanLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

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
