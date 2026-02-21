import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { resolveRequestIp } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateToken, logBetaEvent } from '@/lib/beta'
import { buildRateLimitHeaders, checkRateLimit } from '@/lib/rate-limit'

const acceptSchema = z.object({
  token: z.string().trim().min(16).max(256),
})

// GET /api/beta/accept?t=<token> — Validate a beta token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t')
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const ip = resolveRequestIp(request)
  const supabase = createAdminClient()
  const rateLimit = await checkRateLimit({
    namespace: 'beta-accept-ip',
    key: ip,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  const headers = buildRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers })
  }

  const { valid, invitation, reason } = await validateToken(supabase, token)

  if (!valid) {
    const messages: Record<string, string> = {
      invalid_token: 'Enlace de invitacion no valido.',
      already_used: 'Esta invitacion ya ha sido utilizada.',
      expired: 'Esta invitacion ha expirado.',
    }
    return NextResponse.json({
      error: messages[reason || 'invalid_token'] || 'Token no valido.',
      reason,
    }, { status: 400, headers })
  }

  return NextResponse.json({
    valid: true,
    email: invitation!.email,
    cohort: invitation!.cohort,
  }, { headers })
}

// POST /api/beta/accept — Accept invitation and trigger OTP
export async function POST(request: NextRequest) {
  const parsed = acceptSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload invalido', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { token } = parsed.data
  const ip = resolveRequestIp(request)
  const ua = request.headers.get('user-agent') || 'unknown'
  const supabase = createAdminClient()
  const rateLimit = await checkRateLimit({
    namespace: 'beta-accept-ip',
    key: ip,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  const headers = buildRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers })
  }

  const { valid, invitation, reason } = await validateToken(supabase, token)
  if (!valid || !invitation) {
    await logBetaEvent(supabase, 'login_failed', { ipAddress: ip, userAgent: ua, metadata: { reason } })
    return NextResponse.json({ error: 'Token no valido.', reason }, { status: 400, headers })
  }

  // Send OTP magic link to the invited email.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: invitation.email,
    options: {
      emailRedirectTo: `${baseUrl}/api/auth/callback?next=/beta/complete&invitation=${invitation.id}`,
    },
  })

  if (otpError) {
    return NextResponse.json({ error: 'Error al enviar el email. Intentalo de nuevo.' }, { status: 500, headers })
  }

  return NextResponse.json({
    success: true,
    message: 'Hemos enviado un enlace magico a tu email. Revisa tu bandeja de entrada.',
    email: invitation.email,
  }, { headers })
}
