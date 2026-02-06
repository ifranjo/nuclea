# 02 - TECHNICAL FEASIBILITY & ARCHITECTURE

> **Categoría 2 de 5** | Propósito: Demostrar que la solución es técnicamente viable, escalable y segura

---

## 📋 Contenido de esta Categoría

Esta carpeta documenta la arquitectura técnica de NUCLEA: stack tecnológico, decisiones de diseño, y evidencia de que el sistema puede funcionar a escala.

---

## 2.1 Technology Stack (Stack Tecnológico)

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.4 | Framework React con App Router |
| React | 18.3.1 | UI library |
| TypeScript | 5.7.2 | Type safety |
| Tailwind CSS | 3.4.17 | Styling utility-first |
| Framer Motion | 11.15.0 | Animaciones |
| Zustand | 5.0.2 | State management |

### Backend & Infraestructura
| Tecnología | Propósito |
|------------|-----------|
| Firebase Auth | Autenticación (email, Google, Apple) |
| Firestore | Base de datos NoSQL documental |
| Firebase Storage | Almacenamiento de media (fotos, videos) |
| Firebase Functions | Serverless para lógica de negocio |
| Vercel | Hosting y CDN |

### Third-Party Integrations (Futuro)
| Servicio | Propósito | Status POC |
|----------|-----------|------------|
| ElevenLabs | Síntesis de voz para avatar | Mock/UI only |
| OpenAI | Generación de respuestas avatar | Mock/UI only |
| Stripe | Pagos y suscripciones | Excluido POC |

---

## 2.2 System Architecture (Arquitectura del Sistema)

### High-Level Architecture (HLA)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Navegador)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Landing   │  │   Login/    │  │  Dashboard  │  │   Editor    │ │
│  │    Page     │  │   Registro  │  │             │  │  Cápsulas   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   Next.js API      │
                         │   Routes (Vercel)  │
                         └─────────┬──────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
   ┌──────▼──────┐        ┌────────▼────────┐     ┌────────▼────────┐
   │   Firebase  │        │   Firestore     │     │  Firebase       │
   │    Auth     │        │   (Database)    │     │   Storage       │
   └─────────────┘        └─────────────────┘     └─────────────────┘
```

### Data Flow Diagram (DFD) - Creación de Cápsula

```
Usuario → Login (Firebase Auth) → JWT Token
   ↓
Dashboard → Selecciona tipo cápsula → API /capsules
   ↓
Firestore: Crea documento capsules/{capsuleId}
   ↓
Editor → Sube contenido → Firebase Storage
   ↓
Firestore: Actualiza referencias media[]
   ↓
Compartir → API /share → Firestore: Update sharedWith[]
```

---

## 2.3 Database Schema (Esquema de Datos)

### Colecciones Firestore

```typescript
// users/{userId}
interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  plan: 'free' | 'esencial' | 'familiar' | 'premium'
  createdAt: Timestamp
  capsuleCount: number
  storageUsed: number        // bytes
  consentAI?: {
    signed: boolean
    documentUrl: string
    signedAt: Timestamp
  }
}

// capsules/{capsuleId}
interface Capsule {
  id: string
  userId: string             // ref: users/{userId}
  type: 'everlife' | 'life-chapter' | 'social' | 'pet' | 'origin'
  title: string
  description: string
  coverImage?: string        // URL Storage
  createdAt: Timestamp
  updatedAt: Timestamp
  isPublic: boolean
  sharedWith: string[]       // array de userIds
  scheduledRelease?: Timestamp
  status: 'draft' | 'active' | 'sealed' | 'released'
  tags: string[]
}

// contents/{contentId}
interface CapsuleContent {
  id: string
  capsuleId: string          // ref: capsules/{capsuleId}
  type: 'photo' | 'video' | 'audio' | 'text' | 'document'
  url?: string               // URL Storage
  text?: string
  caption?: string
  createdAt: Timestamp
  metadata?: {
    size: number
    mimeType: string
    dimensions?: { width: number, height: number }
  }
}

