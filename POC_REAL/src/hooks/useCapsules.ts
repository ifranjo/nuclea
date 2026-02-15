'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Capsule {
  id: string
  owner_id: string
  type: string
  status: string
  title: string | null
  description: string | null
  cover_image_url: string | null
  share_token: string | null
  storage_used_bytes: number
  created_at: string
  updated_at: string
  closed_at: string | null
}

export function useCapsules(userId?: string) {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchCapsules = useCallback(async () => {
    if (!userId) {
      setCapsules([])
      setLoading(false)
      return
    }

    setLoading(true)
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
          .select('capsule_id, file_size_bytes')
          .in('capsule_id', capsuleIds)
        if (contentSizes) {
          const sizeMap: Record<string, number> = {}
          for (const row of contentSizes) {
            sizeMap[row.capsule_id] = (sizeMap[row.capsule_id] || 0) + (row.file_size_bytes || 0)
          }
          for (const c of unique) {
            c.storage_used_bytes = sizeMap[c.id] || 0
          }
        }
      }

      setCapsules(unique)
    } catch {
      setCapsules([])
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => { fetchCapsules() }, [fetchCapsules])

  const createCapsule = useCallback(async (data: {
    owner_id: string; type: string; title: string; description?: string
  }) => {
    const shareToken = crypto.randomUUID().slice(0, 8)
    const { data: capsule, error } = await supabase
      .from('capsules')
      .insert({ ...data, share_token: shareToken, status: 'active' })
      .select()
      .single()
    if (!error) await fetchCapsules()
    return { capsule, error }
  }, [fetchCapsules, supabase])

  const closeCapsule = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('capsules')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await fetchCapsules()
    return { error }
  }, [fetchCapsules, supabase])

  const ensureShareToken = useCallback(async (capsuleId: string, currentToken?: string | null) => {
    if (currentToken) return { shareToken: currentToken, error: null }

    const shareToken = crypto.randomUUID().slice(0, 8)
    const { error } = await supabase
      .from('capsules')
      .update({ share_token: shareToken })
      .eq('id', capsuleId)

    if (!error) {
      setCapsules(prev => prev.map(c => (
        c.id === capsuleId ? { ...c, share_token: shareToken } : c
      )))
    }

    return { shareToken: error ? null : shareToken, error }
  }, [supabase])

  return { capsules, loading, fetchCapsules, createCapsule, closeCapsule, ensureShareToken }
}
