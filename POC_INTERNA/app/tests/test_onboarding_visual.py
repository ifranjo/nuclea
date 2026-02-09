"""
NUCLEA POC — Onboarding Visual Regression Tests
=================================================

Full visual regression suite for the 4-step onboarding flow (P1→P4).
Tests: DOM assertions, design system compliance, screenshots, console errors.

Usage:
    # With server already running on :3001
    python tests/test_onboarding_visual.py

    # Auto-start server (using webapp-testing helper)
    python <skills>/webapp-testing/scripts/with_server.py \
        --server "npm run dev" --port 3001 \
        -- python tests/test_onboarding_visual.py

Requirements:
    pip install playwright
    playwright install chromium
"""

import json
import os
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime

# Fix Windows cp1252 encoding for Unicode output
if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright, Page, BrowserContext, Locator

BASE_URL = "http://localhost:3001"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "..", "screenshots", "regression")

# ── Design System Constants (from 01_SPECS/DESIGN_SYSTEM.md) ──────────────

DESIGN = {
    "bg_primary": "#FFFFFF",
    "bg_secondary": "#FAFAFA",
    "text_primary": "#1A1A1A",
    "text_secondary": "#6B6B6B",
    "text_muted": "#9A9A9A",
    "accent_gold": "#D4AF37",
    "border": "#E5E5E5",
    "font_body": "Inter",
    "font_display": "Cormorant Garamond",
    "body_size": "16px",
    "h1_size": "28px",
    "h3_size": "18px",
    "tagline_size": "20px",
    "btn_border": "1.5px",
    "btn_radius": "8px",
    "screen_padding_x": "24px",  # mobile px-6
    "capsule_width_mobile": "240px",
    "capsule_width_desktop": "320px",
}


@dataclass
class TestResult:
    name: str
    passed: bool
    details: str = ""
    screenshot: str = ""


@dataclass
class TestSuite:
    results: list[TestResult] = field(default_factory=list)
    console_errors: list[str] = field(default_factory=list)

    def add(self, name: str, passed: bool, details: str = "", screenshot: str = ""):
        self.results.append(TestResult(name, passed, details, screenshot))

    @property
    def passed(self) -> int:
        return sum(1 for r in self.results if r.passed)

    @property
    def failed(self) -> int:
        return sum(1 for r in self.results if not r.passed)

    @property
    def total(self) -> int:
        return len(self.results)


def rgb_to_hex(rgb_str: str) -> str:
    """Convert 'rgb(r, g, b)' or 'rgba(r, g, b, a)' to '#RRGGBB'."""
    match = re.match(r"rgba?\((\d+),\s*(\d+),\s*(\d+)", rgb_str)
    if match:
        r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
        return f"#{r:02X}{g:02X}{b:02X}"
    return rgb_str


def color_matches(actual: str, expected: str, tolerance: int = 10) -> bool:
    """Compare two hex colors with tolerance per channel."""
    actual_hex = rgb_to_hex(actual).upper()
    expected_hex = expected.upper()
    if actual_hex == expected_hex:
        return True
    try:
        ar, ag, ab = int(actual_hex[1:3], 16), int(actual_hex[3:5], 16), int(actual_hex[5:7], 16)
        er, eg, eb = int(expected_hex[1:3], 16), int(expected_hex[3:5], 16), int(expected_hex[5:7], 16)
        return abs(ar - er) <= tolerance and abs(ag - eg) <= tolerance and abs(ab - eb) <= tolerance
    except (ValueError, IndexError):
        return False


def wait_for_server(timeout: int = 30):
    """Wait for the dev server to be ready."""
    import urllib.request
    import urllib.error
    for i in range(timeout):
        try:
            resp = urllib.request.urlopen(f"{BASE_URL}/onboarding", timeout=2)
            if resp.status == 200:
                print(f"  Server ready after {i}s")
                return
        except (urllib.error.URLError, ConnectionError, OSError):
            pass
        time.sleep(1)
    print("  WARNING: Server may not be ready")


