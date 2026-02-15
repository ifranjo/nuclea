'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface P1Props {
  onNext: () => void
}

export function P1CapsuleClosed({ onNext }: P1Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Toca para abrir la cápsula"
      onClick={onNext}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNext()
        }
      }}
      className="h-[100dvh] flex flex-col items-center justify-center cursor-pointer select-none"
    >
      {/* Capsule with floating + breathing animation */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          scale: [1, 1.045, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Pulsing glow shadow beneath the capsule */}
        <motion.div
          animate={{
            opacity: [0.25, 0.5, 0.25],
            scaleX: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-[18px] rounded-[50%] bg-black/[0.08] blur-md pointer-events-none"
        />

        <div className="relative w-[240px] h-[120px] sm:w-[320px] sm:h-[160px]">
          <Image
            src="/images/capsule-closed-nobg.png"
            alt="Cápsula NUCLEA cerrada"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 240px, 320px"
            priority
          />
          {/* "NUCLEA" engraved text on right half of capsule */}
          <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2">
            <span className="font-semibold tracking-[0.15em] text-sm text-[#4A4A4A]">
              NUCLEA
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hint text — fades in after 1.5s */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8, ease: 'easeOut' }}
        className="mt-8 font-sans text-sm text-nuclea-text-muted tracking-wide"
      >
        Toca para abrir
      </motion.p>
    </div>
  )
}

