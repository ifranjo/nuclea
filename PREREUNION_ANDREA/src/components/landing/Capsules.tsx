'use client'

import { motion } from 'framer-motion'
import { CapsuleIconBox } from '@/components/icons/CapsuleIcons'
import { CAPSULE_TYPES } from '@/types'
import type { CapsuleType } from '@/types'

const capsuleEntries = Object.entries(CAPSULE_TYPES) as [CapsuleType, typeof CAPSULE_TYPES[CapsuleType]][]

export default function Capsules() {
  return (
    <section id="capsulas" aria-labelledby="capsulas-heading" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 id="capsulas-heading" className="font-display text-3xl text-center text-[#F4E4BA] mb-12">
          5 Tipos de Capsulas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {capsuleEntries.map(([key, type], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card text-center group"
            >
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                <CapsuleIconBox type={key} size={32} />
              </div>
              <h3 className="font-display text-xl text-[#D4AF37] mb-2">
                {type.name}
              </h3>
              <p className="text-sm text-white/60">
                {type.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
