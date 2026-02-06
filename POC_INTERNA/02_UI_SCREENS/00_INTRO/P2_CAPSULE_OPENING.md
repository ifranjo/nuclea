# P2 - Capsule Opening

Pantalla transicional del onboarding. Simula apertura con placeholders y autonav.

## Objetivo funcional

- Representar el momento "apertura de recuerdos".
- Preparar paso al manifiesto sin accion manual.
- Mantener ritmo narrativo fijo (4s).

## Referencias

- Implementacion real: `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx`
- Flujo: `POC_INTERNA/01_SPECS/USER_FLOWS.md`

## Elementos UI

| Elemento | Detalle |
|----------|---------|
| Fondo | Blanco |
| Bloque central | `260x260`, `bg-[#F2F2F7]`, `rounded-[20px]` |
| Texto central | "Animacion de apertura" |
| Polaroids | 6 placeholders absolutos con rotacion |
| Barra de progreso | Alto `3px`, duracion `4s`, fill lineal |

Polaroids actuales:
- `size:80 rot:-12 top:10% left:5%`
- `size:100 rot:8 top:8% right:6%`
- `size:90 rot:-5 bottom:18% left:4%`
- `size:110 rot:15 bottom:14% right:3%`
- `size:85 rot:-8 top:42% left:0%`
- `size:95 rot:3 top:38% right:2%`

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| `setTimeout(4000)` | Llama `onNext()` automaticamente |

No hay CTA ni interaccion de usuario en esta pantalla.

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Running | Barra de progreso y placeholders visibles |
| Complete | Autoavance a P3 |
| Error timer | Si falla timer, flujo se queda en P2 (agregar watchdog en fase siguiente) |

## Props

```ts
interface P2Props {
  onNext: () => void
}
```

## JSX esqueleto

```tsx
export function P2CapsuleOpening({ onNext }: P2Props) {
  useEffect(() => {
    const timer = setTimeout(onNext, 4000)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <div className="h-[100dvh] relative overflow-hidden">
      {polaroids.map(...)}
      <div>Animacion de apertura</div>
      <div className="progress-bar" />
    </div>
  )
}
```

