import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CAPSULE_DETAIL_CONTENT } from '@/lib/capsuleDetails'

interface CapsuleDetailPageProps {
  params: Promise<{
    type: string
  }>
}

export default async function CapsuleDetailPage({ params }: CapsuleDetailPageProps) {
  const { type } = await params
  const capsule = CAPSULE_DETAIL_CONTENT[type as keyof typeof CAPSULE_DETAIL_CONTENT]

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

        <h1 className="text-3xl font-semibold tracking-tight mb-2">{capsule.title}</h1>
        <p className="text-lg text-nuclea-text-secondary mb-6">{capsule.tagline}</p>

        <section className="rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] p-5">
          <h2 className="text-base font-semibold mb-2">Descripción</h2>
          <p className="text-sm text-nuclea-text-secondary leading-relaxed">{capsule.summary}</p>
        </section>

        <section className="rounded-2xl border border-[#E5E5EA] p-5 mt-4">
          <h2 className="text-base font-semibold mb-3">Claves de esta cápsula</h2>
          <ul className="space-y-2 text-sm text-nuclea-text-secondary leading-relaxed">
            {capsule.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span aria-hidden className="mt-1 text-[#A8A8AD]">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#E5E5EA] p-5 mt-4">
          <h2 className="text-base font-semibold mb-2">Siguiente paso</h2>
          <p className="text-sm text-nuclea-text-secondary leading-relaxed">
            Continuar con flujo de creación, validación legal y activación de cápsula.
          </p>
        </section>
      </div>
    </main>
  )
}
