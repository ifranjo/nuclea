## Prompt - Testing Loop Autonomo

Ejecuta un ciclo de testing tecnico con reporte util para merge.

### Input

- Working dir: `{{WORKDIR}}`
- Comandos de prueba: `{{TEST_COMMANDS}}`
- Rutas/componentes criticos: `{{CRITICAL_AREAS}}`

### Protocolo

1. Baseline
   - Ejecuta tests/lint/build en estado actual.
   - Captura fallos iniciales.
2. Correcciones
   - Aplica fix minimo por fallo.
   - Reejecuta solo lo necesario para validar.
3. Consolidacion
   - Ejecuta suite final completa.
4. Reporte
   - Incluye resumen pass/fail, fallos restantes y riesgo real.

### Formato de evidencia

- `Comando`
- `Resultado (exit code)`
- `Output clave (1-5 lineas)`
- `Decision`

### Regla de honestidad

Si un comando no corrio, no lo marques como aprobado.
