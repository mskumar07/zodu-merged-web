#!/usr/bin/env python3
"""
Slice a 5x2 grid sketch sheet into 10 individual transparent PNG module icons.

Usage:
    python scripts/slice-module-icons.py path/to/sketch.png

What it does:
    1. Loads the sheet and detects column / row gutters automatically by finding
       near-white vertical and horizontal bands (so it tolerates uneven spacing).
    2. Crops each of the 10 cells, trims surrounding whitespace, and makes the
       white background transparent.
    3. Writes the results to src/assets/modules/ using the MODULE_NAMES order
       (left-to-right, top-to-bottom).

Requires: Pillow  ->  python -m pip install Pillow
"""
import sys, os
from PIL import Image

# Left-to-right, top-to-bottom order matching the sketch sheet.
MODULE_NAMES = [
    "task-management",   # row1: clipboard + checks
    "billing-payments",  # row1: wallet + cash
    "inventory",         # row1: cart + boxes
    "reports-insights",  # row1: charts + growth arrow
    "multi-location",    # row1: two shops + pin
    "mobile-app",        # row2: phone + notification bell
    "gst-tax",           # row2: TAX document + %
    "team-customers",    # row2: people group
    "card-payments",     # row2: hand holding card
    "stock-barcode",     # row2: box + barcode
]
COLS, ROWS = 5, 2
WHITE_CUTOFF = 238   # pixels brighter than this count as "background"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "modules")


def content_bands(profile, count):
    """Given a 1-D 'ink per line' profile, split it into `count` content bands
    by locating the widest low-ink gutters between them."""
    n = len(profile)
    inked = [v > 0 for v in profile]
    # collect contiguous inked runs
    runs, start = [], None
    for i, on in enumerate(inked):
        if on and start is None:
            start = i
        elif not on and start is not None:
            runs.append((start, i)); start = None
    if start is not None:
        runs.append((start, n))
    # merge the smallest-gap-separated runs until we have `count` of them
    while len(runs) > count:
        gaps = [(runs[i + 1][0] - runs[i][1], i) for i in range(len(runs) - 1)]
        _, idx = min(gaps)
        runs[idx] = (runs[idx][0], runs[idx + 1][1])
        del runs[idx + 1]
    return runs


def trim(im):
    """Trim transparent / white border around the glyph."""
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def whiten_to_alpha(im):
    """Convert near-white pixels to transparent, keep the colored sketch."""
    im = im.convert("RGBA")
    px = im.getdata()
    out = []
    for r, g, b, a in px:
        if r >= WHITE_CUTOFF and g >= WHITE_CUTOFF and b >= WHITE_CUTOFF:
            out.append((r, g, b, 0))
        else:
            out.append((r, g, b, a))
    im.putdata(out)
    return im


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python scripts/slice-module-icons.py path/to/sketch.png")
    src = sys.argv[1]
    sheet = Image.open(src).convert("RGB")
    w, h = sheet.size
    gray = sheet.convert("L")
    gpx = gray.load()

    # ink profiles (how non-white each column / row is)
    col_ink = [sum(1 for y in range(h) if gpx[x, y] < WHITE_CUTOFF) for x in range(w)]
    row_ink = [sum(1 for x in range(w) if gpx[x, y] < WHITE_CUTOFF) for y in range(h)]

    col_bands = content_bands(col_ink, COLS)
    row_bands = content_bands(row_ink, ROWS)
    if len(col_bands) != COLS or len(row_bands) != ROWS:
        print(f"[warn] detected {len(col_bands)} cols x {len(row_bands)} rows "
              f"(expected {COLS}x{ROWS}); falling back to even grid.")
        col_bands = [(i * w // COLS, (i + 1) * w // COLS) for i in range(COLS)]
        row_bands = [(j * h // ROWS, (j + 1) * h // ROWS) for j in range(ROWS)]

    os.makedirs(OUT_DIR, exist_ok=True)
    pad = 6
    i = 0
    for (y0, y1) in row_bands:
        for (x0, x1) in col_bands:
            cell = sheet.crop((max(0, x0 - pad), max(0, y0 - pad),
                               min(w, x1 + pad), min(h, y1 + pad)))
            icon = trim(whiten_to_alpha(cell))
            name = MODULE_NAMES[i]
            path = os.path.join(OUT_DIR, f"{name}.png")
            icon.save(path)
            print(f"  wrote {name}.png  ({icon.size[0]}x{icon.size[1]})")
            i += 1
    print(f"\nDone. {i} icons in src/assets/modules/")


if __name__ == "__main__":
    main()
