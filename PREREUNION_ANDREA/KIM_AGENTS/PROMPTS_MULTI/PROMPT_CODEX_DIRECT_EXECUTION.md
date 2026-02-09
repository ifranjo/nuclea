## Prompt CODEX - Ejecucion directa con verificacion

Trabaja directamente en el workspace y completa la tarea end-to-end.

Contexto:
- Repo: `C:\Users\Kaos\scripts\nuclea`
- Prioridad: cerrar calidad/trust con evidencia reproducible
- Estilo: commits atomicos, cambios minimos, sin romper scope

Tarea:
1. Implementa los cambios solicitados.
2. Ejecuta verificaciones reales (no simuladas):
   - `npx tsc --noEmit` (apps tocadas)
   - `npm run build` (apps tocadas)
   - scripts de quality si aplican
3. Si cambia comportamiento, actualiza runbooks/docs afectados.
4. Entrega:
   - diff resumido por archivo
   - comandos ejecutados y resultado
   - riesgos pendientes
   - hash de commit(s)

Restricciones:
- No editar fuera de scope.
- No revertir cambios ajenos.
- No afirmar PASS sin output verificable.

Formato de respuesta final:
1. Resultado
2. Commits
3. Verificacion
4. Riesgos
5. Siguiente accion recomendada (max 3)

