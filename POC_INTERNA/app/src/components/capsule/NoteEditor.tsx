'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { MediaModal } from '@/components/capsule/MediaModal'
import type { MediaItem } from '@/types/media'

interface NoteEditorProps {
  isOpen: boolean
  onClose: () => void
  notes: MediaItem[]
  onAddNote: (item: MediaItem) => void
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

function noteTitle(text: string): string {
  const firstLine = text.split('\n')[0]
  return firstLine.length > 60 ? firstLine.slice(0, 60) + '…' : firstLine
}

function notePreview(text: string): string {
  const rest = text.split('\n').slice(1).join(' ').trim()
  if (!rest) return ''
  return rest.length > 80 ? rest.slice(0, 80) + '…' : rest
}

export function NoteEditor({ isOpen, onClose, notes, onAddNote }: NoteEditorProps) {
  const [text, setText] = useState('')

  const handleSave = () => {
    if (!text.trim()) return
    const item: MediaItem = {
      id: crypto.randomUUID(),
      type: 'note',
      name: noteTitle(text),
      url: '',
      text: text.trim(),
      createdAt: new Date(),
    }
    onAddNote(item)
    setText('')
  }

  return (
    <MediaModal isOpen={isOpen} onClose={onClose} title="Escribir nota">
      {/* Auto date */}
      <p className="text-sm text-[#9A9A9A] mb-4">{formatDate(new Date())}</p>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu recuerdo..."
        className="w-full min-h-[200px] p-4 border border-[#E5E5E5] rounded-xl resize-none text-[#1A1A1A] text-base placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#6B6B6B] transition-colors"
      />

      {/* Character count */}
      <p className="text-xs text-[#9A9A9A] mt-1 mb-4">
        {text.length} caracteres
      </p>

      {/* Save button — POC button spec: transparent bg, 1.5px border, 8px radius */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!text.trim()}
        className="w-full py-3 bg-transparent border-[1.5px] border-[#1A1A1A] rounded-[8px] text-[#1A1A1A] font-medium text-sm transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAFAFA]"
      >
        Guardar nota
      </button>

      {/* Saved notes list */}
      {notes.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">
            Notas guardadas
          </p>
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start gap-3 p-3 border border-[#E5E5E5] rounded-xl"
            >
              <FileText size={18} className="text-[#9A9A9A] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A] truncate">
                  {noteTitle(note.text ?? '')}
                </p>
                {notePreview(note.text ?? '') && (
                  <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">
                    {notePreview(note.text ?? '')}
                  </p>
                )}
                <p className="text-xs text-[#9A9A9A] mt-1">
                  {formatDate(note.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </MediaModal>
  )
}
