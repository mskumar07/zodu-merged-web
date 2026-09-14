"""Build the feature-card photos for the landing page's "What Zodu does for you" section.

Each photo is cropped to its subject, then written at two widths (for the <img> srcSet) with a
Lanczos downscale and light sharpening — the sources are 1,300–2,200px wide but are shown at
roughly 150–600px, and a single large browser-side downscale renders them soft.

Crops:
  * Inventory / Attendance: the sources are full card mockups (rounded white frame, border,
    shadow, white margin) around a photo panel that fades to white on its left. Inside the page's
    own card that frame reads as a second, nested card, so only the photo panel is kept.
  * Payments: the phone (reminder title, message and button), trimmed of the empty background.
  * GST: the report on the desk; the source's right ~38% is a text infographic that repeats the
    card title and gets cut mid-word in the slot.
  * Expense / Customer / Purchase: whole image (the customer avatar is cut from it by
    background-position).

Outputs src/assets/Landingpage/feature-photos/<slug>-<width>.webp. The widths must match
FZ_MINI_W / FZ_WIDE_W in src/pages/landingPage/ZodulandingPage.tsx.

Usage: python scripts/crop-feature-photos.py
"""
from pathlib import Path

from PIL import Image, ImageFilter

ASSETS = Path(__file__).resolve().parents[1] / "src" / "assets" / "Landingpage"
OUT_DIR = ASSETS / "feature-photos"

MINI_W = (480, 720)     # FZ_MINI_W
WIDE_W = (640, 1260)    # FZ_WIDE_W

# slug, source, crop box in source pixels (None = whole image), output widths
PHOTOS = [
    ("inventory", "inventory-management.png", (860, 53, 2124, 688), WIDE_W),     # photo panel: x..2127, y 50..691
    ("attendance", "Attendence-management.png", (740, 15, 2122, 696), WIDE_W),   # photo panel: x..2125, y 12..699
    ("customer", "Customer-management-(3).png", None, MINI_W),
    ("payments", "payment-reminder.png", (0, 10, 1292, 1170), MINI_W),          # full width, down to the screen's foot
    ("gst", "gst_compilance.png", (150, 215, 1060, 941), MINI_W),                # infographic starts at x~1080
    ("expense", "expense.png", None, MINI_W),
    ("purchase", "purchase-management3.png", None, MINI_W),
]


def main():
    OUT_DIR.mkdir(exist_ok=True)
    for slug, src, box, widths in PHOTOS:
        im = Image.open(ASSETS / src).convert("RGB")
        if box:
            im = im.crop(box)
        for w in widths:
            if w > im.width:
                raise SystemExit(f"{slug}: {w}px is wider than the {im.width}px crop")
            out = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            out = out.filter(ImageFilter.UnsharpMask(radius=1, percent=45, threshold=2))
            path = OUT_DIR / f"{slug}-{w}.webp"
            out.save(path, "WEBP", quality=88, method=6)
            print(f"wrote {path.name} {out.size} {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
