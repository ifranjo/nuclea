# P1 - Capsule Closed

Pantalla inicial del onboarding. Muestra una capsula centrada sobre fondo blanco.

## Objetivo funcional

- Crear foco visual unico.
- Comunicar que el flujo empieza con una accion tactil.
- Avanzar a P2 con una sola interaccion.

## Referencias

- Implementacion real: `POC_INTERNA/app/src/components/onboarding/P1CapsuleClosed.tsx`
- Flujo: `POC_INTERNA/01_SPECS/USER_FLOWS.md`

## Elementos UI

| Elemento | Detalle |
|----------|---------|
| Contenedor full-screen | `h-[100dvh]`, centrado vertical/horizontal |
| Imagen capsula | `public/images/capsule-closed-nobg.png` |
| Tamaño imagen | `260x130` mobile, `300x150` sm+ |
| Animacion | Scale `[1,1.02,1]`, duracion `3s`, loop infinito |

## Interacciones

| Trigger | Resultado |
|---------|-----------|
| Click/tap en pantalla | `onNext()` |
| Enter o Space | `onNext()` |

Accesibilidad:
- `role="button"`
- `tabIndex={0}`
- `aria-label="Toca para abrir la capsula"`

## Estados

| Estado | Comportamiento |
|--------|----------------|
| Default | Capsula visible, pulso suave |
| Hover/active | Cursor pointer (mobile/desktop) |
| Error asset | Fallback: caja vacia (pendiente de manejo explicito) |

## Props

```ts
interface P1Props {
  onNext: () => void
}
```

## JSX esqueleto

```tsx
export function P1CapsuleClosed({ onNext }: P1Props) {
  return (
    <div role="button" tabIndex={0} onClick={onNext} onKeyDown={...}>
      <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <Image src="/images/capsule-closed-nobg.png" alt="Capsula NUCLEA cerrada" fill />
      </motion.div>
    </div>
  )
}
```

