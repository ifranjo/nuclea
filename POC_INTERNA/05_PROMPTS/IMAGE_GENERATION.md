# Prompts para Generación de Imágenes IA

Prompts para generar assets visuales de NUCLEA.

## Herramientas

| Herramienta | Uso | Acceso |
|-------------|-----|--------|
| Midjourney v6 | Hero images, conceptos | Paid |
| DALL-E 3 | Iteración rápida | ChatGPT Plus |
| Ideogram | Texto en imágenes | Free tier |
| Stable Diffusion | Local, control total | Open source |

---

## Prompt 1: Cápsula metálica (producto)

### Midjourney v6

```
product photography of a sleek metallic pill-shaped capsule, brushed silver finish, "NUCLEA" text engraved on right side, floating on pure white background, soft studio lighting, minimal shadows, Apple product aesthetic, 8K, photorealistic --ar 16:9 --v 6
```

### DALL-E 3

```
A photorealistic product shot of a metallic pill-shaped capsule with brushed silver finish. The word "NUCLEA" is subtly engraved on the right half. Pure white background, soft professional studio lighting, minimal shadows. Style: Apple product photography, premium, minimal.
```

---

## Prompt 2: Cápsula abierta con polaroids

### Midjourney v6

```
product photography of an opened metallic capsule split in half horizontally, vintage polaroid photographs floating out of it, warm golden light emanating from inside, pure white background, dreamy nostalgic feeling, soft focus on polaroids, 8K photorealistic --ar 16:9 --v 6
```

---

## Prompt 3: Polaroid individual (placeholder)

### DALL-E 3

```
A single vintage polaroid photograph floating at a slight angle against pure white background. The photo inside shows a warm, slightly blurred family moment (abstract, no identifiable faces). White polaroid border, subtle shadow beneath. Nostalgic, emotional feeling.
```

---

## Prompt 4: Iconos de cápsula por tipo

### Para cada tipo de cápsula:

**Legacy**
```
minimal line icon of a star with a small crown above it, thin stroke, black on white, simple elegant design, suitable for app UI --ar 1:1
```

**Together**
```
minimal line icon of two hearts interlinked, thin stroke, black on white, romantic but elegant, app UI style --ar 1:1
```

**Social**
```
minimal line icon of a speech bubble with three dots inside, thin stroke, black on white, friendly, app UI style --ar 1:1
```

**Pet**
```
minimal line icon of a pet paw print, thin stroke, black on white, cute but minimal, app UI style --ar 1:1
```

**Life Chapter**
```
minimal line icon of an open book, thin stroke, black on white, simple elegant, app UI style --ar 1:1
```

**Origin**
```
minimal line icon of a baby cradle or simplified baby silhouette, thin stroke, black on white, tender but minimal, app UI style --ar 1:1
```

---

## Prompt 5: App mockup en iPhone

### Midjourney v6

```
iPhone 15 Pro mockup showing NUCLEA app interface, white screen with centered metallic capsule, minimal UI, floating in space with soft shadow, product photography style, 8K, professional mockup --ar 9:16 --v 6
```

---

## Prompt 6: Hero image para landing

### Midjourney v6

```
ethereal product photography, metallic capsule floating in soft white void, multiple polaroid photographs orbiting around it gently, warm light rays, dreamy nostalgic atmosphere, memories concept, premium brand aesthetic, 8K photorealistic --ar 21:9 --v 6
```

---

## Parámetros Midjourney recomendados

```
--v 6           # Versión 6
--ar 16:9       # Aspecto horizontal
--ar 9:16       # Aspecto vertical (móvil)
--ar 1:1        # Cuadrado (iconos)
--s 250         # Stylize medio
--q 2           # Quality alta
--no text       # Evitar texto generado
```

---

## Consistencia visual

Para mantener consistencia entre generaciones:

1. **Seed locking** (Midjourney): Usar mismo seed para variaciones
2. **Style reference**: Subir frame del video demo como referencia
3. **Negative prompts**: Siempre excluir colores brillantes, fondos oscuros

### Negative prompt estándar

```
--no neon, colorful, dark background, gradient, tech, futuristic, cyber, glowing, saturated colors, cartoon, illustration
```

---

## Assets a generar (checklist)

- [ ] Cápsula cerrada (hero)
- [ ] Cápsula abierta (animación frame)
- [ ] 6 iconos de tipo de cápsula
- [ ] 10 polaroids placeholder
- [ ] iPhone mockup
- [ ] Landing hero image
- [ ] Open Graph image (1200x630)
- [ ] App icon (1024x1024)
