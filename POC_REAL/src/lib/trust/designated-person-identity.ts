export interface DesignatedPersonIdentityValidation {
  ok: boolean
  reason?: string
}

export function canAssignDesignatedPerson(
  ownerUserId: string,
  designatedUserId: string | null
): DesignatedPersonIdentityValidation {
  if (!designatedUserId) {
    return { ok: false, reason: 'El contacto debe tener cuenta NUCLEA para poder decidir.' }
  }

  if (designatedUserId === ownerUserId) {
    return { ok: false, reason: 'No puedes designarte a ti mismo como contacto de confianza.' }
  }

  return { ok: true }
}