def take_screenshot(page: Page, name: str) -> str:
    """Capture screenshot and return path."""
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    path = os.path.join(SCREENSHOT_DIR, name)
    page.screenshot(path=path, full_page=False)
    return path


def get_computed_style(page: Page, selector: str, prop: str) -> str:
    """Get computed CSS property for an element."""
    return page.evaluate(
        f"""() => {{
            const el = document.querySelector({json.dumps(selector)});
            if (!el) return '';
            return window.getComputedStyle(el).getPropertyValue({json.dumps(prop)});
        }}"""
    )


def get_element_style(page: Page, locator: Locator, prop: str) -> str:
    """Get computed CSS property via locator."""
    return locator.evaluate(
        f"el => window.getComputedStyle(el).getPropertyValue({json.dumps(prop)})"
    )


# ── TEST: P1 CapsuleClosed ────────────────────────────────────────────────

def test_p1(page: Page, suite: TestSuite):
    """P1: Capsule closed — verify capsule image, hint text, clickability."""
    print("\n  P1: CapsuleClosed")
    page.goto(f"{BASE_URL}/onboarding?step=1", wait_until="networkidle")
    page.wait_for_timeout(2500)  # let animations settle with reducedMotion

    # Screenshot
    ss = take_screenshot(page, "P1_regression.png")

    # 1. Page renders (not blank)
    body_html = page.inner_html("body")
    suite.add(
        "P1: Page renders",
        len(body_html) > 100,
        f"Body HTML length: {len(body_html)}",
        ss,
    )

    # 2. Capsule button exists with correct ARIA
    capsule_btn = page.locator('[role="button"][aria-label="Toca para abrir la cápsula"]')
    suite.add(
        "P1: Capsule button has ARIA label",
        capsule_btn.count() == 1,
        f"Found {capsule_btn.count()} elements",
    )

    # 3. Capsule image loads
    capsule_img = page.locator('img[src*="capsule-closed"]')
    suite.add(
        "P1: Capsule image present",
        capsule_img.count() >= 1,
        f"Found {capsule_img.count()} capsule images",
    )

    # 4. Hint text appears ("Toca para abrir")
    #    With reducedMotion, the delayed animation should jump to final state
    page.wait_for_timeout(2000)  # hint has 1.5s delay
    hint = page.locator("text=Toca para abrir")
    suite.add(
        "P1: Hint text visible",
        hint.count() >= 1,
        "Text 'Toca para abrir' found" if hint.count() >= 1 else "Not found",
    )

    # 5. Full viewport height
    container_height = page.evaluate(
        "() => document.querySelector('[role=\"button\"]').closest('div').offsetHeight"
    )
    viewport_height = page.evaluate("() => window.innerHeight")
    suite.add(
        "P1: Full viewport height",
        abs(container_height - viewport_height) < 20,
        f"Container: {container_height}px, Viewport: {viewport_height}px",
    )


# ── TEST: P2 CapsuleOpening ──────────────────────────────────────────────

