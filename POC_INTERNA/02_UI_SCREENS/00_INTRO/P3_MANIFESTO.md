# P3 - Manifesto

Pantalla de narrativa de marca con CTA para continuar al selector de capsulas.

## Objetivo funcional

- Comunicar propuesta emocional de NUCLEA.
- Introducir manifiesto antes de seleccionar tipo de capsula.
- Avanzar manualmente a P4.

## Referencias

- Implementacion real: `POC_INTERNA/app/src/components/onboarding/P3Manifesto.tsx`
- Flujo: `POC_INTERNA/01_SPECS/USER_FLOWS.md`

## Elementos UI

| Elemento | Detalle |
|----------|---------|
| Layout | `h-[100dvh]` con `safe-top` y `safe-bottom` |
| Imagen capsula | `150x75` con `capsule-closed-nobg.png` |
| Tagline 1 | "Somos las historias que recordamos." |
| Tagline 2 | "Haz que las tuyas permanezcan." |
| Texto descriptivo | Parrafo explicativo centrado |
| CTA | Boton `Continuar` |

Tipografia:
- Taglines: `font-display` (Cormorant Garamond), italica, `22px`.
- Cuerpo: `15px`, color secundario.

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Tap/click en boton `Continuar` | Ejecuta `onNext()` |

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Texto y CTA visibles |
| Active CTA | `active:opacity-70 active:scale-[0.97]` |
| Error asset | Imagen no cargada (pendiente fallback explicito) |

## Props

```ts
interface P3Props {
  onNext: () => void
}
```

## JSX esqueleto

```tsx
export function P3Manifesto({ onNext }: P3Props) {
  return (
    <div className="h-[100dvh] flex flex-col">
      <div className="flex-1">{/* capsula + copy */}</div>
      <Button onClick={onNext}>Continuar</Button>
    </div>
  )
}
```

