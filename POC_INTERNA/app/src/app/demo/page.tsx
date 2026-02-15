'use client'

import { useState, useRef, useCallback } from 'react'

/**
 * /demo — iPhone 15 Pro device frame wrapping the onboarding flow via iframe.
 *
 * The iframe gives the app its own viewport (393×852 screen area),
 * so all vh/vw units, 100dvh, and Framer Motion animations work
 * exactly as they would on a real iPhone.
 *
 * All features are fully functional: file uploads, audio recording,
 * note writing — all real, running locally in the iframe.
 */

/* ------------------------------------------------------------------ */
/*  Device dimensions (iPhone 15 Pro)                                  */
/*  Screen: 393×852 logical pts                                        */
/*  Bezel: 12px each side → total: 417×876                             */
/*  Rounded corners: 55px (Apple's actual spec)                        */
/* ------------------------------------------------------------------ */
const SCREEN_W = 393
const SCREEN_H = 852
const BEZEL = 12
const BODY_W = SCREEN_W + BEZEL * 2
const BODY_H = SCREEN_H + BEZEL * 2
const CORNER = 55

/* Steps for the step-jump bar */
const steps = [
  { n: 1, label: 'Cápsula', emoji: '💊' },
  { n: 2, label: 'Apertura', emoji: '✨' },
  { n: 3, label: 'Manifiesto', emoji: '📜' },
  { n: 4, label: 'Selección', emoji: '🎯' },
]

const capsuleTypes = [
  { type: 'legacy', label: 'Legacy' },
  { type: 'together', label: 'Together' },
  { type: 'social', label: 'Social' },
  { type: 'pet', label: 'Pet' },
  { type: 'life-chapter', label: 'Life Chapter' },
  { type: 'origin', label: 'Origin' },
]

export default function DemoPage() {
  const [iframeSrc, setIframeSrc] = useState('/onboarding?step=1')
  const [activeStep, setActiveStep] = useState(1)
  const [activeCapsule, setActiveCapsule] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const jumpTo = useCallback((step: number) => {
    setActiveStep(step)
    setActiveCapsule(null)
    setIframeSrc(`/onboarding?step=${step}`)
  }, [])

  const openCapsule = useCallback((type: string) => {
    setActiveCapsule(type)
    setActiveStep(0)
    setIframeSrc(`/onboarding/capsule/${type}`)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8f0] via-[#dddde8] to-[#d0d0dc] flex font-sans">

      {/* Left sidebar — navigation panel */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col p-6 gap-6 border-r border-[#d0d0d8]">
        <div>
          <h1 className="text-sm font-bold tracking-[0.16em] uppercase text-[#4a4a5a]">
            NUCLEA
          </h1>
          <p className="text-xs text-[#9999a8] mt-1">Onboarding Demo · iPhone 15 Pro</p>
        </div>

        {/* Onboarding steps */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9999a8] mb-2">Onboarding</p>
          <div className="flex flex-col gap-1">
            {steps.map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => jumpTo(s.n)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-left
                  ${activeStep === s.n && !activeCapsule
                    ? 'bg-[#2c2c2e] text-white shadow-lg'
                    : 'text-[#6b6b7b] hover:bg-white/60'
                  }
                `}
              >
                <span>{s.emoji}</span>
                <span>P{s.n} · {s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Capsule types — direct jump */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9999a8] mb-2">Cápsulas</p>
          <div className="flex flex-col gap-1">
            {capsuleTypes.map((c) => (
              <button
                key={c.type}
                type="button"
                onClick={() => openCapsule(c.type)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-left
                  ${activeCapsule === c.type
                    ? 'bg-[#D4AF37] text-white shadow-lg'
                    : 'text-[#6b6b7b] hover:bg-white/60'
                  }
                `}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-auto text-[10px] text-[#9999a8] space-y-1.5">
          <p>Haz click dentro del iPhone para navegar.</p>
          <p>Fotos, vídeo, audio y notas son funcionales.</p>
          <p className="text-[#b0b0bc]">Todo se ejecuta localmente, sin backend.</p>
        </div>
      </aside>

      {/* Center — iPhone frame */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative flex-shrink-0"
          style={{ width: BODY_W, height: BODY_H }}
        >
          {/* Phone body — Natural Titanium */}
          <div
            className="absolute inset-0 bg-[#2c2c2e]"
            style={{
              borderRadius: CORNER,
              boxShadow: `
                0 60px 120px rgba(0,0,0,0.30),
                0 20px 40px rgba(0,0,0,0.15),
                inset 0 0 0 1px rgba(255,255,255,0.08)
              `,
            }}
          >
            {/* Titanium edge catch-light */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: CORNER,
                background: `linear-gradient(
                  145deg,
                  rgba(255,255,255,0.12) 0%,
                  transparent 30%,
                  transparent 70%,
                  rgba(255,255,255,0.06) 100%
                )`,
              }}
            />
          </div>

          {/* Dynamic Island */}
          <div
            className="absolute z-30 bg-black"
            style={{
              width: 126,
              height: 37,
              borderRadius: 20,
              top: BEZEL + 10,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.9)',
            }}
          />

          {/* Left buttons — Silent switch + Volume up + Volume down */}
          <div className="absolute bg-[#3a3a3c] rounded-l-sm" style={{ width: 3, height: 28, left: -3, top: 120 }} />
          <div className="absolute bg-[#3a3a3c] rounded-l-sm" style={{ width: 3, height: 52, left: -3, top: 168 }} />
          <div className="absolute bg-[#3a3a3c] rounded-l-sm" style={{ width: 3, height: 52, left: -3, top: 228 }} />

          {/* Right button — Power / Action */}
          <div className="absolute bg-[#3a3a3c] rounded-r-sm" style={{ width: 3, height: 68, right: -3, top: 190 }} />

          {/* Screen area — iframe with own viewport */}
          <div
            className="absolute overflow-hidden bg-white"
            style={{
              top: BEZEL,
              left: BEZEL,
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: CORNER - BEZEL,
            }}
          >
            <iframe
              ref={iframeRef}
              key={iframeSrc}
              src={iframeSrc}
              title="NUCLEA Onboarding"
              className="w-full h-full border-0"
              style={{ borderRadius: CORNER - BEZEL }}
              allow="microphone; camera"
            />
          </div>

          {/* Home indicator bar */}
          <div
            className="absolute z-30 bg-black/50 rounded-full"
            style={{
              width: 134,
              height: 5,
              bottom: BEZEL + 8,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </main>
    </div>
  )
}
