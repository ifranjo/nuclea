# Sistema de Mensajes Futuros

Especificación técnica del sistema de custodia temporal y entrega programada de mensajes.

## Promesa de producto

> **"Los mensajes futuros se entregan SIEMPRE en la fecha marcada por el creador, independientemente de que el destinatario continúe o no usando la app."**

## Principios fundamentales

1. **Entrega garantizada**: El sistema DEBE entregar en la fecha programada
2. **Mínima retención**: Solo guardar lo necesario hasta la entrega
3. **Privacidad máxima**: Cifrado end-to-end, acceso mínimo
4. **Sin dependencias**: Destinatario NO necesita suscripción

## Ciclo de vida de un mensaje futuro

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CICLO DE VIDA                                  │
└─────────────────────────────────────────────────────────────────────┘

[CREACIÓN]
     │
     │ Usuario graba/escribe mensaje
     │ Selecciona destinatario
     │ Elige fecha de apertura
     │
     ▼
┌─────────────────────────────────────┐
│ 1. CIFRADO Y ALMACENAMIENTO        │
│                                     │
│ • Contenido cifrado con AES-256     │
│ • Key almacenada en Vault separado  │
│ • Metadata mínima (fecha, email)    │
│ • Estado: SCHEDULED                 │
└─────────────────────────────────────┘
     │
     │ [Tiempo pasa...]
     │
     ▼
┌─────────────────────────────────────┐
│ 2. BLOQUEO ACTIVO                  │
│                                     │
│ • Creador puede: editar, borrar     │
│ • Destinatario: NO puede ver        │
│ • UI: Candado + fecha visible       │
│ • Miniatura: Borrosa o ninguna      │
└─────────────────────────────────────┘
     │
     │ [Fecha programada llega]
     │
     ▼
┌─────────────────────────────────────┐
│ 3. DESBLOQUEO AUTOMÁTICO           │
│                                     │
│ • Cron job detecta fecha            │
│ • Descifra contenido                │
│ • Estado: DELIVERED                 │
│ • Inicia ventana de descarga        │
└─────────────────────────────────────┘
     │
     │ [Notificación enviada]
     │
     ▼
┌─────────────────────────────────────┐
│ 4. NOTIFICACIÓN AL DESTINATARIO    │
│                                     │
│ Canales:                            │
│ • Push notification (si tiene app)  │
│ • Email con enlace seguro           │
│ • SMS opcional (premium)            │
│                                     │
│ Contenido email:                    │
│ • Remitente: "NUCLEA - Legacy"      │
│ • Asunto: "{Nombre} te dejó..."     │
│ • Enlace temporal (7 días)          │
└─────────────────────────────────────┘
     │
     │ [30 días de ventana]
     │
     ▼
┌─────────────────────────────────────┐
│ 5. VENTANA DE DESCARGA             │
│                                     │
│ • Destinatario accede vía enlace    │
│ • Autenticación ligera (email)      │
│ • Puede ver y descargar             │
│ • Recordatorios: día 7, 21, 28      │
└─────────────────────────────────────┘
     │
     ├─── [Descarga exitosa] ───┐
     │                          │
     │                          ▼
     │             ┌─────────────────────────────┐
     │             │ Estado: DOWNLOADED          │
     │             │ • Contenido en dispositivo  │
     │             │ • Programar borrado servidor│
     │             └─────────────────────────────┘
     │
     └─── [Sin descarga en 30 días] ───┐
                                        │
                                        ▼
                           ┌─────────────────────────────┐
                           │ Estado: EXPIRED             │
                           │ • Borrado de servidor       │
                           │ • Log de auditoría          │
                           │ • Notificación final        │
                           └─────────────────────────────┘
```

## Arquitectura técnica

### Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA                               │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│  API Edge   │────▶│  PostgreSQL │
│   (App)     │     │  Functions  │     │  (Supabase) │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │                    │
                          ▼                    │
                   ┌─────────────┐             │
                   │   Vault     │◀────────────┘
                   │ (Keys)      │
                   └─────────────┘
                          │
                          │
                          ▼
                   ┌─────────────┐
                   │  Storage    │
                   │ (Encrypted) │
                   └─────────────┘
                          │
                          │
                          ▼
                   ┌─────────────┐
                   │ CRON Jobs   │
                   │ (Delivery)  │
                   └─────────────┘
                          │
                          │
                          ▼
                   ┌─────────────┐
                   │   Email     │
                   │  (Resend)   │
                   └─────────────┘
```

### Flujo de cifrado

