interface ReportVideoDownloadInput {
  capsuleId: string
  idempotencyKey: string
  storagePath?: string
  authToken?: string
}

interface ReportVideoDownloadResult {
  ok: boolean
  status: number
  body?: unknown
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function reportVideoDownloaded(
  input: ReportVideoDownloadInput
): Promise<ReportVideoDownloadResult> {
  const endpoint = `/api/capsules/${input.capsuleId}/video/download-complete`
  const payload = JSON.stringify({
    idempotencyKey: input.idempotencyKey,
    storagePath: input.storagePath,
  })

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(input.authToken ? { Authorization: `Bearer ${input.authToken}` } : {}),
        },
        body: payload,
        keepalive: true,
      })

      if (response.ok) {
        return { ok: true, status: response.status, body: await response.json() }
      }

      if (response.status >= 400 && response.status < 500) {
        return { ok: false, status: response.status, body: await response.json().catch(() => undefined) }
      }
    } catch {
      // Retry on network errors.
    }

    await wait(250 * (2 ** (attempt - 1)))
  }

  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(endpoint, blob)
    } catch {
      // No-op: retries already exhausted.
    }
  }

  return { ok: false, status: 0 }
}

