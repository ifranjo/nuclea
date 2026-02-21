import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { isValidAdminRequest } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createInvitation } from '@/lib/beta'
import { buildRateLimitHeaders, checkRateLimit, hashRateLimitKey } from '@/lib/rate-limit'

const inviteSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  cohort: z.string().trim().min(1).max(50).optional().default('beta-1'),
  expiresInHours: z.number().int().min(1).max(24 * 30).optional().default(72),
})

// POST /api/beta/invite — Create a beta invitation (admin only)
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminKey = request.headers.get('x-admin-key') as string
  const rateLimit = await checkRateLimit({
    namespace: 'beta-invite-admin',
    key: hashRateLimitKey(adminKey),
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  const headers = buildRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intentalo de nuevo mas tarde.' },
      { status: 429, headers }
    )
  }

  const parseResult = inviteSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload invalido', details: parseResult.error.flatten() },
      { status: 400, headers }
    )
  }

  const { email, cohort, expiresInHours } = parseResult.data
  const supabase = createAdminClient()
  const { invitation, token, error } = await createInvitation(supabase, email, {
    cohort,
    expiresInHours,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already invited' }, { status: 409, headers })
    }
    return NextResponse.json({ error: error.message }, { status: 500, headers })
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
  }, { headers })
}

// GET /api/beta/invite — List invitations (admin only)
export async function GET(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
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
