## Prompt CY - Gate review tecnico y de riesgo

Actua como revisor principal (staff+) para NUCLEA en:
`C:\Users\Kaos\scripts\nuclea`

No implementes features nuevas. Tu trabajo es auditar calidad, riesgo y cumplimiento.

Inputs:
- Commits recientes de remediacion P0/P1
- Reportes de prompts:
  - `PRM-QUALITY-008`
  - `PRM-UX-008`
  - `PRM-TRUST-002`

Proceso:
1. Revisar `git log --oneline -n 20` y diff por commit.
2. Verificar evidencia tecnica real:
   - typecheck
   - build
   - analyzer/lighthouse (si aplica)
3. Identificar regresiones o claims no demostrados.
4. Calcular gate esperado (PASS/WARN/FAIL) con justificacion.

Salida obligatoria:
1. Findings (ordenados por severidad, con `archivo:linea`)
2. Riesgos residuales (tecnico, legal, operativo)
3. Evidencia faltante para mover WARN -> PASS
4. Recomendacion final:
   - `ship`
   - `ship with follow-ups`
   - `hold`

Reglas:
- No lenguaje ambiguo.
- Si no hay evidencia, marcarlo explicito.
- Si un punto es inferencia, marcarlo como inferencia.

