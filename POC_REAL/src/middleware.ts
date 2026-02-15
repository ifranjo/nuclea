import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Public paths — no auth required
  const publicPaths = ['/', '/login', '/registro', '/share', '/onboarding', '/demo', '/legal', '/beta/accept', '/beta/waitlist']
  const isPublic = publicPaths.some(p => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/'))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Beta access gate — only for authenticated users on protected routes
  const betaGatedPaths = ['/dashboard', '/capsule', '/settings']
  const isBetaGated = betaGatedPaths.some(p => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/'))

  if (user && isBetaGated) {
    // Check if BETA_GATE is enabled (disabled by default for POC testing)
    const betaGateEnabled = process.env.BETA_GATE_ENABLED === 'true'

    if (betaGateEnabled) {
      // Look up user's beta_access using service client via admin API
      // We use a lightweight check: query beta_access via the existing supabase client
      // (RLS is disabled for POC, so anon key works)
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
        // User authenticated but no profile — send to waitlist
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
