# P4 - Capsule Selection

Pantalla de seleccion de tipo de capsula tras onboarding.

## Objetivo funcional

- Presentar las 6 opciones de capsula.
- Permitir seleccion rapida tipo lista mobile.
- Dejar listo el flujo para navegar a detalle/creacion.

## Referencias

- Implementacion real: `POC_INTERNA/app/src/components/onboarding/P4CapsuleSelection.tsx`
- Tipos: `POC_INTERNA/app/src/types/index.ts`
- UI: `POC_INTERNA/app/src/components/ui/CapsuleTypeCard.tsx`

## Elementos UI

| Elemento | Detalle |
|----------|---------|
| Header | Menu icon + logo centrado (`Header.tsx`) |
| Titulo | "Elige tu capsula" |
| Subtitulo | "Aqui guardas lo que no quieres perder" |
| Lista | 6 cards tipo iOS grouped list |
| Iconos | Legacy, Life Chapter, Together, Social, Pet, Origin |

Cards:
- `bg-white`, separador `border-[#E5E5EA]`.
- Icono en circulo `40x40`, fondo `#F2F2F7`.
- Chevron derecho `#C7C7CC`.
- `active:bg-[#F2F2F7]`.

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Tap en card | `handleSelect(capsuleType)` |

Estado actual de PoC:
- `handleSelect` hace `console.log` (sin navegacion aun).

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Lista completa visible y scrollable |
| Active card | Feedback visual por `active:bg` |
| Empty data | No implementado (suponemos `CAPSULE_TYPES` siempre presente) |

## Props y contratos

`P4CapsuleSelection` no recibe props (lee `CAPSULE_TYPES` localmente).

`CapsuleTypeCard`:

```ts
interface CapsuleTypeCardProps {
  capsuleType: CapsuleTypeInfo
  onClick: (type: CapsuleTypeInfo) => void
  isFirst?: boolean
  isLast?: boolean
}
```

## JSX esqueleto

```tsx
export function P4CapsuleSelection() {
  const handleSelect = (capsuleType: CapsuleTypeInfo) => {
    console.log('Selected capsule:', capsuleType.id)
  }

  return (
    <div className="h-[100dvh] flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {CAPSULE_TYPES.map((type, i) => (
          <CapsuleTypeCard key={type.id} capsuleType={type} onClick={handleSelect} ... />
        ))}
      </div>
    </div>
  )
}
```

