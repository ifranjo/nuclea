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
      className="h-[100dvh] flex items-center justify-center cursor-pointer select-none"
    >
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-[260px] h-[130px] sm:w-[300px] sm:h-[150px]"
      >
        <Image
          src="/images/capsule-closed-nobg.png"
          alt="Cápsula NUCLEA cerrada"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  )
}
