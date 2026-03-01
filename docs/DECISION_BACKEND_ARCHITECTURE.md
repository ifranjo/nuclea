# Decisión Ejecutiva: Arquitectura de Backend

**Fecha:** Feb 2026
**Estado:** Pendiente de decisión
**Track:** Firebase (PREREUNION_ANDREA)

---

## Contexto

NUCLEA actualmente opera con **Firebase** (Auth, Firestore, Storage) en PREREUNION_ANDREA. POC_REAL prototyped con **Supabase** (PostgreSQL local Docker). Se requiere decidir la dirección estratégica para producción.

---

## Opciones Viables

### Opción A: Mantener Firebase (Status Quo)

| Aspecto | Detalle |
|---------|----------|
| **Impacto** | Bajo — sin migración |
| **Esfuerzo** | Bajo — infraestructura existente |
| **Riesgo** | Bajo — ya validado en producción |
| **Costo** | ~€50-100/mes (Firebase Spark → Blaze) |

**Pros:**
- Stack ya implementado y funcionando
- Auth integrado con Google OAuth
- Storage para fotos/videos
- Sin migración de datos

**Contras:**
- Firestore = No SQL (limitado para queries complejos)
- Rate limiting manual (Firestore-based)
- Coste escala puede aumentar
- Menos control sobre infraestructura

---

### Opción B: Migrar a Supabase (Target POC)

| Aspecto | Detalle |
|---------|----------|
| **Impacto** | Alto — nuevo backend |
| **Esfuerzo** | Alto — 2-4 semanas |
| **Riesgo** | Medio — datos + API migration |
| **Costo** | ~€0-50/mes (Supabase Free tier generous) |

**Pros:**
- PostgreSQL real con relaciones
- RLS (Row Level Security) mejor que Firestore rules
- API auto-generada desde schema
- Mejor soporte para queries complejos
- Tipo免费 tier muy generoso

**Contras:**
- Requiere migración de datos Firebase → PostgreSQL
- Auth necesita reconfiguración (Supabase Auth)
- Storage necesita migración (Firebase Storage → Supabase Storage)
- POC_REAL aún no está en producción

---

### Opción C: Firebase + Supabase (Híbrido)

| Aspecto | Detalle |
|---------|----------|
| **Impacto** | Medio — dos backends |
| **Esfuerzo** | Medio — integrar ambos |
| **Riesgo** | Bajo — migración gradual |
| **Costo** | Suma de ambos |

**Pros:**
- Migración gradual
- Mantener Firebase Auth mientras se migra storage
- Menor riesgo de downtime

**Contras:**
- Complejidad operacional (dos sistemas)
- Datos duplicados/transición
- Mayor coste

---

## Implicaciones de cada opción

### Opción A: Firebase
- **Negocio:** Continuar desarrollo features rápidamente
- **Técnico:** Mantener stack actual, optimizar rate limiting
- **Ops:** Monitorear costes Firebase, configurar alerts

### Opción B: Supabase
- **Negocio:** Requiere resources para migración (~2-4 semanas dev)
- **Técnico:** Migrar Auth + Firestore → PostgreSQL + Supabase Auth
- **Ops:** Setup Supabase Cloud, configurar RLS, migrar storage

### Opción C: Híbrido
- **Negocio:** Roadmap más largo pero menor riesgo
- **Técnico:** Definir qué va a cada backend
- **Ops:** Mantener dos sistemas temporalmente

---

## Orden Recomendado de Ejecución

### Si se elige **Opción A (Firebase)**:
1. Optimizar rate limiting (Redis vs Firestore)
2. Configurar alerts de coste Firebase
3. Documentar failback procedures
4. **Fin:** Mantener y mejorar Firebase

### Si se elige **Opción B (Supabase)**:
1. Completar POC_REAL con features parity
2. Migrar schema Firebase → PostgreSQL
3. Migrar Auth (usuarios existentes)
4. Migrar Storage (fotos/videos)
5. Configurar RLS production-ready
6. Deploy POC_REAL a Vercel + Supabase Cloud
7. Feature freeze en PREREUNION_ANDREA
8. **Fin:** Deprecar PREREUNION_ANDREA Firebase

### Si se elige **Opción C (Híbrido)**:
1. Definir split: Auth en Firebase, data en Supabase
2. Migrar datos de capsulas a Supabase progresivamente
3. Mantener Firebase Auth hasta migración completa
4. **Fin:** Eliminación gradual de Firebase

---

## Recomendación

| Factor | Recomendación |
|--------|----------------|
| **Recursos limitados** | Opción A — mantener Firebase |
| **Scale/consultas complejas** | Opción B — migrar a Supabase |
| **Risk-averse** | Opción C — híbrido gradual |

**Recomendación técnica actual:** **Opción A** (mantener Firebase) por:
- Ya está en producción y funcionando
- POC_REAL aún no está deployado
- Evita migración de datos mientras se valida product-market

**Revisión recomendada:** Q3 2026 tras validar product-market fit con usuarios reales.

---

## Próximos Pasos

1. **Inmediato:** Documentar esta decisión en equipo
2. **Corto plazo:** Definir roadmap de features
3. **Medio plazo:** Evaluar costes Firebase en producción real
4. **Largo plazo:** Revisitar decisión Q3 2026

---

*Documento preparado para decisión ejecutiva. Actualizar tras cada revisión trimestral.*
