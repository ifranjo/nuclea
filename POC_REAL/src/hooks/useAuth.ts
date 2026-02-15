'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchProfile = useCallback(async (authId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle()
      setProfile(data ?? null)
    } catch {
      setProfile(null)
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

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    if (data.user) {
      await supabase.from('users').insert({
        auth_id: data.user.id,
        email,
        full_name: fullName,
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

  return { user, profile, loading, signIn, signUp, signOut }
}
