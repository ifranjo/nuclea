import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { acceptInvitation } from '@/lib/beta'

// POST /api/beta/complete — Complete beta acceptance after OTP auth
export async function POST(request: NextRequest) {
  const { invitationId } = await request.json()
  if (!invitationId) {
    return NextResponse.json({ error: 'invitationId required' }, { status: 400 })
  }

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
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const ua = request.headers.get('user-agent') || 'unknown'

  // Verify the invitation email matches the authenticated user
  const { data: invitation } = await admin
    .from('beta_invitations')
    .select('email, status')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  if (invitation.email !== user.email) {
    return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
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
    const { data: newUser } = await admin.from('users').insert({
      auth_id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
    }).select('id').single()
    userId = newUser?.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  // Accept invitation + grant beta access
  await acceptInvitation(admin, invitationId, userId, user.email!, ip, ua)

  return NextResponse.json({ success: true })
}
