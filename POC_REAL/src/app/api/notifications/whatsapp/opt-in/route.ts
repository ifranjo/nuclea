import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface OptInBody {
  capsuleId: string
  contactId: string
  phone?: string
  source?: string
}

function parseBody(payload: unknown): OptInBody {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Payload inválido')
  }

  const body = payload as Record<string, unknown>
  const capsuleId = typeof body.capsuleId === 'string' ? body.capsuleId.trim() : ''
  const contactId = typeof body.contactId === 'string' ? body.contactId.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined
  const source = typeof body.source === 'string' ? body.source.trim() : 'ui'

  if (!capsuleId) throw new Error('capsuleId requerido')
  if (!contactId) throw new Error('contactId requerido')

  return { capsuleId, contactId, phone, source }
}

async function resolveCurrentUserProfileId(): Promise<string | null> {
  const serverClient = await createServerSupabaseClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  return profile?.id || null
}

export async function POST(request: NextRequest) {
  try {
    const profileId = await resolveCurrentUserProfileId()
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = parseBody(await request.json())
    const admin = createAdminClient()
    const nowIso = new Date().toISOString()

    const { data: capsule } = await admin
      .from('capsules')
      .select('id, owner_id')
      .eq('id', body.capsuleId)
      .maybeSingle()

    if (!capsule?.id) {
      return NextResponse.json({ error: 'Cápsula no encontrada' }, { status: 404 })
    }

    if (capsule.owner_id !== profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatePayload: Record<string, unknown> = {
      whatsapp_opt_in_at: nowIso,
      whatsapp_opt_in_source: body.source,
    }

    if (body.phone) {
      updatePayload.phone = body.phone
    }

    const { data: contact, error: contactError } = await admin
      .from('designated_persons')
      .update(updatePayload)
      .eq('id', body.contactId)
      .eq('capsule_id', body.capsuleId)
      .select('id, phone')
      .single()

    if (contactError || !contact?.id) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    await admin
      .from('notification_optins')
      .upsert({
        capsule_id: body.capsuleId,
        contact_ref: body.contactId,
        channel: 'whatsapp',
        opted_in: true,
        source: body.source,
        opted_in_at: nowIso,
      }, { onConflict: 'capsule_id,contact_ref,channel' })

    return NextResponse.json({
      ok: true,
      capsuleId: body.capsuleId,
      contactId: body.contactId,
      phone: contact.phone || body.phone || null,
      whatsappOptInAt: nowIso,
    })
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Payload inválido') ||
      error.message.includes('capsuleId requerido') ||
      error.message.includes('contactId requerido')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'No se pudo registrar el opt-in' }, { status: 500 })
  }
}