def test_p2(page: Page, suite: TestSuite):
    """P2: Capsule opening — verify polaroids, progress bar, auto-advance."""
    print("  P2: CapsuleOpening")
    page.goto(f"{BASE_URL}/onboarding?step=2", wait_until="networkidle")
    page.wait_for_timeout(2500)

    ss = take_screenshot(page, "P2_regression.png")

    # 1. Polaroid images present
    polaroids = page.locator('img[src*="polaroid"]')
    suite.add(
        "P2: Polaroid images rendered",
        polaroids.count() >= 4,
        f"Found {polaroids.count()} polaroid images",
        ss,
    )

    # 2. Progress bar exists
    progress_bar = page.locator('[class*="h-\\[3px\\]"]')
    has_progress = progress_bar.count() >= 1
    if not has_progress:
        # fallback: look for any thin bar at bottom
        progress_bar = page.evaluate(
            """() => {
                const els = [...document.querySelectorAll('div')];
                return els.some(el => {
                    const s = window.getComputedStyle(el);
                    return s.height === '3px' && el.querySelector('div');
                });
            }"""
        )
        has_progress = bool(progress_bar)
    suite.add("P2: Progress bar present", has_progress, "")

    # 3. No visible text (purely visual step)
    visible_text = page.evaluate(
        """() => {
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode(node) {
                    // Skip script, style, and hidden elements
                    const tag = node.parentElement?.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT')
                        return NodeFilter.FILTER_REJECT;
                    const style = window.getComputedStyle(node.parentElement);
                    if (style.display === 'none' || style.visibility === 'hidden')
                        return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            });
            const texts = [];
            while (walk.nextNode()) {
                const t = walk.currentNode.textContent.trim();
                if (t && t.length > 2) texts.push(t);
            }
            return texts;
        }"""
    )
    # Filter out SSR hydration payloads and framework noise
    meaningful_text = [
        t for t in visible_text
        if not t.startswith("{") and not t.startswith("@")
        and not t.startswith("self.__next") and not t.startswith("(self.__next")
        and "push(" not in t and "webpack" not in t.lower()
    ]
    suite.add(
        "P2: Minimal/no visible text (visual-only step)",
        len(meaningful_text) <= 3,
        f"Found {len(meaningful_text)} text nodes" + (f": {meaningful_text[:3]}" if meaningful_text else ""),
    )

    # 4. Screenshot at ~3.5s (near end of animation)
    page.wait_for_timeout(1500)
    take_screenshot(page, "P2_regression_late.png")


# ── TEST: P3 Manifesto ───────────────────────────────────────────────────

def test_p3(page: Page, suite: TestSuite):
    """P3: Manifesto — verify text content, button, design system compliance."""
    print("  P3: Manifesto")
    page.goto(f"{BASE_URL}/onboarding?step=3", wait_until="networkidle")
    page.wait_for_timeout(2500)

    ss = take_screenshot(page, "P3_regression.png")

    # 1. Manifesto text present
    manifesto_text = "Somos las historias que recordamos"
    has_manifesto = page.locator(f"text={manifesto_text}").count() >= 1
    suite.add("P3: Manifesto headline present", has_manifesto, "", ss)

    # 2. Body text present
    body_text = "NUCLEA transforma tus recuerdos en legado"
    has_body = page.locator(f"text={body_text}").count() >= 1
    suite.add("P3: Body text present", has_body, "")

    # 3. "Continuar" button present
    btn = page.locator("text=Continuar")
    suite.add(
        "P3: Continuar button present",
        btn.count() >= 1,
        f"Found {btn.count()} button(s)",
    )

    # 4. Design: Tagline uses Cormorant Garamond (italic, 20px)
    tagline_el = page.locator(f"text={manifesto_text}").first
    if tagline_el.count() >= 1:
        font_family = get_element_style(page, tagline_el, "font-family")
        font_style = get_element_style(page, tagline_el, "font-style")
        font_size = get_element_style(page, tagline_el, "font-size")
        is_cormorant = "cormorant" in font_family.lower() or "garamond" in font_family.lower()
        suite.add(
            "P3: Tagline font = Cormorant Garamond",
            is_cormorant,
            f"Actual: {font_family}",
        )
        suite.add(
            "P3: Tagline is italic",
            font_style == "italic",
            f"Actual style: {font_style}",
        )
        suite.add(
            "P3: Tagline size ~20px",
            font_size in ("20px", "19px", "21px"),
            f"Actual: {font_size}",
        )
    else:
        suite.add("P3: Tagline font check", False, "Tagline element not found")
        suite.add("P3: Tagline italic check", False, "Tagline element not found")
        suite.add("P3: Tagline size check", False, "Tagline element not found")

    # 5. Design: Body text color matches --text-secondary (#6B6B6B)
    body_el = page.locator(f"text={body_text}").first
    if body_el.count() >= 1:
        color = get_element_style(page, body_el, "color")
        suite.add(
            "P3: Body text color = #6B6B6B",
            color_matches(color, DESIGN["text_secondary"]),
            f"Actual: {color} → {rgb_to_hex(color)}",
        )
    else:
        suite.add("P3: Body text color check", False, "Body element not found")

    # 6. Design: Button spec — transparent bg, border, 8px radius
    btn_el = page.locator("button:has-text('Continuar')").first
    if btn_el.count() >= 1:
        bg = get_element_style(page, btn_el, "background-color")
        border_radius = get_element_style(page, btn_el, "border-radius")
        # Transparent bg = rgba(0,0,0,0) or 'transparent'
        is_transparent = "transparent" in bg or "rgba(0, 0, 0, 0)" in bg
        suite.add(
            "P3: Button bg is transparent",
            is_transparent,
            f"Actual bg: {bg}",
        )
        suite.add(
            "P3: Button border-radius = 8px",
            border_radius == "8px",
            f"Actual: {border_radius}",
        )
    else:
        suite.add("P3: Button design checks", False, "Button not found")

    # 7. Capsule image in hero area
    capsule_img = page.locator('img[src*="capsule"]')
    suite.add(
        "P3: Capsule image in hero",
        capsule_img.count() >= 1,
        f"Found {capsule_img.count()} capsule images",
    )


