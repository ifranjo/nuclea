# Polaroid Float Animation

Especificacion para animar polaroids emergiendo y flotando durante P2.

## Estado actual

- Hoy son elementos estaticos posicionados en absoluto.
- Componente base: `POC_INTERNA/app/src/components/capsule/PolaroidPlaceholder.tsx`.

## Objetivo visual

- Simular recuerdos saliendo de la capsula.
- Mantener movimiento suave y no distractor.
- Variar ligeramente escala, rotacion y desplazamiento por item.

## Timeline sugerido

| Fase | Tiempo | Accion |
|------|--------|--------|
| Spawn | 0-900ms | Aparecen desde centro con blur bajo |
| Drift | 900-3200ms | Flotacion suave y rotacion minima |
| Settle | 3200-4000ms | Se estabilizan antes de transicion |

## Keyframes por polaroid

| Punto | translateY | scale | rotate extra | opacity |
|------|-------------|-------|--------------|---------|
| 0% | `24px` | `0.85` | `0deg` | `0` |
| 25% | `8px` | `0.95` | `+1deg` | `0.8` |
| 50% | `-4px` | `1` | `-1deg` | `1` |
| 75% | `-10px` | `1.01` | `+0.5deg` | `1` |
| 100% | `-6px` | `1` | `0deg` | `1` |

## Variacion por indice

- Delay por item: `index * 90ms`
- Drift horizontal: `[-3px, +3px]` random estable por item
- Duracion individual: `2.2s - 3.0s`

## Framer Motion referencia

```tsx
const polaroidVariants = {
  hidden: { y: 24, scale: 0.85, opacity: 0 },
  visible: (i: number) => ({
    y: [-4, -10, -6],
    x: [0, (i % 2 === 0 ? -3 : 3), 0],
    scale: [0.95, 1, 1],
    rotate: [0, i % 2 === 0 ? -1 : 1, 0],
    opacity: 1,
    transition: {
      delay: i * 0.09,
      duration: 2.6,
      ease: 'easeInOut',
    },
  }),
}
```

## Criterios de aceptacion

1. Las polaroids no se superponen de forma agresiva.
2. El movimiento se ve organico y consistente.
3. No hay "jank" visible en scroll/contenedores mobile.

