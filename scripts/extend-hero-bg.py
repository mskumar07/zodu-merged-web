"""Build the desktop hero background from src/assets/Landingpage/herosection_bg.png.

The landing-page hero caps the artwork's height (min(100%, 33vw - 12px)) so its leftmost
baked-in badge always starts to the right of the copy. On full-height heroes that leaves space
around it, so this script continues the artwork's own backdrop (no added blur):

  * plant:  the potted plant cut off at the artwork's left edge would sit right behind the hero
            copy once mirrored, so it is replaced by a mirror of the window/table area beside it,
  * left:   the zone left of the first badge (x < 440), mirror-tiled leftwards (mirroring keeps
            every seam continuous),
  * bottom: the last row's colours (smoothed across x, so no streaks) fading into the hero's
            base colour; this lifts the artwork off the hero's bottom edge and lets it dissolve
            into the page (mirroring would turn the table's diagonal edge into a sawtooth),
  * top:    the band above the first badge (y < 110), mirror-tiled upwards.

Everything right of x = 140 in the original is untouched. Output:
src/assets/Landingpage/herosection_bg_extended.webp. If you change L, T or B, update HERO_WIDE_K
in src/pages/landingPage/ZodulandingPage.tsx to (793 + T + B) / 793.

Usage: python scripts/extend-hero-bg.py [preview.jpg]
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ASSETS = Path(__file__).resolve().parents[1] / "src" / "assets" / "Landingpage"
SRC = ASSETS / "herosection_bg.png"
OUT = ASSETS / "herosection_bg_extended.webp"

L, T, B = 1200, 600, 96           # extension on the left / top / bottom (px)
SAFE_X, SAFE_Y = 440, 110         # first badge starts at x~462 / y~117
PLANT = (0, 370, 140, 790)        # leaves x<=125 y>=395, pot + shadow down to y~760
PLANT_FEATHER = 20                # rows blended at the patch's top and bottom edges
BASE = (248, 251, 252)            # HERO_BASE (#F8FBFC) in ZodulandingPage.tsx
BOTTOM_DETAIL_ROWS = 12           # rows over which the last row's detail gives way to smooth colour
BOTTOM_SMOOTH_PX = 24             # horizontal smoothing cell for the bottom colours


def remove_plant(src):
    x0, y0, x1, y1 = PLANT
    h = y1 - y0
    patch = ImageOps.mirror(src.crop((x1, y0, 2 * x1 - x0, y1)))
    alpha = Image.new("L", (1, h))
    alpha.putdata([min(255, round(255 * min(i, h - 1 - i) / PLANT_FEATHER)) for i in range(h)])
    src.paste(patch, (x0, y0), alpha.resize((x1 - x0, h), Image.NEAREST))


def main():
    src = Image.open(SRC).convert("RGB")
    remove_plant(src)
    w0, h0 = src.size
    wc, hc = w0 + L, T + h0 + B
    canvas = Image.new("RGB", (wc, hc))
    canvas.paste(src, (L, T))

    # Left, beside the original rows only.
    strip = src.crop((0, 0, SAFE_X, h0))
    tiles = [ImageOps.mirror(strip), strip]
    x, i = L, 0
    while x > 0:
        x -= SAFE_X
        canvas.paste(tiles[i % 2], (x, T))
        i += 1

    # Bottom, across the full (left-extended) width: detail -> smooth colour -> base colour.
    last_row = canvas.crop((0, T + h0 - 1, wc, T + h0))
    smooth = last_row.resize((wc // BOTTOM_SMOOTH_PX, 1), Image.BOX).resize((wc, 1), Image.BILINEAR)
    base = Image.new("RGB", (wc, 1), BASE)
    for r in range(B):
        row = Image.blend(last_row, smooth, min(1.0, r / BOTTOM_DETAIL_ROWS))
        canvas.paste(Image.blend(row, base, (r / (B - 1)) ** 1.2), (0, T + h0 + r))

    # Top, across the full width.
    band = canvas.crop((0, T, wc, T + SAFE_Y))
    tiles = [ImageOps.flip(band), band]
    y, i = T, 0
    while y > 0:
        y -= SAFE_Y
        canvas.paste(tiles[i % 2], (0, y))
        i += 1

    canvas.save(OUT, "WEBP", quality=82, method=6)
    print(f"wrote {OUT.name} {canvas.size} {OUT.stat().st_size // 1024} KB")

    if len(sys.argv) > 1:
        canvas.resize((wc // 2, hc // 2), Image.LANCZOS).save(sys.argv[1], quality=85)


if __name__ == "__main__":
    main()
