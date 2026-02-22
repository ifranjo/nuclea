'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, Square, Play, Trash2 } from 'lucide-react'
import { MediaModal } from '@/components/capsule/MediaModal'
import type { MediaItem } from '@/types/media'

type RecorderState = 'idle' | 'recording' | 'preview'

interface AudioRecorderProps {
  isOpen: boolean
  onClose: () => void
  recordings: MediaItem[]
  onAddRecording: (item: MediaItem) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function AudioRecorder({ isOpen, onClose, recordings, onAddRecording }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      cleanup()
      setState('idle')
      setElapsed(0)
      setError(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }, [isOpen, cleanup, previewUrl])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setState('preview')
        // Stop mic access
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } catch {
      setError('No se pudo acceder al micrófono. Comprueba los permisos del navegador.')
      setState('idle')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const saveRecording = () => {
    if (!previewUrl) return
    const item: MediaItem = {
      id: crypto.randomUUID(),
      type: 'audio',
      name: `Grabación ${recordings.length + 1}`,
      url: previewUrl,
      createdAt: new Date(),
      duration: elapsed,
    }
    onAddRecording(item)
    setPreviewUrl(null)
    setState('idle')
    setElapsed(0)
  }

  const discardRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setState('idle')
    setElapsed(0)
  }

  return (
    <MediaModal isOpen={isOpen} onClose={onClose} title="Grabar audio">
      <div className="flex flex-col items-center gap-6">

        {/* Error state */}
        {error && (
          <div className="w-full rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* IDLE */}
        {state === 'idle' && !error && (
          <div className="flex flex-col items-center gap-4 py-6">
            <button
              type="button"
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
              aria-label="Grabar"
            >
              <Mic size={32} className="text-white" />
            </button>
            <p className="text-sm text-[#6B6B6B]">Pulsa para grabar</p>
          </div>
        )}

        {/* RECORDING */}
        {state === 'recording' && (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* Pulsing dot */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-5 h-5 rounded-full bg-red-500 animate-[pulse-dot_1.2s_ease-in-out_infinite]" />
              <span className="w-3 h-3 rounded-full bg-red-600 relative z-10" />
            </div>

            {/* Timer */}
            <p className="text-2xl font-mono font-semibold text-[#1A1A1A] tabular-nums">
              {formatTime(elapsed)}
            </p>

            {/* Waveform bars */}
            <div className="flex items-center gap-1 h-10">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-red-400"
                  style={{
                    animation: `wave-bar 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>

            {/* Stop button */}
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#1A1A1A]"
            >
              <Square size={14} className="fill-current" />
              Parar
            </button>
          </div>
        )}

        {/* PREVIEW */}
        {state === 'preview' && previewUrl && (
          <div className="flex flex-col items-center gap-4 w-full py-4">
            <audio src={previewUrl} controls className="w-full" />
            <p className="text-xs text-[#9A9A9A]">Duración: {formatTime(elapsed)}</p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={discardRecording}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F5F5] transition-colors"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={saveRecording}
                className="flex-1 py-2.5 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
              >
                Guardar grabación
              </button>
            </div>
          </div>
        )}

        {/* Saved recordings list */}
        {recordings.length > 0 && (
          <div className="w-full border-t border-[#F0F0F0] pt-4 mt-2">
            <p className="text-xs font-medium text-[#9A9A9A] uppercase tracking-wide mb-3">
              Grabaciones guardadas
            </p>
            <ul className="flex flex-col gap-2">
              {recordings.map(rec => (
                <li
                  key={rec.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FAFAFA]"
                >
                  <Play size={16} className="text-[#6B6B6B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{rec.name}</p>
                    {rec.duration != null && (
                      <p className="text-xs text-[#9A9A9A]">{formatTime(rec.duration)}</p>
                    )}
                  </div>
                  <Trash2 size={14} className="text-[#9A9A9A] shrink-0 cursor-pointer hover:text-red-500 transition-colors" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MediaModal>
  )
}
