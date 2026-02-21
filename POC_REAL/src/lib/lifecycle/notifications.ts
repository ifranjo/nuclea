import type { SupabaseClient } from '@supabase/supabase-js'

export type NotificationChannel = 'email' | 'sms' | 'whatsapp'

export interface NotificationOutboxItem {
  userId: string
  capsuleId: string
  channel: NotificationChannel
  recipient: string
  template: string
  payload?: Record<string, unknown>
}

export async function queueNotification(
  supabase: SupabaseClient,
  item: NotificationOutboxItem
): Promise<void> {
  await supabase.from('notification_outbox').insert({
    user_id: item.userId,
    capsule_id: item.capsuleId,
    channel: item.channel,
    recipient: item.recipient,
    template: item.template,
    payload: item.payload || {},
    status: 'pending',
  })
}

