'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search, Grid, List, Download, UserX } from 'lucide-react'
import Header from '@/components/Header'
import CapsuleCard from '@/components/CapsuleCard'
import ClientErrorBoundary from '@/components/error/ClientErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useCapsules } from '@/hooks/useCapsules'
import { CAPSULE_TYPES, PLANS } from '@/types'
import type { CapsuleType } from '@/types'
import { useAppStore, useUIPreferences } from '@/lib/store'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user, firebaseUser, loading: authLoading, signOut } = useAuth()

  const getAuthToken = useCallback(async () => {
    if (!firebaseUser) throw new Error('Sesion no disponible')
    return firebaseUser.getIdToken(true)
  }, [firebaseUser])

  const {
    capsules,
    loading: capsulesLoading,
    loadingMore,
    hasMore,
    error: capsulesError,
    createCapsule,
    deleteCapsule,
    loadMore,
  } = useCapsules(user?.id, getAuthToken)

  const { viewMode, setViewMode } = useUIPreferences()
  const {
    searchQuery,
    setSearchQuery,
    createModalOpen: showCreateModal,
    setCreateModalOpen: setShowCreateModal,
  } = useAppStore()

  const [newCapsule, setNewCapsule] = useState({
    type: 'life-chapter' as CapsuleType,
    title: '',
    description: '',
  })
  const [creating, setCreating] = useState(false)
  const [exportingData, setExportingData] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const filteredCapsules = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return capsules
    return capsules.filter((capsule) =>
      capsule.title.toLowerCase().includes(q) ||
      capsule.description.toLowerCase().includes(q)
    )
  }, [capsules, searchQuery])

  if (capsulesError) {
    throw new Error(capsulesError)
  }

  if (authLoading || capsulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  if (!user) return null

  const plan = PLANS[user.plan]
  const canCreateCapsule = plan.capsules === -1 || capsules.length < plan.capsules

  const handleCreateCapsule = async () => {
    if (!newCapsule.title.trim()) return

    setCreating(true)
    try {
      await createCapsule(newCapsule.type, newCapsule.title, newCapsule.description)
      setShowCreateModal(false)
      setNewCapsule({ type: 'life-chapter', title: '', description: '' })
    } catch (error) {
      console.error('Error creating capsule:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCapsule = async (capsuleId: string) => {
    if (confirm('Estas seguro de eliminar esta capsula?')) {
      await deleteCapsule(capsuleId)
    }
  }

  const handleExportData = async () => {
    setExportingData(true)
    try {
      const token = await getAuthToken()
      const response = await fetch('/api/privacy/export', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo exportar la informacion')
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `nuclea-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(downloadUrl)
      toast.success('Exportacion descargada')
    } catch (error) {
      console.error('Export data error:', error)
      toast.error('Error al exportar los datos')
    } finally {
      setExportingData(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt('Escribe ELIMINAR para confirmar la eliminacion de tu cuenta:')
    if (confirmation !== 'ELIMINAR') return

    setDeletingAccount(true)
    try {
      const token = await getAuthToken()
      const response = await fetch('/api/privacy/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo eliminar la cuenta')
      }

      toast.success('Cuenta eliminada correctamente')
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Error al eliminar la cuenta')
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <ClientErrorBoundary
      fallback={(
        <main className="min-h-screen pb-20">
          <Header />
          <div className="pt-28 px-4 max-w-3xl mx-auto">
            <div className="card text-center">
              <h1 className="font-display text-2xl gradient-text mb-3">No pudimos cargar el dashboard</h1>
              <p className="text-white/60 mb-6">Ocurrio un error al sincronizar tus capsulas.</p>
              <button onClick={() => window.location.reload()} className="btn-primary">
                Reintentar
              </button>
            </div>
          </div>
        </main>
      )}
    >
      <main className="min-h-screen pb-20">
        <Header />

        <div className="pt-24 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display gradient-text font-semibold">Mis Capsulas</h1>
              <p className="text-white/60 mt-1">
                {capsules.length} de {plan.capsules === -1 ? 'infinito' : plan.capsules} capsulas {' '}·{' '}Plan {plan.name}
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!canCreateCapsule}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Nueva Capsula
            </button>
          </div>

          <div className="glass rounded-2xl p-5 mb-8 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">Privacidad y datos</h2>
            <p className="text-white/55 text-sm mb-4">
              Puedes exportar tus datos personales o solicitar la eliminacion completa de tu cuenta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportData}
                disabled={exportingData || deletingAccount}
                className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                {exportingData ? 'Exportando...' : 'Exportar mis datos'}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || exportingData}
                className="px-4 py-2 rounded-xl border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserX size={16} />
                {deletingAccount ? 'Eliminando...' : 'Eliminar mi cuenta'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar capsulas..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="input pl-12"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-nuclea-gold/20 text-nuclea-gold' : 'text-white/40 hover:text-white'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-nuclea-gold/20 text-nuclea-gold' : 'text-white/40 hover:text-white'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {filteredCapsules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-6">[]</div>
              <h3 className="text-xl text-white/80 mb-2">
                {searchQuery ? 'No se encontraron capsulas' : 'Aun no tienes capsulas'}
              </h3>
              <p className="text-white/50 mb-6">
                {searchQuery ? 'Intenta con otra busqueda' : 'Crea tu primera capsula para empezar a preservar tus recuerdos'}
              </p>
              {!searchQuery && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                  Crear mi primera capsula
                </button>
              )}
            </motion.div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
                {filteredCapsules.map((capsule) => (
                  <CapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    onDelete={handleDeleteCapsule}
                    onEdit={(capsuleItem) => router.push(`/capsulas/${capsuleItem.id}`)}
                  />
                ))}
              </div>

              {!searchQuery && hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="btn-secondary disabled:opacity-50"
                  >
                    {loadingMore ? 'Cargando...' : 'Cargar mas capsulas'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg glass rounded-2xl p-6"
            >
              <h2 className="text-2xl font-display gradient-text mb-6">Nueva Capsula</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Tipo de capsula</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CAPSULE_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        onClick={() => setNewCapsule({ ...newCapsule, type: key as CapsuleType })}
                        className={`p-3 rounded-xl text-center transition-all ${
                          newCapsule.type === key
                            ? 'bg-nuclea-gold/20 border-2 border-nuclea-gold'
                            : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <p className="text-xs text-white/60 mt-1">{type.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Titulo</label>
                  <input
                    type="text"
                    value={newCapsule.title}
                    onChange={(event) => setNewCapsule({ ...newCapsule, title: event.target.value })}
                    placeholder="Ej: Recuerdos de la familia"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Descripcion</label>
                  <textarea
                    value={newCapsule.description}
                    onChange={(event) => setNewCapsule({ ...newCapsule, description: event.target.value })}
                    placeholder="Que quieres preservar en esta capsula?"
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCapsule}
                  disabled={!newCapsule.title.trim() || creating}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear Capsula'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </ClientErrorBoundary>
  )
}