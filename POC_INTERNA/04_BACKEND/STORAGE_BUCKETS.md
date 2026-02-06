# Storage Buckets

Especificacion de buckets y rutas para media de NUCLEA.

## Objetivos

- Separar media operativa y media de entrega.
- Simplificar permisos por tipo de acceso.
- Hacer cleanup automatizable tras cierre/expiracion.

## Buckets propuestos

| Bucket | Publico | Uso |
|-------|---------|-----|
| `avatars` | No | Fotos de perfil usuario |
| `capsule-contents` | No | Fotos, videos, audio y docs de capsulas |
| `future-messages` | No | Contenido cifrado de mensajes futuros |
| `downloads-temp` | No | Paquetes temporales para descarga |

## Convencion de rutas

`capsule-contents`:

```text
{owner_id}/{capsule_id}/{content_type}/{content_id}-{filename}
```

`future-messages`:

```text
{capsule_id}/{message_id}/encrypted-{timestamp}.bin
```

`downloads-temp`:

```text
{capsule_id}/archive-{yyyyMMddHHmmss}.zip
```

## Politicas de acceso

| Bucket | Read | Write | Delete |
|-------|------|-------|--------|
| `avatars` | owner | owner | owner |
| `capsule-contents` | owner + collaborators | owner + editor | owner + editor |
| `future-messages` | service role | service role | service role |
| `downloads-temp` | owner o destinatario autorizado | edge function | edge function |

## Limites recomendados

| Tipo | Limite por archivo |
|------|--------------------|
| Imagen | 15 MB |
| Video | 250 MB |
| Audio | 50 MB |
| ZIP descarga | 1 GB |

## Reglas de retencion

1. Contenido activo: conservar mientras `capsule.status != closed`.
2. `downloads-temp`: borrar en <= 7 dias.
3. `future-messages`: borrar tras `download_deadline`.
4. Soft delete en DB antes de limpieza fisica en storage.

