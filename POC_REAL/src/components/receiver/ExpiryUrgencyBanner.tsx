'use client'

import { getExpiryBannerModel } from '@/lib/recipientExperience'

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

interface ExpiryUrgencyBannerProps {
  createdAt: string
}

export function ExpiryUrgencyBanner({ createdAt }: ExpiryUrgencyBannerProps) {
  const model = getExpiryBannerModel(createdAt)
  const style = BANNER_STYLES[model.level]

  return (
    <div className={`rounded-xl border p-4 ${style.wrap}`}>
      <p className={`text-sm font-semibold ${style.title}`}>Estado del regalo</p>
      {model.level === 'expired' ? (
        <p className={`mt-1 text-sm ${style.copy}`}>
          El periodo de 30 dias ha finalizado. Esta capsula ya no esta disponible.
        </p>
      ) : (
        <p className={`mt-1 text-sm ${style.copy}`}>
          Te quedan <strong>{model.daysRemaining} dias</strong> dentro del periodo de {model.windowDays} dias para decidir.
        </p>
      )}
    </div>
  )
}
