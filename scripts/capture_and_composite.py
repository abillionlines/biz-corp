"""
Capture Three.js city background and composite bizcorp OG images.
"""
import asyncio
import sys
import os
from pathlib import Path

# ── paths ──────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "frontend" / "public"
BG_WIDE   = PUBLIC / "city-bg-wide.png"
BG_SQUARE = PUBLIC / "city-bg-square.png"
OUT_WIDE   = PUBLIC / "og-image.png"
OUT_SQUARE = PUBLIC / "og-image-square.png"

# ── capture ────────────────────────────────────────────────────────────────────
async def capture():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # ── wide: capture at 1.5× then crop to 1200×627 (50% zoom) ──
        W, H = 1200, 627
        CW, CH = int(W * 1.5), int(H * 1.5)
        print(f"Capturing wide background {CW}×{CH} → crop to {W}×{H} …")
        page = await browser.new_page(viewport={"width": CW, "height": CH})
        await page.goto("http://localhost:5175/?bg=1", wait_until="networkidle")
        await asyncio.sleep(4)   # let Three.js animate
        tmp_wide = PUBLIC / "city-bg-wide-raw.png"
        await page.screenshot(path=str(tmp_wide))
        from PIL import Image as _Img
        raw = _Img.open(tmp_wide)
        # crop center W×H out of the 1.5× capture
        left = (CW - W) // 2
        top  = (CH - H) // 2
        raw.crop((left, top, left + W, top + H)).save(str(BG_WIDE))
        tmp_wide.unlink(missing_ok=True)
        print(f"  saved → {BG_WIDE}")

        # ── square: capture at 1.5× then crop to 800×800 (50% zoom) ──
        S = 800
        CS = int(S * 1.5)
        print(f"Capturing square background {CS}×{CS} → crop to {S}×{S} …")
        page2 = await browser.new_page(viewport={"width": CS, "height": CS})
        await page2.goto("http://localhost:5175/?bg=1", wait_until="networkidle")
        await asyncio.sleep(4)
        tmp_sq = PUBLIC / "city-bg-square-raw.png"
        await page2.screenshot(path=str(tmp_sq))
        raw2 = _Img.open(tmp_sq)
        left2 = (CS - S) // 2
        top2  = (CS - S) // 2
        raw2.crop((left2, top2, left2 + S, top2 + S)).save(str(BG_SQUARE))
        tmp_sq.unlink(missing_ok=True)
        print(f"  saved → {BG_SQUARE}")

        await browser.close()

# ── composite ──────────────────────────────────────────────────────────────────
def make_og(bg_path: Path, out_path: Path, w: int, h: int, shift_up_pct: float = 0.0, zoom_bg: float = 1.0, crop_offset_x: int = 0, crop_offset_y: int = 0):
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np

    # ── load background (zoom_bg > 1 crops the centre for extra zoom) ──
    bg = Image.open(bg_path).convert("RGBA")
    if zoom_bg > 1.0:
        bw, bh = bg.size
        cw, ch = int(bw / zoom_bg), int(bh / zoom_bg)
        left = (bw - cw) // 2 + crop_offset_x
        top  = (bh - ch) // 2 + crop_offset_y
        # clamp so crop stays inside the image
        left = max(0, min(left, bw - cw))
        top  = max(0, min(top, bh - ch))
        bg = bg.crop((left, top, left + cw, top + ch))
    bg = bg.resize((w, h), Image.LANCZOS)

    # ── draw text on transparent layer to measure ink bounds ──
    font_size = 188
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", font_size)
    except OSError:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)

    # render text on scratch canvas to get pixel-exact ink bounds
    scratch = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scratch)
    sd.text((w // 2, h // 2), "bizcorp", font=font, fill="#0d6efd", anchor="mm")
    arr = np.array(scratch)
    mask = arr[:, :, 3] > 10
    ys, xs = np.where(mask)
    ink_x0, ink_x1 = int(xs.min()), int(xs.max())
    ink_y0, ink_y1 = int(ys.min()), int(ys.max())
    ink_w = ink_x1 - ink_x0
    ink_h = ink_y1 - ink_y0

    # ── border box ──
    pad_x      = 60
    pad_bottom = 48
    pad_top    = int(pad_bottom * 1.15)
    box_w = ink_w + pad_x * 2
    box_h = ink_h + pad_top + pad_bottom

    # ── position (centre, then shift up if requested) ──
    cx = w // 2
    cy = h // 2
    cy = cy - int(h * shift_up_pct)

    box_x0 = cx - box_w // 2
    box_y0 = cy - box_h // 2
    box_x1 = box_x0 + box_w
    box_y1 = box_y0 + box_h

    # text anchor: top-left of ink region → offset from box
    text_x = box_x0 + pad_x - (ink_x0 - w // 2 + ink_w // 2) + ink_w // 2 - ink_w // 2
    # anchor="mm" places the font-metric midpoint at the draw coordinate, not the
    # actual ink midpoint. We measured the real ink_y0 in the scratch canvas where
    # the anchor was at h//2, so the offset from anchor → ink_top = h//2 - ink_y0.
    # Placing the anchor at (box_y0 + pad_top + offset) puts ink_top exactly at
    # box_y0 + pad_top, giving pad_top above and pad_bottom below.
    text_cx = (box_x0 + box_x1) // 2
    text_cy = box_y0 + pad_top + (h // 2 - ink_y0)

    # ── compose on background ──
    canvas = bg.copy()
    d = ImageDraw.Draw(canvas)

    # semi-transparent white fill behind text for readability
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    radius = 32
    od.rounded_rectangle(
        [box_x0, box_y0, box_x1, box_y1],
        radius=radius,
        fill=(255, 255, 255, 200),
        outline="#cccccc",
        width=2,
    )
    canvas = Image.alpha_composite(canvas, overlay)
    d = ImageDraw.Draw(canvas)
    d.text((text_cx, text_cy), "bizcorp", font=font, fill="#0d6efd", anchor="mm")

    canvas.convert("RGB").save(out_path)
    print(f"  saved → {out_path}")

# ── main ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Skip browser capture if bg files already exist
    if BG_WIDE.exists() and BG_SQUARE.exists():
        print("Background files found — skipping capture.")
    else:
        asyncio.run(capture())

    # zoom_bg: crop the centre of the bg before compositing (>1 = zoom in)
    BG_ZOOM = 2.0

    print("\nCompositing wide OG image …")
    # shift crop right (+x) so city moves left; shift crop down (+y) so city moves up
    make_og(BG_WIDE, OUT_WIDE, 1200, 627, shift_up_pct=0.15, zoom_bg=BG_ZOOM,
            crop_offset_x=80, crop_offset_y=86)

    print("Compositing square OG image …")
    # shift crop down (+y) so city moves up
    make_og(BG_SQUARE, OUT_SQUARE, 800, 800, shift_up_pct=0.0, zoom_bg=BG_ZOOM,
            crop_offset_x=0, crop_offset_y=100)

    print("\nAll finished. (bg files kept for future composite-only runs)")
