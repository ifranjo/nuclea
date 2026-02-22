import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Cápsula compartida',
    description: 'Alguien ha compartido una cápsula de memoria contigo.',
    robots: { index: false, follow: false },
  }
}
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import { ExpiryUrgencyBanner } from '@/components/receiver/ExpiryUrgencyBanner'
import { ReceiverActionOptions } from '@/components/receiver/ReceiverActionOptions'
import { normalizeCapsuleType, type CapsuleType } from '@/types'

async function getCapsuleByToken(token: string) {
  const supabase = createAdminClient()
  const { data: capsule } = await supabase
    .from('capsules')
    .select('id, title, description, type, status, share_token, owner_id, creator_id, created_at, gift_state, experience_expires_at')
    .eq('share_token', token)
    .single()
  if (!capsule) return null
  const { data: contents } = await supabase
    .from('contents')
    .select('id, type, file_path, file_name, title, text_content, captured_at, created_at')
    .eq('capsule_id', capsule.id)
    .order('created_at', { ascending: false })
  const sharedByUserId = capsule.creator_id || capsule.owner_id
  const { data: owner } = await supabase.from('users').select('full_name').eq('id', sharedByUserId).single()
  return { capsule, contents: contents || [], owner }
}

interface SharePageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ invite?: string }>
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { token } = await params
  const { invite: invitationToken } = await searchParams
  const data = await getCapsuleByToken(token)

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl tracking-[0.2em] font-light text-nuclea-text mb-2">NUCLEA</h1>
          <p className="text-nuclea-text-muted">Esta cápsula no existe o el enlace ha expirado</p>
        </div>
      </div>
    )
  }

  const { capsule, contents, owner } = data
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const giftState = capsule.gift_state || 'draft'
  const isExpired = giftState === 'expired'
  const isClaimed = ['claimed', 'continued', 'video_purchased', 'video_downloaded'].includes(giftState)
  const isSent = giftState === 'sent'

  return (
    <div className="min-h-screen bg-nuclea-secondary">
      <header className="bg-white border-b border-nuclea-border px-6 py-4 text-center">
        <p className="text-xs text-nuclea-text-muted tracking-[0.2em] mb-1">NUCLEA</p>
        <div className="flex items-center justify-center gap-2">
          <CapsuleIcon type={normalizeCapsuleType(capsule.type) as CapsuleType} size={18} />
          <h1 className="text-lg font-medium text-nuclea-text">{capsule.title}</h1>
        </div>
        <p className="text-sm text-nuclea-text-secondary mt-1">
          {isSent ? `Un regalo de ${owner?.full_name || 'alguien especial'}` : `Compartida por ${owner?.full_name}`}
        </p>
      </header>

      <div className="px-6 py-6">
        {isExpired && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-semibold text-rose-800">Esta cápsula ha expirado</p>
            <p className="text-sm text-rose-700 mt-1">
              El periodo de experiencia ha finalizado. El contenido ya no está disponible.
            </p>
          </div>
        )}

        {!isExpired && (
          <div className='mb-6 space-y-3'>
            {isSent && (
              <div className='bg-white rounded-xl border border-nuclea-border p-4'>
                <p className='text-xs uppercase tracking-wide text-nuclea-text-muted'>Invitación</p>
                <p className='text-sm text-nuclea-text-secondary mt-2'>
                  Has recibido una cápsula de recuerdos. Inicia sesión o regístrate para reclamarla y
                  disfrutar de 30 días de experiencia.
                </p>
              </div>
            )}

            {isClaimed && capsule.experience_expires_at && (
              <ExpiryUrgencyBanner expiresAt={capsule.experience_expires_at} />
            )}

            <ReceiverActionOptions
              capsuleId={capsule.id}
              giftState={giftState}
              invitationToken={invitationToken || null}
            />
          </div>
        )}

        {!isExpired && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {contents.filter(c => c.type === 'photo' && c.file_path).map(c => (
                <div key={c.id} className="aspect-square rounded-xl overflow-hidden bg-white border border-nuclea-border">
                  <img
                    src={`${supabaseUrl}/storage/v1/object/public/capsule-contents/${c.file_path}`}
                    alt={c.file_name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {contents.filter(c => c.type === 'text').length > 0 && (
              <div className="mt-6 space-y-3">
                <h2 className="text-sm font-medium text-nuclea-text">Notas</h2>
                {contents.filter(c => c.type === 'text').map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-nuclea-border p-4">
                    <h3 className="text-sm font-medium text-nuclea-text mb-1">{c.title}</h3>
                    <p className="text-sm text-nuclea-text-secondary">{c.text_content}</p>
                    <p className="text-xs text-nuclea-text-muted mt-2">
                      {new Date(c.captured_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {contents.length === 0 && (
              <p className="text-center text-nuclea-text-muted py-10">Esta cápsula aún no tiene contenido</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
