import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revokeBetaAccess } from '@/lib/beta'

// POST /api/beta/revoke — Revoke beta access (admin only)
export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, reason } = await request.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await revokeBetaAccess(supabase, userId, reason)

  return NextResponse.json({ success: true })
}
