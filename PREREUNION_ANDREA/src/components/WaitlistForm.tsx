'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return
    if (!acceptedPrivacy) {
      toast.error('Debes aceptar privacidad y terminos para unirte a la lista')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'landing-page',
          acceptedPrivacy,
          consentVersion: '1.0',
        }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Error al unirse a la lista de espera')
      }

      setSubmitted(true)
      setEmail('')
      toast.success(payload?.existing ? 'Ya estabas en la lista de espera' : 'Te has unido a la lista de espera')
    } catch (error) {
      console.error('Error adding to waitlist:', error)
      toast.error('Error al unirse a la lista de espera')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
        <h3 className="text-xl font-display text-[#F4E4BA] mb-2">
          Estas en la lista
        </h3>
        <p className="text-white/60">
          Te notificaremos cuando lancemos. Acceso anticipado + 30% descuento garantizado.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="input flex-1"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="spinner w-4 h-4" />
              Enviando...
            </span>
          ) : (
            'Reservar mi lugar'
          )}
        </button>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-white/65">
        <input
          type="checkbox"
          checked={acceptedPrivacy}
          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
          disabled={loading}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-nuclea-gold focus:ring-nuclea-gold"
          required
        />
        <span>
          Acepto la{' '}
          <Link href="/privacidad" className="text-nuclea-gold hover:underline">
            politica de privacidad
          </Link>{' '}
          y los{' '}
          <Link href="/terminos" className="text-nuclea-gold hover:underline">
            terminos de servicio
          </Link>
          .
        </span>
      </label>
    </form>
  )
}
