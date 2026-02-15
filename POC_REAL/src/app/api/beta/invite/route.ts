import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createInvitation } from '@/lib/beta'

// POST /api/beta/invite — Create a beta invitation (admin only)
export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { email, cohort, expiresInHours } = body

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { invitation, token, error } = await createInvitation(supabase, email, {
    cohort: cohort || 'c1',
    expiresInHours: expiresInHours || 72,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already invited' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Build invitation URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const inviteUrl = `${baseUrl}/beta/accept?t=${token}`

  return NextResponse.json({
    invitation: {
      id: invitation.id,
      email: invitation.email,
      cohort: invitation.cohort,
      expiresAt: invitation.expires_at,
    },
    inviteUrl,
  })
}

// GET /api/beta/invite — List invitations (admin only)
export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('beta_invitations')
    .select('id, email, status, cohort, expires_at, accepted_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ invitations: data })
}