// waitlist/{entryId}
interface WaitlistEntry {
  id: string
  email: string
  createdAt: Timestamp
  source: string            // 'landing', 'referral', etc.
  capsuleInterest?: string[] // tipos de cápsula de interés
  notified: boolean
}
```

### Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │◄──────┤   capsules  │◄──────┤  contents   │
├─────────────┤  1:N  ├─────────────┤  1:N  ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │       │ userId (FK) │       │ capsuleId   │
│ plan        │       │ type        │       │ type        │
│ storageUsed │       │ title       │       │ url         │
└─────────────┘       │ status      │       └─────────────┘
                      └─────────────┘
                             │
                             │ N:M
                             ▼
                      ┌─────────────┐
                      │ sharedWith  │
                      │ (array)     │
                      └─────────────┘
```

---

## 2.4 Success Criteria (Criterios de Éxito Técnico)

### Performance Benchmarks
| Métrica | Target | Método de Prueba |
|---------|--------|------------------|
| Time to First Byte (TTFB) | <200ms | WebPageTest |
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse |
| API response time (p95) | <500ms | Firebase monitoring |
| Subida de imagen (5MB) | <10s | Test manual |
| Carga dashboard | <3s | Lighthouse |

### Escalabilidad
| Escenario | Capacidad | Estrategia |
|-----------|-----------|------------|
| Usuarios concurrentes | 1,000 | Firebase auto-scale |
| Cápsulas por usuario | 100 | Límites de plan |
| Almacenamiento por usuario | 100GB | Firebase Storage quotas |
| Requests/minuto | 10,000 | Vercel + Firebase limits |

### Seguridad (Resumen - ver Categoría 3)
- Autenticación JWT con Firebase Auth
- Reglas Firestore granulares por usuario
- Encriptación en tránsito (TLS 1.3) y reposo (AES-256)
- Validación de inputs con Zod

---

## 2.5 Technical Decisions Log (Registro de Decisiones)

| Fecha | Decisión | Alternativas | Razón |
|-------|----------|--------------|-------|
| 2025-01 | Firebase vs AWS | AWS Amplify, Supabase | Velocidad de desarrollo, costo inicial bajo |
| 2025-01 | Next.js vs React puro | Create React App, Vue | SSR para SEO, App Router moderno |
| 2025-01 | Firestore vs PostgreSQL | MongoDB, RDS | Integración nativa Firebase, real-time |
| 2025-01 | Zustand vs Redux | Redux Toolkit, Context | Simplicidad, menos boilerplate |
| 2025-01 | Tailwind vs Styled | Chakra, Material UI | Customización rápida, bundle size |

---

## 2.6 POC Technical Deliverables (Entregables Técnicos POC)

### Funcionalidades Implementadas
- [x] Landing page con waitlist funcional
- [x] Autenticación (registro/login/logout)
- [x] Dashboard de usuario
- [x] Creación de cápsula (Life Chapter)
- [x] Subida de fotos a cápsula
- [x] Compartir cápsula por email
- [x] Responsive design (mobile-first)

### Funcionalidades Mock (UI Only)
- [ ] Avatar AI interactivo
- [ ] Video/audio en cápsulas
- [ ] Procesamiento de pagos
- [ ] Notificaciones push

---

## 📁 Archivos en esta Carpeta

```
02_TECHNICAL_ARCHITECTURE/
├── README.md                    ← Este archivo
├── TECH_STACK.md                ← Detalle completo del stack
├── ARCHITECTURE_DIAGRAMS.md     ← Diagramas HLA, DFD, ERD
├── DATABASE_SCHEMA.md           ← Esquema Firestore completo
├── API_SPECIFICATION.md         ├── Endpoints y contratos
├── PERFORMANCE_BENCHMARKS.md    ├── Resultados de testing
├── SECURITY_OVERVIEW.md         ├── Resumen (detalle en Cat 3)
└── DECISIONS_LOG.md             ├── Registro de ADRs
```

---

## 🔗 Conexión con Otras Categorías

| Categoría | Conexión |
|-----------|----------|
| 01_EXECUTIVE_SUMMARY | Qué problema resuelve esta arquitectura |
| 03_MARKET_VALIDATION | Si la tecnología elegida es adecuada para el mercado |
| 04_BUSINESS_MODEL | Costos de infraestructura y unit economics |
| 05_RISK_ROADMAP | Riesgos técnicos y mitigaciones |

---

*Última actualización: 2025-02-01 | Estado: Estructura creada, contenido pendiente*
