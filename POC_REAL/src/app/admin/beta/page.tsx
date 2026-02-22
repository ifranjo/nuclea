'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// --- Types ---

interface Invitation {
  id: string
  email: string
  status: string
  cohort: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

interface BetaAccessEntry {
  id: string
  user_id: string
  enabled: boolean
  cohort: string
  granted_at: string
  revoked_at: string | null
  users: { email: string; full_name: string | null }
}

interface AuditEntry {
  id: string
  event: string
  email: string | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type TabId = 'invitations' | 'access' | 'audit'

// --- Helpers ---

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    revoked: 'bg-red-100 text-red-700',
    expired: 'bg-amber-100 text-amber-600',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function auditEventBadge(event: string) {
  const map: Record<string, string> = {
    invited: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    revoked: 'bg-red-100 text-red-700',
    access_granted: 'bg-emerald-100 text-emerald-700',
    access_revoked: 'bg-red-100 text-red-700',
    login_failed: 'bg-orange-100 text-orange-700',
    token_expired: 'bg-amber-100 text-amber-600',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${map[event] || 'bg-gray-100 text-gray-500'}`}>
      {event}
    </span>
  )
}

// --- Tab Button ---

function TabButton({ id, label, active, onClick }: { id: TabId; label: string; active: boolean; onClick: (id: TabId) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

// --- Stats Card ---

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-w-[120px]">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// --- Toast ---

function Toast({ message, ok, onClose }: { message: string; ok: boolean; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm shadow-lg border transition-all ${
      ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {message}
    </div>
  )
}

// --- Main Component ---

export default function AdminBetaPage() {
  // Auth state
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  // Tab
  const [activeTab, setActiveTab] = useState<TabId>('invitations')

  // Data
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [accessEntries, setAccessEntries] = useState<BetaAccessEntry[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditOffset, setAuditOffset] = useState(0)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditEmailFilter, setAuditEmailFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteCohort, setInviteCohort] = useState('beta-1')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; message: string; url?: string } | null>(null)

  // Action states
  const [revoking, setRevoking] = useState<string | null>(null)
  const [resending, setResending] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null)

  // Try loading key from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('nuclea_admin_key')
    if (stored) {
      setAdminKey(stored)
      setAuthenticated(true)
    }
  }, [])

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
  }), [adminKey])

  // --- Stats ---

  const stats = useMemo(() => {
    const pending = invitations.filter(i => i.status === 'pending').length
    const accepted = invitations.filter(i => i.status === 'accepted').length
    const revoked = invitations.filter(i => i.status === 'revoked').length
    const expired = invitations.filter(i => i.status === 'expired').length
    const activeBeta = accessEntries.filter(a => a.enabled).length
    return { total: invitations.length, pending, accepted, revoked, expired, activeBeta }
  }, [invitations, accessEntries])

  // --- Auth ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    const res = await fetch('/api/beta/invite', { headers: { 'x-admin-key': adminKey } })
    if (res.ok) {
      sessionStorage.setItem('nuclea_admin_key', adminKey)
      setAuthenticated(true)
    } else {
      setAuthError('Clave incorrecta o API no disponible.')
    }
  }

  // --- Data fetching ---

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [invRes, accessRes] = await Promise.all([
        fetch('/api/beta/invite', { headers: { 'x-admin-key': adminKey } }),
        fetch('/api/beta/access', { headers: { 'x-admin-key': adminKey } }),
      ])

      if (invRes.ok) {
        const invData = await invRes.json()
        setInvitations(invData.invitations || [])
      }
      if (accessRes.ok) {
        const accData = await accessRes.json()
        setAccessEntries(accData.access || [])
      }
    } catch {
      setToast({ ok: false, message: 'Error de conexion al cargar datos.' })
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  const fetchAuditLog = useCallback(async (offset: number = 0, append: boolean = false) => {
    setAuditLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50', offset: String(offset) })
      if (auditEmailFilter.trim()) {
        params.set('email', auditEmailFilter.trim())
      }
      const res = await fetch(`/api/beta/audit?${params}`, {
        headers: { 'x-admin-key': adminKey },
      })
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setAuditEntries(prev => [...prev, ...(data.entries || [])])
        } else {
          setAuditEntries(data.entries || [])
        }
        setAuditTotal(data.total ?? 0)
        setAuditOffset(offset + (data.entries?.length || 0))
      }
    } catch {
      setToast({ ok: false, message: 'Error al cargar registro de auditoria.' })
    } finally {
      setAuditLoading(false)
    }
  }, [adminKey, auditEmailFilter])

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated, fetchData])

  // Load audit on tab switch
  useEffect(() => {
    if (authenticated && activeTab === 'audit' && auditEntries.length === 0) {
      fetchAuditLog(0)
    }
  }, [authenticated, activeTab, auditEntries.length, fetchAuditLog])

  // --- Actions ---

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    setInviteResult(null)
    setCopiedUrl(false)

    try {
      const res = await fetch('/api/beta/invite', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: inviteEmail.trim(), cohort: inviteCohort }),
      })
      const data = await res.json()

      if (res.ok) {
        setInviteResult({
          ok: true,
          message: 'Invitacion enviada correctamente.',
          url: data.inviteUrl,
        })
        setInviteEmail('')
        fetchData()
      } else {
        setInviteResult({ ok: false, message: data.error || 'Error al enviar invitacion.' })
      }
    } catch {
      setInviteResult({ ok: false, message: 'Error de conexion.' })
    } finally {
      setInviting(false)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch {
      // Fallback: select the code element text
      setToast({ ok: false, message: 'No se pudo copiar. Selecciona manualmente.' })
    }
  }

  const handleResendInvitation = async (email: string) => {
    setResending(email)
    try {
      const res = await fetch('/api/beta/invite/resend', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setToast({ ok: true, message: `Invitacion reenviada a ${email}.` })
      } else {
        const data = await res.json()
        setToast({ ok: false, message: data.error || 'Error al reenviar invitacion.' })
      }
    } catch {
      setToast({ ok: false, message: 'Error de conexion al reenviar.' })
    } finally {
      setResending(null)
    }
  }

  const handleRevokeInvitation = async (id: string, email: string) => {
    if (!confirm(`Revocar invitacion para ${email}?`)) return

    setRevoking(id)
    try {
      const res = await fetch('/api/beta/invite/revoke', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ invitationId: id }),
      })
      if (res.ok) {
        setToast({ ok: true, message: `Invitacion para ${email} revocada.` })
        fetchData()
      } else {
        const data = await res.json()
        setToast({ ok: false, message: data.error || 'Error al revocar.' })
      }
    } catch {
      setToast({ ok: false, message: 'Error de conexion.' })
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeAccess = async (userId: string, email: string) => {
    if (!confirm(`Revocar acceso beta para ${email}?`)) return

    setRevoking(userId)
    try {
      const res = await fetch('/api/beta/revoke', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setToast({ ok: true, message: `Acceso revocado para ${email}.` })
        fetchData()
      } else {
        const data = await res.json()
        setToast({ ok: false, message: data.error || 'Error al revocar acceso.' })
      }
    } catch {
      setToast({ ok: false, message: 'Error de conexion.' })
    } finally {
      setRevoking(null)
    }
  }

  // --- Login Screen ---

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin - Beta Management</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-key" className="block text-sm font-medium text-gray-700 mb-1">
              Admin API Key
            </label>
            <input
              id="admin-key"
              type="password"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              placeholder="ADMIN_API_SECRET"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              autoFocus
            />
          </div>
          {authError && (
            <p className="text-sm text-red-600">{authError}</p>
          )}
          <button
            type="submit"
            disabled={!adminKey.trim()}
            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            Acceder
          </button>
        </form>
      </div>
    )
  }

  // --- Dashboard ---

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <Toast message={toast.message} ok={toast.ok} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Beta Management</h2>
        <button
          onClick={() => { fetchData(); if (activeTab === 'audit') fetchAuditLog(0); }}
          disabled={loading || auditLoading}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
        >
          {loading || auditLoading ? 'Cargando...' : 'Refrescar'}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3">
        <StatCard label="Total invitaciones" value={stats.total} sub={`${stats.pending} pendientes`} />
        <StatCard label="Aceptadas" value={stats.accepted} />
        <StatCard label="Revocadas" value={stats.revoked} />
        <StatCard label="Expiradas" value={stats.expired} />
        <StatCard label="Beta activos" value={stats.activeBeta} />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <TabButton id="invitations" label="Invitaciones" active={activeTab === 'invitations'} onClick={setActiveTab} />
        <TabButton id="access" label="Acceso Beta" active={activeTab === 'access'} onClick={setActiveTab} />
        <TabButton id="audit" label="Registro de Auditoria" active={activeTab === 'audit'} onClick={setActiveTab} />
      </div>

      {/* ===== INVITATIONS TAB ===== */}
      {activeTab === 'invitations' && (
        <>
          {/* Invite Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Nueva invitacion</h3>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="invite-email" className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div className="w-32">
                <label htmlFor="invite-cohort" className="block text-xs text-gray-500 mb-1">Cohort</label>
                <input
                  id="invite-cohort"
                  type="text"
                  value={inviteCohort}
                  onChange={e => setInviteCohort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                {inviting ? 'Enviando...' : 'Invitar'}
              </button>
            </form>
            {inviteResult && (
              <div className={`mt-3 text-sm ${inviteResult.ok ? 'text-green-700' : 'text-red-600'}`}>
                {inviteResult.ok && inviteResult.url ? (
                  <div>
                    <p className="mb-2">{inviteResult.message}</p>
                    <div className="flex items-stretch gap-2">
                      <code className="flex-1 block p-2 bg-gray-50 rounded text-xs break-all select-all border border-gray-200">
                        {inviteResult.url}
                      </code>
                      <button
                        onClick={() => handleCopyUrl(inviteResult.url!)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          copiedUrl
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {copiedUrl ? 'Copiado' : 'Copiar enlace'}
                      </button>
                    </div>
                  </div>
                ) : (
                  inviteResult.message
                )}
              </div>
            )}
          </div>

          {/* Invitations Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Invitaciones ({invitations.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Cohort</th>
                    <th className="px-4 py-3 text-left">Creada</th>
                    <th className="px-4 py-3 text-left">Aceptada</th>
                    <th className="px-4 py-3 text-left">Expira</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        {loading ? 'Cargando...' : 'Sin invitaciones'}
                      </td>
                    </tr>
                  )}
                  {invitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{inv.email}</td>
                      <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                      <td className="px-4 py-3 text-gray-500">{inv.cohort}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.accepted_at)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.expires_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleResendInvitation(inv.email)}
                                disabled={resending === inv.email}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40"
                              >
                                {resending === inv.email ? '...' : 'Reenviar'}
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                                disabled={revoking === inv.id}
                                className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                              >
                                {revoking === inv.id ? '...' : 'Revocar'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== ACCESS TAB ===== */}
      {activeTab === 'access' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Acceso Beta Activo ({accessEntries.filter(a => a.enabled).length} / {accessEntries.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Cohort</th>
                  <th className="px-4 py-3 text-left">Concedido</th>
                  <th className="px-4 py-3 text-left">Revocado</th>
                  <th className="px-4 py-3 text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accessEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      {loading ? 'Cargando...' : 'Sin entradas de acceso'}
                    </td>
                  </tr>
                )}
                {accessEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {entry.users?.full_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{entry.users?.email || '-'}</td>
                    <td className="px-4 py-3">
                      {entry.enabled ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          activo
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          revocado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{entry.cohort}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(entry.granted_at)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(entry.revoked_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {entry.enabled && (
                        <button
                          onClick={() => handleRevokeAccess(entry.user_id, entry.users?.email || entry.user_id)}
                          disabled={revoking === entry.user_id}
                          className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                        >
                          {revoking === entry.user_id ? '...' : 'Revocar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== AUDIT LOG TAB ===== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Email filter */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label htmlFor="audit-email-filter" className="block text-xs text-gray-500 mb-1">Filtrar por email</label>
              <input
                id="audit-email-filter"
                type="text"
                value={auditEmailFilter}
                onChange={e => setAuditEmailFilter(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <button
              onClick={() => { setAuditOffset(0); fetchAuditLog(0); }}
              disabled={auditLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              Buscar
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Registro de Auditoria ({auditTotal} entradas)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Timestamp</th>
                    <th className="px-4 py-3 text-left">Evento</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        {auditLoading ? 'Cargando...' : 'Sin entradas de auditoria'}
                      </td>
                    </tr>
                  )}
                  {auditEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{formatDate(entry.created_at)}</td>
                      <td className="px-4 py-3">{auditEventBadge(entry.event)}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{entry.ip_address || '-'}</td>
                      <td className="px-4 py-3">
                        {entry.metadata ? (
                          <code className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 max-w-[200px] block truncate" title={JSON.stringify(entry.metadata)}>
                            {JSON.stringify(entry.metadata)}
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load more */}
            {auditOffset < auditTotal && (
              <div className="px-6 py-4 border-t border-gray-100 text-center">
                <button
                  onClick={() => fetchAuditLog(auditOffset, true)}
                  disabled={auditLoading}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-40 transition-colors"
                >
                  {auditLoading ? 'Cargando...' : `Cargar mas (${auditOffset} de ${auditTotal})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="text-center">
        <button
          onClick={() => {
            sessionStorage.removeItem('nuclea_admin_key')
            setAuthenticated(false)
            setAdminKey('')
          }}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cerrar sesion admin
        </button>
      </div>
    </div>
  )
}
