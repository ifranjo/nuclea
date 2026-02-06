# NUCLEA - Propuesta de Demo MVP

## Objetivo de la Demo
Crear un prototipo funcional que:
1. Comunique el concepto emocional de NUCLEA
2. Demuestre el flujo principal de creación de cápsula
3. Sea visualmente impactante para inversores
4. No requiera infraestructura compleja

## Alcance Recomendado

### Incluido en Demo
- [ ] Landing page emocional con propuesta de valor
- [ ] Registro/Login básico
- [ ] Creación de cápsula Life Chapter (más simple)
- [ ] Creación de cápsula EverLife (simplificada)
- [ ] Upload de fotos y texto (videos limitado)
- [ ] Preview de cápsula creada
- [ ] Configuración de fecha de entrega (visual)
- [ ] Dashboard de "mis cápsulas"

### NO incluido en Demo
- Avatar digital funcional (solo explicativo)
- Cifrado E2E real
- Envío real de cápsulas programadas
- Sistema de destinatarios verificados
- Social Capsule, Pet Capsule, Origin Capsule
- App móvil nativa

## Wireframes Conceptuales

### 1. Landing Page
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo NUCLEA]                    [Iniciar Sesión] [Demo]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     "Somos las historias que recordamos.                    │
│      Haz que las tuyas permanezcan."                        │
│                                                             │
│              [Crear mi primera cápsula]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│   │EverLife │  │ Chapter │  │ Social  │  │   Pet   │       │
│   │ Capsule │  │ Capsule │  │ Capsule │  │ Capsule │       │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
├─────────────────────────────────────────────────────────────┤
│   "¿Cómo funciona?"  [Video explicativo]                    │
└─────────────────────────────────────────────────────────────┘
```

### 2. Selección de Cápsula
```
┌─────────────────────────────────────────────────────────────┐
│  ← Volver                              Mi cuenta ▼          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ¿Qué quieres preservar hoy?                    │
│                                                             │
│   ┌─────────────────────┐  ┌─────────────────────┐         │
│   │                     │  │                     │         │
│   │    🏛️ EverLife      │  │    📖 Life Chapter  │         │
│   │                     │  │                     │         │
│   │  Tu legado para     │  │  Una etapa especial │         │
│   │  quienes amas       │  │  como regalo        │         │
│   │                     │  │                     │         │
│   │    [Crear →]        │  │    [Crear →]        │         │
│   └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│   ┌─────────────────────┐  ┌─────────────────────┐         │
│   │    🐾 Pet           │  │    👶 Origin        │         │
│   │    (Próximamente)   │  │    (Próximamente)   │         │
│   └─────────────────────┘  └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 3. Creación de Cápsula (Wizard)
```
Paso 1/4: Información básica
┌─────────────────────────────────────────────────────────────┐
│  Nombre de tu cápsula: [_________________________]          │
│                                                             │
│  ¿Para quién es?                                            │
│  [_________________________] (nombre del destinatario)      │
│                                                             │
│  Mensaje inicial (opcional):                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│                              [Siguiente →]                  │
└─────────────────────────────────────────────────────────────┘

Paso 2/4: Añadir contenido
┌─────────────────────────────────────────────────────────────┐
│  📷 Fotos        📝 Textos       🎬 Videos                  │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│  │  +  │ │ 📷  │ │ 📷  │ │ 📷  │  Arrastra o haz click    │
│  │     │ │     │ │     │ │     │                           │
│  └─────┘ └─────┘ └─────┘ └─────┘                           │
│                                                             │
│  [← Anterior]                      [Siguiente →]            │
└─────────────────────────────────────────────────────────────┘

Paso 3/4: Programar entrega
┌─────────────────────────────────────────────────────────────┐
│  ¿Cuándo quieres que llegue esta cápsula?                   │
│                                                             │
│  ○ En una fecha específica: [📅 Seleccionar]                │
│  ○ Cuando ya no esté (EverLife)                             │
│  ○ En un evento especial: [▼ Seleccionar]                   │
│    - Cumpleaños                                             │
│    - Boda                                                   │
│    - Graduación                                             │
│                                                             │
│  [← Anterior]                      [Siguiente →]            │
└─────────────────────────────────────────────────────────────┘

Paso 4/4: Preview y confirmar
┌─────────────────────────────────────────────────────────────┐
│            ✨ Tu cápsula está lista ✨                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │           [Preview visual de la cápsula]              │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Para: María García                                         │
│  Entrega: 15 de marzo de 2026                               │
│  Contenido: 12 fotos, 3 textos                              │
│                                                             │
│  [← Editar]                        [Guardar cápsula ✓]      │
└─────────────────────────────────────────────────────────────┘
```

## Stack Técnico Propuesto

```
Frontend:
├── Next.js 14 (App Router)
├── Tailwind CSS (estilos)
├── Framer Motion (animaciones emocionales)
├── React Hook Form (formularios)
└── Zustand (estado simple)

Backend:
├── Firebase Auth (login/registro)
├── Firestore (base de datos)
├── Firebase Storage (archivos)
└── Vercel (hosting)

Extras:
├── Cloudinary (optimización imágenes) - opcional
└── Resend (emails) - opcional para demo
```

## Fases de Desarrollo

### Fase 1: Setup + Landing (3-4 días)
- Configurar proyecto Next.js
- Diseñar landing page emocional
- Integrar Firebase Auth
- Deploy inicial en Vercel

### Fase 2: Creación de Cápsula (5-7 días)
- Wizard de creación paso a paso
- Upload de fotos y texto
- Formularios validados
- Guardar en Firestore

### Fase 3: Dashboard + Preview (4-5 días)
- Lista de cápsulas del usuario
- Preview visual de cada cápsula
- Configuración de entrega (UI)
- Estados de cápsula (borrador, lista, enviada)

### Fase 4: Pulido + Demo (2-3 días)
- Animaciones y transiciones
- Responsive mobile
- Datos de demo precargados
- Testing general

**Total estimado: 14-19 días de trabajo enfocado**

## Entregables

1. **Demo funcional** hospedada en Vercel
2. **Código fuente** en repositorio privado
3. **Documentación básica** de uso
4. **Datos de demo** precargados para presentación
5. **Video walkthrough** (opcional)

## Preguntas para Andrea

1. ¿Hay diseñador o necesito proponer diseño también?
2. ¿Qué cápsulas son prioritarias para la demo?
3. ¿Cuál es el timeline para tener la demo?
4. ¿Hay colores/estilo visual definido?
5. ¿La demo es para inversores específicos o general?

---
*Documento generado: 2025-01-02*
