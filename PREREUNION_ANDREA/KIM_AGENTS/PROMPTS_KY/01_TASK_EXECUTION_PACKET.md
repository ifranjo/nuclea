## Prompt - Execution Packet (larga autonomia)

Ejecuta esta tarea como implementador senior con checkpoints de evidencia.

### Contexto

- Repo: `C:\Users\Kaos\scripts\nuclea`
- Scope exacto: `{{SCOPE_PATHS}}`
- Objetivo: `{{TASK_GOAL}}`
- Restricciones: `{{CONSTRAINTS}}`

### Flujo obligatorio

1. Inspeccion
   - Lista archivos relevantes.
   - Resume estado actual en 5-10 lineas.
2. Plan minimo
   - Maximo 5 pasos.
   - Cada paso con comando de validacion.
3. Ejecucion
   - Aplica cambios por bloques pequenos.
   - Tras cada bloque, valida.
4. Cierre
   - Diff resumido por archivo.
   - Lista comandos ejecutados y exit code esperado/real.

### Contrato de salida

- `Plan`
- `Implementacion`
- `Verificacion`
- `Archivos modificados`
- `Pendientes`

### Regla anti-deriva

Si detectas trabajo fuera de scope, no lo implementes. Registralo en `Pendientes`.
