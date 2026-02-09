'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PolaroidPlaceholder } from '@/components/capsule/PolaroidPlaceholder'

interface P2Props {
  onNext: () => void
}

/* ------------------------------------------------------------------ */
/*  Polaroid destinations — where each polaroid drifts to after       */
/*  emerging from the center split. Positions are in viewport %.      */
/*  Each now carries a real photo src.                                 */
/* ------------------------------------------------------------------ */
const polaroids = [
  { rotation: -12, x: '-38vw', y: '-32vh', delay: 0.7, src: '/images/polaroids/dinner.jpg', alt: 'Cena al aire libre' },
  { rotation: 8, x: '34vw', y: '-28vh', delay: 0.85, src: '/images/polaroids/terrace.jpg', alt: 'Terraza en Lanzarote' },
  { rotation: -5, x: '-30vw', y: '28vh', delay: 1.0, src: '/images/polaroids/beach.jpg', alt: 'Playa y montañas' },
  { rotation: 15, x: '32vw', y: '24vh', delay: 1.15, src: '/images/polaroids/group.jpg', alt: 'Amigos en la entrada' },
  { rotation: -8, x: '-42vw', y: '-2vh', delay: 1.3, src: '/images/polaroids/friends.jpg', alt: 'Amigos en la calle' },
  { rotation: 3, x: '38vw', y: '4vh', delay: 1.45, src: '/images/polaroids/cathedral.jpg', alt: 'Catedral' },
  { rotation: 10, x: '-18vw', y: '-38vh', delay: 1.6, src: '/images/polaroids/adventure.jpg', alt: 'Aventura en la roca' },
  { rotation: -14, x: '20vw', y: '34vh', delay: 1.75, src: '/images/polaroids/terrace2.jpg', alt: 'Terraza con vistas' },
]

const floatingCapsules = [
  { w: 86, h: 42, x: '-44vw', y: '-18vh', rotation: -20, delay: 0.95 },
  { w: 74, h: 36, x: '42vw', y: '-12vh', rotation: 18, delay: 1.05 },
  { w: 92, h: 46, x: '-34vw', y: '20vh', rotation: 16, delay: 1.18 },
  { w: 80, h: 38, x: '40vw', y: '18vh', rotation: -14, delay: 1.28 },
  { w: 68, h: 34, x: '-12vw', y: '34vh', rotation: -8, delay: 1.45 },
]

/* ------------------------------------------------------------------ */
/*  Capsule image dimensions — matching P1's container sizes.         */
/*  The capsule seam is roughly at 45% from the left edge.            */
/* ------------------------------------------------------------------ */
const POLAROID_SIZE_MOBILE = 80
const FLOAT_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

/* Clip-path split point — the seam on the capsule PNG */
const SEAM_PCT = 46
const TOTAL_DURATION_MS = 4000
const TICK_MS = 100

