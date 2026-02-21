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
      { error: 'Payload invalido', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const { userId, reason } = parseResult.data
  const supabase = createAdminClient()
  await revokeBetaAccess(supabase, userId, reason)

  return NextResponse.json({ success: true })
}
