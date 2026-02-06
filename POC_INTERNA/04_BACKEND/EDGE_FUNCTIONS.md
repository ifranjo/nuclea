# Edge Functions

Contratos funcionales para funciones serverless (Supabase Edge Functions / Deno).

## Prioridad de implementacion

1. `create-future-message`
2. `unlock-messages` (cron)
3. `send-delivery-notification`
4. `send-reminders` (cron)
5. `cleanup-expired` (cron)

## 1) create-future-message

`POST /functions/v1/create-future-message`

### Input

```json
{
  "capsule_id": "uuid",
  "content_type": "text|photo|video|audio",
  "payload": "base64-or-text",
  "recipient_email": "mail@example.com",
  "recipient_name": "Optional",
  "scheduled_date": "2030-01-01"
}
```

### Output

```json
{
  "message_id": "uuid",
  "status": "scheduled"
}
```

## 2) unlock-messages

Cron diario `00:00 UTC`.

Responsabilidades:
- Buscar `future_messages` con `scheduled_date <= today` y `status = scheduled`.
- Descifrar/mover a zona de entrega.
- Cambiar estado a `delivered`.
- Definir `download_deadline` (+30 dias).

## 3) send-delivery-notification

`POST /functions/v1/send-delivery-notification`

Responsabilidades:
- Enviar email (Resend) con enlace seguro.
- Registrar intento y resultado.

## 4) send-reminders

Cron diario `09:00 UTC`.

Responsabilidades:
- Mensajes entregados pendientes de descarga.
- Enviar recordatorios dias 7, 21 y 28.

## 5) cleanup-expired

Cron diario `03:00 UTC`.

Responsabilidades:
- Marcar `expired` mensajes fuera de ventana.
- Borrar contenido en storage asociado.
- Guardar log de auditoria.

## Errores y observabilidad

Campos minimos por log:

```json
{
  "function": "unlock-messages",
  "message_id": "uuid",
  "status": "ok|error",
  "error_code": "optional",
  "created_at": "timestamp"
}
```

Recomendacion:
- Trazas con correlation id por ejecucion.
- Alertas cuando fallos consecutivos > 3 en cron critico.