# ── TEST: P4 CapsuleSelection ────────────────────────────────────────────

def test_p4(page: Page, suite: TestSuite):
    """P4: Capsule selection — verify title, 6 capsule cards, clickability."""
    print("  P4: CapsuleSelection")
    page.goto(f"{BASE_URL}/onboarding?step=4", wait_until="networkidle")
    page.wait_for_timeout(2500)

    ss = take_screenshot(page, "P4_regression.png")

    # 1. Title "Elige tu cápsula"
    title = page.locator("text=Elige tu cápsula")
    suite.add("P4: Title present", title.count() >= 1, "", ss)

    # 2. Subtitle
    subtitle = page.locator("text=Aquí guardas lo que no quieres perder")
    suite.add("P4: Subtitle present", subtitle.count() >= 1, "")

    # 3. Design: Title is 28px, semibold
    if title.count() >= 1:
        title_el = title.first
        font_size = get_element_style(page, title_el, "font-size")
        font_weight = get_element_style(page, title_el, "font-weight")
        suite.add(
            "P4: Title size = 28px",
            font_size == "28px",
            f"Actual: {font_size}",
        )
        suite.add(
            "P4: Title weight = 600 (semibold)",
            font_weight in ("600", "bold"),
            f"Actual: {font_weight}",
        )

    # 4. All 6 capsule type cards present
    capsule_names_es = [
        "Legacy", "Capítulo de Vida", "Together", "Social", "Mascota", "Origen"
    ]
    cards_found = 0
    for name in capsule_names_es:
        loc = page.locator(f"text={name}")
        if loc.count() >= 1:
            cards_found += 1
    suite.add(
        "P4: All 6 capsule types displayed",
        cards_found >= 6,
        f"Found {cards_found}/6: {capsule_names_es}",
    )

    # 5. Cards are clickable (have onClick or anchor)
    clickable_cards = page.evaluate(
        """() => {
            const cards = document.querySelectorAll('[class*="cursor-pointer"], [role="button"], button');
            return cards.length;
        }"""
    )
    suite.add(
        "P4: Capsule cards are interactive",
        clickable_cards >= 6,
        f"Found {clickable_cards} clickable elements",
    )

    # 6. Header component present
    header = page.locator("header, [class*='Header']")
    # fallback: look for NUCLEA text in top area
    if header.count() == 0:
        header = page.locator("text=NUCLEA")
    suite.add(
        "P4: Header/brand visible",
        header.count() >= 1,
        f"Found {header.count()} header elements",
    )

    # 7. Desktop screenshot
    take_screenshot(page, "P4_regression_mobile.png")


# ── TEST: Cross-cutting Design System ─────────────────────────────────────

