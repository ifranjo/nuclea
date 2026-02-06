'use client'

interface PolaroidPlaceholderProps {
  size?: number      // 80-120px
  rotation?: number  // -15 to +15 degrees
  className?: string
}

export function PolaroidPlaceholder({ size = 100, rotation = 0, className = '' }: PolaroidPlaceholderProps) {
  const borderSide = 8
  const borderBottom = 24
  const innerSize = size - borderSide * 2

  return (
    <div
      className={`bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-[2px] ${className}`}
      style={{
        width: size,
        padding: `${borderSide}px ${borderSide}px ${borderBottom}px ${borderSide}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div
        className="bg-[#F0F0F0] rounded-[1px]"
        style={{
          width: innerSize,
          height: innerSize,
        }}
      />
    </div>
  )
}
