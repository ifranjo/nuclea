'use client'

import { useEffect } from 'react'
import { PolaroidPlaceholder } from '@/components/capsule/PolaroidPlaceholder'

interface P2Props {
  onNext: () => void
}

const polaroids = [
  { size: 80, rotation: -12, top: '10%', left: '5%' },
  { size: 100, rotation: 8, top: '8%', right: '6%' },
  { size: 90, rotation: -5, bottom: '18%', left: '4%' },
  { size: 110, rotation: 15, bottom: '14%', right: '3%' },
  { size: 85, rotation: -8, top: '42%', left: '0%' },
  { size: 95, rotation: 3, top: '38%', right: '2%' },
]

export function P2CapsuleOpening({ onNext }: P2Props) {
  useEffect(() => {
    const timer = setTimeout(onNext, 4000)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Scattered polaroids */}
      {polaroids.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
          } as React.CSSProperties}
        >
          <PolaroidPlaceholder size={p.size} rotation={p.rotation} />
        </div>
      ))}

      {/* Center placeholder */}
      <div className="w-[260px] h-[260px] bg-[#F2F2F7] rounded-[20px] flex items-center justify-center z-10">
        <p className="text-nuclea-text-muted text-[15px] text-center px-6">
          Animación de apertura
        </p>
      </div>

      {/* Progress bar — iOS style thin */}
      <div className="absolute bottom-0 left-0 right-0 safe-bottom px-8 pb-4">
        <div className="h-[3px] bg-[#E5E5EA] rounded-full overflow-hidden">
          <div
            className="h-full bg-nuclea-text rounded-full"
            style={{
              animation: 'progress-fill 4s linear forwards',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
