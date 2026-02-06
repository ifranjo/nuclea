# Pet Capsule - Detail Screen Spec

Pantalla de detalle para crear una `Pet Capsule`.

## Objetivo funcional

- Registrar perfil de mascota.
- Definir enfoque (memorial o timeline vivo).
- Facilitar subida de recuerdos de forma simple.

## Referencias

- `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`
- `docs/capsules/pet/FEATURES.md`

## Elementos UI

| Elemento | Descripcion |
|----------|-------------|
| Header | Flecha atras + titulo |
| Hero | Huella / foto mascota |
| Tagline | "Momentos que compartimos con nuestras mascotas." |
| Form perfil | Nombre, especie, raza opcional, fechas |
| Toggle memorial | Activar memorial publico/privado |
| Config compartir | Compartir con familia opcional |
| CTA | `Crear esta capsula` |

## Campos clave

| Campo | Tipo | Regla |
|------|------|-------|
| `pet_name` | text | Requerido |
| `species` | enum | Requerido |
| `birth_date` | date | Opcional |
| `passing_date` | date | Opcional |
| `memorial_mode` | boolean | Auto sugerido si `passing_date` existe |
| `share_with_family` | boolean | Default `false` |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Seleccionar especie | Muestra icono/preset |
| Activar memorial | Ajusta copy y tono visual |
| Tap CTA | Valida datos y crea capsula |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Form limpio |
| Profile incomplete | Errors inline |
| Submit loading | Spinner en CTA |
| Success | Capsula creada en modo pet |

## Props

```ts
interface PetCapsuleDetailProps {
  onBack: () => void
  onCreate: (payload: PetCreatePayload) => void
  isSubmitting?: boolean
  error?: string | null
}
```

## JSX esqueleto

```tsx
export function PetCapsuleDetail(props: PetCapsuleDetailProps) {
  return (
    <main>
      <Header onBack={props.onBack} />
      <PetProfileForm />
      <MemorialOptions />
      <Button onClick={() => props.onCreate(payload)}>Crear esta capsula</Button>
    </main>
  )
}
```

