import type { NextRequest } from 'next/server'

export function isValidAdminRequest(request: NextRequest): boolean {
  const providedKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_API_SECRET

  if (!expectedKey) {
    return false
  }

  return !!providedKey && providedKey === expectedKey
}

export function resolveRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}
