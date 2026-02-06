# Workflow de Delegación - POC_INTERNA NUCLEA

Plan de ejecución con 3 agentes: **GLM-4.7** (gy), **Kimi** (ky), **MiniMax** (my)

Claude reservado solo para emergencias.

---

## Fase 1: Completar Specs (Kimi)

**Objetivo**: Subir readiness de 68% → 80%
**Agente**: Kimi (ky) - Bueno en docs largos y razonamiento

### Tarea 1.1: Specs de Animación

```bash
ky
```

**Prompt para Kimi:**
```
Lee el archivo C:\Users\Kaos\scripts\nuclea\POC_INTERNA\CLAUDE.md para contexto.

Luego lee:
- C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\DESIGN_SYSTEM.md
- C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\USER_FLOWS.md

Mira las 4 imágenes del video demo en:
E:\DOWNLOADS\screenshots_20260203_173352\

Tu tarea: Crear specs detalladas de animación para Framer Motion.
Escribe el archivo: C:\Users\Kaos\scripts\nuclea\POC_INTERNA\03_ANIMATION\CAPSULE_OPENING.md

Debe incluir:
- Keyframes exactos (0%, 25%, 50%, 75%, 100%)
- Valores de transform, opacity, rotate para cada elemento
- Timing functions (easing)
- Código Framer Motion de ejemplo
- Duración de cada fase

Basate en los 4 frames del video para extraer los valores.
```

### Tarea 1.2: Specs de Pantallas Individuales

**Prompt para Kimi:**
```
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\CLAUDE.md para contexto.

Lee los PDFs en C:\Users\Kaos\scripts\nuclea\DISEÑO_ANDREA_PANTALLAS\:
- NUCLEA_INICIO.pdf
- NUCLEA_REGISTRO.pdf

Crea specs individuales para cada pantalla del onboarding:

1. C:\Users\Kaos\scripts\nuclea\POC_INTERNA\02_UI_SCREENS\00_INTRO\P1_CAPSULE_CLOSED.md
2. C:\Users\Kaos\scripts\nuclea\POC_INTERNA\02_UI_SCREENS\00_INTRO\P2_CAPSULE_OPENING.md
3. C:\Users\Kaos\scripts\nuclea\POC_INTERNA\02_UI_SCREENS\00_INTRO\P3_MANIFESTO.md
4. C:\Users\Kaos\scripts\nuclea\POC_INTERNA\02_UI_SCREENS\01_SELECTION\P4_CAPSULE_SELECTION.md

Cada spec debe tener:
- Descripción funcional
- Elementos UI (lista)
- Interacciones
- Estados (loading, error, success)
- Código JSX esqueleto
- Props del componente
```

---

## Fase 2: Backend Supabase (GLM-4.7)

**Objetivo**: Schema funcionando con RLS
**Agente**: GLM-4.7 (gy) - Fuerte en código y lógica

### Tarea 2.1: Schema SQL ejecutable

```bash
gy
```

**Prompt para GLM:**
```
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\CLAUDE.md para contexto.

Lee el modelo de datos:
C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\DATA_MODEL.md

Tu tarea: Crear un archivo SQL ejecutable para Supabase.

Escribe: C:\Users\Kaos\scripts\nuclea\POC_INTERNA\04_BACKEND\SUPABASE_SCHEMA.sql

Requisitos:
1. DROP TABLE IF EXISTS para cada tabla (para re-ejecutar)
2. CREATE TABLE con todos los campos
3. CREATE INDEX para campos frecuentes
4. ENABLE ROW LEVEL SECURITY en cada tabla
5. CREATE POLICY para cada operación (SELECT, INSERT, UPDATE, DELETE)
6. Funciones y triggers documentados
7. Comentarios explicando cada sección

El SQL debe poder ejecutarse directamente en Supabase SQL Editor.
```

### Tarea 2.2: Edge Functions

**Prompt para GLM:**
```
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\FUTURE_MESSAGES.md

Crea las Edge Functions para el sistema de mensajes futuros.

Escribe estos archivos en C:\Users\Kaos\scripts\nuclea\POC_INTERNA\04_BACKEND\edge_functions\:

1. create-future-message.ts - Crear y cifrar mensaje
2. unlock-messages.ts - Cron job para desbloquear
3. send-delivery-notification.ts - Enviar email con Resend

Usa:
- Deno runtime (Supabase Edge Functions)
- Supabase client para DB
- crypto.subtle para cifrado AES-256-GCM
- Resend para emails

Incluye tipos TypeScript y manejo de errores.
```

### Tarea 2.3: Storage Policies

**Prompt para GLM:**
```
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\DATA_MODEL.md (sección Storage)

Crea: C:\Users\Kaos\scripts\nuclea\POC_INTERNA\04_BACKEND\STORAGE_POLICIES.sql

SQL para configurar Supabase Storage:
1. Crear buckets (capsule-contents, avatars, future-messages)
2. Políticas RLS para cada bucket
3. Límites de tamaño por tipo de archivo
4. Políticas de acceso (solo owner puede subir, colaboradores pueden ver)
```

---

## Fase 3: Frontend Components (MiniMax + GLM)

**Objetivo**: Componentes React funcionando
**Agentes**: MiniMax (my) para prototipo, GLM (gy) para pulir

