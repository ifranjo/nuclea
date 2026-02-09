## Prompt - Progress Report (checkpoint)

Genera reporte de checkpoint corto, sin relleno.

### Input

- Objetivo del sprint: `{{SPRINT_GOAL}}`
- Estado actual: `{{CURRENT_STATUS}}`
- Cambios hechos: `{{CHANGES_DONE}}`
- Evidencia: `{{EVIDENCE}}`
- Bloqueos: `{{BLOCKERS}}`

### Salida exacta

1. `Estado`: on-track | at-risk | blocked
2. `Hecho hoy` (max 5 bullets)
3. `Evidencia` (comandos + archivos)
4. `Bloqueos y mitigacion`
5. `Proximo bloque de trabajo` (max 3 acciones)

### Reglas

- Nada de lenguaje motivacional.
- Si falta evidencia, marca `at-risk`.
- Cada accion proxima debe poder ejecutarse en una sesion.
