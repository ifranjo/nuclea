# Future Messages Flow

**Source:** NUCLEA_LEGACY MENSJ FUUROS.pdf
**Capsule Type:** Legacy (primary), potentially others

## Overview

Future Messages are time-locked content within a capsule. They remain hidden (blurred thumbnail + lock icon) until a specified date, at which point they unlock and become accessible to the recipient.

## Use Cases

| Scenario | Example | Unlock Date |
|----------|---------|-------------|
| Birthday message | "Para cuando cumplas 18" | Child's 18th birthday |
| Anniversary | "Nuestro 25 aniversario" | Wedding anniversary |
| Post-mortem | "Léeme cuando no esté" | After inactivity trigger |
| Milestone | "Para tu graduación" | Expected graduation date |
| Holiday | "Esta Navidad" | Dec 25, 2030 |

## Message States

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│ SCHEDULED  │ ──▶ │  UNLOCKED  │ ──▶ │ DOWNLOADED │ ──▶ │  EXPIRED   │
│            │     │            │     │            │     │            │
│ Waiting    │     │ Available  │     │ Confirmed  │     │ Deleted    │
│ for date   │     │ to view    │     │ download   │     │ from server│
└────────────┘     └────────────┘     └────────────┘     └────────────┘
     │                   │                  │
     │                   │                  │
   Hidden             Visible           30-day window
   (blurred)          (revealed)         then deleted
