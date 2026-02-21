import { createClient } from '@supabase/supabase-js'
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import { ExpiryUrgencyBanner } from '@/components/receiver/ExpiryUrgencyBanner'
import { ReceiverActionOptions } from '@/components/receiver/ReceiverActionOptions'
import type { CapsuleType } from '@/types'

async function getCapsuleByToken(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: capsule } = await supabase.from('capsules').select('*').eq('share_token', token).single()
  if (!capsule) return null
  const { data: contents } = await supabase.from('contents').select('*').eq('capsule_id', capsule.id).order('captured_at', { ascending: false })
  const { data: owner } = await supabase.from('users').select('full_name').eq('id', capsule.owner_id).single()
  return { capsule, contents: contents || [], owner }
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
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

  return (
    <div className="min-h-screen bg-nuclea-secondary">
      <header className="bg-white border-b border-nuclea-border px-6 py-4 text-center">
        <p className="text-xs text-nuclea-text-muted tracking-[0.2em] mb-1">NUCLEA</p>
        <div className="flex items-center justify-center gap-2">
          <CapsuleIcon type={capsule.type.replace('_', '-') as CapsuleType} size={18} />
          <h1 className="text-lg font-medium text-nuclea-text">{capsule.title}</h1>
        </div>
        <p className="text-sm text-nuclea-text-secondary mt-1">Compartida por {owner?.full_name}</p>
      </header>

      <div className="px-6 py-6">
        <div className='mb-6 space-y-3'>
          <div className='bg-white rounded-xl border border-nuclea-border p-4'>
            <p className='text-xs uppercase tracking-wide text-nuclea-text-muted'>Onboarding receptor</p>
            <p className='text-sm text-nuclea-text-secondary mt-2'>
              1) Verifica identidad (registro/login) 2) Reclama la capsula 3) Decide como vivir el regalo en 30 dias.
            </p>
          </div>
          <ExpiryUrgencyBanner createdAt={capsule.created_at} />
          <ReceiverActionOptions capsuleId={capsule.id} />
        </div>

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
      </div>
    </div>
  )
}
