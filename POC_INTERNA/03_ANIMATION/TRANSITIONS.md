# Onboarding Transitions

Especificacion de transiciones entre pasos P1, P2, P3 y P4.

## Estado actual (implementado)

Archivo: `POC_INTERNA/app/src/app/onboarding/page.tsx`

```ts
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
const fadeTransition = { duration: 0.3 }
```

Uso:
- `AnimatePresence mode="wait"`
- Cada pantalla se monta con `motion.div` y `key` independiente.

## Comportamiento esperado

| Transicion | Trigger | Efecto |
|-----------|---------|--------|
| P1 -> P2 | Tap en pantalla P1 | Fade out/in `300ms` |
| P2 -> P3 | Timer `4000ms` en P2 | Fade out/in `300ms` |
| P3 -> P4 | Tap en boton Continuar | Fade out/in `300ms` |

## Reglas UX

1. Una sola pantalla visible por vez (`mode="wait"`).
2. Sin desplazamientos de layout al cambiar paso.
3. Mantener tiempo corto para no romper ritmo.

## Evolucion opcional

Si se necesita mayor caracter de marca:
- Mantener opacidad como base.
- Anadir solo `translateY` sutil (`+8 -> 0`) en `animate`.
- No superar `400ms`.

Ejemplo:

```ts
initial: { opacity: 0, y: 8 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -4 }
```

## Criterios de aceptacion

1. No hay parpadeo entre pasos.
2. El usuario percibe continuidad narrativa.
3. La transicion funciona igual en mobile y desktop.

