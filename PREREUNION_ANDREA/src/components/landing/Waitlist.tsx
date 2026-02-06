'use client'

import { motion } from 'framer-motion'
import { Mail, Sparkles } from 'lucide-react'
import WaitlistForm from '@/components/WaitlistForm'

export default function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-heading" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 text-center"
        >
          <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />

          <h2 id="waitlist-heading" className="font-display text-2xl text-[#F4E4BA] mb-4">
            Unete a la Lista de Espera
          </h2>
          <p className="text-white/60 mb-8">
            Se de los primeros en preservar tus historias.
            Acceso anticipado + 30% descuento para early adopters.
          </p>

          <WaitlistForm />
        </motion.div>
      </div>
    </section>
  )
}
