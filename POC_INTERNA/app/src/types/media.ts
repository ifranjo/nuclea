export interface MediaItem {
  id: string
  type: 'photo' | 'video' | 'audio' | 'note'
  name: string
  url: string
  file?: File
  createdAt: Date
  thumbnail?: string
  /** Duration in seconds (audio/video) */
  duration?: number
  /** Text content (notes only) */
  text?: string
}