```

## Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. INITIATE                                                                │
│                                                                             │
│     In Legacy capsule → "Mensajes futuros" section → "+"                   │
│                                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  Mensajes Futuros           │                                        │
│     │                             │                                        │
│     │  ┌────┐ ┌────┐ ┌────┐      │                                        │
│     │  │🔒  │ │🔒  │ │ +  │      │                                        │
│     │  │blur│ │blur│ │    │      │                                        │
│     │  └────┘ └────┘ └────┘      │                                        │
│     │                             │                                        │
│     │  2 mensajes programados     │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. SELECT CONTENT TYPE                                                     │
│     ┌─────────────────────────────┐                                        │
│     │  ¿Qué quieres enviar?       │                                        │
│     │                             │                                        │
│     │   📷      🎬      🎤      📝  │                                        │
│     │  Foto   Video   Audio   Carta│                                        │
│     │                             │                                        │
│     │  O combinar varios          │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. ADD CONTENT                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  Contenido del mensaje      │                                        │
│     │                             │                                        │
│     │  ┌───────────────────────┐  │                                        │
│     │  │   [preview área]      │  │                                        │
│     │  │                       │  │                                        │
│     │  │   + Añadir foto       │  │                                        │
│     │  │   + Añadir video      │  │                                        │
│     │  │   + Añadir audio      │  │                                        │
│     │  └───────────────────────┘  │                                        │
│     │                             │                                        │
│     │  Mensaje escrito:           │                                        │
│     │  ┌───────────────────────┐  │                                        │
│     │  │ Querida hija...       │  │                                        │
│     │  │                       │  │                                        │
│     │  └───────────────────────┘  │                                        │
│     │                             │                                        │
│     │  [Continuar]                │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Multiple content types can be combined in one message                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. SET UNLOCK DATE                                                         │
│     ┌─────────────────────────────┐                                        │
│     │  ¿Cuándo se desbloqueará?   │                                        │
│     │                             │                                        │
│     │  Fecha: [📅 15 Mar 2035]   │                                        │
│     │  Hora:  [⏰ 09:00     ]     │                                        │
│     │                             │                                        │
│     │  ─────────────────────────  │                                        │
│     │  Accesos rápidos:           │                                        │
│     │  [18º cumpleaños]           │                                        │
│     │  [Graduación]               │                                        │
│     │  [Boda]                     │                                        │
│     │  [Personalizado]            │                                        │
│     │                             │                                        │
│     │  [Continuar]                │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Quick presets for common milestones                                        │
│  Custom date/time picker for specific dates                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. SELECT RECIPIENT                                                        │
│     ┌─────────────────────────────┐                                        │
│     │  ¿Para quién es?            │                                        │
│     │                             │                                        │
│     │  ○ María García (hija)      │                                        │
│     │  ○ Carlos García (hijo)     │                                        │
│     │  ○ Ana López (esposa)       │                                        │
│     │  + Añadir destinatario      │                                        │
│     │                             │                                        │
│     │  [Continuar]                │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Recipients from Legacy capsule's recipient list                            │
│  Can add new recipient inline                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  6. TITLE & PREVIEW                                                         │
│     ┌─────────────────────────────┐                                        │
│     │  Dale un título             │                                        │
│     │                             │                                        │
│     │  [Para tu 18º cumpleaños__] │                                        │
│     │                             │                                        │
│     │  ─────────────────────────  │                                        │
│     │  Resumen:                   │                                        │
│     │                             │                                        │
│     │  📅 15 Mar 2035, 09:00     │                                        │
│     │  👤 María García            │                                        │
│     │  📎 1 video, 1 carta        │                                        │
│     │                             │                                        │
│     │  [Programar mensaje]        │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  7. CONFIRMATION                                                            │
│     ┌─────────────────────────────┐                                        │
│     │         ✓                   │                                        │
│     │                             │                                        │
│     │  Mensaje programado         │                                        │
│     │                             │                                        │
│     │  Se desbloqueará el         │                                        │
│     │  15 de marzo de 2035        │                                        │
│     │                             │                                        │
│     │  [Ver mensajes futuros]     │                                        │
│     │  [Crear otro mensaje]       │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Viewing (Pre-Unlock)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LOCKED MESSAGE VIEW (Creator)                                              │
│                                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  🔒 Para tu 18º cumpleaños  │                                        │
│     │                             │                                        │
│     │  ┌───────────────────────┐  │                                        │
│     │  │                       │  │                                        │
│     │  │   [blurred preview]   │  │                                        │
│     │  │        🔒              │  │                                        │
│     │  │                       │  │                                        │
│     │  └───────────────────────┘  │                                        │
│     │                             │                                        │
│     │  📅 Se desbloquea:          │                                        │
│     │     15 Mar 2035 (9 años)    │                                        │
│     │  👤 Para: María             │                                        │
│     │                             │                                        │
│     │  [Editar] [Eliminar]        │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Creator can edit or delete until unlock date                               │
│  Preview is blurred even for creator                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Unlock Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. SYSTEM TRIGGERS UNLOCK (Cron at unlock_date + unlock_time)              │
│                                                                             │
│  Database update:                                                           │
│  - status: 'scheduled' → 'unlocked'                                        │
│  - unlocked_at: NOW()                                                       │
│  - expires_at: NOW() + 30 days                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. NOTIFICATIONS SENT                                                      │
│                                                                             │
│  To recipient:                                                              │
│     ┌─────────────────────────────┐                                        │
│     │  🎁 Tienes un mensaje       │  (Push notification)                   │
│     │                             │                                        │
│     │  [Nombre] te ha dejado      │                                        │
│     │  un mensaje especial.       │                                        │
│     │                             │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Email:                                                                     │
│     Subject: "Un mensaje especial te espera"                               │
│     Body: Link to app/web to view message                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. RECIPIENT VIEWS MESSAGE                                                 │
│                                                                             │
│     ┌─────────────────────────────┐                                        │
│     │  Un mensaje de [Nombre]     │                                        │
│     │                             │                                        │
│     │  "Para tu 18º cumpleaños"   │                                        │
│     │                             │                                        │
│     │  [reveal animation]         │                                        │
│     │                             │                                        │
│     │  ───────────────────────    │                                        │
│     │  Querida María,             │                                        │
│     │                             │                                        │
│     │  [message content]          │                                        │
│     │                             │                                        │
│     │  ───────────────────────    │                                        │
│     │  📎 1 video adjunto         │                                        │
│     │                             │                                        │
│     │  [Descargar todo]           │                                        │
│     └─────────────────────────────┘                                        │
│                                                                             │
│  Emotional reveal animation                                                 │
│  Content is now fully visible                                               │
│  Download option for local copy                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. DOWNLOAD WINDOW (30 days)                                               │
│                                                                             │
│  UI shows countdown:                                                        │
│     "Disponible para descarga: 23 días restantes"                          │
│                                                                             │
│  Reminder emails at:                                                        │
│  - 7 days before expiry                                                     │
│  - 1 day before expiry                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. EXPIRATION                                                              │
│                                                                             │
│  After 30 days:                                                             │
│  - status: 'unlocked' → 'expired'                                          │
│  - Content deleted from server                                              │
│  - Metadata retained (for history)                                          │
│                                                                             │
│  Recipient's view:                                                          │
│     ┌─────────────────────────────┐                                        │
│     │  Mensaje expirado           │                                        │
│     │                             │                                        │
│     │  Este mensaje ya no está    │                                        │
│     │  disponible para descarga.  │                                        │
│     │                             │                                        │
│     │  Si lo descargaste, estará  │                                        │
│     │  en tu dispositivo.         │                                        │
│     └─────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Cron Job (Daily Check)
```sql
-- Supabase scheduled function: Check and unlock messages
CREATE OR REPLACE FUNCTION check_future_messages()
RETURNS void AS $$
DECLARE
  message RECORD;
