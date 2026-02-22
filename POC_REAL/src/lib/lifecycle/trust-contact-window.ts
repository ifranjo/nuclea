export function computeTrustContactNotifyBeforeIso(now: Date, lookaheadHours: number): string {
  const threshold = new Date(now)
  threshold.setUTCHours(threshold.getUTCHours() + lookaheadHours)
  return threshold.toISOString()
}

export function isWithinTrustContactWindow(
  expiresAtIso: string | null,
  now: Date,
  lookaheadHours: number
): boolean {
  if (!expiresAtIso) return false
  const expiresAt = new Date(expiresAtIso)
  if (Number.isNaN(expiresAt.getTime())) return false
  if (expiresAt <= now) return false

  const threshold = new Date(now)
  threshold.setUTCHours(threshold.getUTCHours() + lookaheadHours)
  return expiresAt <= threshold
}
