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
import { authFetch } from '@/lib/auth-fetch'
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

function assertCapsuleMutable(capsule: Capsule): void {
  const lifecycleState = (capsule as Capsule & { giftLifecycle?: { state?: string } }).giftLifecycle?.state
  if (!lifecycleState) return

  const immutableStates = new Set(['closed', 'downloaded', 'expired', 'archived', 'deleted', 'video_purged'])
  if (immutableStates.has(lifecycleState)) {
    throw new Error(`Capsula bloqueada en estado '${lifecycleState}'`)
  }
}

// getAuthToken is accepted for backward compatibility but is intentionally not
// used internally.  Token acquisition is now handled by authFetch, which
// performs automatic refresh on 401 without relying on an external callback.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const params = new URLSearchParams({ limit: String(CAPSULES_PAGE_SIZE) })
    if (cursor) {
      params.set('cursor', cursor)
    }

    // authFetch attaches the Firebase ID token and retries once with a
    // force-refreshed token on 401 — this handles sessions open for >1 hour
    // where the cached token has expired without a page reload.
    const response = await authFetch(`/api/capsules?${params.toString()}`, {
      method: 'GET',
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
  }, [userId])

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
    if (!userId) throw new Error('Usuario no autenticado')

    try {
      const target = capsules.find((item) => item.id === capsuleId)
      if (!target || target.userId !== userId) {
        throw new Error('No autorizado para actualizar esta capsula')
      }
      assertCapsuleMutable(target)

      await updateDoc(doc(db, 'capsules', capsuleId), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      await refreshCapsules()
    } catch (err) {
      console.error('Error updating capsule:', err)
      throw new Error('Error al actualizar la capsula')
    }
  }, [capsules, refreshCapsules, userId])

  const deleteCapsule = useCallback(async (capsuleId: string) => {
    if (!userId) throw new Error('Usuario no autenticado')

    try {
      const capsule = capsules.find((item) => item.id === capsuleId)
      if (!capsule || capsule.userId !== userId) {
        throw new Error('No autorizado para eliminar esta capsula')
      }
      assertCapsuleMutable(capsule)

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
    if (!userId) throw new Error('Usuario no autenticado')

    try {
      const capsule = capsules.find((c) => c.id === capsuleId)
      if (!capsule) throw new Error('Capsula no encontrada')
      if (capsule.userId !== userId) throw new Error('No autorizado para modificar esta capsula')
      assertCapsuleMutable(capsule)

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
  }, [capsules, refreshCapsules, userId])

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
