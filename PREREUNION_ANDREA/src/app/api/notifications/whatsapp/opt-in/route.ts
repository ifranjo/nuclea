import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { AuthError, getAdminDb, verifyBearerToken } from '@/lib/firebase-admin'

interface OptInBody {
  capsuleId: string
  contactId?: string
  phone?: string
  source?: string
}

interface TrustContact {
  id?: string
  name?: string
  email?: string
  phone?: string
  whatsappOptInAt?: string
  whatsappOptInSource?: string
}

function parseBody(payload: unknown): OptInBody {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Payload invalido')
  }

  const body = payload as Record<string, unknown>
  const capsuleId = typeof body.capsuleId === 'string' ? body.capsuleId.trim() : ''
  const contactId = typeof body.contactId === 'string' ? body.contactId.trim() : undefined
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined
  const source = typeof body.source === 'string' ? body.source.trim() : 'ui'

  if (!capsuleId) {
    throw new Error('capsuleId requerido')
  }

  if (!contactId && !phone) {
    throw new Error('contactId o phone requerido')
  }

  return { capsuleId, contactId, phone, source }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const body = parseBody(await request.json())
    const db = getAdminDb('whatsapp opt-in')

    const capsuleRef = db.collection('capsules').doc(body.capsuleId)
    const capsuleSnapshot = await capsuleRef.get()
    if (!capsuleSnapshot.exists) {
      return NextResponse.json({ error: 'Capsula no encontrada' }, { status: 404 })
    }

    const capsule = (capsuleSnapshot.data() || {}) as {
      userId?: string
      trustContacts?: TrustContact[]
    }

    if (capsule.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contacts = Array.isArray(capsule.trustContacts) ? capsule.trustContacts : []
    const nowIso = new Date().toISOString()
    let touched = false

    const updatedContacts = contacts.map((contact) => {
      const byId = body.contactId && contact.id === body.contactId
      const byPhone = body.phone && contact.phone === body.phone
      if (!byId && !byPhone) return contact

      touched = true
      return {
        ...contact,
        whatsappOptInAt: nowIso,
        whatsappOptInSource: body.source,
      }
    })

    if (!touched && body.phone) {
      updatedContacts.push({
        id: randomUUID(),
        phone: body.phone,
        whatsappOptInAt: nowIso,
        whatsappOptInSource: body.source,
      })
      touched = true
    }

    if (!touched) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    await capsuleRef.set({
      trustContacts: updatedContacts,
      updatedAt: new Date(),
    }, { merge: true })

    return NextResponse.json({
      ok: true,
      capsuleId: body.capsuleId,
      whatsappOptInAt: nowIso,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Error && (
      error.message.includes('capsuleId requerido') ||
      error.message.includes('contactId o phone requerido') ||
      error.message.includes('Payload invalido')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('WhatsApp opt-in error:', error)
    return NextResponse.json({ error: 'No se pudo registrar el opt-in' }, { status: 500 })
  }
}

