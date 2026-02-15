import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateToken, checkRateLimit, logBetaEvent } from '@/lib/beta'

// GET /api/beta/accept?t=<token> — Validate a beta token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t')
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const supabase = createAdminClient()

  // Rate limit by IP
  const { allowed } = await checkRateLimit(supabase, `beta-accept:${ip}`)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const { valid, invitation, reason } = await validateToken(supabase, token)

  if (!valid) {
    const messages: Record<string, string> = {
      invalid_token: 'Enlace de invitación no válido.',
      already_used: 'Esta invitación ya ha sido utilizada.',
      expired: 'Esta invitación ha expirado.',
    }
    return NextResponse.json({
      error: messages[reason || 'invalid_token'] || 'Token no válido.',
      reason,
    }, { status: 400 })
  }

  return NextResponse.json({
    valid: true,
    email: invitation!.email,
    cohort: invitation!.cohort,
  })
}

// POST /api/beta/accept — Accept invitation and trigger OTP
export async function POST(request: NextRequest) {
  const { token } = await request.json()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const ua = request.headers.get('user-agent') || 'unknown'
  const supabase = createAdminClient()

  // Rate limit
  const { allowed } = await checkRateLimit(supabase, `beta-accept:${ip}`)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const { valid, invitation, reason } = await validateToken(supabase, token)
  if (!valid || !invitation) {
    await logBetaEvent(supabase, 'login_failed', { ipAddress: ip, userAgent: ua, metadata: { reason } })
    return NextResponse.json({ error: 'Token no válido.', reason }, { status: 400 })
  }

  // Send OTP magic link to the invited email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: invitation.email,
    options: {
      emailRedirectTo: `${baseUrl}/api/auth/callback?next=/beta/complete&invitation=${invitation.id}`,
    },
  })

  if (otpError) {
    return NextResponse.json({ error: 'Error al enviar el email. Inténtalo de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Hemos enviado un enlace mágico a tu email. Revisa tu bandeja de entrada.',
    email: invitation.email,
  })
}
