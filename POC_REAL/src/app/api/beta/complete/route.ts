import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { resolveRequestIp } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { acceptInvitation } from '@/lib/beta'
import { buildRateLimitHeaders, checkRateLimit } from '@/lib/rate-limit'

const completeSchema = z.object({
  invitationId: z.string().uuid(),
})

// POST /api/beta/complete — Complete beta acceptance after OTP auth
export async function POST(request: NextRequest) {
  const parsed = completeSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload invalido', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { invitationId } = parsed.data

  // Get current authenticated user
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const ip = resolveRequestIp(request)
  const ua = request.headers.get('user-agent') || 'unknown'

  const rateLimit = await checkRateLimit({
    namespace: 'beta-complete-user',
    key: user.id,
    limit: 3,
    windowMs: 15 * 60 * 1000,
  })
  const headers = buildRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers })
  }

  // Verify the invitation email matches the authenticated user
  const { data: invitation } = await admin
    .from('beta_invitations')
    .select('email, status')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404, headers })
  }

  if (invitation.email !== user.email) {
    return NextResponse.json({ error: 'Email mismatch' }, { status: 403, headers })
  }

  // Ensure user exists in our users table
  const { data: existingUser } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  let userId = existingUser?.id

  if (!userId) {
    // Create user profile for OTP-authenticated users
    const consentNow = new Date().toISOString()
    const { data: newUser } = await admin.from('users').insert({
      auth_id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      terms_accepted_at: consentNow,
      privacy_accepted_at: consentNow,
      consent_version: '2.0',
      consent_source: 'beta_invite',
    }).select('id').single()
    userId = newUser?.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500, headers })
  }

  // Accept invitation + grant beta access
  await acceptInvitation(admin, invitationId, userId, user.email!, ip, ua)

  return NextResponse.json({ success: true }, { headers })
}
