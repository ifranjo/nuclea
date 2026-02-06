'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useState, useCallback, memo } from 'react'
import { useAuth } from '@/hooks/useAuth'

function Header() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl gradient-text font-semibold tracking-wider">
              NUCLEA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/capsulas" className="text-white/70 hover:text-white transition-colors">
              Capsulas
            </Link>
            <Link href="/planes" className="text-white/70 hover:text-white transition-colors">
              Planes
            </Link>
            <Link href="/sobre-nosotros" className="text-white/70 hover:text-white transition-colors">
              Nosotros
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-white/70 hover:text-white">
                    <User size={20} />
                    <span className="text-sm">{user.displayName}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 py-2 glass rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/perfil" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">
                      Mi Perfil
                    </Link>
                    <Link href="/configuracion" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">
                      Configuracion
                    </Link>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Cerrar sesion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                  Iniciar sesion
                </Link>
                <Link href="/registro" className="btn-primary text-sm py-2 px-4">
                  Empezar gratis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="flex flex-col gap-4">
              <Link href="/capsulas" className="text-white/70 hover:text-white py-2">
                Capsulas
              </Link>
              <Link href="/planes" className="text-white/70 hover:text-white py-2">
                Planes
              </Link>
              <Link href="/sobre-nosotros" className="text-white/70 hover:text-white py-2">
                Nosotros
              </Link>
              <hr className="border-white/10" />
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-secondary text-center">
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-red-400 hover:text-red-300 py-2 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white/70 hover:text-white py-2">
                    Iniciar sesion
                  </Link>
                  <Link href="/registro" className="btn-primary text-center">
                    Empezar gratis
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  )
}

export default memo(Header)
