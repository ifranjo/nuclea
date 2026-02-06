'use client'

import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'

const plans = [
  {
    name: 'Esencial',
    price: '9.99',
    period: '/mes',
    desc: 'Para preservar lo que importa',
    featured: false,
    features: [
      '2 capsulas activas',
      '5GB almacenamiento',
      'Compartir con 10 personas',
      'Soporte por email'
    ]
  },
  {
    name: 'Familiar',
    price: '24.99',
    period: '/mes',
    desc: 'Para toda la familia',
    featured: true,
    features: [
      '10 capsulas activas',
      '50GB almacenamiento',
      'Compartir ilimitado',
      '1 Avatar IA incluido',
      'Soporte prioritario'
    ]
  },
  {
    name: 'EverLife Premium',
    price: '99',
    period: 'unico',
    desc: 'Legado digital completo',
    featured: false,
    features: [
      'Capsula EverLife completa',
      'Avatar IA con tu voz',
      'Video memorial personalizado',
      'Almacenamiento perpetuo',
      'Configuracion asistida'
    ]
  }
]

export default function Pricing() {
  return (
    <section id="planes" aria-labelledby="planes-heading" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 id="planes-heading" className="font-display text-3xl text-center text-[#F4E4BA] mb-12">
          Planes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`card relative ${plan.featured ? 'border-[#D4AF37]/40' : ''}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BA] text-[#0D0D12] text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Star size={12} />
                  Recomendado
                </div>
              )}

              <h3 className="font-display text-xl text-[#D4AF37] mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-white mb-1">
                €{plan.price}
                <span className="text-sm font-normal text-white/50 ml-1">
                  {plan.period}
                </span>
              </div>
              <p className="text-white/50 text-sm mb-6">{plan.desc}</p>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check size={16} className="text-[#D4AF37] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full mt-6 ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}>
                Elegir Plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
