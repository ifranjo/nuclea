# 04 - BUSINESS MODEL & FINANCIAL PROJECTIONS

> **Categoría 4 de 5** | Propósito: Demostrar cómo generamos ingresos y proyecciones financieras realistas

---

## 📋 Contenido de esta Categoría

Esta carpeta documenta el modelo de negocio de NUCLEA: fuentes de ingreso, unit economics, y proyecciones financieras a 3 años.

---

## 4.1 Revenue Model (Modelo de Ingresos)

### Freemium SaaS + One-Time Purchases

| Plan | Precio | Cápsulas | Almacenamiento | AI Avatar | Target |
|------|--------|----------|----------------|-----------|--------|
| **Gratuito** | €0 | 1 | 500MB | ❌ | Adquisición |
| **Esencial** | €9.99/mes | 2 | 5GB | ❌ | Usuarios individuales |
| **Familiar** | €24.99/mes | 10 | 50GB | ✅ | Familias |
| **EverLife Premium** | €99 único | 1 | 100GB | ✅ + Soporte | Legado permanente |

### Revenue Mix Projection (Año 3)

```
        Ingresos Totales: €2M
        ═══════════════════════════════════════

        Suscripciones (MRR)     65%  ████████████████████
        EverLife Premium        25%  ████████
        Partnerships B2B         7%  ██
        API/White-label          3%  █
```

### Pricing Strategy

**Anclaje de precios**: EverLife Premium a €99 establece valor percibido alto, haciendo que €24.99/mes parezca razonable.

**Psychological pricing**:
- €9.99 (menos de €10) para baja fricción de entrada
- €24.99 (parece €20) para familiar
- €99 (precio redondo) para premium/permanente

---

## 4.2 Unit Economics (Economía Unitaria)

### Customer Acquisition Cost (CAC)

| Canal | CAC | % de Adquisiciones |
|-------|-----|-------------------|
| Orgánico (SEO/Content) | €0 | 30% |
| Referidos | €5 | 25% |
| Social Media orgánico | €2 | 20% |
| Paid Ads | €20 | 20% |
| Partnerships | €15 | 5% |
| **Blended CAC** | **€6.50** | 100% |

### Lifetime Value (LTV)

| Plan | ARPU/mes | Retención (24m) | LTV |
|------|----------|-----------------|-----|
| Esencial | €9.99 | 65% | €130 |
| Familiar | €24.99 | 75% | €375 |
| EverLife | €99 único | N/A | €99 |

**Blended LTV**: ~€200 (ponderado por mix de planes)

### LTV:CAC Ratio

```
LTV:CAC = €200 : €6.50 = 30.8:1

Benchmarks:
❌ <3:1  = Insostenible
⚠️ 3-5:1 = Aceptable
✅ >5:1  = Excelente
🚀 30:1  = Excepcional (valida product-market fit fuerte)
```

### Payback Period

| Métrica | Valor |
|---------|-------|
| CAC | €6.50 |
| ARPU (blended) | €15/mes |
| Gross Margin | 85% |
| **Payback Period** | **0.5 meses** |

---

## 4.3 Cost Structure (Estructura de Costos)

### Fixed Costs (Monthly)

| Categoría | Costo | Notas |
|-----------|-------|-------|
| Equipo (2 founders) | €4,000 | Salarios simbólicos inicial |
| Firebase/Vercel | €200 | Escala con usuarios |
| Herramientas (SaaS) | €150 | Figma, Notion, etc. |
| Marketing | €500 | Inicialmente orgánico |
| Legal/Admin | €300 | |
| **Total Fixed** | **€5,150/mes** | |

### Variable Costs (por usuario)

| Métrica | Costo | % de Revenue |
|---------|-------|--------------|
| Firebase Storage | €0.02/GB | ~5% |
| Firebase Auth | €0.01/user | ~1% |
| Firestore reads/writes | €0.05/user | ~3% |
| Payment processing (Stripe) | 2.9% + €0.30 | ~5% |
| **Total Variable** | **~15%** | **85% Gross Margin** |

### Break-Even Analysis

```
Fixed Costs: €5,150/mes
Contribution Margin: 85%
ARPU: €15

Break-even = €5,150 / (€15 × 0.85) = 404 usuarios pagos

Con 1,000 usuarios pagos:
Revenue: €15,000
Costs: €5,150 + €2,250 (variable) = €7,400
Profit: €7,600 (51% margin)
```

