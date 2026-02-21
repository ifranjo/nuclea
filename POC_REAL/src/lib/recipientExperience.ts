export const EXPIRY_WINDOW_DAYS = 30

export type ExpiryUrgencyLevel = 'calm' | 'warning' | 'critical' | 'expired'

export interface ExpiryBannerModel {
  level: ExpiryUrgencyLevel
  daysElapsed: number
  daysRemaining: number
  windowDays: number
}

export interface CapsuleEmailTemplate {
  subject: string
  preview: string
  body: string
}

export interface CapsuleEmailTemplates {
  received: CapsuleEmailTemplate
  reminder: CapsuleEmailTemplate
  expirationWarning: CapsuleEmailTemplate
}

interface BuildTemplateInput {
  recipientName: string
  capsuleTitle: string
  actionUrl: string
  daysRemaining: number
}

export function getUrgencyLevel(daysRemaining: number): ExpiryUrgencyLevel {
  if (daysRemaining <= 0) return 'expired'
  if (daysRemaining <= 3) return 'critical'
  if (daysRemaining <= 10) return 'warning'
  return 'calm'
}

export function getExpiryBannerModel(createdAt: string, now = new Date()): ExpiryBannerModel {
  const createdDate = new Date(createdAt)
  const diffMs = now.getTime() - createdDate.getTime()
  const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  const daysRemaining = Math.max(0, EXPIRY_WINDOW_DAYS - daysElapsed)

  return {
    level: getUrgencyLevel(daysRemaining),
    daysElapsed,
    daysRemaining,
    windowDays: EXPIRY_WINDOW_DAYS,
  }
}

export function buildCapsuleEmailTemplates(input: BuildTemplateInput): CapsuleEmailTemplates {
  const { recipientName, capsuleTitle, actionUrl, daysRemaining } = input

  return {
    received: {
      subject: `Has recibido una capsula en NUCLEA: ${capsuleTitle}`,
      preview: 'Tu regalo ya esta disponible',
      body: `Hola ${recipientName}, has recibido la capsula "${capsuleTitle}". Puedes reclamarla y vivir la experiencia aqui: ${actionUrl}`,
    },
    reminder: {
      subject: `Recordatorio NUCLEA: faltan ${daysRemaining} dias para decidir`,
      preview: 'Tu capsula sigue activa',
      body: `Tu capsula "${capsuleTitle}" sigue activa. Te quedan ${daysRemaining} dias para continuar la herencia emocional, ver el mini-trailer o descargar el video regalo: ${actionUrl}`,
    },
    expirationWarning: {
      subject: `Aviso final: tu capsula expira pronto`,
      preview: 'Ultimo aviso de expiracion',
      body: `Ultimo aviso para "${capsuleTitle}". Si no realizas ninguna accion, la capsula expirara al finalizar el periodo. Revisa tus opciones aqui: ${actionUrl}`,
    },
  }
}
