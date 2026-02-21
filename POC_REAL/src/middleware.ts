import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { buildLoginRedirectParam, isAuthPagePath, isBetaGatedPath, isPublicPath } from '@/lib/middlewareAccess'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as never)
          )
        },
      },
    }
  )

  // Wrap in try/catch — getUser() can throw during logout when cookies are in a partial state
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Auth error (corrupted session, network) — treat as unauthenticated
  }

  const pathname = request.nextUrl.pathname

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', buildLoginRedirectParam(pathname, request.nextUrl.search))
    return NextResponse.redirect(url)
  }

  if (user && isAuthPagePath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Beta access gate — only for authenticated users on protected routes
  if (user && isBetaGatedPath(pathname)) {
    // Check if BETA_GATE is enabled (disabled by default for POC testing)
    const betaGateEnabled = process.env.BETA_GATE_ENABLED === 'true'

    if (betaGateEnabled) {
      try {
        // Look up user's beta_access (RLS disabled for POC)
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userRow) {
          const { data: access } = await supabase
            .from('beta_access')
            .select('enabled')
            .eq('user_id', userRow.id)
            .eq('enabled', true)
            .single()

          if (!access) {
            const url = request.nextUrl.clone()
            url.pathname = '/beta/waitlist'
            return NextResponse.redirect(url)
          }
        } else {
          const url = request.nextUrl.clone()
          url.pathname = '/beta/waitlist'
          return NextResponse.redirect(url)
        }
      } catch {
        // Fail closed for beta-gated routes, but do not crash middleware on transient errors.
        const url = request.nextUrl.clone()
        url.pathname = '/beta/waitlist'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
