'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegistroPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null)
  const [privacyAcceptedAt, setPrivacyAcceptedAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!acceptTerms || !acceptPrivacy || !termsAcceptedAt || !privacyAcceptedAt) {
      setError('Debes aceptar Terminos y Politica de Privacidad para continuar.')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, fullName, {
      termsAcceptedAt,
      privacyAcceptedAt,
      consentSource: 'signup_email',
    })

    if (error) {
      setError('Error al crear la cuenta. Inténtalo de nuevo.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl tracking-[0.3em] font-light text-nuclea-text mb-2">NUCLEA</h1>
        <p className="text-center text-nuclea-text-secondary text-sm mb-10">Crea tu cuenta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              placeholder="Homer Simpson"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              minLength={6}
              required
            />
          </div>

          <label className='flex items-start gap-3 rounded-lg border border-nuclea-border bg-white p-3'>
            <input
              type='checkbox'
              checked={acceptTerms}
              onChange={e => {
                const checked = e.target.checked
                setAcceptTerms(checked)
                setTermsAcceptedAt(checked ? new Date().toISOString() : null)
              }}
              className='mt-1'
              required
            />
            <span className='text-sm text-nuclea-text-secondary'>Acepto los Términos de Servicio</span>
          </label>

          <label className='flex items-start gap-3 rounded-lg border border-nuclea-border bg-white p-3'>
            <input
              type='checkbox'
              checked={acceptPrivacy}
              onChange={e => {
                const checked = e.target.checked
                setAcceptPrivacy(checked)
                setPrivacyAcceptedAt(checked ? new Date().toISOString() : null)
              }}
              className='mt-1'
              required
            />
            <span className='text-sm text-nuclea-text-secondary'>Acepto la Política de Privacidad</span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !acceptTerms || !acceptPrivacy}
            className="w-full py-3 rounded-lg bg-nuclea-text text-white font-medium hover:bg-nuclea-text/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-nuclea-text-secondary mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-nuclea-gold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
