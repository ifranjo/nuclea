'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface P3Props {
  onNext: () => void
}

/* ------------------------------------------------------------------ */
/*  Floating pills — metallic capsule shapes scattered around the     */
/*  hero area. More than before for richer presence.                  */
/* ------------------------------------------------------------------ */
const floatingPills = [
  { w: 110, h: 54, x: '-34%', y: '18%', rotate: -22, delay: 0.15 },
  { w: 84,  h: 42, x: '-14%', y: '2%',  rotate: 16,  delay: 0.3  },
  { w: 95,  h: 46, x: '74%',  y: '12%', rotate: 18,  delay: 0.24 },
  { w: 120, h: 58, x: '78%',  y: '42%', rotate: -16, delay: 0.36 },
  { w: 76,  h: 38, x: '64%',  y: '68%', rotate: 20,  delay: 0.48 },
  { w: 88,  h: 44, x: '6%',   y: '72%', rotate: -14, delay: 0.54 },
  // Additional pills for richer presence
  { w: 66,  h: 32, x: '90%',  y: '26%', rotate: 12,  delay: 0.42 },
  { w: 72,  h: 36, x: '-8%',  y: '44%', rotate: -28, delay: 0.6  },
  { w: 58,  h: 28, x: '48%',  y: '78%', rotate: -10, delay: 0.66 },
]

/* ------------------------------------------------------------------ */
/*  Scattered mini-polaroids — tiny real photos peeking around the    */
/*  layout to reinforce the memories-emerging metaphor.               */
/* ------------------------------------------------------------------ */
const scatteredPolaroids = [
  { size: 52, x: '-4%',  y: '8%',  rotate: -18, delay: 0.5,  src: '/images/polaroids/dinner.jpg'    },
  { size: 44, x: '82%',  y: '6%',  rotate: 14,  delay: 0.62, src: '/images/polaroids/beach.jpg'     },
  { size: 48, x: '88%',  y: '58%', rotate: -10, delay: 0.72, src: '/images/polaroids/friends.jpg'   },
  { size: 40, x: '2%',   y: '62%', rotate: 22,  delay: 0.58, src: '/images/polaroids/adventure.jpg' },
  { size: 36, x: '42%',  y: '2%',  rotate: 8,   delay: 0.68, src: '/images/polaroids/terrace2.jpg'  },
]

export function P3Manifesto({ onNext }: P3Props) {
  return (
    <div className="h-[100dvh] flex flex-col safe-top bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.14),rgba(212,175,55,0.02)_38%,transparent_68%),linear-gradient(180deg,#FCFCFD_0%,#F1F2F6_100%)] overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full border border-[rgba(212,175,55,0.12)]" />
        <div className="absolute top-[18%] left-[14%] w-2 h-2 rounded-full bg-[rgba(212,175,55,0.28)]" />
        <div className="absolute top-[24%] right-[16%] w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.24)]" />
        <div className="absolute top-[56%] left-[20%] w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.2)]" />
        {/* Extra subtle dots */}
        <div className="absolute top-[68%] right-[22%] w-1 h-1 rounded-full bg-[rgba(212,175,55,0.16)]" />
        <div className="absolute top-[38%] left-[8%] w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.14)]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-[360px] w-full flex flex-col items-center text-center">

          {/* ====================================================== */}
          {/*  Hero illustration area — capsule + pills + polaroids  */}
          {/* ====================================================== */}
          <div className="relative w-[260px] h-[220px] mb-8">
            {/* Warm glow behind capsule */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.05) 48%, transparent 72%)',
                filter: 'blur(2px)',
              }}
            />

            {/* Floating pills with gentle continuous drift */}
            {floatingPills.map((pill, i) => (
              <motion.div
                key={`pill-${pill.x}-${pill.y}`}
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 0.9, scale: 1, y: 0 }}
                transition={{ delay: pill.delay, duration: 0.7, ease: 'easeOut' }}
                className="absolute pointer-events-none"
                style={{ left: pill.x, top: pill.y }}
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0, 2, 0],
                    rotate: [pill.rotate, pill.rotate + 1.5, pill.rotate, pill.rotate - 1, pill.rotate],
                  }}
                  transition={{
                    delay: pill.delay + 0.8,
                    duration: 5 + i * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div
                    className="relative overflow-hidden rounded-full border border-[rgba(255,255,255,0.88)] shadow-[0_10px_28px_rgba(22,22,32,0.14)]"
                    style={{
                      width: pill.w,
                      height: pill.h,
                      transform: `rotate(${pill.rotate}deg)`,
                      background: 'linear-gradient(132deg, #f6f6f8 0%, #dcdee7 46%, #c5c9d4 100%)',
                    }}
                  >
                    <div className="absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.08))]" />
                    {/* Capsule seam line */}
                    <div
                      className="absolute inset-y-[22%] left-[56%] w-[28%] rounded-full bg-[rgba(125,132,146,0.28)]"
                      style={{ filter: 'blur(0.4px)' }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}

            {/* Scattered mini-polaroids with real photos */}
            {scatteredPolaroids.map((pol) => (
              <motion.div
                key={`pol-${pol.src}`}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 0.85, scale: 1, y: 0 }}
                transition={{ delay: pol.delay, duration: 0.65, ease: 'easeOut' }}
                className="absolute pointer-events-none"
                style={{ left: pol.x, top: pol.y }}
              >
                <div
                  className="bg-white rounded-[1px] shadow-[0_3px_10px_rgba(0,0,0,0.1)]"
                  style={{
                    width: pol.size,
                    padding: '3px 3px 10px 3px',
                    transform: `rotate(${pol.rotate}deg)`,
                  }}
                >
                  <div className="relative overflow-hidden rounded-[0.5px]" style={{ width: pol.size - 6, height: pol.size - 6 }}>
                    <Image src={pol.src} alt="" fill className="object-cover" sizes={`${pol.size}px`} />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Central capsule image with breathing animation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.65 }}
              className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[180px] h-[90px]"
            >
              <motion.div
                animate={{
                  y: [0, -4, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full h-full"
              >
                <Image
                  src="/images/capsule-closed-nobg.png"
                  alt="Cápsula NUCLEA"
                  fill
                  className="object-cover drop-shadow-[0_16px_26px_rgba(20,20,26,0.22)]"
                  sizes="180px"
                />
              </motion.div>
            </motion.div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs tracking-[0.16em] uppercase text-[#8A8C93]">
              Archivo de memorias
            </div>
          </div>

          {/* ====================================================== */}
          {/*  Manifesto card                                         */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[26px] border border-[rgba(23,23,28,0.08)] bg-white/78 backdrop-blur-sm px-6 py-6 shadow-[0_14px_40px_rgba(18,18,24,0.08)]"
          >
            <p className="font-display text-xl italic text-nuclea-text-secondary leading-snug">
              Somos las historias que recordamos.
            </p>
            <p className="font-display text-xl italic text-nuclea-text-secondary leading-snug mb-5">
              Haz que las tuyas permanezcan.
            </p>
            <p className="text-base text-nuclea-text-secondary leading-relaxed">
              NUCLEA transforma tus recuerdos en legado. Un espacio íntimo donde guardar lo que importa: fotos, vídeos, mensajes y momentos que merecen perdurar.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-8 safe-bottom flex justify-center">
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}

