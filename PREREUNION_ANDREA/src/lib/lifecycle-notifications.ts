import { FieldValue } from 'firebase-admin/firestore'

export type NotificationChannel = 'email' | 'sms' | 'whatsapp'

export interface NotificationOutboxItem {
  userId: string
  capsuleId: string
  channel: NotificationChannel
  to: string
  template: string
  payload?: Record<string, unknown>
}

interface FirestoreLike {
  collection: (name: string) => {
    add: (value: Record<string, unknown>) => Promise<unknown>
  }
}

export async function queueNotification(
  db: FirestoreLike,
  item: NotificationOutboxItem
): Promise<void> {
  await db.collection('notification_outbox').add({
    ...item,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}

