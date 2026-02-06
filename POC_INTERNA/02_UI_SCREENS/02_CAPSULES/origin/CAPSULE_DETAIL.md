# Origin Capsule - Detail Screen Spec

Pantalla de detalle para crear una `Origin Capsule` (padres -> hijos).

## Objetivo funcional

- Configurar perfil inicial del hijo/a.
- Definir horizonte de entrega (edad/fecha objetivo).
- Permitir colaboracion de co-parent.

## Referencias

- `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`
- `docs/capsules/origin/FEATURES.md`

## Elementos UI

| Elemento | Descripcion |
|----------|-------------|
| Header | Flecha atras + titulo |
| Hero | Iconografia bebe/origen |
| Tagline | "Una capsula creada por padres para sus hijos." |
| Form hijo | Nombre, fecha nacimiento, inicio en embarazo |
| Co-parent block | Email y permisos de co-parent |
| Entrega futura | Edad objetivo (ej: 18) o fecha |
| CTA | `Crear esta capsula` |

## Campos clave

| Campo | Tipo | Regla |
|------|------|-------|
| `child_name` | text | Requerido |
| `child_birth_date` | date | Requerido (o fecha estimada) |
| `started_during_pregnancy` | boolean | Default `false` |
| `target_gift_age` | number | Default `18` |
| `co_parent_email` | email | Opcional |
| `allow_drawings` | boolean | Default `true` |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Activar "inicio embarazo" | Habilita contenido prenatal |
| Añadir co-parent | Prepara invitacion colaborador |
| Tap CTA | Crea capsula con metadata de crecimiento |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Form editable |
| Validation error | Mensajes inline |
| Invite pending | Estado de invitacion co-parent |
| Success | Navega a panel de capsula origin |

## Props

```ts
interface OriginCapsuleDetailProps {
  onBack: () => void
  onCreate: (payload: OriginCreatePayload) => void
  isSubmitting?: boolean
  error?: string | null
}
```

## JSX esqueleto

```tsx
export function OriginCapsuleDetail(props: OriginCapsuleDetailProps) {
  return (
    <main>
      <Header onBack={props.onBack} />
      <ChildProfileForm />
      <CoParentForm />
      <DeliveryConfig />
      <Button onClick={() => props.onCreate(payload)}>Crear esta capsula</Button>
    </main>
  )
}
```

