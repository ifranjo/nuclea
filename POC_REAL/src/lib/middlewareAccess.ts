const PUBLIC_PATHS = ['/', '/login', '/registro', '/share', '/onboarding', '/demo', '/legal', '/beta/accept', '/beta/waitlist']
const BETA_GATED_PATHS = ['/dashboard', '/capsule', '/settings']

function isPathInList(pathname: string, paths: string[]): boolean {
  return paths.some(path => pathname === path || pathname.startsWith(`${path}/`))
}

export function isPublicPath(pathname: string): boolean {
  return isPathInList(pathname, PUBLIC_PATHS)
}

export function isBetaGatedPath(pathname: string): boolean {
  return isPathInList(pathname, BETA_GATED_PATHS)
}

export function isAuthPagePath(pathname: string): boolean {
  return pathname === '/login' || pathname === '/registro'
}

export function buildLoginRedirectParam(pathname: string, search: string): string {
  return `${pathname}${search || ''}`
}
