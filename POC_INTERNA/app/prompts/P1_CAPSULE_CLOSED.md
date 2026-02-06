# P1 — Cápsula Cerrada (Hero Image)

## Descripción visual

Cápsula metálica con forma de píldora horizontal, acabado en plata cepillada (brushed silver). La palabra "NUCLEA" está grabada sutilmente en el lado derecho. Flota en un vacío blanco puro con iluminación de estudio suave. Sombras mínimas, sensación premium, estética Apple. La cápsula transmite permanencia, intimidad, calma.

**Materiales**: Metal plateado cepillado con reflejos suaves. No cromado brillante — más bien aluminio anodizado mate con highlights sutiles.

**Iluminación**: Difusa, estudio profesional. Luz principal desde arriba-izquierda. Sin sombras duras. Ambiente limpio y etéreo.

**Fondo**: Blanco puro (#FFFFFF). Sin gradientes, sin texturas, sin elementos adicionales.

## Prompt — Midjourney v6

```
product photography of a sleek metallic pill-shaped capsule, brushed silver aluminum finish with soft reflections, "NUCLEA" text subtly engraved on right side, floating on pure white background, soft diffused studio lighting, minimal shadows, Apple product aesthetic, premium feel, intimate and calm mood, 8K, photorealistic --v 6 --s 250 --q 2 --ar 9:16
```

### Variante desktop (16:9):
```
product photography of a sleek metallic pill-shaped capsule, brushed silver aluminum finish with soft reflections, "NUCLEA" text subtly engraved on right side, floating on pure white background, soft diffused studio lighting, minimal shadows, Apple product aesthetic, premium feel, 8K, photorealistic --v 6 --s 250 --q 2 --ar 16:9
```

## Prompt — DALL-E 3

```
A photorealistic product shot of a metallic pill-shaped capsule with brushed silver aluminum finish. The word "NUCLEA" is subtly engraved on the right half in a clean sans-serif font. Pure white background with no gradients or textures. Soft professional studio lighting from above-left, minimal shadows. The capsule appears to float weightlessly. Style: Apple product photography, premium, minimal. Dimensions approximately 280x100px proportions with fully rounded ends.
```

## Negative prompt

```
--no neon, colorful, dark background, gradient, tech, futuristic, cyber, glowing, saturated colors, cartoon, illustration, text overlay, watermark, logo, multiple objects
```

## Aspect ratios necesarios

| Uso | Ratio | Notas |
|-----|-------|-------|
| Mobile hero | 9:16 | Cápsula centrada verticalmente |
| Desktop hero | 16:9 | Cápsula centrada horizontalmente |
| Cuadrado | 1:1 | Para social media / OG |

## Instrucciones de integración

1. Generar imagen a 2x resolución mínimo (2160x3840 para mobile)
2. Verificar que el fondo sea blanco puro — ajustar niveles si necesario
3. Recortar con espacio generoso alrededor de la cápsula (30% margen)
4. Guardar como PNG con transparencia si posible, o JPG con fondo blanco
5. En la app: reemplazar `<CapsulePlaceholder size="md" />` por `<Image>`
6. Mantener responsive: 240px (mobile) → 320px (desktop) de ancho
