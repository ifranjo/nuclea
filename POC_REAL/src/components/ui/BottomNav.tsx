'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, Plus, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Inicio' },
    { href: '/onboarding', icon: Plus, label: 'Crear' },
    { href: '/settings', icon: Settings, label: 'Ajustes' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nuclea-border px-6 py-2 safe-bottom z-40" style={{ height: '60px' }}>
      <div className="flex justify-around">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
                active ? 'text-nuclea-text' : 'text-nuclea-text-muted'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