BEGIN
  -- Find messages ready to unlock
  FOR message IN
    SELECT *
    FROM future_messages
    WHERE status = 'scheduled'
      AND unlock_date <= CURRENT_DATE
      AND (unlock_time IS NULL OR unlock_time <= CURRENT_TIME)
  LOOP
    -- Update status
    UPDATE future_messages
    SET
      status = 'unlocked',
      unlocked_at = NOW(),
      expires_at = NOW() + INTERVAL '30 days'
    WHERE id = message.id;

    -- Queue notification (handled by Edge Function)
    INSERT INTO notification_queue (type, payload)
    VALUES ('future_message_unlocked', jsonb_build_object(
      'message_id', message.id,
      'recipient_id', message.recipient_id,
      'capsule_id', message.capsule_id
    ));
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule: Run every hour
SELECT cron.schedule('check-future-messages', '0 * * * *', 'SELECT check_future_messages()');
```

### Notification Service
```typescript
// Edge Function: send-future-message-notification
interface NotificationPayload {
  message_id: string;
  recipient_id: string;
  capsule_id: string;
}

export async function sendFutureMessageNotification(payload: NotificationPayload) {
  const supabase = createClient(/* ... */);

  // Get message and recipient details
  const { data: message } = await supabase
    .from('future_messages')
    .select('*, recipients(*), capsules(*)')
    .eq('id', payload.message_id)
    .single();

  const recipient = message.recipients;

  // Send email
  await sendEmail({
    to: recipient.email,
    template: 'future-message-unlocked',
    data: {
      recipientName: recipient.name,
      messageTitle: message.title,
      creatorName: message.capsules.owner_name,
      expiresAt: message.expires_at,
      viewUrl: `${APP_URL}/messages/${message.id}`
    }
  });

  // Send push notification (if app user)
  if (recipient.user_id) {
    await sendPushNotification({
      userId: recipient.user_id,
      title: 'Tienes un mensaje especial',
      body: `${message.capsules.owner_name} te ha dejado un mensaje`,
      data: { messageId: message.id }
    });
  }

  // Mark notification sent
  await supabase
    .from('future_messages')
    .update({ notification_sent: true })
    .eq('id', message.id);
}
```

### Blur Effect (CSS)
```css
/* Locked message preview */
.future-message-preview {
  position: relative;
}

.future-message-preview.locked img {
  filter: blur(20px);
  transform: scale(1.1); /* Prevent blur edge visibility */
}

.future-message-preview.locked::after {
  content: '🔒';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

/* Unlock animation */
@keyframes reveal {
  0% {
    filter: blur(20px);
    opacity: 0.5;
  }
  100% {
    filter: blur(0);
    opacity: 1;
  }
}

.future-message-preview.unlocking img {
  animation: reveal 2s ease-out forwards;
}
```

### Expiration Cleanup
```typescript
// Daily cron: Expire old messages
export async function expireOldMessages() {
  const supabase = createClient(/* ... */);

  // Find expired messages
  const { data: expired } = await supabase
    .from('future_messages')
    .select('id, content_ids')
    .eq('status', 'unlocked')
    .lt('expires_at', new Date().toISOString());

  for (const message of expired) {
    // Delete associated content from storage
    for (const contentId of message.content_ids) {
      const { data: content } = await supabase
        .from('contents')
        .select('storage_path')
        .eq('id', contentId)
        .single();

      await supabase.storage
        .from('content')
        .remove([content.storage_path]);
    }

    // Update status
    await supabase
      .from('future_messages')
      .update({ status: 'expired' })
      .eq('id', message.id);
  }
}
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Creator dies before unlock date | Message still unlocks on date (Legacy capsule triggers) |
| Recipient email invalid | Retry 3x, then notify trusted contact |
| Recipient never views | Expires after 30 days anyway |
| Creator wants to edit after creation | Allowed until unlock date |
| Creator wants to delete | Allowed, with confirmation |
| Multiple messages same date | Each unlocks independently |
| Past date entered | Error: "La fecha debe ser futura" |

## Privacy Considerations

- **Creator cannot preview unlocked state** - Maintains surprise element
- **Blur is server-enforced** - Client can't bypass
- **No screenshot detection** - Can't prevent, but content is personal
- **Audit log** - Track who viewed and when