### Tarea 3.1: Componente Cápsula (MiniMax)

```bash
my
```

**Prompt para MiniMax:**
```
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\CLAUDE.md
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\DESIGN_SYSTEM.md
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\03_ANIMATION\CAPSULE_OPENING.md (si existe)

Mira las imágenes en E:\DOWNLOADS\screenshots_20260203_173352\

Crea el componente React de la cápsula animada:
C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\components\Capsule\Capsule.tsx

Requisitos:
- TypeScript
- Framer Motion para animaciones
- Props: isOpen, onOpen, polaroids[]
- Estados: closed, opening, open
- Animación de apertura horizontal
- Polaroids que emergen y flotan
- Estilos con Tailwind CSS

Crea también:
- Capsule.types.ts (interfaces)
- Polaroid.tsx (subcomponente)
```

### Tarea 3.2: Pantalla Onboarding (MiniMax)

**Prompt para MiniMax:**
```
Lee las specs en C:\Users\Kaos\scripts\nuclea\POC_INTERNA\02_UI_SCREENS\00_INTRO\

Crea la pantalla de onboarding completa:
C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\app\onboarding\page.tsx

Debe incluir:
- Las 4 pantallas en secuencia (P1 → P2 → P3 → P4)
- Transiciones entre pantallas
- Componente Capsule importado
- Mobile-first responsive
- Navegación al dashboard tras selección
```

### Tarea 3.3: Revisión y Pulido (GLM)

**Prompt para GLM:**
```
Lee los componentes creados en:
- C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\components\Capsule\
- C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\app\onboarding\

Revisa y mejora:
1. Type safety (TypeScript estricto)
2. Performance (memo, useCallback donde necesario)
3. Accesibilidad (aria labels, keyboard navigation)
4. Edge cases (loading, error states)
5. Consistencia con DESIGN_SYSTEM.md

Corrige cualquier error y añade comentarios explicativos.
```

---

## Fase 4: Integración (GLM + Kimi QA)

### Tarea 4.1: Conectar Frontend con Supabase (GLM)

**Prompt para GLM:**
```
Lee C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\lib\firebase.ts (código actual)
Lee C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\DATA_MODEL.md

Migra de Firebase a Supabase:

1. Crea C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\lib\supabase.ts
   - Cliente Supabase
   - Tipos generados

2. Actualiza C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\hooks\useAuth.ts
   - Supabase Auth en lugar de Firebase

3. Actualiza C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\hooks\useCapsules.ts
   - Queries Supabase
   - Real-time subscriptions

Mantén la API de los hooks igual para no romper componentes.
```

### Tarea 4.2: Testing y QA (Kimi)

**Prompt para Kimi:**
```
Lee todos los archivos en:
- C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\components\
- C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\app\
- C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\src\hooks\

Haz un QA completo:

1. Lista todos los bugs potenciales
2. Verifica consistencia con specs en POC_INTERNA\01_SPECS\
3. Identifica código duplicado
4. Sugiere mejoras de UX
5. Verifica que los flujos de USER_FLOWS.md están implementados

Escribe el reporte en:
C:\Users\Kaos\scripts\nuclea\POC_INTERNA\QA_REPORT.md
```

---

## Orden de Ejecución

```
Semana 1:
├── [ky] Tarea 1.1: Specs animación
├── [ky] Tarea 1.2: Specs pantallas
└── [gy] Tarea 2.1: Schema SQL

Semana 2:
├── [gy] Tarea 2.2: Edge functions
├── [gy] Tarea 2.3: Storage policies
└── [my] Tarea 3.1: Componente cápsula

Semana 3:
├── [my] Tarea 3.2: Pantalla onboarding
├── [gy] Tarea 3.3: Revisión código
└── [gy] Tarea 4.1: Integración Supabase

Semana 4:
├── [ky] Tarea 4.2: QA completo
└── [todos] Fixes y polish
```

---

## Comandos Rápidos

```powershell
# Abrir carpeta POC_INTERNA
cd C:\Users\Kaos\scripts\nuclea\POC_INTERNA

# Lanzar Kimi para specs
ky

# Lanzar GLM para backend
gy

# Lanzar MiniMax para frontend
my

# Ver progreso
start "" "C:\Users\Kaos\scripts\nuclea\POC_INTERNA\POC_INTERNA_MASTER_DOC.html"
```

---

## Escalación a Claude

Usar Claude (cy) SOLO si:

1. Bug crítico que otros agentes no resuelven tras 2 intentos
2. Decisión arquitectónica compleja
3. Integración de múltiples sistemas
4. Debugging de edge functions en producción

**Comando de emergencia:**
```powershell
cy "EMERGENCIA: [descripción del problema]. Lee POC_INTERNA/CLAUDE.md para contexto."
```

---

## Checklist Final

- [ ] Fase 1 completa (readiness 80%)
- [ ] Schema SQL ejecutado en Supabase
- [ ] Edge functions desplegadas
- [ ] Componente Capsule funcionando
- [ ] Onboarding navegable
- [ ] Auth con Supabase
- [ ] QA pasado
- [ ] Demo presentable para Andrea

---

*Workflow creado: 3 Feb 2026*
*Estimación: 4 semanas con dedicación parcial*
