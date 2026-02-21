export interface ExportContentInput {
  type: string
  file_name: string | null
  title: string | null
  captured_at: string
  mime_type: string | null
}

export interface MetadataPayloadInput {
  capsule: {
    id: string
    title: string | null
    type: string
    status: string
  }
  ownerEmail?: string | null
  contentsCount: number
  personsCount: number
  exportedAt: string
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
}

function removeDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function sanitizeFileSegment(value: string | null | undefined, fallback: string): string {
  const cleaned = removeDiacritics(value || '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || fallback
}

function formatCapturedAtForFile(isoDate: string): string {
  const date = new Date(isoDate)
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}_${hh}${min}${ss}`
}

function extensionFromName(fileName: string | null): string | null {
  if (!fileName) return null
  const parts = fileName.split('.')
  if (parts.length < 2) return null
  return sanitizeFileSegment(parts[parts.length - 1]?.toLowerCase(), '')
}

function extensionFromMime(mimeType: string | null): string | null {
  if (!mimeType) return null
  return MIME_EXTENSION_MAP[mimeType] || null
}

function folderByType(type: string): string {
  if (type === 'photo') return 'photos'
  if (type === 'video') return 'videos'
  if (type === 'audio') return 'audios'
  if (type === 'text') return 'notes'
  return 'others'
}

export function buildContentEntryName(content: ExportContentInput, index: number): string {
  const folder = folderByType(content.type)
  const stamp = formatCapturedAtForFile(content.captured_at)
  const indexPart = String(index).padStart(2, '0')
  const nameWithoutExtension = content.file_name
    ? content.file_name.replace(/\.[^/.]+$/, '')
    : content.title || 'item'
  const baseName = sanitizeFileSegment(nameWithoutExtension, `item-${indexPart}`)
  const ext = extensionFromName(content.file_name) || extensionFromMime(content.mime_type)
  const finalName = ext ? `${baseName}.${ext}` : baseName
  return `${folder}/${stamp}_${indexPart}_${finalName}`
}

export function buildCapsuleZipName(title: string | null, capsuleId: string): string {
  const safeTitle = sanitizeFileSegment(title || 'capsula', 'capsula')
  const shortId = sanitizeFileSegment(capsuleId.slice(0, 8), 'capsule')
  return `capsula_${safeTitle}_${shortId}.zip`
}

export function buildMetadataPayload(input: MetadataPayloadInput) {
  return {
    exportedAt: input.exportedAt,
    capsule: input.capsule,
    ownerEmail: input.ownerEmail || null,
    summary: {
      contents: input.contentsCount,
      designatedPersons: input.personsCount,
    },
  }
}
