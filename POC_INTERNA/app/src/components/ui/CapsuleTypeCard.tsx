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
        w-full flex items-center px-4 py-[14px]
        bg-white text-left
        transition-colors duration-100
        active:bg-[#F2F2F7]
        ${isFirst ? 'rounded-t-[12px]' : ''}
        ${isLast ? 'rounded-b-[12px]' : ''}
        ${!isLast ? 'border-b border-[#E5E5EA]' : ''}
      `}
    >
      <div className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 bg-[#F2F2F7] rounded-full">
        <CapsuleIcon type={capsuleType.id} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[17px] font-normal text-nuclea-text leading-snug">
          {capsuleType.name}
        </h3>
        <p className="text-[13px] text-nuclea-text-secondary mt-0.5 leading-snug">
          {capsuleType.tagline}
        </p>
      </div>
      <ChevronRight size={18} strokeWidth={2} className="text-[#C7C7CC] ml-2 flex-shrink-0" />
    </button>
  )
}
