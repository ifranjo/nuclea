'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface P3Props {
  onNext: () => void
}

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

