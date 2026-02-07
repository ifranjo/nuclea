'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PolaroidPlaceholder } from '@/components/capsule/PolaroidPlaceholder'

interface P2Props {
  onNext: () => void
}

/* ------------------------------------------------------------------ */
/*  Polaroid destinations — where each polaroid drifts to after       */
/*  emerging from the center split. Positions are in viewport %.      */
/* ------------------------------------------------------------------ */
const polaroids = [
  { size: 80,  rotation: -12, x: '-38vw', y: '-32vh', delay: 0.7 },
  { size: 100, rotation: 8,   x: '34vw',  y: '-28vh', delay: 0.85 },
  { size: 90,  rotation: -5,  x: '-30vw', y: '28vh',  delay: 1.0 },
  { size: 110, rotation: 15,  x: '32vw',  y: '24vh',  delay: 1.15 },
  { size: 85,  rotation: -8,  x: '-42vw', y: '-2vh',  delay: 1.3 },
  { size: 95,  rotation: 3,   x: '38vw',  y: '4vh',   delay: 1.45 },
  { size: 75,  rotation: 10,  x: '-18vw', y: '-38vh', delay: 1.6 },
  { size: 88,  rotation: -14, x: '20vw',  y: '34vh',  delay: 1.75 },
]

/* ------------------------------------------------------------------ */
/*  Capsule image dimensions — matching P1's container sizes.         */
/*  The capsule seam is roughly at 45% from the left edge.            */
/* ------------------------------------------------------------------ */
const CAPSULE_W = 240
const CAPSULE_H = 120

/* Clip-path split point — the seam on the capsule PNG */
const SEAM_PCT = 46

export function P2CapsuleOpening({ onNext }: P2Props) {
  useEffect(() => {
    const timer = setTimeout(onNext, 4000)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden bg-nuclea-bg">

      {/* ============================================================ */}
      {/*  Background glow — warm radial light from the center where   */}
      {/*  memories emerge. Fades in as capsule splits open.           */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1.4, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Secondary glow — tighter, brighter core */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 0.8, 0.5], scale: [0.3, 1.2, 1] }}
        transition={{ delay: 0.5, duration: 2, ease: 'easeOut' }}
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.03) 50%, transparent 100%)',
          filter: 'blur(20px)',
        }}
      />

      {/* ============================================================ */}
      {/*  Capsule split animation                                     */}
      {/*  Two halves of the same capsule image, clipped via           */}
      {/*  clip-path, animate apart to reveal the center.              */}
      {/* ============================================================ */}
      <div className="relative z-10" style={{ width: CAPSULE_W, height: CAPSULE_H }}>
        {/* Left half — slides left */}
        <motion.div
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: -60, opacity: 0 }}
          transition={{
            x: { delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            opacity: { delay: 0.5, duration: 0.4, ease: 'easeOut' },
          }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full" style={{ clipPath: `inset(0 ${100 - SEAM_PCT}% 0 0)` }}>
            <Image src="/images/capsule-closed-nobg.png" alt="" fill className="object-cover" priority />
          </div>
        </motion.div>

        {/* Right half — slides right */}
        <motion.div
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: 60, opacity: 0 }}
          transition={{
            x: { delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            opacity: { delay: 0.5, duration: 0.4, ease: 'easeOut' },
          }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full" style={{ clipPath: `inset(0 0 0 ${SEAM_PCT}%)` }}>
            <Image src="/images/capsule-closed-nobg.png" alt="" fill className="object-cover" />
          </div>
        </motion.div>

        {/* Light burst at seam — appears as capsule parts */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0.3, scaleX: 0.1 }}
          animate={{
            opacity: [0, 0.9, 0],
            scaleY: [0.3, 1.5, 2.5],
            scaleX: [0.1, 0.4, 0.8],
          }}
          transition={{ delay: 0.2, duration: 1.2, ease: 'easeOut' }}
          className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
          style={{
            width: 4,
            height: CAPSULE_H,
            background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.6), transparent)',
            borderRadius: '50%',
            filter: 'blur(6px)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/*  Polaroids — emerge from center, drift to scattered spots    */}
      {/*  Each starts at scale 0 in the center, then floats outward   */}
      {/*  with a gentle wobble and staggered timing.                  */}
      {/* ============================================================ */}
      {polaroids.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: p.x,
            y: p.y,
            scale: 1,
            opacity: [0, 1, 1, 0.92],
            rotate: p.rotation,
          }}
          transition={{
            delay: p.delay,
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            opacity: {
              delay: p.delay,
              duration: 0.6,
              ease: 'easeOut',
            },
          }}
          className="absolute z-20"
          style={{ top: '50%', left: '50%', marginLeft: -(p.size / 2), marginTop: -(p.size / 2) }}
        >
          {/* Subtle continuous float after arriving */}
          <motion.div
            animate={{
              y: [0, -4, 0, 3, 0],
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{
              delay: p.delay + 1.6,
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <PolaroidPlaceholder size={p.size} rotation={0} />
          </motion.div>
        </motion.div>
      ))}

      {/* ============================================================ */}
      {/*  Soft particle sparkles — tiny dots that drift up from       */}
      {/*  the center for an ethereal memory-release feel.             */}
      {/* ============================================================ */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const distance = 60 + ((i * 37) % 100) // deterministic pseudo-random
        const targetX = Math.cos(angle) * distance
        const targetY = Math.sin(angle) * distance - 40

        return (
          <motion.div
            key={`particle-${i}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: targetX,
              y: targetY,
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              delay: 0.4 + i * 0.08,
              duration: 2,
              ease: 'easeOut',
            }}
            className="absolute pointer-events-none z-30"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              borderRadius: '50%',
              background: i % 3 === 0
                ? 'rgba(212, 175, 55, 0.5)'
                : 'rgba(212, 175, 55, 0.25)',
            }}
          />
        )
      })}

      {/* ============================================================ */}
      {/*  Progress bar — same style as original, reliable timing      */}
      {/* ============================================================ */}
      <div className="absolute bottom-0 left-0 right-0 safe-bottom px-8 pb-4 z-40">
        <div className="h-[3px] bg-[#E5E5EA] rounded-full overflow-hidden">
          <div
            className="h-full bg-nuclea-text rounded-full"
            style={{ animation: 'p2-progress-fill 4s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes p2-progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
