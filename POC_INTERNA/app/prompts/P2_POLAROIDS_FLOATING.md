# P2 — Polaroids Flotando

## Descripción visual

Polaroids vintage individuales flotando en espacio blanco vacío. Cada polaroid muestra momentos cálidos y familiares — ligeramente desenfocados por privacidad, sin caras identificables. Marco blanco clásico de polaroid (más grueso en la parte inferior). Sensación nostálgica, onírica, cálida.

## Especificaciones del polaroid

```
Dimensiones totales: 80-120px (variable por polaroid)
Borde blanco: 8px (lados y top), 24px (bottom)
Imagen interior: proporción 1:1
Border radius: 2px
Sombra: 0 4px 12px rgba(0,0,0,0.08)
Rotación: entre -15° y +15°
```

## Prompt — Midjourney v6 (set de polaroids)

```
6 vintage polaroid photographs floating weightlessly in pure white empty space, each polaroid shows warm slightly blurred family moments, no identifiable faces, soft warm color tones inside photos, white polaroid borders, polaroids at different angles and rotations, scattered arrangement, dreamy nostalgic feeling, soft diffused lighting, 8K, editorial photography style --v 6 --s 250 --q 2 --ar 9:16
```

### Para polaroid individual:
```
a single vintage polaroid photograph floating at a slight angle against pure white background, the photo inside shows a warm slightly blurred intimate moment, golden warm tones, white polaroid border thicker at bottom, subtle shadow beneath, nostalgic emotional feeling, soft focus, 8K --v 6 --s 250 --q 2 --ar 1:1
```

## Prompt — DALL-E 3

```
Six vintage polaroid photographs floating weightlessly against a pure white background. Each polaroid is at a different angle (some tilted left, some right). The photos inside show warm, intimate moments with soft blur — a sunset, hands touching, a cozy room, flowers, a handwritten letter, rain on a window. White polaroid borders with the classic thick bottom margin. Soft shadows beneath each. The overall feeling is dreamy, nostalgic, and deeply emotional.
```

## Variantes de contenido sugeridas

Para los 6 polaroids, usar estos temas (abstractos, sin caras):

| # | Contenido | Tono |
|---|-----------|------|
| 1 | Manos entrelazadas, luz dorada | Amor |
| 2 | Paisaje de atardecer borroso | Serenidad |
| 3 | Carta manuscrita sobre mesa de madera | Nostalgia |
| 4 | Silueta en ventana con lluvia | Intimidad |
| 5 | Flores silvestres en luz suave | Naturaleza |
| 6 | Taza de café humeante, mañana | Cotidianidad |

## Negative prompt

```
--no neon, colorful backgrounds, dark, gradient, tech, digital, sharp faces, identifiable people, text overlay, modern frames, phone screenshots
```

## Instrucciones de integración

1. Generar 6 polaroids individuales (fondo transparente ideal)
2. Recortar cada uno con el marco blanco incluido
3. Guardar como PNG con transparencia
4. En la app: reemplazar cada `<PolaroidPlaceholder />` con `<Image>`
5. Mantener las mismas posiciones absolutas, tamaños y rotaciones del CSS
6. Los polaroids deben sentirse orgánicos — no perfectamente alineados
