import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { isValidAdminRequest } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateBetaToken, hashToken, logBetaEvent } from '@/lib/beta'
import { buildRateLimitHeaders, checkRateLimit, hashRateLimitKey } from '@/lib/rate-limit'
import { getEmailService } from '@/lib/email'
import { betaInvitationEmail } from '@/lib/email-templates'

const resendSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
})

// POST /api/beta/invite/resend — Resend a pending beta invitation (admin only)
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminKey = request.headers.get('x-admin-key') as string
  const rateLimit = await checkRateLimit({
    namespace: 'beta-invite-resend',
    key: hashRateLimitKey(adminKey),
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  const headers = buildRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
      { status: 429, headers }
    )
  }

  const parseResult = resendSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400, headers }
    )
  }

  const { email } = parseResult.data
  const supabase = createAdminClient()

  // Find the pending invitation for this email
  const { data: invitation, error: findError } = await supabase
    .from('beta_invitations')
    .select('id, email, cohort, expires_at')
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (findError || !invitation) {
    return NextResponse.json(
      { error: 'No se encontró una invitación pendiente para este email.' },
      { status: 404, headers }
    )
  }

  // Generate a new token (invalidates old one)
  const newToken = generateBetaToken()
  const newTokenHash = hashToken(newToken)
  const expiresInHours = 72
  const newExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('beta_invitations')
    .update({
      token_hash: newTokenHash,
      expires_at: newExpiresAt,
    })
    .eq('id', invitation.id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Error al actualizar la invitación.' },
      { status: 500, headers }
    )
  }

  // Build new invitation URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const inviteUrl = `${baseUrl}/beta/accept?t=${newToken}`

  // Send email
  let emailSent = false
  try {
    const emailService = getEmailService()
    const template = betaInvitationEmail(inviteUrl, { expiresInHours })
    const result = await emailService.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
    emailSent = result.success
  } catch (emailError) {
    console.error('[beta/invite/resend] Email delivery failed:', emailError)
  }

  // Audit log
  await logBetaEvent(supabase, 'resend', {
    email,
    metadata: { invitationId: invitation.id, newExpiresAt },
  })

  return NextResponse.json({
    success: true,
    emailSent,
    newExpiresAt,
  }, { headers })
}
