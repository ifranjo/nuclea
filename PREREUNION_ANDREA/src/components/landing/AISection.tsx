'use client'

import { motion } from 'framer-motion'
import { Brain, Mic, Video, MessageSquare, Shield, Check } from 'lucide-react'

const techStack = [
  { name: 'ElevenLabs', icon: Mic, desc: 'Clonacion de voz', status: 'integrated' },
  { name: 'Wan 2.1', icon: Video, desc: 'Generacion de video', status: 'integrated' },
  { name: 'ComfyUI', icon: Brain, desc: 'Pipeline visual', status: 'integrated' },
  { name: 'Claude AI', icon: MessageSquare, desc: 'Conversaciones', status: 'coming' },
]

const statusColors = {
  integrated: 'bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20',
  coming: 'bg-amber-500/10 text-amber-400/90 border border-amber-500/20',
  research: 'bg-sky-500/10 text-sky-400/90 border border-sky-500/20',
}

const statusText = {
  integrated: 'Integrado',
  coming: 'Proximamente',
  research: 'En desarrollo',
}

export default function AISection() {
  return (
    <section id="tecnologia" aria-labelledby="tecnologia-heading" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-gold rounded-3xl p-8 md:p-12 text-center"
        >
          <Brain className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />

          <h2 id="tecnologia-heading" className="font-display text-3xl text-[#F4E4BA] mb-4">
            Tecnologia de Avatar IA
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Preserva la voz y apariencia de tus seres queridos con tecnologia de punta.
            Solo con consentimiento explicito firmado en vida.
          </p>

          {/* Tech Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {techStack.map((tech) => (
              <div key={tech.name} className="py-4 px-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <tech.icon className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-sm font-medium text-white">{tech.name}</p>
                <p className="text-xs text-white/50 mb-2">{tech.desc}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[tech.status as keyof typeof statusColors]}`}>
                  {statusText[tech.status as keyof typeof statusText]}
                </span>
              </div>
            ))}
          </div>

          {/* Consent Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-400/90" />
            <span className="text-sm text-emerald-400/90 font-medium">
              Consentimiento Explicito Garantizado
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
