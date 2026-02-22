'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import { canAssignDesignatedPerson } from '@/lib/trust/designated-person-identity'

export type DesignatedPerson = Database['public']['Tables']['designated_persons']['Row']

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

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

  const addPerson = useCallback(async (data: { full_name: string; email: string; relationship?: string }) => {
    const ownerError = await assertCapsuleOwner()
    if (ownerError) return { error: ownerError }
    if (!capsuleId) return { error: new Error('No capsule ID') }
    if (!currentUserId) {
      return { error: new Error('Not authenticated') }
    }

    const normalizedEmail = normalizeEmail(data.email)
    if (!normalizedEmail) {
      return { error: new Error('Email requerido para contacto designado') }
    }

    const { data: designatedUser, error: designatedUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (designatedUserError) {
      return { error: designatedUserError }
    }

    const identityValidation = canAssignDesignatedPerson(currentUserId, designatedUser?.id || null)
    if (!identityValidation.ok) {
      return { error: new Error(identityValidation.reason || 'Contacto de confianza invalido') }
    }

    const { error } = await supabase.from('designated_persons').insert({
      capsule_id: capsuleId,
      user_id: designatedUser.id,
      full_name: data.full_name.trim(),
      email: normalizedEmail,
      relationship: data.relationship?.trim() || null,
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
