# DELEGATION PATTERNS

Patrones de delegacion para maximizar productividad.

## Delegacion Individual

```bash
/delegate cy "refactor auth module"
# → Claude Opus 4.5 en terminal aislada
```

## Delegacion Paralela

```bash
/delegate cy "frontend"
/delegate ky "backend"
/delegate gy "tests"
/delegate my "docs"

# O combinado:
/delegate both "implement dark mode"
# → Todos los agentes ejecutan la misma tarea
```

## Por Tipo de Tarea

| Tarea | Agente | Razon |
|-------|--------|-------|
| Code complejo | `cy` | Mejor reasoning |
| Code rapido | `ky` | Velocidad |
| Alternative view | `gy` / `my` | Perspectiva diferente |
| Research | `/jarvis` | Busquedas web |
| UI/UX | `/frontend-design` | Diseño especializado |

## Workspace de Delegacion

```
C:\Users\Kaos\scripts\delegate_workspaces\
    {timestamp}_{agent}_{task_slug}\
```

Cada delegacion corre en workspace aislado.

## Mejores Practicas

1. **Tarea clara**: Definir exactamente lo que se necesita
2. **Contexto**: Proporcionar archivos relevantes
3. **Review**: Siempre revisar output antes de integrar
4. **Iterar**: Si no esta bien, delegar refinamiento

---

Actualizado: 2026-02-01
