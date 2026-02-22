'use client'

import { useState, useEffect, useCallback } from 'react'

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
    expired: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

// --- Main Component ---

export default function AdminBetaPage() {
  // Auth state
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  // Data
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [accessEntries, setAccessEntries] = useState<BetaAccessEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteCohort, setInviteCohort] = useState('beta-1')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; message: string } | null>(null)

  // Revoke state
  const [revoking, setRevoking] = useState<string | null>(null)

  // Feedback
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

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

  // --- Auth ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    // Test the key by fetching invitations
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
    setFeedback(null)
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
      setFeedback({ ok: false, message: 'Error de conexion al cargar datos.' })
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated, fetchData])

  // --- Actions ---

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    setInviteResult(null)

    try {
      const res = await fetch('/api/beta/invite', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: inviteEmail.trim(), cohort: inviteCohort }),
      })
      const data = await res.json()

      if (res.ok) {
        setInviteResult({ ok: true, message: `Invitacion enviada. URL: ${data.inviteUrl}` })
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

  const handleRevokeInvitation = async (id: string, email: string) => {
    if (!confirm(`Revocar invitacion para ${email}?`)) return

    setRevoking(id)
    try {
      // Update invitation status directly via the admin client
      // We need to add this. For now, update status by using the existing revoke pattern.
      // The revoke API works with userId, so for invitations we update status directly.
      const res = await fetch('/api/beta/invite/revoke', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ invitationId: id }),
      })
      if (res.ok) {
        setFeedback({ ok: true, message: `Invitacion para ${email} revocada.` })
        fetchData()
      } else {
        const data = await res.json()
        setFeedback({ ok: false, message: data.error || 'Error al revocar.' })
      }
    } catch {
      setFeedback({ ok: false, message: 'Error de conexion.' })
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
        setFeedback({ ok: true, message: `Acceso revocado para ${email}.` })
        fetchData()
      } else {
        const data = await res.json()
        setFeedback({ ok: false, message: data.error || 'Error al revocar acceso.' })
      }
    } catch {
      setFeedback({ ok: false, message: 'Error de conexion.' })
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Beta Invitations</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
        >
          {loading ? 'Cargando...' : 'Refrescar'}
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm ${feedback.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {feedback.message}
        </div>
      )}

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
            {inviteResult.ok ? (
              <div>
                <p>{inviteResult.message.split('URL: ')[0]}</p>
                <code className="block mt-1 p-2 bg-gray-50 rounded text-xs break-all select-all">
                  {inviteResult.message.split('URL: ')[1]}
                </code>
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
                <th className="px-4 py-3 text-right">Accion</th>
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
                    {inv.status === 'pending' && (
                      <button
                        onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                        disabled={revoking === inv.id}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                      >
                        {revoking === inv.id ? '...' : 'Revocar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beta Access Table */}
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
