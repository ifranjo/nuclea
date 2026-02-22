import { NextResponse, type NextRequest } from 'next/server'
import { isValidAdminRequest } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/beta/audit — List audit log entries (admin only)
export async function GET(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)
  const emailFilter = searchParams.get('email')?.trim().toLowerCase()

  const supabase = createAdminClient()

  let query = supabase
    .from('beta_audit_log')
    .select('id, event, email, user_id, ip_address, user_agent, metadata, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (emailFilter) {
    query = query.ilike('email', `%${emailFilter}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entries: data, total: count })
}
