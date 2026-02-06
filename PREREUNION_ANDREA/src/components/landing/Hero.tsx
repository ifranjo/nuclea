'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

export default function Hero() {
  return (
    <section id="hero" aria-label="Bienvenida" className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <h1 className="font-display text-5xl md:text-7xl gradient-text font-semibold tracking-wider mb-6">
            NUCLEA
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/70 font-light italic mb-4">
            Capsulas Digitales del Tiempo
          </p>
          <p className="text-2xl md:text-3xl font-display text-[#F4E4BA] mb-8">
            Somos las historias que recordamos. Haz que las tuyas permanezcan.
          </p>

          {/* Badge */}
          <div className="inline-block px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BA] text-[#0D0D12] font-semibold text-sm uppercase tracking-widest rounded-full animate-pulse-gold mb-12">
            Proximamente 2026
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/registro"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            Empezar Gratis
            <ArrowRight size={18} />
          </Link>
          <button className="btn-secondary inline-flex items-center justify-center gap-2">
            <Play size={18} />
            Ver Demo
          </button>
        </motion.div>
      </div>
    </section>
  )
}
