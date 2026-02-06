# Social Capsule - Detail Screen Spec

Pantalla de detalle para crear `Social Capsule` con foco en circulo privado.

## Objetivo funcional

- Definir grupo reducido de personas (`Mis Socials`).
- Configurar permisos de colaboracion y reacciones.
- Crear espacio compartido cronologico.

## Referencias

- `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`
- `docs/capsules/social/FEATURES.md`

## Elementos UI

| Elemento | Descripcion |
|----------|-------------|
| Header | Flecha atras + titulo |
| Hero | Iconografia chat/comunidad |
| Tagline | "Momentos que compartimos con amigos." |
| Input invites | Emails de socials |
| Config feed | Cronologico fijo (solo informacion) |
| Config interaccion | Reacciones privadas toggle |
| CTA | `Crear esta capsula` |

## Campos clave

| Campo | Tipo | Regla |
|------|------|-------|
| `social_emails` | list email | Min 1, max segun plan |
| `max_members` | number | Informativo segun plan |
| `allow_reactions` | boolean | Default `true` |
| `allow_collab_upload` | boolean | Default `true` |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Agregar email | Añade chip de invitado |
| Quitar email | Elimina invitado |
| Tap CTA | Valida lista y crea capsula |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Form editable |
| Limit reached | Bloquea agregar mas usuarios |
| Submit loading | CTA deshabilitado |
| Success | Capsula creada + invitaciones en cola |

## Props

```ts
interface SocialCapsuleDetailProps {
  onBack: () => void
  onCreate: (payload: SocialCreatePayload) => void
  planLimit: number
  isSubmitting?: boolean
  error?: string | null
}
```

## JSX esqueleto

```tsx
export function SocialCapsuleDetail(props: SocialCapsuleDetailProps) {
  return (
    <main>
      <Header onBack={props.onBack} />
      <InviteListInput />
      <SettingsBlock />
      <Button onClick={() => props.onCreate(payload)}>Crear esta capsula</Button>
    </main>
  )
}
```

