# Iconos de Tipos de Cápsula

## Estilo requerido

- Línea fina (stroke ~1.5px equivalente)
- Esquinas redondeadas
- Sin relleno (outline only)
- Color: negro (#1A1A1A) sobre blanco
- Tamaño: 48x48px en la app
- Estilo: minimalista, app UI, profesional

## Iconos por tipo

### 1. Legacy Capsule — Estrella

Estrella de 5 puntas con líneas limpias. Simboliza permanencia y legado.

**Midjourney v6:**
```
minimal line icon of a five-pointed star, thin elegant stroke, black on white background, simple clean design, suitable for premium app UI, no fill, rounded corners --v 6 --s 100 --ar 1:1
```

**DALL-E 3:**
```
A minimal line icon of a five-pointed star with thin clean strokes. Black lines on pure white background. No fill, just outline. Rounded line endings. Style: premium iOS app icon, professional and elegant. Size: 1024x1024px.
```

### 2. Together Capsule — Corazones entrelazados

Dos corazones que se intersectan, simbolizando unión de pareja.

**Midjourney v6:**
```
minimal line icon of two hearts interlinked overlapping, thin stroke, black on white background, romantic but elegant and minimal, app UI style, no fill --v 6 --s 100 --ar 1:1
```

### 3. Social Capsule — Burbuja de chat

Globo de diálogo con tres puntos suspensivos dentro.

**Midjourney v6:**
```
minimal line icon of a speech bubble with three dots inside, thin stroke, black on white background, friendly and clean, app UI style, no fill, rounded --v 6 --s 100 --ar 1:1
```

### 4. Pet Capsule — Huella de pata

Huella de pata de animal (gato/perro), tierna pero minimalista.

**Midjourney v6:**
```
minimal line icon of a pet paw print, thin stroke, black on white background, cute but minimal and clean, app UI style, no fill --v 6 --s 100 --ar 1:1
```

### 5. Life Chapter Capsule — Libro abierto

Libro abierto con páginas visibles, simbolizando capítulos de vida.

**Midjourney v6:**
```
minimal line icon of an open book with visible pages, thin stroke, black on white background, simple elegant, app UI style, no fill --v 6 --s 100 --ar 1:1
```

### 6. Origin Capsule — Cuna / Bebé

Silueta simplificada de cuna o bebé, ternura minimalista.

**Midjourney v6:**
```
minimal line icon of a baby cradle or simplified baby silhouette, thin stroke, black on white background, tender but minimal, app UI style, no fill --v 6 --s 100 --ar 1:1
```

## Negative prompt (todos)

```
--no colorful, gradient, 3D, shading, fill, thick stroke, realistic, photograph, complex details
```

## Nota sobre Lucide React

La app actualmente usa iconos de Lucide React como placeholder:

| Tipo | Icono Lucide | Futuro icono custom |
|------|-------------|-------------------|
| Legacy | `Star` | Estrella con estilo propio |
| Together | `HeartHandshake` | Corazones entrelazados |
| Social | `MessageCircle` | Burbuja de chat |
| Pet | `PawPrint` | Huella de pata |
| Life Chapter | `BookOpen` | Libro abierto |
| Origin | `Baby` | Cuna / bebé |

Para reemplazar: actualizar `CapsuleIcons.tsx` para usar `<Image>` en lugar de componentes Lucide.

## Instrucciones de integración

1. Generar cada icono a 1024x1024px mínimo
2. Vectorizar con herramienta (Vectorizer.ai, Adobe Illustrator trace)
3. Exportar como SVG para mejor escalado
4. Alternativa: usar PNG a 3x (144x144px) con fondo transparente
5. En la app: reemplazar iconos Lucide en `CapsuleIcons.tsx`
