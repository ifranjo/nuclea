import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CAPSULE_TYPES } from '@/types'

interface CapsuleDetailPageProps {
  params: Promise<{
    type: string
  }>
}

export default async function CapsuleDetailPage({ params }: CapsuleDetailPageProps) {
  const { type } = await params
  const capsule = CAPSULE_TYPES.find((item) => item.id === type)

  if (!capsule) {
    notFound()
  }

  return (
    <main className="min-h-[100dvh] bg-white text-nuclea-text px-6 py-8">
      <div className="max-w-[560px] mx-auto">
        <Link
          href="/onboarding"
          className="inline-flex items-center text-sm text-nuclea-text-secondary mb-6"
        >
          Volver
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">{capsule.name}</h1>
        <p className="text-lg text-nuclea-text-secondary mb-6">{capsule.tagline}</p>

        <section className="rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] p-5">
          <h2 className="text-base font-semibold mb-2">Descripción</h2>
          <p className="text-sm text-nuclea-text-secondary leading-relaxed">{capsule.description}</p>
        </section>

        <section className="rounded-2xl border border-[#E5E5EA] p-5 mt-4">
          <h2 className="text-base font-semibold mb-2">Siguiente paso</h2>
          <p className="text-sm text-nuclea-text-secondary leading-relaxed">
            Esta vista es un placeholder funcional para el detalle de cápsula. El siguiente
            incremento es conectar esta pantalla con el flujo de creación real y validación legal.
          </p>
        </section>
      </div>
    </main>
  )
}
