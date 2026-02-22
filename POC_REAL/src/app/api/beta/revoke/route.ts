import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { isValidAdminRequest } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { revokeBetaAccess } from '@/lib/beta'

const revokeSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().trim().max(300).optional(),
})

// POST /api/beta/revoke — Revoke beta access (admin only)
export async function POST(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parseResult = revokeSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Payload inválido', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const { userId, reason } = parseResult.data
  const supabase = createAdminClient()
  const result = await revokeBetaAccess(supabase, userId, reason)
  if (result.error) {
    return NextResponse.json({ error: 'No se pudo revocar acceso beta' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
