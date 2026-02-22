import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthError, getAdminDb, verifyBearerToken } from '@/lib/firebase-admin'

interface TrustContact {
  id?: string
  name?: string
  email?: string
  phone?: string
  whatsappOptInAt?: string
  whatsappOptInSource?: string
}

const whatsappOptInSchema = z
  .object({
    capsuleId: z.string().trim().min(1, 'capsuleId requerido'),
    contactId: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    source: z.string().trim().min(1).default('ui'),
  })
  .refine((data) => data.contactId || data.phone, {
    message: 'contactId o phone requerido',
  })

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyBearerToken(request)
    const parsed = whatsappOptInSchema.safeParse(await request.json())

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? 'Payload invalido'
      return NextResponse.json({ error: firstIssue }, { status: 400 })
    }

    const body = parsed.data
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

    console.error('WhatsApp opt-in error:', error)
    return NextResponse.json({ error: 'No se pudo registrar el opt-in' }, { status: 500 })
  }
}
