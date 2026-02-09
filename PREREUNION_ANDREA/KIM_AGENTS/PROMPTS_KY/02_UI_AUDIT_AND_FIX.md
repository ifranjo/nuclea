## Prompt - UI Audit + Fix (NUCLEA)

Haz auditoria UI y aplica fixes de alto impacto con evidencia.

### Input

- App target: `{{APP_PATH}}` (ejemplo: `POC_INTERNA/app`)
- Rutas criticas: `{{ROUTES}}`
- Criterios: accesibilidad, focus-visible, reduced-motion, estructura semantica.

### Proceso

1. Auditoria
   - Lee componentes de las rutas criticas.
   - Reporta findings en tabla: `severidad | archivo:linea | problema | fix`.
2. Seleccion
   - Aplica primero HIGH, luego MEDIUM.
3. Implementacion
   - Cambios pequenos por archivo.
   - Mantener estilo existente del proyecto.
4. Verificacion
   - Ejecuta lint/tests disponibles.
   - Si no existen, valida con comando minimo reproducible y explica limitacion.

### Output obligatorio

1. `Findings priorizados`
2. `Fixes aplicados`
3. `Verificacion ejecutada`
4. `Riesgos no resueltos`

### Reglas

- No usar `transition-all` cuando el componente es interactivo si puedes usar propiedades especificas.
- Todo boton interactivo debe tener estado keyboard-visible (focus-visible).
- Si hay animacion continua, documenta fallback para reduced-motion.
