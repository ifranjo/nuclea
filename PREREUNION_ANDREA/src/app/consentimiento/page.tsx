'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface ActiveConsent {
  consentId: string
  voiceConsent: boolean
  faceConsent: boolean
  personalityConsent: boolean
  consentVersion: string
  signedAt: string
}

export default function ConsentimientoPage() {
  const { firebaseUser, loading: authLoading } = useAuth()

  const [voiceConsent, setVoiceConsent] = useState(false)
  const [faceConsent, setFaceConsent] = useState(false)
  const [personalityConsent, setPersonalityConsent] = useState(false)

  // API states
  const [submitting, setSubmitting] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [loadingConsent, setLoadingConsent] = useState(false)
  const [activeConsent, setActiveConsent] = useState<ActiveConsent | null>(null)
  const [signedConsentId, setSignedConsentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  const allChecked = voiceConsent && faceConsent && personalityConsent
  const anyChecked = voiceConsent || faceConsent || personalityConsent

  // Fetch token helper
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null
    try {
      return await firebaseUser.getIdToken()
    } catch {
      return null
    }
  }, [firebaseUser])

  // Load active consent on mount (when user is authenticated)
  useEffect(() => {
    if (authLoading || !firebaseUser) return

    let cancelled = false

    async function fetchConsent() {
      setLoadingConsent(true)
      try {
        const token = await firebaseUser!.getIdToken()
        const res = await fetch('/api/consent/biometric', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Error al cargar el consentimiento')

        const data = await res.json()

        if (!cancelled) {
          if (data.hasActiveConsent && data.consent) {
            setActiveConsent(data.consent)
          } else {
            setActiveConsent(null)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching consent:', err)
        }
      } finally {
        if (!cancelled) setLoadingConsent(false)
      }
    }

    fetchConsent()
    return () => { cancelled = true }
  }, [firebaseUser, authLoading])

  async function handleSign() {
    if (!anyChecked) return

    setError(null)
    setSubmitting(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('No se pudo obtener el token de autenticacion')
        return
      }

      const res = await fetch('/api/consent/biometric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voiceConsent, faceConsent, personalityConsent }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar el consentimiento')
        return
      }

      setSignedConsentId(data.consentId)
      setActiveConsent({
        consentId: data.consentId,
        voiceConsent,
        faceConsent,
        personalityConsent,
        consentVersion: '2.0',
        signedAt: data.signedAt,
      })
    } catch {
      setError('Error de red al registrar el consentimiento')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke() {
    if (!activeConsent) return

    setError(null)
    setRevoking(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        setError('No se pudo obtener el token de autenticacion')
        return
      }

      const res = await fetch('/api/consent/biometric', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consentId: activeConsent.consentId,
          ...(revokeReason.trim() ? { reason: revokeReason.trim() } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al revocar el consentimiento')
        return
      }

      setActiveConsent(null)
      setSignedConsentId(null)
      setShowRevokeConfirm(false)
      setRevokeReason('')
      setVoiceConsent(false)
      setFaceConsent(false)
      setPersonalityConsent(false)
    } catch {
      setError('Error de red al revocar el consentimiento')
    } finally {
      setRevoking(false)
    }
  }

  const isAuthenticated = !!firebaseUser
  const hasActiveConsent = !!activeConsent || !!signedConsentId

  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">
          Consentimiento para Avatar IA
        </h1>
        <p className="text-white/40 text-sm mb-4">
          Consentimiento expl&iacute;cito conforme al Art&iacute;culo 9.2.a del RGPD (UE) 2016/679
        </p>
        <p className="text-white/40 text-sm mb-10">
          &Uacute;ltima actualizaci&oacute;n: febrero 2026 &middot; Versi&oacute;n 2.0
        </p>

        <div className="space-y-8 text-white/70 text-[15px] leading-relaxed">

          {/* Introduction */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Informaci&oacute;n previa al consentimiento
            </h2>
            <p className="mb-3">
              El servicio Avatar IA de NUCLEA permite crear una representaci&oacute;n digital del usuario
              mediante inteligencia artificial, dise&ntilde;ada para interactuar con sus seres queridos
              de forma post-mortem o en situaciones predefinidas por el usuario.
            </p>
            <p>
              Para la creaci&oacute;n de este avatar, es necesario procesar{' '}
              <strong className="text-white/90">datos biom&eacute;tricos</strong>, que constituyen datos de
              categor&iacute;a especial conforme al Art&iacute;culo 9 del Reglamento General de
              Protecci&oacute;n de Datos (RGPD). El tratamiento de estos datos requiere tu consentimiento
              expl&iacute;cito, libre, espec&iacute;fico e informado.
            </p>
          </section>

          {/* What data */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Datos biom&eacute;tricos que se tratar&aacute;n
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <h3 className="text-white text-sm font-semibold mb-2">1. Datos de voz</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Grabaciones de audio de tu voz natural</li>
                  <li>Procesadas por <strong className="text-white/90">ElevenLabs</strong> (EE.UU.) para clonaci&oacute;n vocal</li>
                  <li>Finalidad: generar una r&eacute;plica de tu voz para que el Avatar IA pueda comunicarse verbalmente</li>
                  <li>Transferencia internacional a EE.UU. bajo cl&aacute;usulas contractuales tipo (Art. 46.2.c RGPD)</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <h3 className="text-white text-sm font-semibold mb-2">2. Datos de imagen facial</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Fotograf&iacute;as y v&iacute;deos de tu rostro</li>
                  <li>Utilizados para la generaci&oacute;n de v&iacute;deo del Avatar IA</li>
                  <li>Finalidad: crear una representaci&oacute;n visual que reproduzca tu apariencia</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <h3 className="text-white text-sm font-semibold mb-2">3. Datos de personalidad</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Textos, patrones de comunicaci&oacute;n y preferencias personales</li>
                  <li>Proporcionados voluntariamente para el entrenamiento del modelo de personalidad</li>
                  <li>Finalidad: que el Avatar IA refleje tu forma de expresarte y tus valores</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Purpose */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Prop&oacute;sito del tratamiento
            </h2>
            <p>
              Los datos biom&eacute;tricos se procesan con la &uacute;nica finalidad de crear un Avatar IA
              que represente al usuario de forma post-mortem o en situaciones predefinidas. Este avatar
              permite a los seres queridos del usuario interactuar con una representaci&oacute;n digital
              que reproduce su voz, apariencia y personalidad.
            </p>
          </section>

          {/* Responsible */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Responsable y encargados del tratamiento
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Responsable:</strong> NUCLEA (Imanol Franjo &Aacute;lvarez y Andrea Box L&oacute;pez)</li>
              <li><strong className="text-white/90">Encargado (voz):</strong> ElevenLabs, Inc. (EE.UU.) &mdash; clonaci&oacute;n vocal</li>
              <li><strong className="text-white/90">Encargado (almacenamiento):</strong> Google Cloud (Firebase) &mdash; regi&oacute;n europe-west1 (UE)</li>
            </ul>
          </section>

          {/* Rights */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Derecho a retirar el consentimiento
            </h2>
            <div className="p-4 rounded-lg border border-nuclea-gold/20 bg-nuclea-gold/[0.03] mb-4">
              <p className="text-white/80 text-sm">
                <strong className="text-nuclea-gold">Importante:</strong> Puedes retirar tu consentimiento
                en cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el
                consentimiento previo a su retirada (Art. 7.3 RGPD).
              </p>
            </div>
            <p className="mb-3">
              Para retirar tu consentimiento, puedes:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Utilizar el boton de revocacion en esta misma pagina</li>
              <li>Escribir a <span className="text-nuclea-gold">privacidad@nuclea.app</span></li>
              <li>Utilizar la opci&oacute;n de revocaci&oacute;n en la configuraci&oacute;n de tu cuenta</li>
            </ul>
            <h3 className="text-white text-base font-semibold mb-2">Consecuencias de la retirada</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Desactivaci&oacute;n inmediata</strong> del Avatar IA: dejar&aacute; de estar disponible para interacciones.</li>
              <li><strong className="text-white/90">Eliminaci&oacute;n de datos biom&eacute;tricos</strong> de nuestros servidores en un plazo m&aacute;ximo de 30 d&iacute;as.</li>
              <li><strong className="text-white/90">Solicitud de eliminaci&oacute;n</strong> a los encargados del tratamiento (ElevenLabs) para que eliminen los datos en sus sistemas.</li>
              <li><strong className="text-white/90">Sin afectaci&oacute;n</strong> al resto de funcionalidades de tu cuenta NUCLEA (c&aacute;psulas, contenido, etc.).</li>
            </ul>
          </section>

          {/* Consent checkboxes / status */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Otorgamiento del consentimiento
            </h2>

            {/* Not authenticated */}
            {!authLoading && !isAuthenticated && (
              <div className="p-6 rounded-xl border border-nuclea-gold/20 bg-nuclea-gold/[0.03]">
                <p className="text-white/70 text-sm mb-3">
                  Para firmar el consentimiento biometrico, necesitas iniciar sesion en tu cuenta NUCLEA.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4E4BA] text-[#0D0D12] font-medium text-sm hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)] transition-all duration-300"
                >
                  Iniciar sesion
                </Link>
              </div>
            )}

            {/* Loading auth or consent */}
            {(authLoading || loadingConsent) && isAuthenticated && (
              <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-nuclea-gold/40 border-t-nuclea-gold rounded-full animate-spin" />
                <span className="text-white/50 text-sm">Cargando estado del consentimiento...</span>
              </div>
            )}

            {/* Active consent — show signed state */}
            {isAuthenticated && !authLoading && !loadingConsent && hasActiveConsent && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/[0.05]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-green-400 font-semibold">Consentimiento firmado</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-3">
                    Has otorgado tu consentimiento explicito para el tratamiento de datos biometricos.
                  </p>
                  {activeConsent && (
                    <div className="space-y-1 text-xs text-white/40">
                      <p>ID de consentimiento: <span className="text-white/60 font-mono">{activeConsent.consentId}</span></p>
                      <p>Version: {activeConsent.consentVersion}</p>
                      {activeConsent.signedAt && (
                        <p>Firmado: {new Date(activeConsent.signedAt).toLocaleString('es-ES')}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-white/50">
                        {activeConsent.voiceConsent && <span>Voz</span>}
                        {activeConsent.faceConsent && <span>Imagen facial</span>}
                        {activeConsent.personalityConsent && <span>Personalidad</span>}
                      </div>
                    </div>
                  )}
                  {signedConsentId && !activeConsent && (
                    <p className="text-xs text-white/40">
                      ID de consentimiento: <span className="text-white/60 font-mono">{signedConsentId}</span>
                    </p>
                  )}
                </div>

                {/* Revocation section */}
                {activeConsent && (
                  <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/[0.03]">
                    <h3 className="text-red-400/80 font-semibold text-sm mb-2">Revocar consentimiento</h3>
                    <p className="text-white/50 text-xs mb-4">
                      Puedes revocar tu consentimiento en cualquier momento. Esta accion desactivara tu Avatar IA
                      y eliminara tus datos biometricos de nuestros servidores.
                    </p>

                    {!showRevokeConfirm ? (
                      <button
                        onClick={() => setShowRevokeConfirm(true)}
                        className="px-5 py-2 rounded-lg border border-red-500/30 text-red-400/80 text-sm hover:bg-red-500/10 transition-colors"
                      >
                        Revocar consentimiento
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          placeholder="Motivo de la revocacion (opcional)"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/70 text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-red-500/30"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleRevoke}
                            disabled={revoking}
                            className="px-5 py-2 rounded-lg bg-red-600/80 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {revoking && (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Confirmar revocacion
                          </button>
                          <button
                            onClick={() => { setShowRevokeConfirm(false); setRevokeReason('') }}
                            className="px-5 py-2 rounded-lg border border-white/[0.08] text-white/50 text-sm hover:text-white/70 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No active consent — show form */}
            {isAuthenticated && !authLoading && !loadingConsent && !hasActiveConsent && (
              <>
                <p className="mb-4">
                  Marca cada casilla de forma individual para otorgar tu consentimiento expl&iacute;cito para
                  cada categor&iacute;a de datos biom&eacute;tricos:
                </p>

                <div className="space-y-4">
                  {/* Voice consent */}
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-nuclea-gold/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={voiceConsent}
                      onChange={(e) => setVoiceConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-nuclea-gold focus:ring-nuclea-gold/50 accent-[#D4AF37]"
                    />
                    <div>
                      <span className="text-white text-sm font-semibold block mb-1">
                        Datos de voz
                      </span>
                      <span className="text-white/60 text-sm">
                        Consiento de forma expl&iacute;cita el tratamiento de mis grabaciones de voz para la
                        clonaci&oacute;n vocal mediante ElevenLabs, incluyendo la transferencia internacional
                        de estos datos a EE.UU. bajo cl&aacute;usulas contractuales tipo.
                      </span>
                    </div>
                  </label>

                  {/* Face consent */}
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-nuclea-gold/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={faceConsent}
                      onChange={(e) => setFaceConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-nuclea-gold focus:ring-nuclea-gold/50 accent-[#D4AF37]"
                    />
                    <div>
                      <span className="text-white text-sm font-semibold block mb-1">
                        Datos de imagen facial
                      </span>
                      <span className="text-white/60 text-sm">
                        Consiento de forma expl&iacute;cita el tratamiento de mis fotograf&iacute;as y
                        v&iacute;deos faciales para la generaci&oacute;n de v&iacute;deo del Avatar IA.
                      </span>
                    </div>
                  </label>

                  {/* Personality consent */}
                  <label className="flex items-start gap-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-nuclea-gold/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={personalityConsent}
                      onChange={(e) => setPersonalityConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-nuclea-gold focus:ring-nuclea-gold/50 accent-[#D4AF37]"
                    />
                    <div>
                      <span className="text-white text-sm font-semibold block mb-1">
                        Datos de personalidad
                      </span>
                      <span className="text-white/60 text-sm">
                        Consiento de forma expl&iacute;cita el tratamiento de mis textos, patrones de
                        comunicaci&oacute;n y preferencias personales para el entrenamiento del modelo de
                        personalidad del Avatar IA.
                      </span>
                    </div>
                  </label>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/[0.05]">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Sign button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSign}
                      disabled={!anyChecked || submitting}
                      className={`
                        w-full py-4 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                        ${anyChecked && !submitting
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4E4BA] text-[#0D0D12] hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)] hover:scale-[1.01]'
                          : 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/[0.06]'
                        }
                      `}
                    >
                      {submitting && (
                        <div className="w-4 h-4 border-2 border-[#0D0D12]/30 border-t-[#0D0D12] rounded-full animate-spin" />
                      )}
                      {submitting
                        ? 'Registrando consentimiento...'
                        : anyChecked
                          ? 'Firmar consentimiento'
                          : 'Selecciona los datos para los que otorgas consentimiento'
                      }
                    </button>
                    {!anyChecked && (
                      <p className="text-white/40 text-xs text-center mt-3">
                        Debes marcar al menos una casilla de consentimiento para firmar. Cada casilla
                        representa un consentimiento espec&iacute;fico e independiente conforme al Art. 9.2.a RGPD.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Error display (for revocation errors) */}
          {error && hasActiveConsent && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/[0.05]">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Legal references */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Base legal y referencias normativas
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Reglamento (UE) 2016/679 (RGPD), Art&iacute;culo 9.2.a &mdash; Consentimiento expl&iacute;cito para datos de categor&iacute;a especial</li>
              <li>Reglamento (UE) 2016/679 (RGPD), Art&iacute;culo 7 &mdash; Condiciones del consentimiento</li>
              <li>Reglamento (UE) 2016/679 (RGPD), Art&iacute;culos 44-49 &mdash; Transferencias internacionales</li>
              <li>Ley Org&aacute;nica 3/2018 (LOPDGDD), disposiciones complementarias al RGPD</li>
            </ul>
          </section>

          {/* Additional info */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">
              Informaci&oacute;n adicional
            </h2>
            <p>
              Para informaci&oacute;n completa sobre el tratamiento de tus datos personales, consulta nuestra{' '}
              <Link href="/privacidad" className="text-nuclea-gold hover:underline">
                Pol&iacute;tica de Privacidad
              </Link>{' '}
              y los{' '}
              <Link href="/terminos" className="text-nuclea-gold hover:underline">
                T&eacute;rminos de Servicio
              </Link>.
              Para cualquier consulta, contacta con{' '}
              <span className="text-nuclea-gold">privacidad@nuclea.app</span>.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white/30 text-xs">
          <span>NUCLEA &copy; 2026. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-nuclea-gold transition-colors">
              Pol&iacute;tica de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-nuclea-gold transition-colors">
              T&eacute;rminos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
