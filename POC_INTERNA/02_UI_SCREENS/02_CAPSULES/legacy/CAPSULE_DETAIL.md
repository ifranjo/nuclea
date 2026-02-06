# Legacy Capsule - Detail Screen Spec

Pantalla de detalle y configuracion inicial para crear una `Legacy Capsule`.

## Objetivo funcional

- Explicar valor de legado personal.
- Configurar destinatarios y modelo de entrega.
- Permitir iniciar creacion de capsula.

## Referencias

- `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`
- `docs/capsules/legacy/FEATURES.md`

## Elementos UI

| Elemento | Descripcion |
|----------|-------------|
| Header | Flecha atras + titulo `Legacy Capsule` |
| Hero | Imagen/ilustracion de capsula legacy |
| Tagline | "Para que tu historia siga presente." |
| Copy largo | Texto emocional oficial |
| Chips features | Mensajes futuros, AI Avatar, multip. destinatarios, inactividad |
| Config panel | Trigger entrega, destinatarios, mensajes futuros |
| CTA principal | `Crear esta capsula` |
| Nota legal | Entrega y privacidad |

## Campos clave de configuracion

| Campo | Tipo | Regla |
|------|------|-------|
| `delivery_trigger` | select | `manual | date | inactivity` |
| `delivery_date` | date | Requerido si trigger = `date` |
| `inactivity_days` | number | Requerido si trigger = `inactivity` |
| `allow_future_messages` | boolean | Default `true` |
| `recipients` | list email | Minimo 1 recomendado |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Tap atras | `onBack()` |
| Editar campo | Actualiza estado local del form |
| Tap `Crear esta capsula` | `onCreate()` y valida campos |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Form visible completo |
| Loading submit | CTA bloqueado + spinner |
| Validation error | Mensajes inline por campo |
| Success | Navega a flujo Auth/Legal o capsula activa |

## Props

```ts
interface LegacyCapsuleDetailProps {
  onBack: () => void
  onCreate: (payload: LegacyCreatePayload) => void
  isSubmitting?: boolean
  error?: string | null
}
```

## JSX esqueleto

```tsx
export function LegacyCapsuleDetail(props: LegacyCapsuleDetailProps) {
  return (
    <main>
      <Header onBack={props.onBack} />
      <Hero />
      <FeatureChips />
      <LegacyConfigForm />
      <Button onClick={() => props.onCreate(payload)}>Crear esta capsula</Button>
    </main>
  )
}
```

