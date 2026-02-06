# Backend Specs (Supabase)

Documentacion tecnica de backend para la PoC interna.

## Objetivo

Definir un backend base en Supabase para:

- Auth
- Modelo de capsulas y contenido
- Mensajes futuros
- Control de acceso (RLS)
- Almacenamiento de media

## Fuentes base

- `POC_INTERNA/01_SPECS/DATA_MODEL.md`
- `POC_INTERNA/01_SPECS/FUTURE_MESSAGES.md`
- `docs/DATABASE_SCHEMA.md`

## Archivos en esta carpeta

| Archivo | Proposito |
|--------|-----------|
| `SUPABASE_SCHEMA.sql` | Draft ejecutable de schema + triggers + RLS + storage policies |
| `RLS_POLICIES.md` | Politicas de seguridad por tabla |
| `STORAGE_BUCKETS.md` | Organizacion de buckets y permisos |
| `EDGE_FUNCTIONS.md` | Contratos y jobs serverless |

## Estado

- Documento de arquitectura: listo
- SQL ejecutable consolidado: listo (draft v1)
- Integracion app->supabase en `POC_INTERNA/app`: pendiente

## Roadmap minimo

1. Ejecutar `SUPABASE_SCHEMA.sql` en entorno de desarrollo y validar.
2. Ajustar RLS con casos reales de colaboracion.
3. Implementar edge functions criticas segun `EDGE_FUNCTIONS.md`.
4. Conectar `POC_INTERNA/app` a Supabase.
