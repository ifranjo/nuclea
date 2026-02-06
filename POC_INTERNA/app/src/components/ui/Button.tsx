'use client'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function Button({ children, onClick, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full max-w-[340px] px-8 py-[14px]
        bg-nuclea-text border-0
        rounded-[14px] text-[17px] font-semibold text-white
        transition-all duration-200 ease-out
        active:opacity-70 active:scale-[0.97]
        ${className}
      `}
    >
      {children}
    </button>
  )
}
