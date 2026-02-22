export type TrustDecisionValue = 'continue' | 'allow-expiration'

export interface TrustDecisionInput {
  capsuleId: string
  personId: string
  decision: TrustDecisionValue
}

export interface TrustDecisionSnapshot {
  id: string
  capsuleId: string
  userId: string | null
  email: string | null
}

export interface TrustDecisionIdentity {
  profileId: string
  email: string | null
}

export interface TrustDecisionValidation {
  ok: boolean
  reason?: string
}

function normalizeEmail(email: string | null): string | null {
  if (typeof email !== 'string') return null
  const normalized = email.trim().toLowerCase()
  return normalized || null
}

export function normalizeTrustDecision(value: string): TrustDecisionValue | null {
  if (value === 'continue' || value === 'allow-expiration') {
    return value
  }
  return null
}

export function canSubmitTrustDecision(
  input: TrustDecisionInput,
  person: TrustDecisionSnapshot,
  identity: TrustDecisionIdentity
): TrustDecisionValidation {
  if (person.id !== input.personId) {
    return { ok: false, reason: 'El contacto no coincide con la decisión enviada.' }
  }

  if (person.capsuleId !== input.capsuleId) {
    return { ok: false, reason: 'El contacto no pertenece a esta cápsula.' }
  }

  const sameUser = !!person.userId && person.userId === identity.profileId
  const sameEmail = normalizeEmail(person.email) !== null
    && normalizeEmail(person.email) === normalizeEmail(identity.email)

  if (!sameUser && !sameEmail) {
    return { ok: false, reason: 'No autorizado para decidir sobre este contacto.' }
  }

  return { ok: true }
}
