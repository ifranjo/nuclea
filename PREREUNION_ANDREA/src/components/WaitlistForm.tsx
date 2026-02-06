'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setLoading(true)

    try {
      await addDoc(collection(db, 'waitlist'), {
        email,
        createdAt: serverTimestamp(),
        source: 'landing-page',
        notified: false
      })

      setSubmitted(true)
      setEmail('')
      toast.success('Te has unido a la lista de espera')
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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
    </form>
  )
}
