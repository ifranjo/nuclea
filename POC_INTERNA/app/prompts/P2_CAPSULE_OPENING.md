# P2 — Cápsula Abriéndose (Animación / Frame)

## Descripción visual

La cápsula metálica se ha separado horizontalmente por la mitad. Las dos mitades flotan separadas, revelando un interior con luz dorada cálida. Polaroids comienzan a emerger suavemente del interior. El movimiento es lento, deliberado, emocional. Como abrir un cofre de recuerdos.

**Estado**: La cápsula está a medio abrir — las dos mitades separadas ~30% de su altura.

**Luz interior**: Dorada cálida, difusa, como luz de atardecer. Emana del centro de la cápsula abierta.

**Polaroids**: 3-4 polaroids parcialmente visibles, emergiendo del centro. Algunos con ligera rotación.

## Prompt — Midjourney v6 (frame estático)

```
product photography of an opened metallic pill-shaped capsule split horizontally in half, brushed silver finish, two halves floating apart revealing warm golden light from inside, vintage polaroid photographs beginning to emerge gently from the opening, pure white background, dreamy nostalgic feeling, soft studio lighting, Apple aesthetic, premium, 8K photorealistic --v 6 --s 250 --q 2 --ar 9:16
```

## Prompt — DALL-E 3

```
A photorealistic image of a metallic pill-shaped capsule that has split open horizontally. The two brushed silver halves float apart, revealing warm golden light emanating from inside. Several vintage polaroid photographs are emerging gently from the opening, some at slight angles. Pure white background, soft studio lighting. The feeling is emotional, like opening a treasure chest of precious memories. Style: premium product photography with dreamy quality.
```

## Para video (Runway Gen-3 Alpha)

```
A sleek metallic pill-shaped capsule with "NUCLEA" engraved on the right side, floating against a pure white background. The capsule slowly splits horizontally in the middle, revealing warm golden light from inside. Polaroid photographs begin to float out gently, rotating slightly as they emerge. The motion is slow, deliberate, and emotional. Soft shadows, product photography lighting, minimal aesthetic, 4K quality.

Camera: Static, centered
Duration: 4 seconds
Style: Commercial, Apple-like minimalism
Motion amount: 5 (moderate)
```

## Negative prompt

```
--no neon, colorful, dark background, gradient, tech, futuristic, cyber, glowing, saturated colors, cartoon, illustration, fast motion, chaotic, explosive
```

## Aspect ratios

| Uso | Ratio |
|-----|-------|
| Mobile (principal) | 9:16 |
| Desktop | 16:9 |
| Video | 9:16 (1080x1920) o 16:9 (1920x1080) |

## Instrucciones de integración

### Para imagen estática:
1. Reemplazar el div placeholder gris (320x320) con la imagen
2. Mantener los PolaroidPlaceholder CSS alrededor como capa adicional
3. La imagen debe tener fondo transparente o blanco puro

### Para video:
1. Usar etiqueta `<video>` con autoplay, muted, playsInline
2. Formato: MP4 (H.264) + WebM fallback
3. Duración: 4 segundos, sin loop
4. Al terminar el video → auto-avanzar a P3
