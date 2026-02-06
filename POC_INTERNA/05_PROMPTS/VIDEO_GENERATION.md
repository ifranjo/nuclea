# Prompts para Generación de Video IA

Prompts optimizados para generar videos de marketing y UI para NUCLEA.

## Herramientas recomendadas

| Herramienta | Uso | Tier |
|-------------|-----|------|
| Runway Gen-3 | Producción final | Paid |
| Luma Dream Machine | Prototipos rápidos | Free tier |
| Kling | Alternativa | Paid |
| Pika | Motion graphics | Free tier |

---

## Prompt 1: Apertura de cápsula (hero animation)

### Para Runway Gen-3 Alpha

```
A sleek metallic pill-shaped capsule with "NUCLEA" engraved on the right side, floating against a pure white background. The capsule slowly splits horizontally in the middle, revealing warm golden light from inside. Polaroid photographs begin to float out gently, rotating slightly as they emerge. The motion is slow, deliberate, and emotional. Soft shadows, product photography lighting, minimal aesthetic, 4K quality.

Camera: Static, centered
Duration: 4 seconds
Style: Commercial, Apple-like minimalism
```

### Para Luma Dream Machine

```
Metallic silver capsule splitting open horizontally, polaroid photos floating out gently, pure white background, soft shadows, slow motion, product shot, minimal aesthetic
```

---

## Prompt 2: Polaroids flotando (loop)

### Para Runway Gen-3

```
Multiple vintage polaroid photographs floating weightlessly in empty white space. Each polaroid shows warm family moments - slightly blurred for privacy. The photos rotate gently and drift slowly. Dreamy, nostalgic feeling. Soft diffused lighting. Seamless loop potential. 4K, shallow depth of field.

Camera: Slow dolly forward
Duration: 3 seconds
Style: Ethereal, memory-like
```

---

## Prompt 3: Cápsula cerrada (estado inicial)

### Para Image-to-Video (Runway)

**Imagen base**: Frame 1 del video demo de Andrea

```
Starting from this metallic capsule image: gentle ambient light movement on the brushed metal surface, subtle reflection shifts, the capsule breathes slightly with a soft pulse of light. Pure white background remains static. Minimal movement, premium feel.

Camera: Static
Duration: 2 seconds
Style: Product hero shot
```

---

## Prompt 4: Transición de pantalla (UI motion)

### Para Pika

```
Smooth transition: a white screen with centered text fades as a metallic capsule rises from below, settling in the center. Clean, minimal, iOS-like animation. White background throughout.

Duration: 1.5 seconds
Style: UI/UX motion design
```

---

## Prompt 5: Recuerdos emergiendo (emotional)

### Para Runway Gen-3

```
Inside view of an opening metallic capsule: warm light spills out as memories emerge - represented by floating polaroid photographs, small speech bubbles, and gentle particles of light. The emergence is organic and emotional, like opening a treasure chest of memories. Bokeh background, cinematic lighting.

Camera: Push in slowly
Duration: 4 seconds
Style: Emotional, cinematic
```

---

## Configuración técnica

### Runway Gen-3 Alpha

```
Resolution: 1280x768 (16:9) or 768x1280 (9:16 for mobile)
Duration: 4 seconds (extendable)
Motion: 5-7 (moderate, not chaotic)
Seed: Lock for consistency
```

### Luma Dream Machine

```
Resolution: 1080p
Duration: 5 seconds max
Keyframes: Use start/end images for control
```

---

## Assets de referencia a usar

| Asset | Path local | Uso |
|-------|------------|-----|
| Frame 1 | `E:\DOWNLOADS\screenshots_20260203_173352\*_frame01_*.png` | Image-to-video base |
| Frame 4 | `E:\DOWNLOADS\screenshots_20260203_173352\*_frame04_*.png` | Estado final referencia |
| PDF screens | `DISEÑO_ANDREA_PANTALLAS\*.pdf` | Estilo UI |

---

## Workflow recomendado

1. **Prototipo**: Luma Dream Machine (gratis, rápido)
2. **Iteración**: Ajustar prompt basado en resultado
3. **Producción**: Runway Gen-3 con prompt refinado
4. **Post**: After Effects para timing y branding

---

## No hacer

- Colores brillantes o neón
- Movimientos rápidos o bruscos
- Estética "tech startup" genérica
- Fondos oscuros o gradientes
- Texto animado (hacer en post)
