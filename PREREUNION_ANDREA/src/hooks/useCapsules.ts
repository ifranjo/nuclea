'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { deleteObject, ref as storageRef } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { normalizeCapsuleType } from '@/types'
import type { Capsule, CapsuleType, CapsuleContent } from '@/types'

const CAPSULES_PAGE_SIZE = 12

function toDateOrNow(value: unknown): Date {
  if (value instanceof Date) return value

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => unknown }).toDate === 'function'
  ) {
    const converted = (value as { toDate: () => unknown }).toDate()
    return converted instanceof Date ? converted : new Date()
  }

  return new Date()
}

function toCapsule(payload: unknown): Capsule | null {
  if (!payload || typeof payload !== 'object') return null

  const raw = payload as Partial<Capsule> & { id?: string; type?: string }
  if (typeof raw.id !== 'string') return null

  return {
    id: raw.id,
    userId: typeof raw.userId === 'string' ? raw.userId : '',
    type: normalizeCapsuleType(raw.type),
    title: typeof raw.title === 'string' ? raw.title : 'Capsula',
    description: typeof raw.description === 'string' ? raw.description : '',
    coverImage: typeof raw.coverImage === 'string' ? raw.coverImage : undefined,
    createdAt: toDateOrNow(raw.createdAt),
    updatedAt: toDateOrNow(raw.updatedAt),
    isPublic: raw.isPublic === true,
    sharedWith: Array.isArray(raw.sharedWith) ? raw.sharedWith.filter((item): item is string => typeof item === 'string') : [],
    contents: Array.isArray(raw.contents) ? raw.contents as CapsuleContent[] : [],
    aiAvatar: raw.aiAvatar,
    scheduledRelease: raw.scheduledRelease ? toDateOrNow(raw.scheduledRelease) : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((item): item is string => typeof item === 'string') : [],
  }
}

interface CapsulesApiResponse {
  capsules?: unknown[]
  pagination?: {
    hasMore?: boolean
    nextCursor?: string | null
  }
}

export function useCapsules(userId: string | undefined, getAuthToken?: () => Promise<string>) {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCapsulesPage = useCallback(async (cursor: string | null, append: boolean) => {
    if (!userId) {
      setCapsules([])
      setHasMore(false)
      setNextCursor(null)
      setLoading(false)
      return
    }

    if (!getAuthToken) {
      setError('Sesion no disponible para cargar capsulas')
      setLoading(false)
      return
    }

    const token = await getAuthToken()
    const params = new URLSearchParams({ limit: String(CAPSULES_PAGE_SIZE) })
    if (cursor) {
      params.set('cursor', cursor)
    }

    const response = await fetch(`/api/capsules?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await response.json() as CapsulesApiResponse & { error?: string }
    if (!response.ok) {
      throw new Error(payload.error || 'Error al cargar capsulas')
    }

    const parsedCapsules = Array.isArray(payload.capsules)
      ? payload.capsules
        .map(toCapsule)
        .filter((item): item is Capsule => item !== null)
      : []

    setCapsules((current) => {
      if (!append) return parsedCapsules

      const deduped = new Map<string, Capsule>()
      current.forEach((item) => deduped.set(item.id, item))
      parsedCapsules.forEach((item) => deduped.set(item.id, item))
      return [...deduped.values()]
    })

    setHasMore(payload.pagination?.hasMore === true)
    setNextCursor(typeof payload.pagination?.nextCursor === 'string' ? payload.pagination.nextCursor : null)
  }, [getAuthToken, userId])

  const refreshCapsules = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      await fetchCapsulesPage(null, false)
    } catch (err) {
      console.error('Error fetching capsules:', err)
      setError('Error al cargar las capsulas')
    } finally {
      setLoading(false)
    }
  }, [fetchCapsulesPage])

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return

    try {
      setLoadingMore(true)
      setError(null)
      await fetchCapsulesPage(nextCursor, true)
    } catch (err) {
      console.error('Error loading more capsules:', err)
      setError('Error al cargar mas capsulas')
    } finally {
      setLoadingMore(false)
    }
  }, [fetchCapsulesPage, hasMore, loadingMore, nextCursor])

  useEffect(() => {
    void refreshCapsules()
  }, [refreshCapsules])

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
        tags: [],
      }

      const docRef = await addDoc(collection(db, 'capsules'), capsuleData)

      await updateDoc(doc(db, 'users', userId), {
        capsuleCount: increment(1),
      })

      await refreshCapsules()
      return docRef.id
    } catch (err) {
      console.error('Error creating capsule:', err)
      throw new Error('Error al crear la capsula')
    }
  }, [refreshCapsules, userId])

  const updateCapsule = useCallback(async (
    capsuleId: string,
    updates: Partial<Capsule>
  ) => {
    try {
      await updateDoc(doc(db, 'capsules', capsuleId), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      await refreshCapsules()
    } catch (err) {
      console.error('Error updating capsule:', err)
      throw new Error('Error al actualizar la capsula')
    }
  }, [refreshCapsules])

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

      await updateDoc(doc(db, 'users', userId), {
        capsuleCount: increment(-1),
      })

      await refreshCapsules()
    } catch (err) {
      console.error('Error deleting capsule:', err)
      throw new Error('Error al eliminar la capsula')
    }
  }, [capsules, refreshCapsules, userId])

  const addContent = useCallback(async (
    capsuleId: string,
    content: Omit<CapsuleContent, 'id' | 'createdAt'>
  ) => {
    try {
      const capsule = capsules.find((c) => c.id === capsuleId)
      if (!capsule) throw new Error('Capsula no encontrada')

      const newContent: CapsuleContent = {
        ...content,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }

      await updateDoc(doc(db, 'capsules', capsuleId), {
        contents: [...capsule.contents, newContent],
        updatedAt: serverTimestamp(),
      })

      await refreshCapsules()
    } catch (err) {
      console.error('Error adding content:', err)
      throw new Error('Error al agregar contenido')
    }
  }, [capsules, refreshCapsules])

  return {
    capsules,
    loading,
    loadingMore,
    hasMore,
    error,
    createCapsule,
    updateCapsule,
    deleteCapsule,
    addContent,
    refreshCapsules,
    loadMore,
  }
}