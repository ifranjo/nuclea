import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin'

export type ProcessorDeleteResult = {
  ok: boolean
  retryable: boolean
  status?: number
  message: string
}

export async function deleteElevenLabsVoice(voiceId?: string | null): Promise<ProcessorDeleteResult> {
  if (!voiceId) {
    return {
      ok: true,
      retryable: false,
      message: 'No ElevenLabs voiceId configured',
    }
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      retryable: true,
      message: 'ELEVENLABS_API_KEY missing',
    }
  }

  const url = `https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'xi-api-key': apiKey,
      },
    })

    if (response.ok || response.status === 404) {
      return {
        ok: true,
        retryable: false,
        status: response.status,
        message: response.status === 404 ? 'Voice already deleted' : 'Voice deleted',
      }
    }

    const body = await response.text()
    const retryable = response.status >= 500 || response.status === 429 || response.status === 408
    return {
      ok: false,
      retryable,
      status: response.status,
      message: body.slice(0, 400) || 'ElevenLabs delete failed',
    }
  } catch (error) {
    return {
      ok: false,
      retryable: true,
      message: error instanceof Error ? error.message : 'Network error deleting voice',
    }
  }
}

export async function deleteBiometricFiles(userId: string): Promise<void> {
  const db = getAdminDb('biometric file cleanup')
  const storage = getAdminStorage('biometric file cleanup')
  const userDoc = await db.collection('users').doc(userId).get()
  const userData = userDoc.data() as {
    aiAvatar?: {
      profilePhotoUrl?: string
      videoUrls?: string[]
      consentDocumentUrl?: string
    }
  } | undefined

  const targets = new Set<string>()
  const avatar = userData?.aiAvatar
  const urls = [
    avatar?.profilePhotoUrl,
    avatar?.consentDocumentUrl,
    ...(avatar?.videoUrls || []),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  for (const url of urls) {
    if (url.startsWith('gs://')) {
      const withoutPrefix = url.replace('gs://', '')
      const slashIndex = withoutPrefix.indexOf('/')
      if (slashIndex > -1) {
        targets.add(withoutPrefix.slice(slashIndex + 1))
      }
      continue
    }
    const marker = '/o/'
    const markerIndex = url.indexOf(marker)
    if (markerIndex > -1) {
      const encodedPath = url.slice(markerIndex + marker.length).split('?')[0]
      targets.add(decodeURIComponent(encodedPath))
    }
  }

  await Promise.all(
    [...targets].map(async (path) => {
      await storage.bucket().file(path).delete({ ignoreNotFound: true })
    })
  )
}
