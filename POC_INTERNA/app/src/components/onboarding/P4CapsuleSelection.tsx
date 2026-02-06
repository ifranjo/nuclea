'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { CapsuleTypeCard } from '@/components/ui/CapsuleTypeCard'
import { CAPSULE_TYPES } from '@/types'
import type { CapsuleTypeInfo } from '@/types'

export function P4CapsuleSelection() {
  const router = useRouter()

  const handleSelect = (capsuleType: CapsuleTypeInfo) => {
    router.push(`/onboarding/capsule/${capsuleType.id}`)
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F2F2F7]">
      <Header />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-none">
        <div className="px-5 pb-10">
          {/* Title */}
          <h1 className="text-[28px] font-semibold text-nuclea-text text-center mt-4 mb-1">
            Elige tu cápsula
          </h1>
          <p className="text-[15px] text-nuclea-text-muted text-center mb-6">
            Aquí guardas lo que no quieres perder
          </p>

          {/* iOS grouped list */}
          <div className="max-w-[480px] mx-auto rounded-[12px] overflow-hidden">
            {CAPSULE_TYPES.map((type, i) => (
              <CapsuleTypeCard
                key={type.id}
                capsuleType={type}
                onClick={handleSelect}
                isFirst={i === 0}
                isLast={i === CAPSULE_TYPES.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Bottom safe area spacer */}
        <div className="safe-bottom" />
      </div>
    </div>
  )
}
