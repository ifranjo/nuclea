'use client'
import { useAuth } from '@/hooks/useAuth'
import { BottomNav } from '@/components/ui/BottomNav'
import { User, Bell, Gift, Shield, HelpCircle, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { profile, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-nuclea-text-muted">Cargando...</div>
      </div>
    )
  }

  const sections = [
    { icon: User, label: 'Perfil', desc: profile?.full_name || 'Sin nombre', status: 'Activo' },
    { icon: Bell, label: 'Notificaciones', desc: 'No disponible en beta', status: 'Pendiente' },
    { icon: Gift, label: 'Video Regalo', desc: 'Pago único disponible', status: 'Activo' },
    { icon: Shield, label: 'Privacidad', desc: 'Panel completo en desarrollo', status: 'Pendiente' },
    { icon: HelpCircle, label: 'Ayuda', desc: 'Centro de ayuda en desarrollo', status: 'Pendiente' },
  ]

  return (
    <div className="min-h-screen bg-nuclea-secondary pb-20">
      <header className="bg-white border-b border-nuclea-border px-6 py-4">
        <h1 className="text-xl tracking-[0.2em] font-light text-nuclea-text">Ajustes</h1>
      </header>

      <div className="px-6 py-6 space-y-2">
        {sections.map(({ icon: Icon, label, desc, status }) => (
          <div key={label} className="bg-white rounded-xl border border-nuclea-border p-4 flex items-center gap-4">
            <Icon size={20} className="text-nuclea-text-secondary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-nuclea-text">{label}</p>
              {desc && <p className="text-xs text-nuclea-text-muted">{desc}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === 'Activo'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {status}
            </span>
          </div>
        ))}

        <button
          onClick={signOut}
          className="w-full mt-6 bg-white rounded-xl border border-nuclea-border p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
