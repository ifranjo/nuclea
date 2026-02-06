# Capsule Opening Animation (P2)

Especificacion de animacion para reemplazar el placeholder actual de P2.

## Estado actual

- Implementacion actual: bloque central estatico + polaroids placeholders.
- Archivo actual: `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx`.

## Objetivo visual

Representar la capsula abriendose en horizontal y liberando recuerdos.

## Timeline

Duracion total recomendada: `4000ms` (mantener autonav actual).

| Fase | Tiempo | Evento |
|------|--------|--------|
| 1 | 0-600ms | Capsula cerrada aparece y toma foco |
| 2 | 600-1600ms | Mitades se separan izquierda/derecha |
| 3 | 1200-2800ms | Polaroids emergen y escalan |
| 4 | 2800-4000ms | Estabilizacion + paso a P3 |

## Keyframes (0/25/50/75/100)

### Half-left

| Punto | translateX | rotate | opacity |
|------|------------|--------|---------|
| 0% | `0px` | `0deg` | `1` |
| 25% | `-8px` | `-1deg` | `1` |
| 50% | `-32px` | `-2deg` | `1` |
| 75% | `-44px` | `-3deg` | `0.95` |
| 100% | `-48px` | `-3deg` | `0.9` |

### Half-right

| Punto | translateX | rotate | opacity |
|------|------------|--------|---------|
| 0% | `0px` | `0deg` | `1` |
| 25% | `8px` | `1deg` | `1` |
| 50% | `32px` | `2deg` | `1` |
| 75% | `44px` | `3deg` | `0.95` |
| 100% | `48px` | `3deg` | `0.9` |

## Easing

- Entrada capsula: `easeOut` (`[0.16, 1, 0.3, 1]`)
- Apertura: `easeInOut` (`[0.87, 0, 0.13, 1]`)
- Asentamiento final: `easeOut`

## Framer Motion referencia

```tsx
const halfLeft = {
  closed: { x: 0, rotate: 0, opacity: 1 },
  open: { x: -48, rotate: -3, opacity: 0.9, transition: { duration: 1, ease: [0.87, 0, 0.13, 1] } },
}

const halfRight = {
  closed: { x: 0, rotate: 0, opacity: 1 },
  open: { x: 48, rotate: 3, opacity: 0.9, transition: { duration: 1, ease: [0.87, 0, 0.13, 1] } },
}
```

## Criterios de aceptacion

1. Duracion total sigue siendo `4000ms`.
2. Apertura se percibe sin saltos en iOS/Android.
3. Cambio a P3 no corta la animacion de forma abrupta.
4. FPS estable (>= 50fps en equipos modernos).

