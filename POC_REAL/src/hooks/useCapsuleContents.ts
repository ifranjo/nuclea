'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CapsuleContent {
  id: string
  capsule_id: string
  created_by: string
  type: string
  file_path: string | null
  file_name: string | null
  file_size_bytes: number | null
  mime_type: string | null
  text_content: string | null
  title: string | null
  captured_at: string
  created_at: string
}

export function useCapsuleContents(capsuleId?: string) {
  const [contents, setContents] = useState<CapsuleContent[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchContents = useCallback(async () => {
    if (!capsuleId) {
      setContents([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await supabase
        .from('contents')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('captured_at', { ascending: false })
      setContents(data || [])
    } catch {
      setContents([])
    } finally {
      setLoading(false)
    }
  }, [capsuleId, supabase])

  useEffect(() => { fetchContents() }, [fetchContents])

  const uploadFile = useCallback(async (file: File, userId: string, type: 'photo' | 'video' | 'audio', capturedAt?: Date) => {
    if (!capsuleId) return { error: new Error('No capsule ID') }

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
  }, [capsuleId, fetchContents, supabase])

  const addNote = useCallback(async (userId: string, title: string, text: string, capturedAt?: Date) => {
    if (!capsuleId) return { error: new Error('No capsule ID') }
    const { error } = await supabase.from('contents').insert({
      capsule_id: capsuleId,
      created_by: userId,
      type: 'text',
      text_content: text,
      title,
      captured_at: (capturedAt || new Date()).toISOString(),
    })
    if (!error) await fetchContents()
    return { error }
  }, [capsuleId, fetchContents, supabase])

  const deleteContent = useCallback(async (contentId: string, filePath?: string | null) => {
    if (filePath) {
      await supabase.storage.from('capsule-contents').remove([filePath])
    }
    const { error } = await supabase.from('contents').delete().eq('id', contentId)
    if (!error) await fetchContents()
    return { error }
  }, [fetchContents, supabase])

  const getFileUrl = useCallback((filePath: string) => {
    const { data } = supabase.storage.from('capsule-contents').getPublicUrl(filePath)
    return data.publicUrl
  }, [supabase])

  return { contents, loading, fetchContents, uploadFile, addNote, deleteContent, getFileUrl }
}
