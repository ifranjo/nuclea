'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DesignatedPerson {
  id: string
  capsule_id: string
  user_id: string
  full_name: string
  email: string
  relationship: string | null
  created_at: string
}

export function useDesignatedPersons(capsuleId?: string) {
  const [persons, setPersons] = useState<DesignatedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchPersons = useCallback(async () => {
    if (!capsuleId) {
      setPersons([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await supabase
        .from('designated_persons')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: true })
      setPersons(data || [])
    } catch {
      setPersons([])
    } finally {
      setLoading(false)
    }
  }, [capsuleId, supabase])

  useEffect(() => { fetchPersons() }, [fetchPersons])

  const addPerson = useCallback(async (userId: string, data: { full_name: string; email: string; relationship?: string }) => {
    if (!capsuleId) return { error: new Error('No capsule ID') }
    const { error } = await supabase.from('designated_persons').insert({
      capsule_id: capsuleId,
      user_id: userId,
      ...data,
    })
    if (!error) await fetchPersons()
    return { error }
  }, [capsuleId, fetchPersons, supabase])

  const removePerson = useCallback(async (personId: string) => {
    const { error } = await supabase.from('designated_persons').delete().eq('id', personId)
    if (!error) await fetchPersons()
    return { error }
  }, [fetchPersons, supabase])

  return { persons, loading, addPerson, removePerson }
}
