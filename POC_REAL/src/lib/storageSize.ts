export interface ContentSizeRow {
  capsule_id: string
  file_size_bytes: number | null
  text_content: string | null
}

export function estimateUtf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length
}

export function getContentSizeBytes(row: Pick<ContentSizeRow, 'file_size_bytes' | 'text_content'>): number {
  if (typeof row.file_size_bytes === 'number' && Number.isFinite(row.file_size_bytes) && row.file_size_bytes > 0) {
    return row.file_size_bytes
  }
  if (row.text_content) {
    return estimateUtf8Bytes(row.text_content)
  }
  return 0
}

export function buildCapsuleSizeMap(rows: ContentSizeRow[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const row of rows) {
    map[row.capsule_id] = (map[row.capsule_id] || 0) + getContentSizeBytes(row)
  }
  return map
}
