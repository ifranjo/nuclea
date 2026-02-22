'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <section id="planes" aria-labelledby="planes-heading" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 id="planes-heading" className="font-display text-3xl text-center text-[#F4E4BA] mb-12">
          Pago unico
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="card relative border-[#D4AF37]/40"
        >
          <h3 className="font-display text-xl text-[#D4AF37] mb-2">
            Video Regalo
          </h3>
          <div className="text-3xl font-bold text-white mb-1">
            Precio unico
          </div>
          <p className="text-white/50 text-sm mb-6">Sin suscripcion mensual ni anual</p>

          <ul className="space-y-3">
            {[
              'Mini-trailer gratuito',
              'Pago puntual para desbloquear descarga',
              'Sin renovacion automatica',
              'Experiencia 1:1 receptor',
              'Soporte por email'
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-white/70">
                <Check size={16} className="text-[#D4AF37] flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button className="w-full mt-6 btn-primary">
            Desbloquear Video Regalo
          </button>
        </motion.div>
      </div>
    </section>
  )
}
