import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  canSubmitTrustDecision,
  normalizeTrustDecision,
  type TrustDecisionIdentity,
  type TrustDecisionInput,
  type TrustDecisionSnapshot,
} from '@/lib/trust/trust-decision'

interface RequestBody {
  capsuleId: string
  personId: string
  decision: string
}

function parseBody(payload: unknown): TrustDecisionInput {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Payload invalido')
  }

  const body = payload as Partial<RequestBody>
  const capsuleId = typeof body.capsuleId === 'string' ? body.capsuleId.trim() : ''
  const personId = typeof body.personId === 'string' ? body.personId.trim() : ''
  const decisionRaw = typeof body.decision === 'string' ? body.decision.trim() : ''
  const decision = normalizeTrustDecision(decisionRaw)

  if (!capsuleId || !personId || !decision) {
    throw new Error('Datos de decision invalidos')
  }

  return { capsuleId, personId, decision }
}

async function resolveCurrentUserIdentity(): Promise<TrustDecisionIdentity | null> {
  const serverClient = await createServerSupabaseClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!profile?.id) return null

  return {
    profileId: profile.id,
    email: user.email || null,
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await resolveCurrentUserIdentity()
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const input = parseBody(await request.json())
    const admin = createAdminClient()
    const { data: person } = await admin
      .from('designated_persons')
      .select('id, capsule_id, user_id, email')
      .eq('id', input.personId)
      .eq('capsule_id', input.capsuleId)
      .maybeSingle()

    if (!person) {
      return NextResponse.json({ error: 'Contacto de confianza no encontrado' }, { status: 404 })
    }

    const personSnapshot: TrustDecisionSnapshot = {
      id: person.id,
      capsuleId: person.capsule_id,
      userId: person.user_id,
      email: person.email,
    }
    const validation = canSubmitTrustDecision(input, personSnapshot, identity)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason || 'Forbidden' }, { status: 403 })
    }

    const decidedAt = new Date().toISOString()
    const { error: updateError } = await admin
      .from('designated_persons')
      .update({
        decision: input.decision,
        decided_at: decidedAt,
      })
      .eq('id', input.personId)
      .eq('capsule_id', input.capsuleId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      ok: true,
      capsuleId: input.capsuleId,
      personId: input.personId,
      decision: input.decision,
      decidedAt,
    })
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Payload invalido')
      || error.message.includes('Datos de decision invalidos')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Trust decision error:', error)
    return NextResponse.json({ error: 'No se pudo registrar la decision' }, { status: 500 })
  }
}