def test_design_system(page: Page, suite: TestSuite):
    """Cross-cutting design system checks on P3 (richest content)."""
    print("  Design System Compliance")
    page.goto(f"{BASE_URL}/onboarding?step=3", wait_until="networkidle")
    page.wait_for_timeout(2500)

    # 1. Background color = white
    bg_color = page.evaluate(
        "() => window.getComputedStyle(document.body).backgroundColor"
    )
    suite.add(
        "Design: Background = #FFFFFF",
        color_matches(bg_color, DESIGN["bg_primary"]),
        f"Actual: {bg_color} → {rgb_to_hex(bg_color)}",
    )

    # 2. Body font family includes Inter
    body_font = page.evaluate(
        "() => window.getComputedStyle(document.body).fontFamily"
    )
    suite.add(
        "Design: Body font includes Inter",
        "inter" in body_font.lower(),
        f"Actual: {body_font}",
    )

    # 3. Screen padding = 24px (px-6) on mobile
    # Content padding is applied inside onboarding step containers, not at body level
    padding = page.evaluate(
        """() => {
            // Look for px-6 (24px) on any content container
            const candidates = document.querySelectorAll('[class*="px-6"], [class*="px-5"], [class*="px-8"]');
            if (candidates.length > 0) {
                return window.getComputedStyle(candidates[0]).paddingLeft;
            }
            // Fallback: check the deepest wrapper with horizontal padding
            const els = document.querySelectorAll('div');
            for (const el of els) {
                const pl = window.getComputedStyle(el).paddingLeft;
                if (pl === '24px' || pl === '20px' || pl === '32px') return pl;
            }
            return '0px';
        }"""
    )
    suite.add(
        "Design: Content has horizontal padding",
        padding in ("24px", "20px", "16px", "32px"),
        f"Actual: {padding}",
    )


# ── MAIN RUNNER ───────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  NUCLEA POC — Onboarding Visual Regression Tests")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    wait_for_server()

    suite = TestSuite()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ── Mobile context (390x844 — iPhone 14) ──
        print("\n--- Mobile (390x844) ---")
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            reduced_motion="reduce",
        )
        page = ctx.new_page()

        # Capture console errors
        page.on("pageerror", lambda err: suite.console_errors.append(f"[mobile] {err.message}"))
        page.on("console", lambda msg: (
            suite.console_errors.append(f"[mobile:console] {msg.text}")
            if msg.type == "error" else None
        ))

        # Warmup
        page.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
        page.wait_for_timeout(3000)

        # Run tests
        test_p1(page, suite)
        test_p2(page, suite)
        test_p3(page, suite)
        test_p4(page, suite)
        test_design_system(page, suite)

        ctx.close()

        # ── Desktop context (1440x900) ──
        print("\n--- Desktop (1440x900) ---")
        time.sleep(2)  # pause between contexts (page is closed, use time.sleep)

        dctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            reduced_motion="reduce",
        )
        dpage = dctx.new_page()
        dpage.on("pageerror", lambda err: suite.console_errors.append(f"[desktop] {err.message}"))

        # Warmup desktop
        dpage.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
        dpage.wait_for_timeout(3000)

        # Desktop screenshots of key steps
        for step_num, name in [(1, "P1"), (3, "P3"), (4, "P4")]:
            dpage.goto(f"{BASE_URL}/onboarding?step={step_num}", wait_until="networkidle")
            dpage.wait_for_timeout(2500)
            take_screenshot(dpage, f"{name}_desktop_regression.png")
            print(f"  {name} desktop screenshot captured")

        dctx.close()
        browser.close()

    # ── Report ─────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  TEST RESULTS")
    print("=" * 70)

    for r in suite.results:
        status = "PASS" if r.passed else "FAIL"
        icon = "+" if r.passed else "!"
        detail = f" — {r.details}" if r.details else ""
        print(f"  [{icon}] {status}: {r.name}{detail}")

    print(f"\n  Total: {suite.total} | Passed: {suite.passed} | Failed: {suite.failed}")

    if suite.console_errors:
        print(f"\n  JS Errors ({len(suite.console_errors)}):")
        for err in suite.console_errors[:10]:
            print(f"    {err}")
    else:
        print("\n  JS Errors: None")

    print(f"\n  Screenshots: {SCREENSHOT_DIR}")
    print("=" * 70)

    # Exit code
    sys.exit(0 if suite.failed == 0 else 1)


if __name__ == "__main__":
    main()
