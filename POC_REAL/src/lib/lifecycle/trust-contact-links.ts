export function buildTrustDecisionPath(capsuleId: string, personId: string): string {
  const safeCapsuleId = encodeURIComponent(capsuleId)
  const safePersonId = encodeURIComponent(personId)
  return `/trust/decision/${safeCapsuleId}?personId=${safePersonId}`
}

export function buildTrustDecisionUrl(
  appUrl: string | undefined,
  capsuleId: string,
  personId: string
): string {
  const path = buildTrustDecisionPath(capsuleId, personId)
  const base = typeof appUrl === 'string' ? appUrl.trim().replace(/\/+$/, '') : ''

  if (!base || !/^https?:\/\//i.test(base)) {
    return path
  }

  return `${base}${path}`
}
