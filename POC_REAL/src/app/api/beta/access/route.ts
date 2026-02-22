import { NextResponse, type NextRequest } from 'next/server'
import { isValidAdminRequest } from '@/lib/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/beta/access — List all beta access entries (admin only)
export async function GET(request: NextRequest) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('beta_access')
    .select(`
      id,
      user_id,
      enabled,
      cohort,
      granted_at,
      revoked_at,
      users!inner ( email, full_name )
    `)
    .order('granted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ access: data })
}
