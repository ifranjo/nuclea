# POC_INTERNA - NUCLEA

Documentacion operativa para la PoC interna de onboarding y base tecnica del producto.

## Estado actual (real)

| Area | Estado | Evidencia |
|------|--------|-----------|
| `01_SPECS/` | Disponible | 5 docs base (`DESIGN_SYSTEM`, `USER_FLOWS`, `DATA_MODEL`, `CAPSULE_TYPES`, `FUTURE_MESSAGES`) |
| `02_UI_SCREENS/` | Parcial avanzado | Specs completas onboarding (`P1-P4`) + specs por tipo de capsula |
| `03_ANIMATION/` | Parcial | `CAPSULE_OPENING.md`, `POLAROID_FLOAT.md`, `TRANSITIONS.md` |
| `04_BACKEND/` | Parcial avanzado | `SUPABASE_SCHEMA.sql` + docs de RLS, storage y edge functions |
| `05_PROMPTS/` | Parcial | `IMAGE_GENERATION.md` y `VIDEO_GENERATION.md` |
| `app/` | Implementado (PoC) | Next.js con flujo onboarding P1->P4 en `http://localhost:3001` |
| `ASSETS/` | Estructura creada | Carpetas `brand`, `pdf_screens`, `video_frames` |

## Estructura

```text
POC_INTERNA/
├── CLAUDE.md
├── README.md
├── POC_INTERNA_MASTER_DOC.html
├── DELEGATION_WORKFLOW.md
│
├── 01_SPECS/
│   ├── CAPSULE_TYPES.md
│   ├── DATA_MODEL.md
│   ├── DESIGN_SYSTEM.md
│   ├── FUTURE_MESSAGES.md
│   └── USER_FLOWS.md
│
├── 02_UI_SCREENS/        # Specs P1-P4 + placeholders para modulos pendientes
├── 03_ANIMATION/         # Specs de animacion onboarding
├── 04_BACKEND/           # Specs de backend + SQL ejecutable draft
├── 05_PROMPTS/
│   ├── IMAGE_GENERATION.md
│   └── VIDEO_GENERATION.md
│
├── app/                  # Next.js PoC runnable
├── ASSETS/
└── CONVERSACION_EXTRACT/
    └── CONVERSACOIN_EXTRACT.txt
```

## Fuentes de verdad

| Tema | Ubicacion |
|------|-----------|
| Diseno visual | `../DISEÑO_ANDREA_PANTALLAS/` |
| Especificacion funcional base | `./01_SPECS/` |
| PoC ejecutable (UI real) | `./app/` |
| Contexto original de conversacion | `./CONVERSACION_EXTRACT/CONVERSACOIN_EXTRACT.txt` |
| Contexto business/propuesta | `../PREREUNION_ANDREA/` |

## Flujo recomendado de trabajo

1. Leer `01_SPECS/DESIGN_SYSTEM.md` y `01_SPECS/USER_FLOWS.md`.
2. Revisar referencias visuales en `../DISEÑO_ANDREA_PANTALLAS/`.
3. Ejecutar PoC de onboarding desde `app/` para validar comportamiento real.
4. Documentar gaps en `02_UI_SCREENS/`, `03_ANIMATION/` o `04_BACKEND/`.
5. Si se necesitan assets nuevos, usar prompts en `05_PROMPTS/`.

## Quick start de la PoC

```bash
cd POC_INTERNA/app
npm install
npm run dev
```

Abrir `http://localhost:3001`.

Para detalles de scripts, rutas y componentes: `POC_INTERNA/app/README.md`.

## Prioridades sugeridas

1. Crear specs por pantalla en `02_UI_SCREENS/00_INTRO/` y `02_UI_SCREENS/01_SELECTION/`.
2. Bajar especificaciones de animacion en `03_ANIMATION/`.
3. Materializar backend inicial en `04_BACKEND/` (schema + policies).
4. Mantener sincronizados `01_SPECS/` y el comportamiento real de `app/`.
