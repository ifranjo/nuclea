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
        rounded-lg text-[16px] font-medium text-nuclea-text
        transition-all duration-200 ease-out
        hover:bg-nuclea-text hover:text-white
        active:opacity-70 active:scale-[0.97]
        ${className}
      `}
    >
      {children}
    </button>
  )
}
