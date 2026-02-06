'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface P3Props {
  onNext: () => void
}

export function P3Manifesto({ onNext }: P3Props) {
  return (
    <div className="h-[100dvh] flex flex-col safe-top">
      {/* Content area — grows to fill, centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="max-w-[340px] w-full flex flex-col items-center text-center">
          {/* Small capsule */}
          <div className="mb-10 relative w-[150px] h-[75px]">
            <Image
              src="/images/capsule-closed-nobg.png"
              alt="Cápsula NUCLEA"
              fill
              className="object-cover"
            />
          </div>

          {/* Taglines — Cormorant Garamond italic */}
          <p className="font-display text-[22px] italic text-nuclea-text-secondary leading-snug">
            Somos las historias que recordamos.
          </p>
          <p className="font-display text-[22px] italic text-nuclea-text-secondary leading-snug mb-6">
            Haz que las tuyas permanezcan.
          </p>

          {/* Manifesto */}
          <p className="text-[15px] text-nuclea-text-secondary leading-relaxed">
            NUCLEA transforma tus recuerdos en legado. Un espacio íntimo donde guardar lo que importa: fotos, vídeos, mensajes y momentos que merecen perdurar.
          </p>
        </div>
      </div>

      {/* CTA — pinned to bottom with safe area */}
      <div className="px-8 pb-3 safe-bottom flex justify-center">
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}
