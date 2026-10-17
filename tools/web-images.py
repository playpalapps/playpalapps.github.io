#!/usr/bin/env python3
"""Make the light web copies the listing pages load.

The originals stay as they are (full-size masters). For every icons/<slug>.png this writes
icons/<slug>.webp at 256 px, plus a few resized brand assets. Run it after adding an app icon:

    python3 tools/web-images.py

Only files that are missing or older than their source are rewritten.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

def make(src, dst, max_px, quality=86, by='longest'):
    src, dst = ROOT / src, ROOT / dst
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return False
    im = Image.open(src)
    im = im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA', 'PA') or 'transparency' in im.info else im.convert('RGB')
    w, h = im.size
    edge = max(w, h) if by == 'longest' else w
    if edge > max_px:
        s = max_px / edge
        im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=quality, method=6)
    return True

jobs = [(f'icons/{p.name}', f'icons/{p.stem}.webp', 256) for p in sorted((ROOT / 'icons').glob('*.png'))]
jobs += [
    ('assets/logo.png', 'assets/logo-192.webp', 192),        # nav, footer, contact card
    ('assets/logo.png', 'assets/logo-640.webp', 640),        # faint section watermarks
    ('assets/naveen-portrait.png', 'assets/naveen-portrait-560.webp', 560),
    ('assets/infosys.png', 'assets/infosys-480.webp', 480),
    ('assets/afterpay.png', 'assets/afterpay-480.webp', 480),
]
for src, dst, px in jobs:
    if make(src, dst, px):
        print(f'{dst}  {(ROOT / dst).stat().st_size // 1024} KB')
