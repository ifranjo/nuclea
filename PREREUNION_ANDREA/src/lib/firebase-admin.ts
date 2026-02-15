import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import type { NextRequest } from 'next/server'

export class AuthError extends Error {
  status: number

  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

class FirebaseAdminInitError extends Error {}

let cachedApp: App | null = null
let cachedInitError: Error | null = null

function getAdminCredentialOrThrow() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new FirebaseAdminInitError('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY')
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new FirebaseAdminInitError('FIREBASE_PRIVATE_KEY is present but not in PEM format')
  }

  return { projectId, clientEmail, privateKey }
}

function ensureAdminApp(context: string): App {
  if (cachedApp) {
    return cachedApp
  }

  if (cachedInitError) {
    throw new Error(`[firebase-admin] ${context}: ${cachedInitError.message}`)
  }

  if (getApps().length) {
    cachedApp = getApps()[0]
    return cachedApp
  }

  try {
    const credential = getAdminCredentialOrThrow()
    cachedApp = initializeApp({ credential: cert(credential) })
    return cachedApp
  } catch (error) {
    cachedInitError = error instanceof Error
      ? error
      : new FirebaseAdminInitError('Unknown Firebase Admin init error')
    throw new Error(`[firebase-admin] ${context}: ${cachedInitError.message}`)
  }
}

export function getAdminDb(context = 'firestore') {
  return getFirestore(ensureAdminApp(context))
}

export function getAdminAuth(context = 'auth') {
  return getAuth(ensureAdminApp(context))
}

export function getAdminStorage(context = 'storage') {
  return getStorage(ensureAdminApp(context))
}

export async function verifyBearerToken(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('No authorization token', 401)
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await getAdminAuth('verifyBearerToken').verifyIdToken(token)
    return decodedToken.uid
  } catch {
    throw new AuthError('Invalid authorization token', 401)
  }
}
