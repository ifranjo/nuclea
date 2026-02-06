# Life Chapter Capsule - Detail Screen Spec

Pantalla de detalle para crear una `Life Chapter Capsule`.

## Objetivo funcional

- Seleccionar template de capitulo de vida.
- Definir fechas y hitos iniciales.
- Crear estructura narrativa por etapa.

## Referencias

- `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`
- `docs/capsules/life-chapter/FEATURES.md`

## Elementos UI

| Elemento | Descripcion |
|----------|-------------|
| Header | Flecha atras + titulo |
| Hero | Icono libro/capitulo |
| Tagline | "Para guardar etapas de tu vida." |
| Template picker | Embarazo, Erasmus, Viaje, Fitness, etc. |
| Date range | Inicio/fin opcional |
| Milestones block | Lista inicial de hitos |
| CTA | `Crear esta capsula` |

## Campos clave

| Campo | Tipo | Regla |
|------|------|-------|
| `template_id` | enum | Requerido (o `custom`) |
| `title` | text | Requerido |
| `start_date` | date | Requerido |
| `end_date` | date | Opcional |
| `milestones` | list | Opcional, editable |
| `delivery_date` | date | Opcional |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Elegir template | Precarga hitos sugeridos |
| Añadir hito | Inserta item editable |
| Tap CTA | Crea capsula y guarda config inicial |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Template preseleccionado |
| Invalid dates | Error si `end_date < start_date` |
| Loading submit | CTA deshabilitado |
| Success | Navega a vista activa de capitulo |

## Props

```ts
interface LifeChapterCapsuleDetailProps {
  onBack: () => void
  onCreate: (payload: LifeChapterCreatePayload) => void
  isSubmitting?: boolean
  error?: string | null
}
```

## JSX esqueleto

```tsx
export function LifeChapterCapsuleDetail(props: LifeChapterCapsuleDetailProps) {
  return (
    <main>
      <Header onBack={props.onBack} />
      <TemplateSelector />
      <ChapterConfigForm />
      <Button onClick={() => props.onCreate(payload)}>Crear esta capsula</Button>
    </main>
  )
}
```

