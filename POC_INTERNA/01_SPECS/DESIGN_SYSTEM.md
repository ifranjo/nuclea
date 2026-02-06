# Sistema de Diseño NUCLEA

Especificación completa del sistema visual para NUCLEA. Este documento es la referencia para toda implementación de UI.

## Filosofía

NUCLEA no es una app de productividad. Es un **ritual emocional digitalizado**.

Cada decisión de diseño debe responder: *¿Esto transmite intimidad, calma y permanencia?*

## Paleta de colores

### Colores principales

```css
:root {
  /* Fondos */
  --bg-primary: #FFFFFF;      /* Blanco puro - fondo principal */
  --bg-secondary: #FAFAFA;    /* Gris casi blanco - cards */
  --bg-overlay: rgba(0,0,0,0.02); /* Sombras sutiles */

  /* Textos */
  --text-primary: #1A1A1A;    /* Negro suave - títulos */
  --text-secondary: #6B6B6B;  /* Gris medio - descripciones */
  --text-muted: #9A9A9A;      /* Gris claro - hints */

  /* Cápsula */
  --capsule-metal: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%);
  --capsule-shadow: rgba(0,0,0,0.15);
  --capsule-highlight: rgba(255,255,255,0.6);

  /* Acentos (uso mínimo) */
  --accent-gold: #D4AF37;     /* Solo para EverLife/Premium */
  --accent-link: #2563EB;     /* Enlaces, CTA secundario */

  /* Estados */
  --success: #22C55E;
  --error: #EF4444;
  --warning: #F59E0B;
}
```

### Reglas de uso

| Elemento | Color |
|----------|-------|
| Fondo de pantalla | `--bg-primary` |
| Cards/contenedores | `--bg-secondary` |
| Títulos principales | `--text-primary` |
| Descripciones | `--text-secondary` |
| Placeholders | `--text-muted` |
| Botones principales | `--text-primary` sobre blanco, borde negro |
| Botones secundarios | Transparente, borde gris |

## Tipografía

### Fuentes

```css
/* Principal - Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display opcional - Cormorant Garamond (solo títulos emotivos) */
font-family: 'Cormorant Garamond', Georgia, serif;
```

### Escala tipográfica

| Uso | Tamaño | Peso | Line-height |
|-----|--------|------|-------------|
| H1 (título pantalla) | 28px | 600 | 1.2 |
| H2 (sección) | 22px | 600 | 1.3 |
| H3 (card título) | 18px | 500 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

### Ejemplo CSS

```css
.screen-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  text-align: center;
}

.tagline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 400;
  font-style: italic;
  color: var(--text-secondary);
}

.body-text {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}
```

## Espaciado

### Sistema base 8px

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
```

### Márgenes de pantalla

- Padding horizontal: `24px` (móvil)
- Padding vertical top: `48px` (desde status bar)
- Padding vertical bottom: `32px` (sobre home indicator)

## Componentes

### Cápsula (elemento central)

```
Dimensiones base:
- Ancho: 280px
- Alto: 100px
- Border radius: 50px (full round ends)

Gradiente metálico:
- Dirección: 135deg
- Colores: #E8E8E8 → #C0C0C0 → #A8A8A8

Sombra:
- box-shadow: 0 8px 32px rgba(0,0,0,0.12)

Texto "NUCLEA":
- Posición: lado derecho
- Font: Inter, 14px, 600
- Color: #4A4A4A
- Letter-spacing: 2px
```

### Polaroid

```
Dimensiones:
- Ancho: 80-120px (variable)
- Proporción imagen: 1:1
- Borde blanco: 8px (lados), 8px (top), 24px (bottom)
- Border radius: 2px

Sombra:
- box-shadow: 0 4px 12px rgba(0,0,0,0.08)

Rotación:
- Random entre -15deg y +15deg
```

### Botón primario

```css
.btn-primary {
  background: transparent;
  border: 1.5px solid var(--text-primary);
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  width: 100%;
  max-width: 320px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--text-primary);
  color: white;
}
```

### Card de selección

```css
.selection-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  margin-bottom: 12px;
}

.selection-card__icon {
  width: 48px;
  height: 48px;
  margin-right: 16px;
}

.selection-card__content {
  flex: 1;
}

.selection-card__chevron {
  color: var(--text-muted);
}
```

## Iconografía

### Estilo

- Línea fina (stroke: 1.5px)
- Esquinas redondeadas
- Sin relleno
- Color: `--text-secondary` por defecto

### Iconos por cápsula

| Cápsula | Icono |
|---------|-------|
| Legacy | Estrella con corona |
| Together | Dos corazones entrelazados |
| Social | Globo de chat con puntos |
| Pet | Huella de pata |
| Life Chapter | Libro abierto |
| Origin | Cuna / bebé |

## Animaciones

### Principios

1. **Suavidad** - Nunca brusco, siempre ease
2. **Propósito** - Cada animación comunica algo
3. **Duración** - Entre 300ms y 800ms
4. **Pausas** - Permitir momentos de respiro

### Curvas de easing

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duraciones estándar

| Tipo | Duración |
|------|----------|
| Micro (hover, focus) | 150ms |
| Transición UI | 300ms |
| Apertura modal | 400ms |
| Apertura cápsula | 800ms |
| Float polaroids | 1200ms |

## Responsive

### Breakpoints

```css
/* Mobile first */
--bp-sm: 375px;   /* iPhone SE */
--bp-md: 428px;   /* iPhone 14 Pro Max */
--bp-lg: 768px;   /* Tablet */
--bp-xl: 1024px;  /* Desktop */
```

### Adaptaciones

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Cápsula | 240px ancho | 320px ancho |
| Polaroids | 80px | 120px |
| Max-width contenido | 100% | 480px centrado |

## Accesibilidad

### Contraste

- Texto principal sobre fondo: AAA (>7:1)
- Texto secundario: AA (>4.5:1)
- Elementos interactivos: claramente distinguibles

### Touch targets

- Mínimo: 44x44px
- Recomendado: 48x48px
- Espaciado entre targets: 8px mínimo

### Estados de foco

```css
:focus-visible {
  outline: 2px solid var(--accent-link);
  outline-offset: 2px;
}
```

---

## Checklist de implementación

- [ ] Variables CSS configuradas
- [ ] Fuentes Inter cargadas
- [ ] Componente Cápsula base
- [ ] Componente Polaroid
- [ ] Sistema de botones
- [ ] Cards de selección
- [ ] Iconos por cápsula
- [ ] Animaciones Framer Motion
- [ ] Responsive verificado
- [ ] Accesibilidad auditada

---

*Basado en: PDFs de Andrea (DISEÑO_ANDREA_PANTALLAS/) + Video demo*
