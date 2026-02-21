/**
 * auth-fetch.ts
 *
 * Thin fetch wrapper that attaches a Firebase ID token to every request and
 * automatically retries once with a force-refreshed token on 401.
 *
 * Firebase ID tokens expire after 1 hour.  The Firebase SDK refreshes them
 * transparently when the user performs a new action, but a cached token
 * obtained via getIdToken(false) can still be stale for long-lived sessions
 * (e.g. the dashboard kept open overnight).  A single retry with
 * getIdToken(true) covers that case without introducing infinite loops.
 */

import { auth } from '@/lib/firebase'

/**
 * Fetch a URL with automatic Firebase token refresh on 401.
 *
 * Algorithm:
 *  1. Obtain the current cached ID token  (getIdToken(false))
 *  2. Make the request
 *  3. If the server returns 401, force-refresh the token (getIdToken(true))
 *     and retry the same request exactly once
 *  4. Return the final Response — caller is responsible for .json() / error handling
 *
 * Throws if there is no authenticated Firebase user.
 */
export async function authFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) {
    throw new Error('No hay sesion activa')
  }

  // --- first attempt: use cached token (avoids an unnecessary round-trip) ---
  const token = await firebaseUser.getIdToken(false)
  const firstResponse = await fetch(url, buildOptions(options, token))

  if (firstResponse.status !== 401) {
    return firstResponse
  }

  // --- 401 received: force-refresh the token and retry once ---
  const refreshedToken = await firebaseUser.getIdToken(true)
  return fetch(url, buildOptions(options, refreshedToken))
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildOptions(base: RequestInit | undefined, token: string): RequestInit {
  return {
    ...base,
    headers: {
      ...base?.headers,
      Authorization: `Bearer ${token}`,
    },
  }
}
