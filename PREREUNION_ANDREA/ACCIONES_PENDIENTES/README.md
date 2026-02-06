# ACCIONES PENDIENTES

Sistema de organización de tareas y acciones para el proyecto NUCLEA.

## Estructura de Carpetas

| Carpeta | Propósito |
|---------|-----------|
| `01-INMEDIATAS/` | Acciones urgentes (esta semana) |
| `02-CORTO_PLAZO/` | Acciones a 2-4 semanas |
| `03-LARGO_PLAZO/` | Acciones estratégicas (1-3 meses) |
| `04-ESPERANDO/` | Bloqueadas - esperando respuesta externa |
| `05-COMPLETADAS/` | Acciones finalizadas (archivo histórico) |
| `plantillas/` | Plantillas reutilizables |
| `recursos/` | Documentos de apoyo, links, referencias |

## Convención de Nombres

```
[ESTADO]_[CATEGORIA]_[nombre-descriptivo].md
```

**Estados:**
- `PEND` - Pendiente
- `ENPRO` - En progreso
- `BLOQ` - Bloqueada
- `DONE` - Completada

**Categorías:**
- `DES` - Desarrollo
- `NEG` - Negocios/Investment
- `MAR` - Marketing
- `OPS` - Operaciones
- `LEG` - Legal

## Ejemplos

```
PEND_NEG_email-angel-investor.md
ENPRO_DES-integracion-firebase-auth.md
BLOQ_LEG-revision-contrato-andrea.md
```

## Flujo de Trabajo

1. **Nueva acción:** Crear archivo en carpeta correspondiente usando plantilla
2. **En progreso:** Cambiar prefijo a `ENPRO_`
3. **Bloqueada:** Mover a `04-ESPERANDO/` y cambiar prefijo a `BLOQ_`
4. **Completada:** Mover a `05-COMPLETADAS/` y cambiar prefijo a `DONE_`

## Plantillas Disponibles

| Plantilla | Uso |
|-----------|-----|
| `plantilla-accion.md` | Tarea estándar |
| `plantilla-email.md` | Seguimiento de correos |
| `plantilla-reunion.md` | Preparación de reuniones |
| `plantilla-seguimiento.md` | Follow-up de acciones |
| `plantilla-reunion-resultado.md` | Documentar resultados post-reunión |

## Navegación Rápida

- **[INDEX.md](./INDEX.md)** - Dashboard operativo con todas las acciones
- **[recursos/links-utiles.md](./recursos/links-utiles.md)** - Links y contactos
