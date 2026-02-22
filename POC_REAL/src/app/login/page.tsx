'use client'
import { useState, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push(redirect || '/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl tracking-[0.3em] font-light text-nuclea-text mb-2">NUCLEA</h1>
        <p className="text-center text-nuclea-text-secondary text-sm mb-10">Tu legado digital, protegido</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-nuclea-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-nuclea-border bg-white text-nuclea-text focus:outline-none focus:ring-2 focus:ring-nuclea-gold/50"
              placeholder="homer@nuclea.test"
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
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-nuclea-text text-white font-medium hover:bg-nuclea-text/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-nuclea-text-secondary mt-6">
          ¿No tienes cuenta?{' '}
          <Link href={redirect ? `/registro?redirect=${encodeURIComponent(redirect)}` : '/registro'} className="text-nuclea-gold hover:underline">Regístrate</Link>
        </p>

        <div className="mt-10 pt-6 border-t border-nuclea-border">
          <p className="text-center text-xs text-nuclea-text-muted">Usuarios de prueba</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-nuclea-text-secondary">
            {['Homer', 'Marge', 'Bart', 'Lisa', 'Maggie'].map(name => (
              <button
                key={name}
                type="button"
                onClick={() => { setEmail(`${name.toLowerCase()}@nuclea.test`); setPassword('nuclea123') }}
                className="py-2 px-3 rounded border border-nuclea-border hover:bg-nuclea-secondary transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  )
}
