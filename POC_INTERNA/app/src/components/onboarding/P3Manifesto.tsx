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
    <div className="h-[100dvh] flex flex-col safe-top bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.14),rgba(212,175,55,0.02)_38%,transparent_68%),linear-gradient(180deg,#FCFCFD_0%,#F1F2F6_100%)] overflow-y-auto">
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative">
        <div className="max-w-[360px] w-full flex flex-col items-center text-center space-y-6">

          {/* ====================================================== */}
          {/*  Small capsule image at top                            */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-[80px] h-[40px]"
          >
            <Image
              src="/images/capsule-closed-nobg.png"
              alt="Cápsula NUCLEA"
              fill
              className="object-cover"
              sizes="80px"
            />
          </motion.div>

          {/* ====================================================== */}
          {/*  Main heading and subheading                           */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">
              Somos las historias que recordamos.
            </h1>
            <h2 className="text-xl font-medium text-[#3D3D3D]">
              Haz que las tuyas permanezcan.
            </h2>
          </motion.div>

          {/* ====================================================== */}
          {/*  Small separator line                                  */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="w-[40px] h-[1px] bg-[#D4D4D4]"
          />

          {/* ====================================================== */}
          {/*  Main paragraphs                                       */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-base text-[#6B6B6B] leading-relaxed">
              NUCLEA es un espacio íntimo donde guardar lo que de verdad importa.
            </p>
            <p className="text-base text-[#6B6B6B] leading-relaxed">
              Creamos cápsulas emocionales para conservar recuerdos, palabras, imágenes y voces que definen quién eres y a quién amas.
            </p>
          </motion.div>

          {/* ====================================================== */}
          {/*  Three poetic lines                                    */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="space-y-3"
          >
            <p className="text-base font-medium text-[#4A4A4A]">
              Momentos que no quieres olvidar.
            </p>
            <p className="text-base font-medium text-[#4A4A4A]">
              Mensajes para el futuro.
            </p>
            <p className="text-base font-medium text-[#4A4A4A]">
              Historias que merecen quedarse.
            </p>
          </motion.div>

          {/* ====================================================== */}
          {/*  Second separator line                                 */}
          {/* ====================================================== */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="w-[40px] h-[1px] bg-[#D4D4D4]"
          />

          {/* ====================================================== */}
          {/*  Closing statement                                     */}
          {/* ====================================================== */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="text-lg font-semibold text-[#1A1A1A]"
          >
            NUCLEA transforma recuerdos en legado.
          </motion.p>
        </div>
      </div>

      <div className="px-6 pb-8 safe-bottom flex justify-center">
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}

