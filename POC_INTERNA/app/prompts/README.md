# Prompts para Generación de Imágenes — NUCLEA POC

Prompts optimizados para generar assets visuales de la POC de onboarding.

## Herramientas compatibles

| Herramienta | Recomendado para | Acceso |
|-------------|------------------|--------|
| Midjourney v6 | Hero images, producto | Paid (Discord) |
| DALL-E 3 | Iteración rápida | ChatGPT Plus |
| Ideogram 2.0 | Texto en imágenes | Free tier |
| Flux Pro | Fotorrealismo | Replicate |

## Archivos de prompts

| Archivo | Pantalla | Asset |
|---------|----------|-------|
| `P1_CAPSULE_CLOSED.md` | P1 | Cápsula metálica cerrada |
| `P2_CAPSULE_OPENING.md` | P2 | Animación/frame de apertura |
| `P2_POLAROIDS_FLOATING.md` | P2 | Polaroids flotando |
| `CAPSULE_ICONS.md` | P4 | 6 iconos de tipos de cápsula |

## Parámetros Midjourney estándar

- `--v 6` — Versión 6
- `--s 250` — Stylize medio
- `--q 2` — Quality alta
- `--no text` — Evitar texto generado por IA

## Negative prompt estándar

Incluir siempre al final del prompt:

```
--no neon, colorful, dark background, gradient, tech, futuristic, cyber, glowing, saturated colors, cartoon, illustration, anime, 3D render
```

## Aspect ratios necesarios

| Uso | Ratio | Param |
|-----|-------|-------|
| Mobile (9:16) | 1080x1920 | `--ar 9:16` |
| Desktop (16:9) | 1920x1080 | `--ar 16:9` |
| Cuadrado (1:1) | 1024x1024 | `--ar 1:1` |
| OG Image | 1200x630 | `--ar 40:21` |

## Workflow

1. Prototipar con DALL-E 3 (rápido, iteración)
2. Refinar prompt basado en resultado
3. Producción final en Midjourney v6
4. Post-procesamiento: recorte, ajuste de blancos, integración en app

## Integración en la app

Cuando tengas las imágenes generadas:

1. Guardar en `public/images/` del proyecto
2. Reemplazar `CapsulePlaceholder` por `<Image src="/images/capsule-closed.png" />`
3. Reemplazar `PolaroidPlaceholder` por `<Image src="/images/polaroid-N.png" />`
4. Mantener las mismas dimensiones y posiciones