```typescript
// 1. Crear mensaje
async function createFutureMessage(
  capsuleId: string,
  content: Blob,
  recipientEmail: string,
  scheduledDate: Date
) {
  // Generar key única para este mensaje
  const messageKey = crypto.randomBytes(32);

  // Cifrar contenido
  const encryptedContent = await encrypt(content, messageKey);

  // Almacenar key en vault (separado de DB principal)
  const keyId = await vault.store(messageKey, {
    messageId: messageId,
    expiresAt: addDays(scheduledDate, 30)
  });

  // Guardar metadata en DB
  await db.future_messages.insert({
    id: messageId,
    capsule_id: capsuleId,
    encrypted_content: encryptedContent,
    encryption_key_id: keyId,
    recipient_email: recipientEmail,
    scheduled_date: scheduledDate,
    status: 'scheduled'
  });
}

// 2. Desbloquear mensaje (cron job)
async function unlockScheduledMessages() {
  const messages = await db.future_messages.findMany({
    where: {
      scheduled_date: { lte: new Date() },
      status: 'scheduled'
    }
  });

  for (const message of messages) {
    // Obtener key del vault
    const key = await vault.get(message.encryption_key_id);

    // Descifrar contenido
    const content = await decrypt(message.encrypted_content, key);

    // Mover a storage accesible
    const accessUrl = await storage.upload(
      `unlocked/${message.id}`,
      content,
      { expiresIn: '30d' }
    );

    // Actualizar estado
    await db.future_messages.update(message.id, {
      status: 'delivered',
      delivered_at: new Date(),
      download_deadline: addDays(new Date(), 30)
    });

    // Notificar
    await sendDeliveryNotification(message, accessUrl);
  }
}
```

### Edge Functions requeridas

| Función | Trigger | Propósito |
|---------|---------|-----------|
| `create-future-message` | HTTP POST | Crear y cifrar mensaje |
| `unlock-messages` | Cron (diario 00:00 UTC) | Desbloquear mensajes programados |
| `send-reminders` | Cron (diario 09:00 UTC) | Enviar recordatorios |
| `cleanup-expired` | Cron (diario 03:00 UTC) | Borrar mensajes expirados |
| `verify-recipient` | HTTP POST | Verificar email destinatario |
| `download-message` | HTTP GET | Servir contenido descifrado |

## Reglas de producto

### 1. Bloqueo real (antes de fecha)

- Contenido **NO previsualizable**
- Miniatura borrosa o sin miniatura
- Creador puede editar/borrar
- Destinatario no puede ver nada
- UI muestra: `🔒 Se abrirá el DD/MM/AAAA`

### 2. Entrega garantizada (en fecha)

- Desbloqueo automático a las 00:00 UTC
- Notificación inmediata
- NO requiere suscripción del destinatario
- Enlace seguro temporal

### 3. Ventana de descarga

- Duración: 30 días
- Recordatorios: día 7, 21, 28
- Tras expiración: borrado total
- Mensaje final: "Tu mensaje ha expirado"

## Templates de email

### Notificación de entrega

```html
Asunto: {CreadorNombre} te ha dejado un mensaje en NUCLEA

---

Hola {DestinatarioNombre},

{CreadorNombre} programó un mensaje especial para ti.
Hoy es el día en que quiso que lo recibieras.

[Abrir mensaje]

Este enlace estará disponible durante 30 días.

---

NUCLEA - Donde los recuerdos se convierten en legado

Si no esperabas este mensaje, puedes ignorarlo.
```

### Recordatorio

```html
Asunto: Recordatorio: Tienes un mensaje pendiente de {CreadorNombre}

---

Hola {DestinatarioNombre},

Te recordamos que tienes un mensaje de {CreadorNombre}
esperándote en NUCLEA.

Quedan {DiasRestantes} días para descargarlo.

[Abrir mensaje]

---

NUCLEA
```

## Casos límite

### Destinatario nunca accede

```
Día 0: Mensaje desbloqueado, email enviado
Día 7: Recordatorio #1
Día 21: Recordatorio #2
Día 28: Recordatorio #3 (último aviso)
Día 30: Mensaje expirado y borrado
       → Log de auditoría guardado
       → NO se notifica al creador (probablemente fallecido)
```

### Email del destinatario cambia

1. Creador puede actualizar email mientras el mensaje está programado
2. Si el mensaje ya fue entregado, se reenvía al nuevo email
3. Verificación obligatoria del nuevo email

### Múltiples destinatarios

- Creador define si:
  - **Todos reciben el mismo mensaje** (copia)
  - **Cada uno recibe mensaje diferente** (personalizado)
- Entrega independiente para cada destinatario

### Creador revoca antes de fecha

- Puede borrar mensaje en cualquier momento
- Puede cambiar fecha
- No puede recuperar mensaje borrado
- Log de auditoría de la cancelación

## Métricas a trackear

| Métrica | Descripción |
|---------|-------------|
| `messages_scheduled` | Total mensajes programados |
| `messages_delivered` | Entregados exitosamente |
| `messages_downloaded` | Descargados por destinatario |
| `messages_expired` | Expirados sin descarga |
| `avg_time_to_download` | Tiempo promedio hasta descarga |
| `delivery_failures` | Fallos de entrega (bounced emails) |

## Seguridad

### Cifrado

- Algoritmo: AES-256-GCM
- Key storage: Vault separado de DB
- Key rotation: Cada mensaje tiene key única
- Transport: TLS 1.3 obligatorio

### Acceso

- Enlace con token único (UUID v4)
- Token expira tras 30 días
- Verificación de email del destinatario
- Rate limiting en endpoint de descarga

### Auditoría

Eventos logueados:
- `message.created`
- `message.edited`
- `message.deleted`
- `message.unlocked`
- `message.accessed`
- `message.downloaded`
- `message.expired`

## Frase de promesa (para UI)

> **"El creador decide. El tiempo cumple. NUCLEA garantiza."**

---

*Basado en: NUCLEA_LEGACY MENSJ FUUROS.pdf*