export function P2CapsuleOpening({ onNext }: P2Props) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [paused, setPaused] = useState(false)
  const hasAdvancedRef = useRef(false)
  const frameRef = useRef<number | null>(null)
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    if (paused || hasAdvancedRef.current) return

    const tick = (timestamp: number) => {
      if (hasAdvancedRef.current) return

      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp
      }

      const delta = timestamp - lastTickRef.current
      if (delta >= TICK_MS) {
        setElapsedMs((previous) => Math.min(previous + delta, TOTAL_DURATION_MS))
        lastTickRef.current = timestamp
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = null
      lastTickRef.current = null
    }
  }, [paused])

  useEffect(() => {
    if (elapsedMs < TOTAL_DURATION_MS || hasAdvancedRef.current) return
    hasAdvancedRef.current = true
    onNext()
  }, [elapsedMs, onNext])

  const progressPercent = Math.round((elapsedMs / TOTAL_DURATION_MS) * 100)
  const remainingSeconds = Math.max(0, Math.ceil((TOTAL_DURATION_MS - elapsedMs) / 1000))
  const particleSpecs = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const distance = 60 + ((i * 37) % 100)
        return {
          i,
          targetX: Math.cos(angle) * distance,
          targetY: Math.sin(angle) * distance - 40,
          size: 3 + (i % 3),
          background:
            i % 3 === 0
              ? 'rgba(212, 175, 55, 0.5)'
              : 'rgba(212, 175, 55, 0.25)',
        }
      }),
    []
  )

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
      <div className="relative z-10 w-[240px] h-[120px] md:w-[320px] md:h-[160px]">
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
            height: '100%',
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
      {/*  Now with REAL photos and hover interactivity.               */}
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
          style={{ top: '50%', left: '50%', marginLeft: -(POLAROID_SIZE_MOBILE / 2), marginTop: -(POLAROID_SIZE_MOBILE / 2) }}
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
              ease: FLOAT_EASE,
            }}
            className="scale-100 md:scale-[1.5]"
          >
            <PolaroidPlaceholder
              size={POLAROID_SIZE_MOBILE}
              rotation={0}
              src={p.src}
              alt={p.alt}
              interactive
            />
          </motion.div>
        </motion.div>
      ))}

      {floatingCapsules.map((pill, i) => (
        <motion.div
          key={`pill-${i}`}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.45, rotate: 0 }}
          animate={{
            x: pill.x,
            y: pill.y,
            opacity: [0, 0.95, 0.8],
            scale: [0.45, 1, 1],
            rotate: pill.rotation,
          }}
          transition={{
            delay: pill.delay,
            duration: 1.05,
            ease: [0.22, 1, 0.36, 1],
            opacity: { delay: pill.delay, duration: 0.75 },
          }}
          className="absolute z-[22] pointer-events-none"
          style={{ top: '50%', left: '50%', marginLeft: -(pill.w / 2), marginTop: -(pill.h / 2) }}
        >
          <div
            className="relative rounded-full border border-[rgba(255,255,255,0.72)] overflow-hidden shadow-[0_10px_24px_rgba(10,10,16,0.22)]"
            style={{
              width: pill.w,
              height: pill.h,
              background: 'linear-gradient(132deg, #f4f5f8 0%, #d9dce4 48%, #b9bfcc 100%)',
            }}
          >
            <div className="absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.08))]" />
            <div
              className="absolute inset-y-[22%] left-[56%] w-[28%] rounded-full bg-[rgba(125,132,146,0.34)]"
              style={{ filter: 'blur(0.4px)' }}
            />
          </div>
        </motion.div>
      ))}

      {/* ============================================================ */}
      {/*  Soft particle sparkles — tiny dots that drift up from       */}
      {/*  the center for an ethereal memory-release feel.             */}
      {/* ============================================================ */}
      {particleSpecs.map((particle) => (
          <motion.div
            key={`particle-${particle.i}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: particle.targetX,
              y: particle.targetY,
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              delay: 0.4 + particle.i * 0.08,
              duration: 2,
              ease: 'easeOut',
            }}
            className="absolute pointer-events-none z-30"
            style={{
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: particle.background,
            }}
          />
      ))}

      {/* ============================================================ */}
      {/*  Progress bar — same style as original, reliable timing      */}
      {/* ============================================================ */}
      <div className="absolute bottom-0 left-0 right-0 safe-bottom px-8 pb-4 z-40 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            className="text-[12px] font-medium text-nuclea-text/70 hover:text-nuclea-text transition-colors"
            aria-label={paused ? 'Reanudar apertura' : 'Pausar apertura'}
          >
            {paused ? 'Reanudar' : 'Pausar'}
          </button>
          <span className="text-[12px] text-nuclea-text-muted">
            {paused ? 'Pausado' : `Continua en ${remainingSeconds}s`}
          </span>
        </div>
        <div className="h-[3px] bg-[#E5E5EA] rounded-full overflow-hidden">
          <div
            className="h-full bg-nuclea-text rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
