'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'
import type { User } from '@/types'
import { CURRENT_CONSENT_VERSION } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pending consent state for Google OAuth new-user flow
  const [pendingConsent, setPendingConsent] = useState(false)
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUser({
              id: fbUser.uid,
              ...data,
              // Ensure consent fields are surfaced in User state
              termsAcceptedAt: data.termsAcceptedAt?.toDate?.() ?? data.termsAcceptedAt,
              privacyAcceptedAt: data.privacyAcceptedAt?.toDate?.() ?? data.privacyAcceptedAt,
              consentVersion: data.consentVersion,
            } as User)
          } else {
            // No profile doc — do not auto-create. Could be a pending Google consent flow.
            setUser(null)
          }
        } catch (err) {
          console.error('Error fetching user:', err)
          setError('Error al cargar datos del usuario')
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  /**
   * Google OAuth sign-in.
   *
   * For EXISTING users (Firestore doc exists): signs in directly.
   * For NEW users with `acceptedTerms === true` (registro page): creates profile with consent.
   * For NEW users without prior consent (login page): sets `pendingConsent` flag
   * so the caller can show a consent gate before calling `completeGoogleRegistration`.
   */
  const signInWithGoogle = async (acceptedTerms = false): Promise<'signed_in' | 'created' | 'pending_consent'> => {
    setError(null)
    setPendingConsent(false)
    setPendingFirebaseUser(null)

    try {
      const { user: fbUser } = await signInWithPopup(auth, googleProvider)
      const userRef = doc(db, 'users', fbUser.uid)
      const existingUser = await getDoc(userRef)

      if (existingUser.exists()) {
        // Existing user — sign-in complete, onAuthStateChanged will hydrate User state
        return 'signed_in'
      }

      // New user — need consent before creating profile
      if (acceptedTerms) {
        // Consent already given (e.g. from registro page with checkbox)
        await createUserProfile(fbUser)
        return 'created'
      } else {
        // No consent yet — park Firebase user and signal pending consent
        setPendingFirebaseUser(fbUser)
        setPendingConsent(true)
        // Do NOT sign out — keep the Firebase session alive so we can
        // create the Firestore doc when the user accepts terms.
        return 'pending_consent'
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
      setError(message)
      throw err
    }
  }

  /**
   * Complete registration for a Google OAuth user who needs to accept terms.
   * Called from the consent gate UI after the user checks the consent checkbox.
   */
  const completeGoogleRegistration = useCallback(async (acceptedTerms: boolean) => {
    if (!pendingFirebaseUser) {
      throw new Error('No hay usuario pendiente de registro')
    }

    if (!acceptedTerms) {
      // User declined — sign out and clean up
      await firebaseSignOut(auth)
      setPendingConsent(false)
      setPendingFirebaseUser(null)
      setUser(null)
      throw new Error('Debes aceptar los terminos y la politica de privacidad para crear una cuenta')
    }

    try {
      await createUserProfile(pendingFirebaseUser)
      setPendingConsent(false)
      setPendingFirebaseUser(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al completar el registro'
      setError(message)
      throw err
    }
  }, [pendingFirebaseUser])

  /**
   * Cancel a pending Google consent flow — signs out and resets state.
   */
  const cancelPendingConsent = useCallback(async () => {
    await firebaseSignOut(auth)
    setPendingConsent(false)
    setPendingFirebaseUser(null)
    setUser(null)
    setError(null)
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
      setError(message)
      throw err
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string, acceptedTerms = false) => {
    setError(null)
    try {
      if (!acceptedTerms) {
        throw new Error('Debes aceptar terminos y privacidad para crear una cuenta')
      }

      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)

      const now = new Date()
      const newUser: Omit<User, 'id'> = {
        email,
        displayName,
        plan: 'free',
        createdAt: now,
        capsuleCount: 0,
        storageUsed: 0,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        consentVersion: CURRENT_CONSENT_VERSION,
        consentSource: 'signup_email',
      }

      await setDoc(doc(db, 'users', fbUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        termsAcceptedAt: serverTimestamp(),
        privacyAcceptedAt: serverTimestamp(),
      })

      setUser({ id: fbUser.uid, ...newUser })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear cuenta'
      setError(message)
      throw err
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setPendingConsent(false)
      setPendingFirebaseUser(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesion'
      setError(message)
    }
  }

  return {
    user,
    firebaseUser,
    loading,
    error,
    pendingConsent,
    pendingFirebaseUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    completeGoogleRegistration,
    cancelPendingConsent
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a Firestore users/{uid} profile document with consent metadata.
 * Shared by signInWithGoogle (when consent is pre-accepted) and
 * completeGoogleRegistration.
 */
async function createUserProfile(fbUser: FirebaseUser): Promise<void> {
  const userRef = doc(db, 'users', fbUser.uid)
  const now = new Date()

  const newUser: Omit<User, 'id'> = {
    email: fbUser.email || '',
    displayName: fbUser.displayName || 'Usuario',
    photoURL: fbUser.photoURL || undefined,
    plan: 'free',
    createdAt: now,
    capsuleCount: 0,
    storageUsed: 0,
    termsAcceptedAt: now,
    privacyAcceptedAt: now,
    consentVersion: CURRENT_CONSENT_VERSION,
    consentSource: 'signup_google',
  }

  await setDoc(userRef, {
    ...newUser,
    createdAt: serverTimestamp(),
    termsAcceptedAt: serverTimestamp(),
    privacyAcceptedAt: serverTimestamp(),
  })
}
