'use client'

import { useAuth } from '@/hooks/useAuth'

export default function BetaWaitlistPage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl tracking-[0.3em] font-light text-nuclea-text mb-2">NUCLEA</h1>
        <p className="text-nuclea-text-secondary text-sm mb-10">Beta Privada</p>

        <div className="bg-nuclea-secondary rounded-xl p-8 mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-nuclea-text mb-2">Estás en lista de espera</h2>
          <p className="text-sm text-nuclea-text-muted">
            Tu cuenta está creada pero aún no tienes acceso a la beta.
            Te notificaremos cuando sea tu turno.
          </p>
          {profile?.email && (
            <p className="text-xs text-nuclea-text-muted mt-4">
              Cuenta: {profile.email}
            </p>
          )}
        </div>

        <button
          onClick={signOut}
          className="text-sm text-nuclea-text-muted hover:text-nuclea-text transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
