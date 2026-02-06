# 05 - RISK ASSESSMENT & EXECUTION ROADMAP

> **Categoría 5 de 5** | Propósito: Identificar riesgos críticos y presentar un plan de ejecución claro con milestones

---

## 📋 Contenido de esta Categoría

Esta carpeta documenta los riesgos de NUCLEA (técnicos, de mercado, regulatorios) y el roadmap de ejecución con milestones claros.

---

## 5.1 Risk Assessment Matrix (Matriz de Riesgos)

### Risk Categories

| Riesgo | Probabilidad | Impacto | Score | Prioridad |
|--------|--------------|---------|-------|-----------|
| **Técnicos** | | | | |
| Escalabilidad de Firebase | Media | Alto | 6 | 🔴 Alta |
| Latencia en subida de media | Media | Medio | 4 | 🟡 Media |
| Dependencia de terceros (Firebase) | Baja | Alto | 3 | 🟢 Baja |
| **De Mercado** | | | | |
| Competidor con más funding | Media | Alto | 6 | 🔴 Alta |
| Baja retención de usuarios | Media | Alto | 6 | 🔴 Alta |
| Dificultad adquisición (CAC alto) | Media | Medio | 4 | 🟡 Media |
| **Regulatorios/Eticos** | | | | |
| Regulación AI/Avatar | Baja | Alto | 3 | 🟢 Baja |
| Problemas GDPR/consentimiento | Baja | Alto | 3 | 🟢 Baja |
| **Financieros** | | | | |
| Runway insuficiente | Baja | Alto | 3 | 🟢 Baja |
| Dificultad levantar ronda seed | Media | Medio | 4 | 🟡 Media |

### Risk Score Formula
```
Score = Probabilidad (1-3) × Impacto (1-3)

Prioridad:
🔴 6-9 = Alta - Mitigación inmediata requerida
🟡 4-5 = Media - Plan de mitigación definido
🟢 1-3 = Baja - Monitoreo regular
```

---

## 5.2 Risk Mitigation Strategies (Estrategias de Mitigación)

### 🔴 Riesgos Altos

#### R1: Escalabilidad de Firebase
**Riesgo**: Firebase puede volverse costoso o limitado >100K usuarios

**Mitigación**:
- [ ] Implementar caching agresivo (Redis)
- [ ] Optimizar queries Firestore (índices compuestos)
- [ ] Archivar cápsulas inactivas a cold storage
- [ ] Plan de migración a PostgreSQL si necesario (documentado)

**Trigger**: Cuando costo Firebase >20% de revenue

#### R2: Competidor con Más Funding
**Riesgo**: Eternos o similar levanta ronda grande y entra a España

**Mitigación**:
- [ ] First-mover advantage en español (ya lo tenemos)
- [ ] Partnerships exclusivas con funerarias
- [ ] Comunidad/brand emocional fuerte
- [ ] Barrera: consentimiento AI ya implementado

**Trigger**: Anuncio de competidor en mercado hispano

#### R3: Baja Retención de Usuarios
**Riesgo**: Usuarios crean 1 cápsula y no vuelven

**Mitigación**:
- [ ] Onboarding que incentiva múltiples cápsulas
- [ ] Recordatorios emocionales ("Tu cápsula espera")
- [ ] Feature "Familia" para compartir gestión
- [ ] Gamificación leve (streaks, logros)

**KPI**: Retención D30 >40%

---

### 🟡 Riesgos Medios

#### R4: Latencia en Subida de Media
**Mitigación**: Compresión client-side, upload en background, progress indicators

#### R5: Dificultad Adquisición
**Mitigación**: Diversificar canales, focus en partnerships B2B, contenido SEO

#### R6: Dificultad Levantar Seed
**Mitigación**: Traction mínima definida (€5K MRR), alternativas: crowdfunding, angels

---

## 5.3 Execution Roadmap (Hoja de Ruta)

### Timeline Visual

```
2025 Q1          Q2          Q3          Q4          2026 Q1
  │              │           │           │            │
  ▼              ▼           ▼           ▼            ▼
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ POC  │───▶│ MVP  │───▶│ Beta │───▶│Launch│───▶│Scale │
│      │    │      │    │Open  │    │      │    │Seed  │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘
  │           │           │           │            │
Funding    100 users   1K users    3K users    10K users
€150K      €1K MRR     €5K MRR     €15K MRR    €50K MRR
```

### Detailed Milestones

#### FASE 1: POC (Mes 1-2) - COMPLETADO
| Milestone | Status | Evidence |
|-----------|--------|----------|
| Landing page con waitlist | ✅ | nuclea.app |
| Autenticación funcional | ✅ | Firebase Auth |
| 2 cápsulas implementadas | ✅ | Life Chapter, EverLife UI |
| 250+ waitlist | ✅ | Base de datos |

