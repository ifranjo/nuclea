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
            // Create new user document
            const newUser: Omit<User, 'id'> = {
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Usuario',
              photoURL: fbUser.photoURL || undefined,
              plan: 'free',
              createdAt: new Date(),
              capsuleCount: 0,
              storageUsed: 0
            }
            await setDoc(doc(db, 'users', fbUser.uid), {
              ...newUser,
              createdAt: serverTimestamp()
            })
            setUser({ id: fbUser.uid, ...newUser })
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

  const signInWithGoogle = async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
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

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    setError(null)
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)

      const newUser: Omit<User, 'id'> = {
        email,
        displayName,
        plan: 'free',
        createdAt: new Date(),
        capsuleCount: 0,
        storageUsed: 0
      }

      await setDoc(doc(db, 'users', fbUser.uid), {
        ...newUser,
        createdAt: serverTimestamp()
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
