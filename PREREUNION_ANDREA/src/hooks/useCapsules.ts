'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { deleteObject, ref as storageRef } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Capsule, CapsuleType, CapsuleContent } from '@/types'

export function useCapsules(userId: string | undefined) {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setCapsules([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'capsules'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const capsulesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Capsule[]

        setCapsules(capsulesData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching capsules:', err)
        setError('Error al cargar las capsulas')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const createCapsule = useCallback(async (
    type: CapsuleType,
    title: string,
    description: string
  ) => {
    if (!userId) throw new Error('Usuario no autenticado')

    try {
      const capsuleData = {
        userId,
        type,
        title,
        description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic: false,
        sharedWith: [],
        contents: [],
        tags: []
      }

      const docRef = await addDoc(collection(db, 'capsules'), capsuleData)

      // Update user's capsule count
      await updateDoc(doc(db, 'users', userId), {
        capsuleCount: increment(1)
      })

      return docRef.id
    } catch (err) {
      console.error('Error creating capsule:', err)
      throw new Error('Error al crear la capsula')
    }
  }, [userId])

  const updateCapsule = useCallback(async (
    capsuleId: string,
    updates: Partial<Capsule>
  ) => {
    try {
      await updateDoc(doc(db, 'capsules', capsuleId), {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating capsule:', err)
      throw new Error('Error al actualizar la capsula')
    }
  }, [])

  const deleteCapsule = useCallback(async (capsuleId: string) => {
    if (!userId) throw new Error('Usuario no autenticado')

    try {
      const capsule = capsules.find((item) => item.id === capsuleId)
      const urls = capsule?.contents
        .map((content) => content.url)
        .filter((url): url is string => Boolean(url))
        .filter((url) => url.startsWith('gs://') || url.includes('firebasestorage.googleapis.com')) ?? []

      if (urls.length > 0) {
        const cleanupResults = await Promise.allSettled(
          urls.map((url) => deleteObject(storageRef(storage, url)))
        )

        cleanupResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn('Storage cleanup warning:', urls[index], result.reason)
          }
        })
      }

      await deleteDoc(doc(db, 'capsules', capsuleId))

      // Update user's capsule count
      await updateDoc(doc(db, 'users', userId), {
        capsuleCount: increment(-1)
      })
    } catch (err) {
      console.error('Error deleting capsule:', err)
      throw new Error('Error al eliminar la capsula')
    }
  }, [userId, capsules])

  const addContent = useCallback(async (
    capsuleId: string,
    content: Omit<CapsuleContent, 'id' | 'createdAt'>
  ) => {
    try {
      const capsule = capsules.find(c => c.id === capsuleId)
      if (!capsule) throw new Error('Capsula no encontrada')

      const newContent: CapsuleContent = {
        ...content,
        id: crypto.randomUUID(),
        createdAt: new Date()
      }

      await updateDoc(doc(db, 'capsules', capsuleId), {
        contents: [...capsule.contents, newContent],
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error adding content:', err)
      throw new Error('Error al agregar contenido')
    }
  }, [capsules])

  return {
    capsules,
    loading,
    error,
    createCapsule,
    updateCapsule,
    deleteCapsule,
    addContent
  }
}
