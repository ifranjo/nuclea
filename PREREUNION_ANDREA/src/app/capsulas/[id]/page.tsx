'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { useCapsules } from '@/hooks/useCapsules'
import toast from 'react-hot-toast'

export default function CapsuleEditPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const capsuleId = params?.id

  const { user, firebaseUser, loading: authLoading } = useAuth()

  const getAuthToken = useCallback(async () => {
    if (!firebaseUser) throw new Error('Sesion no disponible')
    return firebaseUser.getIdToken(true)
  }, [firebaseUser])

  const {
    capsules,
    loading: capsulesLoading,
    error: capsulesError,
    updateCapsule,
  } = useCapsules(user?.id, getAuthToken)

  const capsule = useMemo(
    () => capsules.find((item) => item.id === capsuleId),
    [capsules, capsuleId]
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!capsule) return
    setTitle(capsule.title)
    setDescription(capsule.description)
  }, [capsule])

  if (capsulesError) {
    throw new Error(capsulesError)
  }

  const handleSave = async () => {
    if (!capsuleId || !title.trim()) {
      toast.error('El titulo es obligatorio')
      return
    }

    setSaving(true)
    try {
      await updateCapsule(capsuleId, {
        title: title.trim(),
        description: description.trim(),
      })
      toast.success('Capsula actualizada')
      router.push('/dashboard')
    } catch (error) {
      console.error('Capsule update error:', error)
      toast.error('No se pudo actualizar la capsula')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || capsulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  if (!capsule) {
    return (
      <main className="min-h-screen pb-20">
        <Header />
        <div className="pt-28 px-4 max-w-3xl mx-auto">
          <div className="card text-center">
            <h1 className="font-display text-2xl gradient-text mb-3">Capsula no encontrada</h1>
            <p className="text-white/60 mb-6">No existe una capsula con ese identificador o no tienes acceso.</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Volver al dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      <Header />

      <div className="pt-24 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-3xl font-display gradient-text font-semibold mb-2">Editar capsula</h1>
          <p className="text-white/55 mb-6">Actualiza los datos principales de esta capsula.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Tipo</label>
              <div className="input bg-white/5 text-white/70 cursor-not-allowed">{capsule.type}</div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Titulo</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input"
                placeholder="Ej: Recuerdos de la familia"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Descripcion</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Describe el objetivo de esta capsula"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary sm:flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="btn-primary sm:flex-1 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  )
}