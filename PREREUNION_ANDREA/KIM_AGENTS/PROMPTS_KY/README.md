# PROMPTS_KY

Prompts operativos para `ky` (Kimi K2), optimizados para ejecucion autonoma larga con baja ambiguedad.

## Objetivo

- Reducir errores por contexto largo.
- Forzar evidencia (comandos, salida, archivos tocados).
- Estandarizar reportes para integrar rapido en NUCLEA.

## Orden recomendado

1. `00_SYSTEM_KY_AUTONOMO.md` (base de comportamiento)
2. Uno de los prompts de tarea:
   - `01_TASK_EXECUTION_PACKET.md`
   - `02_UI_AUDIT_AND_FIX.md`
   - `03_TESTING_LOOP.md`
3. `04_PROGRESS_REPORT.md` para checkpoint y cierre

## Regla clave

Si `ky` no puede probar algo, debe decirlo explicitamente y no afirmar exito.
