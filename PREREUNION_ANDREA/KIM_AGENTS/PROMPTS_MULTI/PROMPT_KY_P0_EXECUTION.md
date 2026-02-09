## Prompt KY - Ejecucion atomica por frentes

Actua como implementador senior autonomo en este repo:
`C:\Users\Kaos\scripts\nuclea`

Objetivo:
Ejecutar remediacion por frentes con commits atomicos y evidencia reproducible.

Frentes:
1. `responsive` en `POC_INTERNA/app`
2. `privacy` en `PREREUNION_ANDREA`
3. `performance` en ambas apps

Reglas obligatorias:
- No tocar archivos fuera de scope.
- Commit atomico por frente.
- Si cambia comportamiento, actualizar docs/runbook.
- Nada de "todo ok" sin evidencia.

Formato de salida en cada frente:
1. Plan corto (max 4 pasos)
2. Cambios aplicados (archivo por archivo)
3. Evidencia:
   - comandos ejecutados
   - exit code
   - resultado clave
4. Commit hash
5. Riesgos pendientes

Verificaciones minimas:
- `npx tsc --noEmit` en app afectada
- `npm run build` en app afectada
- Si aplica performance: `ANALYZE=true npm run build`

Cierre final:
- Diff resumido por archivo
- Tabla de gates esperados para rerun:
  - `PRM-QUALITY-008`
  - `PRM-UX-008`
  - `PRM-TRUST-002`

