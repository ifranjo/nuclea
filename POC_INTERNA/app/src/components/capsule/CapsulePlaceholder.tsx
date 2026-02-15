'use client'

interface CapsulePlaceholderProps {
  size?: 'sm' | 'md'
}

export function CapsulePlaceholder({ size = 'md' }: CapsulePlaceholderProps) {
  const dimensions = size === 'md'
    ? 'w-[240px] h-[86px] sm:w-[280px] sm:h-[100px] lg:w-[320px] lg:h-[114px]'
    : 'w-[160px] h-[56px]'
  const radius = size === 'md' ? 'rounded-[50px]' : 'rounded-[28px]'
  const textSize = size === 'md' ? 'text-sm' : 'text-xs'

  return (
    <div
      className={`${dimensions} ${radius} relative flex items-center justify-end pr-[20%] shadow-[0_8px_32px_rgba(0,0,0,0.12)]`}
      style={{
        background: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)',
      }}
    >
      {/* Highlight reflection */}
      <div
        className={`absolute inset-0 ${radius}`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />
      {/* NUCLEA text */}
      <span
        className={`relative ${textSize} font-semibold tracking-[2px] text-[#4A4A4A] select-none`}
      >
        NUCLEA
      </span>
    </div>
  )
}

