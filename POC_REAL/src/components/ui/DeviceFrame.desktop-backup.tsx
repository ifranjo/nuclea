'use client'

import { type ReactNode } from 'react'

interface DeviceFrameProps {
  children: ReactNode
}

/**
 * iPhone 15 Pro-style device frame wrapper.
 * - Desktop (md+): renders the app inside a realistic phone chrome
 * - Mobile (<md): renders children fullscreen (no frame)
 *
 * Uses a single render of children to avoid duplicated state/animations.
 * The frame is purely decorative CSS around the content.
 */
export function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div className="device-frame-root">
      {/* Desktop background — only visible at md+ */}
      <div className="hidden md:block fixed inset-0 bg-gradient-to-br from-[#f0f0f5] via-[#e8e8f0] to-[#dddde8] -z-10" />

      {/* Phone chrome — only visible at md+ */}
      <div className="
        md:flex md:items-center md:justify-center md:min-h-screen
      ">
        <div className="
          relative
          md:border-[12px] md:border-[#2c2c2e] md:bg-[#2c2c2e]
          md:rounded-[3rem]
          md:shadow-[0_50px_100px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_0_0_1px_rgba(0,0,0,0.3)]
          md:w-[390px] md:h-[844px]
        ">
          {/* Titanium edge highlight — desktop only */}
          <div className="hidden md:block absolute -inset-[1px] rounded-[3rem] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          {/* Dynamic Island */}
          <div className="hidden md:block absolute top-[10px] left-1/2 -translate-x-1/2 z-50 w-[126px] h-[37px] bg-black rounded-full"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.95)' }}
          />

          {/* Left side buttons */}
          <div className="hidden md:block absolute -left-[15px] top-[100px] w-[3px] h-[30px] bg-[#3a3a3c] rounded-l-sm" />
          <div className="hidden md:block absolute -left-[15px] top-[148px] w-[3px] h-[54px] bg-[#3a3a3c] rounded-l-sm" />
          <div className="hidden md:block absolute -left-[15px] top-[210px] w-[3px] h-[54px] bg-[#3a3a3c] rounded-l-sm" />

          {/* Right side button — power */}
          <div className="hidden md:block absolute -right-[15px] top-[172px] w-[3px] h-[72px] bg-[#3a3a3c] rounded-r-sm" />

          {/* Screen area — always rendered, frame only decorative */}
          <div className="
            w-full h-full
            md:rounded-[2.25rem] md:overflow-hidden
            bg-white
          ">
            {children}
          </div>

          {/* Bottom bar indicator */}
          <div className="hidden md:block absolute bottom-[6px] left-1/2 -translate-x-1/2 z-50 w-[134px] h-[5px] bg-black/60 rounded-full" />
        </div>
      </div>
    </div>
  )
}
