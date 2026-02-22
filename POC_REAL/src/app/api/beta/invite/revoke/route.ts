import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { isValidAdminRequest } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid(),
})

// POST /api/beta/invite/revoke — Revoke a pending invitation (admin only)
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parseResult = revokeInvitationSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload invalido', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const { invitationId } = parseResult.data
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('beta_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId)
    .eq('status', 'pending')
    .select('id, email')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'No se pudo revocar la invitacion. Puede que ya no este pendiente.' },
      { status: 404 }
    )
  }

  // Audit log
  await supabase.from('beta_audit_log').insert({
    event: 'access_revoked',
    email: data.email,
    metadata: { invitationId, source: 'admin_ui' },
  })

  return NextResponse.json({ success: true, email: data.email })
}
