'use client'

import { useState, useEffect } from 'react'
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid))
          if (userDoc.exists()) {
            setUser({ id: fbUser.uid, ...userDoc.data() } as User)
          } else {
            // Do not auto-create profiles here. Account creation flows must
            // explicitly persist consent before profile creation.
            setUser(null)
            setError('Perfil no encontrado. Completa el registro desde /registro.')
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

  const signInWithGoogle = async (acceptedTerms = false) => {
    setError(null)
    try {
      const { user: fbUser } = await signInWithPopup(auth, googleProvider)
      const userRef = doc(db, 'users', fbUser.uid)
      const existingUser = await getDoc(userRef)

      if (!existingUser.exists()) {
        if (!acceptedTerms) {
          await firebaseSignOut(auth)
          throw new Error('Debes aceptar terminos y privacidad para crear una cuenta nueva')
        }

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
          consentVersion: '1.0',
        }

        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          termsAcceptedAt: serverTimestamp(),
          privacyAcceptedAt: serverTimestamp(),
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
      setError(message)
      throw err
    }
  }

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
        consentVersion: '1.0',
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
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut
  }
}
