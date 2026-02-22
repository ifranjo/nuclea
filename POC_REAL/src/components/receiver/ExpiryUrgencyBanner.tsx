'use client'

type UrgencyLevel = 'calm' | 'warning' | 'critical' | 'expired'

const BANNER_STYLES = {
  calm: {
    wrap: 'bg-emerald-50 border-emerald-200',
    title: 'text-emerald-800',
    copy: 'text-emerald-700',
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200',
    title: 'text-amber-800',
    copy: 'text-amber-700',
  },
  critical: {
    wrap: 'bg-orange-50 border-orange-200',
    title: 'text-orange-800',
    copy: 'text-orange-700',
  },
  expired: {
    wrap: 'bg-rose-50 border-rose-200',
    title: 'text-rose-800',
    copy: 'text-rose-700',
  },
} as const

function computeUrgency(expiresAt: string): { level: UrgencyLevel; daysRemaining: number } {
  const now = Date.now()
  const expires = new Date(expiresAt).getTime()
  const daysRemaining = Math.ceil((expires - now) / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 0) return { level: 'expired', daysRemaining: 0 }
  if (daysRemaining <= 3) return { level: 'critical', daysRemaining }
  if (daysRemaining <= 7) return { level: 'warning', daysRemaining }
  return { level: 'calm', daysRemaining }
}

interface ExpiryUrgencyBannerProps {
  expiresAt: string
}

export function ExpiryUrgencyBanner({ expiresAt }: ExpiryUrgencyBannerProps) {
  const { level, daysRemaining } = computeUrgency(expiresAt)
  const style = BANNER_STYLES[level]

  return (
    <div className={`rounded-xl border p-4 ${style.wrap}`}>
      <p className={`text-sm font-semibold ${style.title}`}>Estado del regalo</p>
      {level === 'expired' ? (
        <p className={`mt-1 text-sm ${style.copy}`}>
          El periodo de 30 días ha finalizado. Esta cápsula ya no está disponible.
        </p>
      ) : (
        <p className={`mt-1 text-sm ${style.copy}`}>
          Te quedan <strong>{daysRemaining} días</strong> dentro del periodo de 30 días para decidir.
        </p>
      )}
    </div>
  )
}
