'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

interface AddPersonModalProps {
  onClose: () => void
  onSave: (data: { full_name: string; email: string; relationship: string }) => Promise<void>
}

export function AddPersonModal({ onClose, onSave }: AddPersonModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ full_name: fullName, email, relationship })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-nuclea-text">Añadir persona designada</h2>
          <button onClick={onClose} className="text-nuclea-text-muted hover:text-nuclea-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Relación</label>
            <input
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              placeholder="Hijo/a, pareja, amigo/a..."
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 px-8 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-base font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
