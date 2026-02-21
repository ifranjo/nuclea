'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import { buildCapsuleSizeMap } from '@/lib/storageSize'

export type Capsule = Database['public']['Tables']['capsules']['Row']

function toUserFacingErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const message = 'message' in error && typeof error.message === 'string' ? error.message.toLowerCase() : ''
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return 'No tienes permisos para acceder a esta capsula.'
  }
  return fallback
}

function assertCapsuleMutable(status: string): void {
  const immutableStates = ['closed', 'downloaded', 'expired', 'archived']
  if (immutableStates.includes(status)) {
    throw new Error(`Capsule is ${status} and cannot be modified`)
  }
}

export function useCapsules(userId?: string) {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchCapsules = useCallback(async () => {
    if (!userId) {
      setCapsules([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Owned capsules
      const { data: owned } = await supabase
        .from('capsules')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      // Collaborated capsules
      const { data: collabs } = await supabase
        .from('collaborators')
        .select('capsule_id')
        .eq('user_id', userId)

      let collaborated: Capsule[] = []
      if (collabs && collabs.length > 0) {
        const ids = collabs.map(c => c.capsule_id)
        const { data } = await supabase
          .from('capsules')
          .select('*')
          .in('id', ids)
        collaborated = data || []
      }

      const all = [...(owned || []), ...collaborated]
      const unique = Array.from(new Map(all.map(c => [c.id, c])).values())

      // Calculate storage_used_bytes from contents for each capsule
      const capsuleIds = unique.map(c => c.id)
      if (capsuleIds.length > 0) {
        const { data: contentSizes } = await supabase
          .from('contents')
          .select('capsule_id, file_size_bytes, text_content')
          .in('capsule_id', capsuleIds)
        if (contentSizes) {
          const sizeMap = buildCapsuleSizeMap(contentSizes)
          for (const c of unique) {
            c.storage_used_bytes = sizeMap[c.id] || 0
          }
        }
      }

      setCapsules(unique)
    } catch (err) {
      setCapsules([])
      setError(toUserFacingErrorMessage(err, 'No se pudieron cargar las capsulas.'))
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => { fetchCapsules() }, [fetchCapsules])

  const createCapsule = useCallback(async (data: {
    type: Database['public']['Enums']['capsule_type']
    title: string
    description?: string
  }): Promise<{ capsule: Capsule | null; error: Error | null }> => {
    if (!userId) {
      return { capsule: null, error: new Error('Not authenticated') }
    }

    const shareToken = crypto.randomUUID().slice(0, 8)
    const { data: capsule, error } = await supabase
      .from('capsules')
      .insert({
        owner_id: userId,
        type: data.type,
        title: data.title,
        description: data.description ?? null,
        share_token: shareToken,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return { capsule: null, error: new Error(error.message) }
    }

    await fetchCapsules()
    return { capsule, error: null }
  }, [fetchCapsules, supabase, userId])

  const closeCapsule = useCallback(async (id: string) => {
    if (!userId) {
      return { error: new Error('Not authenticated') }
    }

    const { data: capsule, error: readError } = await supabase
      .from('capsules')
      .select('status')
      .eq('id', id)
      .eq('owner_id', userId)
      .maybeSingle()

    if (readError) return { error: readError }
    if (!capsule) return { error: new Error('Capsule not found or not owned by current user') }
    try {
      assertCapsuleMutable(capsule.status)
    } catch (stateError) {
      return { error: stateError as Error }
    }
    if (capsule.status !== 'active') {
      return { error: new Error(`Cannot close capsule with status '${capsule.status}'`) }
    }

    const { error } = await supabase
      .from('capsules')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', userId)
      .eq('status', 'active')
    if (!error) await fetchCapsules()
    return { error }
  }, [fetchCapsules, supabase, userId])

  const ensureShareToken = useCallback(async (capsuleId: string, currentToken?: string | null) => {
    if (!userId) {
      return { shareToken: null, error: new Error('Not authenticated') }
    }

    if (currentToken) return { shareToken: currentToken, error: null }

    const shareToken = crypto.randomUUID().slice(0, 8)
    const { error } = await supabase
      .from('capsules')
      .update({ share_token: shareToken })
      .eq('id', capsuleId)
      .eq('owner_id', userId)

    if (!error) {
      setCapsules(prev => prev.map(c => (
        c.id === capsuleId ? { ...c, share_token: shareToken } : c
      )))
    }

    return { shareToken: error ? null : shareToken, error }
  }, [supabase, userId])

  return { capsules, loading, error, fetchCapsules, createCapsule, closeCapsule, ensureShareToken }
}
