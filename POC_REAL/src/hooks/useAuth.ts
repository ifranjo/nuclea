'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchProfile = useCallback(async (authId: string) => {
    try {
      setError(null)
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle()
      setProfile(data ?? null)
    } catch (err) {
      setProfile(null)
      const message = err instanceof Error ? err.message.toLowerCase() : ''
      setError(
        message.includes('row-level security') || message.includes('permission denied')
          ? 'No tienes permisos para acceder a tu perfil.'
          : 'No se pudo cargar tu perfil.'
      )
    }
  }, [supabase])

  useEffect(() => {
    let cancelled = false
    const failSafe = window.setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 5000)

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      cancelled = true
      clearTimeout(failSafe)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [supabase])

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    consent: {
      termsAcceptedAt: string
      privacyAcceptedAt: string
      consentSource: 'signup_email' | 'signup_google' | 'beta_invite'
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    if (data.user) {
      await supabase.from('users').insert({
        auth_id: data.user.id,
        email,
        full_name: fullName,
        terms_accepted_at: consent.termsAcceptedAt,
        privacy_accepted_at: consent.privacyAcceptedAt,
        consent_version: '2.0',
        consent_source: consent.consentSource,
      })
    }
    return { error: null }
  }, [supabase])

  const signOut = useCallback(async () => {
    // Clear state first so UI reacts immediately
    setUser(null)
    setProfile(null)
    setLoading(false)
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore signOut errors — we're clearing session regardless
    }
    window.location.href = '/login'
  }, [supabase])

  return { user, profile, loading, error, signIn, signUp, signOut }
}
