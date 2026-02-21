'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

export type DesignatedPerson = Database['public']['Tables']['designated_persons']['Row']

export function useDesignatedPersons(capsuleId?: string, currentUserId?: string) {
  const [persons, setPersons] = useState<DesignatedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const assertCapsuleOwner = useCallback(async () => {
    if (!capsuleId) return new Error('No capsule ID')
    if (!currentUserId) return new Error('Not authenticated')

    const { data, error } = await supabase
      .from('capsules')
      .select('id')
      .eq('id', capsuleId)
      .eq('owner_id', currentUserId)
      .maybeSingle()

    if (error) return error
    if (!data) return new Error('Capsule not found or not owned by current user')
    return null
  }, [capsuleId, currentUserId, supabase])

  const fetchPersons = useCallback(async () => {
    if (!capsuleId) {
      setPersons([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data } = await supabase
        .from('designated_persons')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: true })
      setPersons(data || [])
    } catch (err) {
      setPersons([])
      const message = err instanceof Error ? err.message.toLowerCase() : ''
      setError(
        message.includes('row-level security') || message.includes('permission denied')
          ? 'No tienes permisos para acceder a estos contactos.'
          : 'No se pudieron cargar los contactos designados.'
      )
    } finally {
      setLoading(false)
    }
  }, [capsuleId, supabase])

  useEffect(() => { fetchPersons() }, [fetchPersons])

  const addPerson = useCallback(async (userId: string, data: { full_name: string; email: string; relationship?: string }) => {
    const ownerError = await assertCapsuleOwner()
    if (ownerError) return { error: ownerError }
    if (!capsuleId) return { error: new Error('No capsule ID') }
    if (!currentUserId || userId !== currentUserId) {
      return { error: new Error('User mismatch for designated person update') }
    }

    const { error } = await supabase.from('designated_persons').insert({
      capsule_id: capsuleId,
      user_id: userId,
      ...data,
    })
    if (!error) await fetchPersons()
    return { error }
  }, [assertCapsuleOwner, capsuleId, currentUserId, fetchPersons, supabase])

  const removePerson = useCallback(async (personId: string) => {
    const ownerError = await assertCapsuleOwner()
    if (ownerError) return { error: ownerError }
    if (!capsuleId) return { error: new Error('No capsule ID') }

    const { error } = await supabase
      .from('designated_persons')
      .delete()
      .eq('id', personId)
      .eq('capsule_id', capsuleId)

    if (!error) await fetchPersons()
    return { error }
  }, [assertCapsuleOwner, capsuleId, fetchPersons, supabase])

  return { persons, loading, error, addPerson, removePerson }
}
