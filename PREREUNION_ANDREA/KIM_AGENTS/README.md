# KIM_AGENTS

Documentacion de agentes y automation tools para el proyecto NUCLEA.

## Estructura

```
KIM_AGENTS/
├── README.md                    # Este archivo
├── AGENTS_INDEX.md              # Indice de todos los agentes
├── WORKFLOWS.md                 # Flujos de trabajo automatizados
└── DELEGATION_PATTERNS.md       # Patrones de delegacion
```

## Proposito

Este folder contiene documentacion sobre:
- Agentes IA disponibles (Claude, GLM, Kimi, MiniMax)
- Workflows de delegacion
- Patrones de desarrollo
- Configuraciones de automation

## Agentes Disponibles

| Alias | Provider | Model | Uso |
|-------|----------|-------|-----|
| `cy` | Anthropic | Claude Opus 4.5 | Tareas complejas |
| `gy` | Zhipu AI | GLM-4.7 | Codigo alternativo |
| `ky` | Moonshot | Kimi K2 | Codigo rapido |
| `my` | MiniMax | M2.1 | Codigo alternativo |

## Comandos Principales

```bash
/delegate cy "tarea"     # Delegar a Claude
/delegate both "tarea"   # Delegar a todos
/jarvis "topic"          # Investigacion profunda
/htmlreport "topic"      # Generar reporte HTML
/ascii "topic"           # Generar reporte ASCII
```

## Relacionado

- Documentacion principal: `docs/`
- Agentes de desarrollo: `docs/agents/` (legacy)

---

Actualizado: 2026-02-01
