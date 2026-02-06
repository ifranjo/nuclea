# AGENTS INDEX

Indice de todos los agentes y tools disponibles.

## Agentes de Coding (CLI)

| Alias | Provider | Model | API Base | Estado |
|-------|----------|-------|----------|--------|
| `cy` | Anthropic | Claude Opus 4.5 | Default | ✅ Activo |
| `gy` | Zhipu AI | GLM-4.7 | `https://api.z.ai/api/anthropic` | ✅ Activo |
| `ky` | Moonshot | Kimi K2 | `https://api.kimi.com/coding/` | ✅ Activo |
| `my` | MiniMax | M2.1 | `https://api.minimax.io/anthropic` | ✅ Activo |

## Agentes Especializados (Claude Code)

| Agente | Model | Caso de Uso |
|--------|-------|-------------|
| `opus-precision-worker` | opus | Tareas complejas con trazabilidad |
| `quick-prototype-executor` | sonnet | Prototipado rapido |
| `opus-parallel-orchestrator` | opus | Workflows paralelos |
| `parallel-sonnet-coder` | sonnet | Generacion paralela rapida |

## Skills Disponibles

### Desarrollo
- `/autothink` - Meta thinking con COT/VOT
- `/brainstorming` - Exploracion creativa
- `/jarvis` - Investigacion profunda (5 busquedas)
- `/jarvisyt` - Jarvis + 2 transcripts YouTube
- `/initSkills` - Inicializar proyecto con skills

### Documentacion
- `/doc-coauthoring` - Co-escritura de docs
- `/htmlreport` - Reporte HTML estilo JARVIS
- `/ascii` - Reporte ASCII terminal
- `/sidebar` - Documentacion con sidebar

### Desarrollo Web
- `/frontend-design` - UI de alta calidad
- `/web-design-guidelines` - Review UI/UX
- `/webapp-testing` - Testing con Playwright

### Automation
- `/delegate` - Delegacion paralela
- `/rps` - Command center automation
- `/browser` - Automatizacion navegador

## MCP Servers

| Server | Proposito | Estado |
|--------|-----------|--------|
| `memory` | Memoria persistente | Instalado |
| `playwright` | Automatizacion navegador | Instalado |

## Hooks Activos

| Evento | Script | Proposito |
|--------|--------|-----------|
| `PreToolUse:Bash` | `block-dangerous.ps1` | Bloquear comandos peligrosos |
| `PostToolUse:Bash` | `log-commands.ps1` | Log de comandos |
| `Stop` | `session-end.ps1` | Notificacion fin sesion |

---

Actualizado: 2026-02-01
