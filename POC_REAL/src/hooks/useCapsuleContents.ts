'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

export type CapsuleContent = Database['public']['Tables']['contents']['Row']

function toUserFacingErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const message = 'message' in error && typeof error.message === 'string' ? error.message.toLowerCase() : ''
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return 'No tienes permisos para modificar esta cápsula.'
  }
  return fallback
}

function assertCapsuleMutable(status: string): void {
  const immutableStates = ['closed', 'downloaded', 'expired', 'archived']
  if (immutableStates.includes(status)) {
    throw new Error(`Capsule is ${status} and cannot be modified`)
  }
}

export function useCapsuleContents(capsuleId?: string, currentUserId?: string) {
  const [contents, setContents] = useState<CapsuleContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const assertCapsuleOwner = useCallback(async () => {
    if (!capsuleId) return new Error('No capsule ID')
    if (!currentUserId) return new Error('Not authenticated')

    const { data, error } = await supabase
      .from('capsules')
      .select('id, status')
      .eq('id', capsuleId)
      .eq('owner_id', currentUserId)
      .maybeSingle()

    if (error) return error
    if (!data) return new Error('Capsule not found or not owned by current user')
    try {
      assertCapsuleMutable(data.status)
    } catch (stateError) {
      return stateError as Error
    }
    return null
  }, [capsuleId, currentUserId, supabase])

  const fetchContents = useCallback(async () => {
    if (!capsuleId) {
      setContents([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data } = await supabase
        .from('contents')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('captured_at', { ascending: false })
      setContents(data || [])
    } catch (err) {
      setContents([])
      setError(toUserFacingErrorMessage(err, 'No se pudo cargar el contenido.'))
    } finally {
      setLoading(false)
    }
  }, [capsuleId, supabase])

  useEffect(() => { fetchContents() }, [fetchContents])

  const uploadFile = useCallback(async (file: File, userId: string, type: 'photo' | 'video' | 'audio', capturedAt?: Date) => {
    const ownerError = await assertCapsuleOwner()
    if (ownerError) return { error: ownerError }
    if (!capsuleId) return { error: new Error('No capsule ID') }
    if (!currentUserId || userId !== currentUserId) {
      return { error: new Error('User mismatch for content creation') }
    }

    const ext = file.name.split('.').pop()
    const path = `${capsuleId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('capsule-contents')
      .upload(path, file)
    if (uploadError) return { error: uploadError }

    const { error: dbError } = await supabase.from('contents').insert({
      capsule_id: capsuleId,
      created_by: userId,
      type,
      file_path: path,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
      captured_at: (capturedAt || new Date()).toISOString(),
    })
    if (!dbError) await fetchContents()
    return { error: dbError }
  }, [assertCapsuleOwner, capsuleId, currentUserId, fetchContents, supabase])

  const addNote = useCallback(async (userId: string, title: string, text: string, capturedAt?: Date) => {
    const ownerError = await assertCapsuleOwner()
    if (ownerError) return { error: ownerError }
    if (!capsuleId) return { error: new Error('No capsule ID') }
    if (!currentUserId || userId !== currentUserId) {
      return { error: new Error('User mismatch for content creation') }
    }

    const noteSizeBytes = new Blob([text]).size
    const { error } = await supabase.from('contents').insert({
      capsule_id: capsuleId,
      created_by: userId,
      type: 'text',
      text_content: text,
      title,
      file_size_bytes: noteSizeBytes,
      mime_type: 'text/plain',
      captured_at: (capturedAt || new Date()).toISOString(),
    })
    if (!error) await fetchContents()
    return { error }
  }, [assertCapsuleOwner, capsuleId, currentUserId, fetchContents, supabase])

  const deleteContent = useCallback(async (contentId: string, filePath?: string | null) => {
    const ownerError = await assertCapsuleOwner()
    if (ownerError) return { error: ownerError }
    if (!capsuleId) return { error: new Error('No capsule ID') }

    let resolvedFilePath = filePath || null
    if (!resolvedFilePath) {
      const { data: row, error: lookupError } = await supabase
        .from('contents')
        .select('file_path')
        .eq('id', contentId)
        .eq('capsule_id', capsuleId)
        .maybeSingle()

      if (lookupError) return { error: lookupError }
      resolvedFilePath = row?.file_path || null
    }

    if (resolvedFilePath) {
      await supabase.storage.from('capsule-contents').remove([resolvedFilePath])
    }

    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', contentId)
      .eq('capsule_id', capsuleId)

    if (!error) await fetchContents()
    return { error }
  }, [assertCapsuleOwner, capsuleId, fetchContents, supabase])

  const getFileUrl = useCallback((filePath: string) => {
    const { data } = supabase.storage.from('capsule-contents').getPublicUrl(filePath)
    return data.publicUrl
  }, [supabase])

  return { contents, loading, error, fetchContents, uploadFile, addNote, deleteContent, getFileUrl }
}
