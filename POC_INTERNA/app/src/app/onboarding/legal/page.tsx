'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Shield, Users, Clock, Heart, Check } from 'lucide-react'
import Image from 'next/image'

export default function LegalPage() {
  const router = useRouter()
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedBeta, setAcceptedBeta] = useState(false)

  const allAccepted = acceptedPrivacy && acceptedTerms && acceptedBeta

  const handleContinue = () => {
    if (allAccepted) {
      router.push('/onboarding?step=4')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-nuclea-bg overflow-y-auto">
      <div className="max-w-md mx-auto px-6 pt-12 pb-8">
        {/* Back navigation */}
        <Link
          href="/onboarding?step=3"
          className="inline-flex items-center gap-2 text-nuclea-text-secondary hover:text-nuclea-text transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Volver</span>
        </Link>

        {/* Header with capsule */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[80px] h-[46px] mb-6">
            <Image
              src="/images/capsule-closed-nobg.png"
              alt="NUCLEA"
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>

          <h1 className="text-[28px] font-semibold text-nuclea-text text-center leading-tight mb-3">
            Tu historia es tuya. Y solo tuya.
          </h1>

          <p className="text-base text-nuclea-text-secondary text-center leading-relaxed">
            Antes de empezar, es importante que sepas cómo protegemos lo que más te importa.
          </p>
        </div>

        {/* 4 Sections */}
        <div className="space-y-3 mb-8">
          {/* Privacidad */}
          <div className="bg-nuclea-bg-secondary rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-nuclea-bg flex items-center justify-center">
                  <Shield size={20} className="text-nuclea-text-secondary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-nuclea-text mb-1">
                  Privacidad
                </h3>
                <p className="text-sm text-nuclea-text-secondary leading-relaxed">
                  Tus recuerdos son privados por defecto. Nadie accede a tu contenido sin tu permiso explícito.
                </p>
              </div>
            </div>
          </div>

          {/* Personas designadas */}
          <div className="bg-nuclea-bg-secondary rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-nuclea-bg flex items-center justify-center">
                  <Users size={20} className="text-nuclea-text-secondary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-nuclea-text mb-1">
                  Personas designadas
                </h3>
                <p className="text-sm text-nuclea-text-secondary leading-relaxed">
                  Tú decides quién puede recibir tus cápsulas. Solo las personas que elijas tendrán acceso.
                </p>
              </div>
            </div>
          </div>

          {/* Entrega automática */}
          <div className="bg-nuclea-bg-secondary rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-nuclea-bg flex items-center justify-center">
                  <Clock size={20} className="text-nuclea-text-secondary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-nuclea-text mb-1">
                  Entrega automática
                </h3>
                <p className="text-sm text-nuclea-text-secondary leading-relaxed">
                  Los mensajes futuros se entregan en la fecha que programes. Hasta entonces, permanecen cifrados.
                </p>
              </div>
            </div>
          </div>

          {/* Responsabilidad */}
          <div className="bg-nuclea-bg-secondary rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-nuclea-bg flex items-center justify-center">
                  <Heart size={20} className="text-nuclea-text-secondary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-nuclea-text mb-1">
                  Responsabilidad
                </h3>
                <p className="text-sm text-nuclea-text-secondary leading-relaxed">
                  Nos comprometemos a tratar tu legado digital con el máximo respeto y cuidado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 mb-8">
          {/* Política de Privacidad */}
          <label className="flex gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`w-5 h-5 rounded-md border transition-all ${
                  acceptedPrivacy
                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                    : 'border-[#E5E5E5] group-hover:border-[#9A9A9A]'
                } flex items-center justify-center`}
              >
                {acceptedPrivacy && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-nuclea-text leading-relaxed">
                He leído y acepto la{' '}
                <Link
                  href="/onboarding/legal/privacy"
                  className="text-[#2563EB] underline hover:opacity-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidad
                </Link>
              </p>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            />
          </label>

          {/* Términos y Condiciones */}
          <label className="flex gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`w-5 h-5 rounded-md border transition-all ${
                  acceptedTerms
                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                    : 'border-[#E5E5E5] group-hover:border-[#9A9A9A]'
                } flex items-center justify-center`}
              >
                {acceptedTerms && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-nuclea-text leading-relaxed">
                He leído y acepto los{' '}
                <Link
                  href="/onboarding/legal/terms"
                  className="text-[#2563EB] underline hover:opacity-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  Términos y Condiciones
                </Link>
              </p>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
          </label>

          {/* Versión Beta */}
          <label className="flex gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`w-5 h-5 rounded-md border transition-all ${
                  acceptedBeta
                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                    : 'border-[#E5E5E5] group-hover:border-[#9A9A9A]'
                } flex items-center justify-center`}
              >
                {acceptedBeta && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-nuclea-text leading-relaxed">
                Entiendo que esta es una versión beta y que algunas funcionalidades pueden cambiar
              </p>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={acceptedBeta}
              onChange={(e) => setAcceptedBeta(e.target.checked)}
            />
          </label>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!allAccepted}
          className={`w-full max-w-xs mx-auto block bg-transparent border-[1.5px] border-[#1A1A1A] rounded-lg py-4 px-8 text-base font-medium text-nuclea-text transition-all ${
            allAccepted
              ? 'hover:bg-[#1A1A1A] hover:text-white'
              : 'opacity-40 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
