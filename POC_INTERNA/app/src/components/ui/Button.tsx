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
        w-full max-w-[320px] px-8 py-4
        bg-transparent border-[1.5px] border-nuclea-text
        rounded-lg text-base font-medium text-nuclea-text
        transition-colors duration-200 ease-out
        hover:bg-nuclea-text hover:text-white
        active:opacity-70 active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nuclea-gold focus-visible:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  )
}

