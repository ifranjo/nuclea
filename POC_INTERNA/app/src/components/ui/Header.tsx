'use client'

import { Menu } from 'lucide-react'

export function Header() {
  return (
    <header className="safe-top flex items-center justify-between px-5 pb-2 pt-3">
      <button
        className="w-11 h-11 flex items-center justify-center text-nuclea-text"
        aria-label="Menú"
        tabIndex={-1}
      >
        <Menu size={22} strokeWidth={1.5} />
      </button>
      <span className="text-[15px] font-semibold tracking-[2.5px] text-nuclea-text select-none uppercase">
        NUCLEA
      </span>
      <div className="w-11" />
    </header>
  )
}