#### FASE 2: MVP (Mes 3-4)
| Milestone | Target | Owner |
|-----------|--------|-------|
| 5 cápsulas completas | 30 Abril | Tech |
| Subida multimedia | 15 Abril | Tech |
| Sistema de compartir | 30 Abril | Tech |
| 100 beta testers | 30 Abril | Growth |
| €1K MRR | 30 Abril | Business |

#### FASE 3: Beta Abierta (Mes 5-7)
| Milestone | Target | Owner |
|-----------|--------|-------|
| Onboarding optimizado | 15 Junio | Product |
| App móvil PWA | 30 Junio | Tech |
| 1,000 usuarios activos | 30 Julio | Growth |
| 3 partnerships funerarias | 30 Julio | Business |
| €5K MRR | 30 Julio | Business |

#### FASE 4: Lanzamiento Público (Mes 8-10)
| Milestone | Target | Owner |
|-----------|--------|-------|
| Marketing paid (€5K/mes) | 1 Agosto | Growth |
| PR/Press coverage | 15 Agosto | Business |
| 3,000 usuarios | 30 Sept | Growth |
| €15K MRR | 30 Sept | Business |
| NPS >50 | 30 Sept | Product |

#### FASE 5: Scale + Seed Round (Mes 11-12)
| Milestone | Target | Owner |
|-----------|--------|-------|
| 10,000 usuarios | 31 Dic | Growth |
| €50K MRR | 31 Dic | Business |
| Expansión LATAM (México) | 31 Dic | Business |
| Ronda Seed €500K-1M | Q1 2026 | CEO |

---

## 5.4 Go/No-Go Decision Gates (Puntos de Decisión)

### Gate 1: MVP Validation (Fin Mes 4)
**Criteria**:
- [ ] 100 usuarios activos (DAU/MAU >30%)
- [ ] NPS >40
- [ ] Retención D30 >30%
- [ ] CAC <€20

**Decision**: ¿Proceder a Beta Abierta?
- ✅ GO: Si 3/4 criteria cumplidos
- ❌ NO-GO: Pivot o kill si <2/4

### Gate 2: Product-Market Fit (Fin Mes 7)
**Criteria**:
- [ ] 1,000 usuarios pagos
- [ ] €5K MRR
- [ ] LTV:CAC >5:1
- [ ] Churn mensual <5%

**Decision**: ¿Proceder a Lanzamiento Público?
- ✅ GO: Si PMF signals fuertes
- ❌ NO-GO: Iterar más antes de scaling

### Gate 3: Seed Readiness (Fin Mes 10)
**Criteria**:
- [ ] €15K MRR
- [ ] 40%+ revenue growth MoM
- [ ] Unit economics positivas
- [ ] Equipo completo (3-4 personas)

**Decision**: ¿Levantar ronda Seed?
- ✅ GO: Si metrics atractivos para VCs
- ❌ NO-GO: Extender runway, crecer más

---

## 5.5 Team & Resource Plan

### Current Team

| Rol | Persona | Dedicación | Experiencia |
|-----|---------|------------|-------------|
| CEO/Product | Andrea Box | Full-time | 10 años sector digital |
| CTO/Tech | Imanol Franjo | Part-time | Full-stack, Firebase |

### Hiring Plan

| Rol | Timing | Costo/año | Prioridad |
|-----|--------|-----------|-----------|
| Full-stack Developer | Mes 3 | €40K | 🔴 Alta |
| Growth/Marketing | Mes 6 | €30K | 🟡 Media |
| Customer Success | Mes 9 | €25K | 🟢 Baja |

---

## 📁 Archivos en esta Carpeta

```
05_RISK_ROADMAP/
├── README.md                    ← Este archivo
├── RISK_MATRIX.md               ├── Matriz completa de riesgos
├── RISK_MITIGATION_PLANS.md     ├── Planes detallados por riesgo
├── EXECUTION_ROADMAP.md         ├── Timeline detallado Gantt
├── MILESTONES.md                ├── KPIs y decision gates
├── TEAM_PLAN.md                 ├── Organigrama y hiring plan
└── CONTINGENCY_PLANS.md         ├── Planes B para escenarios críticos
```

---

## 🔗 Conexión con Otras Categorías

| Categoría | Conexión |
|-----------|----------|
| 01_EXECUTIVE_SUMMARY | Objetivos que el roadmap cumple |
| 02_TECHNICAL_ARCHITECTURE | Riesgos técnicos y mitigaciones |
| 03_MARKET_VALIDATION | Riesgos de mercado y competencia |
| 04_BUSINESS_MODEL | Riesgos financieros y runway |

---

*Última actualización: 2025-02-01 | Estado: Estructura creada, contenido pendiente*
