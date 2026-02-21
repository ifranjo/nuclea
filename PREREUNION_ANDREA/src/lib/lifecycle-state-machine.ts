export type GiftLifecycleState =
  | 'draft'
  | 'sent'
  | 'claimed'
  | 'continued'
  | 'video_purchased'
  | 'video_downloaded'
  | 'video_purged'
  | 'expired'
  | 'deleted'

export type GiftLifecycleEvent =
  | 'send'
  | 'claim'
  | 'continue_story'
  | 'purchase_video'
  | 'download_video'
  | 'purge_video_copy'
  | 'expire'
  | 'delete_capsule'

const EVENT_TARGET: Record<GiftLifecycleEvent, GiftLifecycleState> = {
  send: 'sent',
  claim: 'claimed',
  continue_story: 'continued',
  purchase_video: 'video_purchased',
  download_video: 'video_downloaded',
  purge_video_copy: 'video_purged',
  expire: 'expired',
  delete_capsule: 'deleted',
}

const ALLOWED_EVENT_SOURCES: Record<GiftLifecycleEvent, GiftLifecycleState[]> = {
  send: ['draft'],
  claim: ['sent'],
  continue_story: ['claimed', 'video_purged'],
  purchase_video: ['claimed', 'continued'],
  download_video: ['video_purchased'],
  purge_video_copy: ['video_downloaded'],
  expire: ['sent', 'claimed', 'continued', 'video_purchased'],
  delete_capsule: ['expired', 'video_purged'],
}

export function isValidLifecycleTransition(
  from: GiftLifecycleState,
  to: GiftLifecycleState
): boolean {
  return Object.entries(EVENT_TARGET).some(([, target]) => {
    if (target !== to) return false
    const event = Object.keys(EVENT_TARGET).find((key) => EVENT_TARGET[key as GiftLifecycleEvent] === to)
    if (!event) return false
    return ALLOWED_EVENT_SOURCES[event as GiftLifecycleEvent].includes(from)
  })
}

export function applyLifecycleEvent(
  from: GiftLifecycleState,
  event: GiftLifecycleEvent
): GiftLifecycleState {
  const allowedSources = ALLOWED_EVENT_SOURCES[event]
  if (!allowedSources.includes(from)) {
    throw new Error(`Invalid lifecycle transition: ${from} -> ${event}`)
  }
  return EVENT_TARGET[event]
}

export function computeClaimDeadline(claimedAt: Date): Date {
  const deadline = new Date(claimedAt)
  deadline.setUTCDate(deadline.getUTCDate() + 30)
  return deadline
}