---

## 4.4 Financial Projections (Proyecciones 3 Años)

### Year 1

| Métrica | Q1 | Q2 | Q3 | Q4 | Total |
|---------|-----|-----|-----|-----|-------|
| Usuarios pagos | 50 | 150 | 300 | 500 | - |
| MRR | €500 | €1,500 | €3,000 | €5,000 | - |
| Revenue | €500 | €1,500 | €3,000 | €8,000* | €13,000 |
| Costs | €15,000 | €10,000 | €8,000 | €8,000 | €41,000 |
| **Net** | **-€14,500** | **-€8,500** | **-€5,000** | **€0** | **-€28,000** |

*Incluye €3,000 EverLife Premium

### Year 2

| Métrica | Q1 | Q2 | Q3 | Q4 | Total |
|---------|-----|-----|-----|-----|-------|
| Usuarios pagos | 800 | 1,200 | 1,800 | 2,500 | - |
| MRR | €8,000 | €12,000 | €18,000 | €25,000 | - |
| Revenue | €10,000 | €15,000 | €22,000 | €35,000 | €82,000 |
| Costs | €10,000 | €12,000 | €15,000 | €18,000 | €55,000 |
| **Net** | **€0** | **€3,000** | **€7,000** | **€17,000** | **€27,000** |

### Year 3

| Métrica | Q1 | Q2 | Q3 | Q4 | Total |
|---------|-----|-----|-----|-----|-------|
| Usuarios pagos | 3,500 | 5,000 | 7,000 | 10,000 | - |
| MRR | €35,000 | €50,000 | €70,000 | €100,000 | - |
| Revenue | €45,000 | €65,000 | €90,000 | €130,000 | €330,000 |
| Costs | €25,000 | €32,000 | €40,000 | €50,000 | €147,000 |
| **Net** | **€20,000** | **€33,000** | **€50,000** | **€80,000** | **€183,000** |

### Resumen 3 Años

```
Revenue Progression:
Year 1:  €13K    █
Year 2:  €82K    ██████
Year 3:  €330K   ███████████████████████████

Cumulative Revenue: €425K
Cumulative Profit:  €182K (43% margin)
```

---

## 4.5 Funding Requirements (Necesidades de Financiación)

### The Ask: €150,000 Pre-Seed

| Uso | Monto | % | Propósito |
|-----|-------|---|-----------|
| Product Development | €60,000 | 40% | 1 developer FT, 6 meses |
| Marketing/Growth | €45,000 | 30% | Paid acquisition, content |
| Operations | €30,000 | 20% | Legal, herramientas, misc |
| Reserve | €15,000 | 10% | Buffer imprevistos |

### Milestones con Funding

| Milestone | Timeline | Métrica |
|-----------|----------|---------|
| MVP completo | Mes 3 | 5 cápsulas funcionales |
| 1,000 usuarios | Mes 6 | Product-market fit signals |
| Revenue €5K MRR | Mes 9 | Sostenibilidad inicial |
| Seed round ready | Mes 12 | €20K MRR, 3,000 usuarios |

### Runway

**€150K / €5,150 mensual = 29 meses** (con crecimiento controlado)

Con hiring de 1 developer: **18 meses runway**

---

## 📁 Archivos en esta Carpeta

```
04_BUSINESS_MODEL/
├── README.md                    ← Este archivo
├── PRICING_STRATEGY.md          ├── Análisis de pricing detallado
├── UNIT_ECONOMICS.md            ├── CAC, LTV, cohort analysis
├── COST_STRUCTURE.md            ├── Breakdown de costos fijos/variables
├── FINANCIAL_MODEL.xlsx         ├── Modelo financiero completo
├── FUNDING_REQUIREMENTS.md      ├── Use of funds detallado
└── COMPARABLE_COMPANIES.md      ├── Múltiplos de salida/valuation
```

---

## 🔗 Conexión con Otras Categorías

| Categoría | Conexión |
|-----------|----------|
| 01_EXECUTIVE_SUMMARY | El problema que monetizamos |
| 02_TECHNICAL_ARCHITECTURE | Costos de infraestructura |
| 03_MARKET_VALIDATION | El mercado que capturamos |
| 05_RISK_ROADMAP | Riesgos financieros y mitigaciones |

---

*Última actualización: 2025-02-01 | Estado: Estructura creada, contenido pendiente*
