# Together Capsule - Detail Screen Spec

Pantalla de detalle y modo de creacion para `Together Capsule`.

## Objetivo funcional

- Definir modo de uso (`share` o `gift`).
- Capturar invitacion de pareja.
- Configurar apertura y privacidad compartida.

## Referencias

- `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`
- `docs/capsules/together/FEATURES.md`

## Elementos UI

| Elemento | Descripcion |
|----------|-------------|
| Header | Flecha atras + `Together Capsule` |
| Hero | Imagen de pareja / corazones entrelazados |
| Tagline | "Una capsula creada para parejas." |
| Selector modo | `Share Mode` / `Gift Mode` |
| Form colaborador | Email y nombre de pareja |
| Config privacidad | Secciones privadas, fecha de apertura |
| CTA | `Crear esta capsula` |

## Campos clave

| Campo | Tipo | Regla |
|------|------|-------|
| `mode` | enum | `share | gift` |
| `partner_email` | email | Requerido |
| `partner_name` | text | Requerido |
| `opening_date` | date | Opcional en `share`, recomendado en `gift` |
| `private_sections` | boolean | Default `true` |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Cambiar modo | Cambia copy y campos requeridos |
| Enviar invitacion | Valida email + prepara collaborator |
| Tap `Crear esta capsula` | Crea capsula e inicia flujo de invitacion |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Modo `share` preseleccionado |
| Pending invite | Mensaje `Invitacion enviada` |
| Invite error | Error inline por email invalido/duplicado |
| Success | Navega a dashboard o detalle de capsula |

## Props

```ts
interface TogetherCapsuleDetailProps {
  onBack: () => void
  onCreate: (payload: TogetherCreatePayload) => void
  isSubmitting?: boolean
  error?: string | null
}
```

## JSX esqueleto

```tsx
export function TogetherCapsuleDetail(props: TogetherCapsuleDetailProps) {
  return (
    <main>
      <Header onBack={props.onBack} />
      <ModeSelector />
      <PartnerInviteForm />
      <PrivacyConfig />
      <Button onClick={() => props.onCreate(payload)}>Crear esta capsula</Button>
    </main>
  )
}
```

