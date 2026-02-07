'use client'

import { ChevronRight } from 'lucide-react'
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import type { CapsuleTypeInfo } from '@/types'

interface CapsuleTypeCardProps {
  capsuleType: CapsuleTypeInfo
  onClick: (type: CapsuleTypeInfo) => void
  isFirst?: boolean
  isLast?: boolean
}

export function CapsuleTypeCard({ capsuleType, onClick, isFirst, isLast }: CapsuleTypeCardProps) {
  return (
    <button
      onClick={() => onClick(capsuleType)}
      className={`
        group w-full flex items-center px-4 py-[15px]
        bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,249,252,0.96))] text-left
        transition-all duration-200
        hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(244,246,252,1))]
        active:bg-[#F2F2F7]
        ${isFirst ? 'rounded-t-[16px]' : ''}
        ${isLast ? 'rounded-b-[16px]' : ''}
        ${!isLast ? 'border-b border-[#E5E5EA]' : ''}
      `}
    >
      <div className="relative w-11 h-11 flex items-center justify-center mr-3 flex-shrink-0 bg-[linear-gradient(140deg,#F4F6FB,#E6E9F2)] rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <span
          aria-hidden
          className="absolute inset-[3px] rounded-full border border-[rgba(255,255,255,0.62)]"
        />
        <CapsuleIcon type={capsuleType.id} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[17px] font-medium text-nuclea-text leading-snug tracking-[-0.01em]">
          {capsuleType.name}
        </h3>
        <p className="text-[13px] text-nuclea-text-secondary mt-0.5 leading-snug">
          {capsuleType.tagline}
        </p>
      </div>
      <ChevronRight
        size={18}
        strokeWidth={2}
        className="text-[#C7C7CC] ml-2 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-[2px]"
      />
    </button>
  )
}
