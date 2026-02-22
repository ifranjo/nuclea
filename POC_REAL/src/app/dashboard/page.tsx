'use client'
import { useAuth } from '@/hooks/useAuth'
import { useCapsules } from '@/hooks/useCapsules'
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import { BottomNav } from '@/components/ui/BottomNav'
import { Plus, LogOut, Gift } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { normalizeCapsuleType, type CapsuleType } from '@/types'

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024)
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    legacy: 'Legacy', together: 'Together', social: 'Social',
    pet: 'Mascota', life_chapter: 'Capítulo de Vida', origin: 'Origen'
  }
  return map[type] || type
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    closed: 'bg-amber-100 text-amber-700',
  }
  const labels: Record<string, string> = {
    active: 'Activa', draft: 'Borrador', closed: 'Cerrada',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  )
}

export default function DashboardPage() {
  const { profile, loading: authLoading, signOut } = useAuth()
  const { capsules, loading: capsulesLoading } = useCapsules(profile?.id)
  const router = useRouter()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-nuclea-text-muted">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nuclea-secondary pb-20">
      {/* Header */}
      <header className="bg-white border-b border-nuclea-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl tracking-[0.2em] font-light text-nuclea-text">NUCLEA</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-nuclea-text-secondary">{profile?.full_name}</span>
          <button onClick={signOut} aria-label="Cerrar sesión" className="text-nuclea-text-muted hover:text-nuclea-text transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-nuclea-text">Mis cápsulas</h2>
          <button
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-nuclea-border text-sm text-nuclea-text hover:bg-white transition-colors"
          >
            <Plus size={16} />
            Crear cápsula
          </button>
        </div>

        {capsulesLoading ? (
          <div className="text-center py-16">
            <p className="text-nuclea-text-muted">Cargando tus cápsulas...</p>
          </div>
        ) : capsules.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-nuclea-text-muted text-lg mb-2">Aún no tienes cápsulas</p>
            <p className="text-nuclea-text-muted text-sm mb-6">Crea tu primera cápsula para empezar a guardar recuerdos</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-6 py-3 rounded-lg bg-nuclea-text text-white font-medium hover:bg-nuclea-text/90 transition-colors"
            >
              Crear mi primera cápsula
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capsules.map(capsule => (
              <Link
                key={capsule.id}
                href={`/capsule/${capsule.id}`}
                className="bg-white rounded-xl border border-nuclea-border p-5 hover:shadow-md transition-shadow"
              >
                {capsule.creator_id && capsule.creator_id !== capsule.owner_id && (
                  <span className="inline-flex items-center gap-1 mb-2 text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                    <Gift size={12} />
                    Regalo recibido
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-nuclea-secondary flex items-center justify-center">
                      <CapsuleIcon type={normalizeCapsuleType(capsule.type) as CapsuleType} size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-nuclea-text text-sm">{capsule.title || 'Sin título'}</h3>
                      <p className="text-xs text-nuclea-text-muted">{typeLabel(capsule.type)}</p>
                    </div>
                  </div>
                  {statusBadge(capsule.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-nuclea-text-muted">
                  <span>{formatBytes(capsule.storage_used_bytes)} de 500 MB</span>
                  <span>{new Date(capsule.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                {capsule.owner_id !== profile?.id && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Colaborador</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
