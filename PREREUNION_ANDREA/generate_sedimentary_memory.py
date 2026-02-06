"""
SEDIMENTARY MEMORY - Masterpiece Edition
Refined artwork with enhanced craftsmanship for museum-quality output
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random
import os

# Configuration
WIDTH, HEIGHT = 2400, 3200
OUTPUT_PATH = r"C:\Users\Kaos\scripts\nuclea\SEDIMENTARY_MEMORY.png"

# Sophisticated mineral/earth palette
PALETTE = {
    'deep_bedrock': '#181210',
    'basalt': '#2d2825',
    'limestone': '#d4c9b8',
    'shale': '#4a4541',
    'iron_oxide': '#7a4535',
    'amber_fossil': '#c9a66b',
    'clay_ochre': '#b8996b',
    'slate_blue': '#3d4a5c',
    'copper_patina': '#5c7a6a',
    'sandstone': '#e8dcc8',
    'deep_slate': '#2c3e44',
    'charcoal': '#2a2a2a',
    'cream': '#f8f5ef',
    'terracotta': '#a64b35',
    'deep_ochre': '#7a5c35',
    'quartz': '#e8ddd0',
    'malachite': '#4a7a6a',
    'jasper': '#8a5545',
}

random.seed(1847)  # Master seed for controlled randomness

def smooth_step(t):
    """Smooth interpolation for natural transitions"""
    return t * t * (3 - 2 * t)

def lerp_color(color1, color2, t):
    """Linear interpolation between two hex colors"""
    c1 = tuple(int(color1[i:i+2], 16) for i in (1, 3, 5))
    c2 = tuple(int(color2[i:i+2], 16) for i in (1, 3, 5))
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_gradient_strata(draw, y_start, y_end, color_start, color_end, detail=3):
    """Draw strata with smooth gradient transitions"""
    steps = int((y_end - y_start) / detail)
    for i in range(steps + 1):
        t = i / steps
        smooth_t = smooth_step(t)
        y = int(y_start + (y_end - y_start) * t)
        color = lerp_color(color_start, color_end, smooth_t)
        draw.line([(0, y), (WIDTH, y)], fill=color, width=1)

def draw_organic_boundary(draw, y_start, y_end, color, amplitude=12, wavelength=80):
    """Draw strata boundary with controlled organic irregularity"""
    points = [(0, y_start)]
    segments = WIDTH // 40

    for i in range(segments + 1):
        x = i * 40
        # Multiple sine waves for natural irregularity
        offset = (
            amplitude * math.sin(2 * math.pi * x / (wavelength * 2)) +
            amplitude * 0.5 * math.sin(2 * math.pi * x / wavelength) +
            amplitude * 0.25 * math.sin(2 * math.pi * x / (wavelength * 0.7))
        )
        # Blend between start and end y
        t = x / WIDTH
        base_y = y_start + (y_end - y_start) * t
        points.append((x, base_y + offset))

    points.append((WIDTH, y_end))
    points.append((WIDTH, y_start))
    points.append((0, y_start))

    draw.polygon(points, fill=color)

def draw_stratified_section_refined(draw):
    """Draw refined geological section with enhanced details"""

    # Define refined strata layers
    strata = [
        (HEIGHT - 350, HEIGHT - 150, PALETTE['deep_bedrock'], 3),       # Base
        (HEIGHT - 650, HEIGHT - 350, PALETTE['basalt'], 8),             # Basalt
        (HEIGHT - 950, HEIGHT - 650, PALETTE['shale'], 10),             # Shale
        (HEIGHT - 1250, HEIGHT - 950, PALETTE['slate_blue'], 12),       # Slate
        (HEIGHT - 1600, HEIGHT - 1250, PALETTE['iron_oxide'], 15),      # Iron
        (HEIGHT - 1950, HEIGHT - 1600, PALETTE['clay_ochre'], 14),      # Clay
        (HEIGHT - 2300, HEIGHT - 1950, PALETTE['sandstone'], 18),       # Sandstone
        (HEIGHT - 2650, HEIGHT - 2300, PALETTE['limestone'], 20),       # Limestone
        (HEIGHT - 2900, HEIGHT - 2650, PALETTE['quartz'], 15),          # Quartz cap
    ]

    for y_start, y_end, color, amp in strata:
        draw_organic_boundary(draw, y_start, y_end, color, amplitude=amp)

def draw_detailed_fossil(draw, cx, cy, scale=1.0, rotation=0, fossil_type='ammonite'):
    """Draw intricate fossil with chambered structure"""
    if fossil_type == 'ammonite':
        # Main spiral body
        segments = 120
        points = []

        for i in range(segments + 1):
            t = i / segments
            r = 90 * scale * (1 - t * 0.4)
            theta = t * math.pi * 2.8 + rotation
            x = cx + r * math.cos(theta)
            y = cy + r * math.sin(theta) * 0.65
            points.append((x, y))

        # Outer shell
        draw.polygon(points, fill=PALETTE['amber_fossil'])

        # Septum lines (chamber dividers)
        for j in range(20):
            t = j / 20
            r_inner = 85 * scale * (1 - t * 0.45)
            r_outer = 90 * scale * (1 - t * 0.4)
            theta = t * math.pi * 2.8 + rotation

            # Chamber wall
            inner_x = cx + r_inner * math.cos(theta)
            inner_y = cy + r_inner * math.sin(theta) * 0.65
            outer_x = cx + r_outer * math.cos(theta)
            outer_y = cy + r_outer * math.sin(theta) * 0.65

            draw.line([(inner_x, inner_y), (outer_x, outer_y)],
                     fill=PALETTE['charcoal'], width=2)

        # Central core
        draw.ellipse([cx-12, cy-8, cx+12, cy+8], fill=PALETTE['terracotta'])

    elif fossil_type == 'trilobite':
        # Body segments
        for i in range(12):
            t = i / 12
            y_offset = t * 100 - 50
            width = 60 * (1 - t * 0.7)

            points = [
                (cx - width, cy + y_offset - 5),
                (cx + width, cy + y_offset - 5),
                (cx + width * 0.8, cy + y_offset + 5),
                (cx - width * 0.8, cy + y_offset + 5)
            ]
            draw.polygon(points, fill=PALETTE['shale'])

        # Head shield
        draw.ellipse([cx-55, cy-35, cx+55, cy+15], fill=PALETTE['deep_ochre'])

def draw_crystalline_geode(draw, cx, cy, radius):
    """Draw detailed geode with crystalline structure"""
    # Outer crust
    draw.ellipse([cx-radius, cy-radius*0.7, cx+radius, cy+radius*0.7],
                 fill=PALETTE['deep_bedrock'])

    # Crystal bands
    bands = 16
    for i in range(bands):
        t = i / bands
        r = radius * (0.92 - t * 0.75)
        angle_offset = t * 0.5

        # Crystal points radiating outward
        for j in range(7):
            angle = (j / 7) * math.pi * 2 + angle_offset
            cr = r * random.uniform(0.85, 1.0)
            tip_x = cx + cr * math.cos(angle)
            tip_y = cy + cr * math.sin(angle) * 0.7

            # Crystal base
            base_size = radius * 0.08 * (1 - t)
            base_x = cx + r * 0.9 * math.cos(angle)
            base_y = cy + r * 0.9 * math.sin(angle) * 0.7

            # Crystal polygon
            crystal_points = [
                (tip_x, tip_y),
                (base_x + base_size, base_y),
                (base_x, base_y + base_size * 0.5),
                (base_x - base_size, base_y)
            ]
            color = PALETTE['copper_patina'] if i % 3 == 0 else (
                    PALETTE['malachite'] if i % 3 == 1 else PALETTE['quartz'])
            draw.polygon(crystal_points, fill=color)

def draw_ceramic_shard_refined(draw, cx, cy, width, height, rotation):
    """Draw refined ceramic shard with crack patterns"""
    # Main shard body
    cos_a = math.cos(rotation)
    sin_a = math.sin(rotation)

    corners = [(-width/2, -height/2), (width/2, -height/2),
               (width/2, height/2), (-width/2, height/2)]

    rotated = []
    for x, y in corners:
        rx = cx + x * cos_a - y * sin_a
        ry = cy + x * sin_a + y * cos_a
        rotated.append((rx, ry))

    draw.polygon(rotated, fill=PALETTE['terracotta'])

    # Surface texture - small dots
    for _ in range(30):
        sx = cx + random.uniform(-width/2.5, width/2.5)
        sy = cy + random.uniform(-height/2.5, height/2.5)
        # Transform point
        dx = sx - cx
        dy = sy - cy
        rx = dx * cos_a + dy * sin_a
        ry = -dx * sin_a + dy * cos_a
        if abs(rx) < width/2 and abs(ry) < height/2:
            draw.ellipse([sx-1, sy-1, sx+1, sy+1], fill=PALETTE['deep_ochre'])

    # Main crack lines
    crack_points = [
        [(cx, cy), (cx + width*0.3, cy - height*0.2)],
        [(cx, cy), (cx - width*0.25, cy + height*0.3)],
        [(cx + width*0.3, cy - height*0.2), (cx + width*0.4, cy - height*0.35)]
    ]

    for cp in crack_points:
        # Convert to integers for PIL
        int_cp = [(int(p[0]), int(p[1])) for p in cp]
        draw.line(int_cp, fill=PALETTE['charcoal'], width=2)

def draw_sedimentary_striations(draw):
    """Draw fine, controlled striations"""
    base_y = HEIGHT - 2850

    while base_y < HEIGHT - 200:
        # Determine layer color
        if base_y < HEIGHT - 2400:
            color = PALETTE['quartz']
        elif base_y < HEIGHT - 2100:
            color = PALETTE['limestone']
        elif base_y < HEIGHT - 1800:
            color = PALETTE['sandstone']
        elif base_y < HEIGHT - 1500:
            color = PALETTE['clay_ochre']
        elif base_y < HEIGHT - 1200:
            color = PALETTE['iron_oxide']
        elif base_y < HEIGHT - 900:
            color = PALETTE['slate_blue']
        else:
            color = PALETTE['shale']

        # Draw striation with varying opacity via multiple lines
        for _ in range(random.randint(1, 3)):
            x_start = random.randint(80, 200)
            x_end = WIDTH - random.randint(80, 200)
            alpha = random.randint(20, 60)
            draw.line([(x_start, base_y), (x_end, base_y)], fill=color, width=1)

        base_y += random.randint(8, 16)

def draw_mineral_inclusions_refined(draw):
    """Draw refined mineral inclusions with controlled distribution"""
    # Create inclusion zones for natural clustering
    zones = [
        ((200, 800), (200, 600), PALETTE['amber_fossil'], 25),
        ((1200, 1600), (300, 500), PALETTE['quartz'], 30),
        ((1800, 2200), (200, 400), PALETTE['malachite'], 20),
        ((600, 1000), (800, 1200), PALETTE['copper_patina'], 25),
        ((1400, 1800), (900, 1100), PALETTE['deep_ochre'], 22),
    ]

    for x_range, y_range, color, count in zones:
        for _ in range(count):
            x = random.uniform(x_range[0], x_range[1])
            y = random.uniform(y_range[0], y_range[1])
            size = random.uniform(2, 8)

            # Vary color slightly
            display_color = color
            if random.random() > 0.7:
                display_color = lerp_color(color, PALETTE['cream'], 0.3)

            draw.ellipse([x-size, y-size, x+size, y+size], fill=display_color)

def draw_temporal_markers_refined(draw):
    """Draw refined temporal reference system"""
    markers = [
        (HEIGHT - 280, "STRATUM I", "HOLOCENE", "~11,700 yrs"),
        (HEIGHT - 750, "STRATUM II", "PLEISTOCENE", "~250,000 yrs"),
        (HEIGHT - 1350, "STRATUM III", "ARCHAIC", "~2.5 M yrs"),
        (HEIGHT - 1950, "STRATUM IV", "DEEP TIME", "~50 M yrs"),
        (HEIGHT - 2550, "STRATUM V", "CRYSTALLINE", "~200 M yrs"),
    ]

    try:
        font_label = ImageFont.truetype(
            r"C:\Users\Kaos\.claude\skills\canvas-design\canvas-fonts\IBMPlexMono-Bold.ttf", 20)
        font_stratum = ImageFont.truetype(
            r"C:\Users\Kaos\.claude\skills\canvas-design\canvas-fonts\InstrumentSerif-Regular.ttf", 32)
        font_year = ImageFont.truetype(
            r"C:\Users\Kaos\.claude\skills\canvas-design\canvas-fonts\IBMPlexMono-Regular.ttf", 14)
    except:
        font_label = ImageFont.load_default()
        font_stratum = ImageFont.load_default()
        font_year = ImageFont.load_default()

    for y, stratum, name, years in markers:
        # Reference line
        draw.line([(180, y), (WIDTH - 180, y)], fill=PALETTE['charcoal'], width=1)

        # Stratum label (left)
        draw.text((100, y - 20), stratum, font=font_stratum, fill=PALETTE['charcoal'])

        # Layer name (left, smaller)
        draw.text((100, y + 8), name, font=font_label, fill=PALETTE['shale'])

        # Year (right)
        draw.text((WIDTH - 150, y - 8), years, font=font_year, fill=PALETTE['charcoal'])

def draw_subtle_vignette(draw, img):
    """Apply refined vignette for depth"""
    vignette = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)

    # Soft edge darkening gradient
    for i in range(150):
        alpha = int(25 * (i / 150) ** 1.2)
        vdraw.rectangle([0, 0, WIDTH, i], fill=(0, 0, 0, alpha))
        vdraw.rectangle([0, HEIGHT - i, WIDTH, HEIGHT], fill=(0, 0, 0, alpha))
        vdraw.rectangle([0, 0, i, HEIGHT], fill=(0, 0, 0, alpha))
        vdraw.rectangle([WIDTH - i, 0, WIDTH, HEIGHT], fill=(0, 0, 0, alpha))

    # Composite
    img_alpha = img.convert('RGBA')
    return Image.alpha_composite(img_alpha, vignette)

def main():
    """Generate masterpiece-quality Sedimentary Memory artwork"""

    print("Creating Sedimentary Memory (Masterpiece Edition)...")

    # Base
    img = Image.new('RGB', (WIDTH, HEIGHT), PALETTE['cream'])
    draw = ImageDraw.Draw(img)

    # Main strata
    print("Drawing refined geological strata...")
    draw_stratified_section_refined(draw)

    # Details
    print("Adding sedimentary striations...")
    draw_sedimentary_striations(draw)

    print("Embedding mineral inclusions...")
    draw_mineral_inclusions_refined(draw)

    # Place fossils
    print("Placing detailed fossil specimens...")
    fossils = [
        (400, HEIGHT - 2100, 0.9, 0.5, 'trilobite'),
        (1800, HEIGHT - 2450, 1.1, -0.3, 'ammonite'),
        (900, HEIGHT - 1750, 0.85, 1.2, 'ammonite'),
        (1500, HEIGHT - 1150, 1.0, 0.8, 'trilobite'),
    ]
    for cx, cy, scale, rot, ftype in fossils:
        draw_detailed_fossil(draw, cx, cy, scale, rot, ftype)

    # Place geodes
    print("Embedding crystalline geodes...")
    geodes = [
        (700, HEIGHT - 2300, 55),
        (1700, HEIGHT - 1950, 45),
        (500, HEIGHT - 1600, 50),
        (1300, HEIGHT - 1400, 40),
    ]
    for cx, cy, r in geodes:
        draw_crystalline_geode(draw, cx, cy, r)

    # Place shards
    print("Placing ceramic fragments...")
    shards = [
        (2000, HEIGHT - 2200, 55, 40, 0.35),
        (1100, HEIGHT - 1850, 45, 35, 1.1),
        (400, HEIGHT - 1500, 50, 38, 0.6),
        (1600, HEIGHT - 1050, 48, 36, 0.9),
    ]
    for cx, cy, w, h, rot in shards:
        draw_ceramic_shard_refined(draw, cx, cy, w, h, rot)

    # Temporal markers
    print("Drawing temporal reference system...")
    draw_temporal_markers_refined(draw)

    # Vignette
    print("Applying refined vignette...")
    img = draw_subtle_vignette(draw, img)
    draw = ImageDraw.Draw(img)

    # Final typography
    print("Adding typographic elements...")
    try:
        font_title = ImageFont.truetype(
            r"C:\Users\Kaos\.claude\skills\canvas-design\canvas-fonts\InstrumentSerif-Regular.ttf", 64)
        font_subtitle = ImageFont.truetype(
            r"C:\Users\Kaos\.claude\skills\canvas-design\canvas-fonts\IBMPlexMono-Regular.ttf", 14)
        font_figure = ImageFont.truetype(
            r"C:\Users\Kaos\.claude\skills\canvas-design\canvas-fonts\IBMPlexMono-Bold.ttf", 18)
    except:
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_figure = ImageFont.load_default()

    # Main title
    draw.text((100, 60), "SEDIMENTARY MEMORY", font=font_title, fill=PALETTE['charcoal'])

    # Subtitle
    draw.text((100, 135), "STRATIGRAPHIC ARCHIVE OF TEMPORAL DEPOSITION", font=font_subtitle, fill=PALETTE['shale'])

    # Figure label
    draw.text((100, HEIGHT - 80), "FIG. 1 — ARCHAEOLOGICAL CROSS-SECTION", font=font_figure, fill=PALETTE['charcoal'])

    # Save at high quality
    img_rgb = img.convert('RGB')
    img_rgb.save(OUTPUT_PATH, 'PNG', quality=100, dpi=(300, 300))

    print(f"\nMasterpiece saved: {OUTPUT_PATH}")
    print(f"Dimensions: {WIDTH}x{HEIGHT} pixels @ 300 DPI")

    return OUTPUT_PATH

if __name__ == "__main__":
    main()
