#!/usr/bin/env python3
"""Checks that keep the listing pages light and the store-linked pages alive.

    python3 tools/check-site.py

Fails (exit 1) when:
  - an image or file referenced by the homepage or the Naveen Raj page is missing, or its path
    differs in letter case from the file (GitHub Pages is case-sensitive, macOS is not);
  - an image those pages load is heavier than MAX_IMAGE_KB;
  - a homepage card has no link, no WebP icon, or a missing showcase screen;
  - a page or anchor that an App Store or Google Play listing points to has gone.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_IMAGE_KB = 160
PAGES = ['index.html', 'naveen-raj/index.html']

# Addresses the store listings link to (privacy policy, terms, support, marketing). Keep them working.
STORE_LINKED = {
    'NightBloom/index.html': ['privacy', 'terms'],
    'canwasa/index.html': ['privacy'],
    'Palettely/index.html': [], 'Palettely/privacy-policy.html': [], 'Palettely/support.html': [],
    'MergeRise/privacy-policy.html': [], 'MergeRise/support.html': [],
    'PaperLens/privacy-policy.html': [], 'UtilifyApp/privacy-policy.html': [],
    'Qito/privacy-policy.html': [], 'Qito/support.html': [],
    'FuzzyPop/support.html': [], 'Inkline/support.html': [], 'Pippet/support.html': [], 'HydroPanda/support.html': [],
    'DailyStreak/privacy.html': [], 'DailyStreak/terms.html': [],
}

errors = []

def exact(path: Path) -> bool:
    """True if the path exists with exactly this letter case."""
    try:
        rel = path.resolve().relative_to(ROOT)
    except ValueError:
        return path.exists()
    cur = ROOT
    for part in rel.parts:
        if part not in {p.name for p in cur.iterdir()} if cur.is_dir() else set():
            return False
        cur = cur / part
    return True

for page in PAGES:
    html = re.sub(r'<script\b.*?</script>', '', (ROOT / page).read_text(encoding='utf-8'), flags=re.S)
    base = (ROOT / page).parent
    refs = set(re.findall(r'<img[^>]+src="([^"]+)"', html)) | set(re.findall(r'<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]+href="([^"]+)"', html))
    refs |= {s for m in re.findall(r'data-shots="([^"]+)"', html) for s in m.split()}
    for ref in sorted(refs):
        if re.match(r'(https?:|data:|//)', ref):
            continue
        f = (base / ref.split('?')[0]).resolve()
        if not f.exists():
            errors.append(f'{page}: missing file {ref}')
        elif not exact(f):
            errors.append(f'{page}: letter case of {ref} does not match the file on disk')
        elif f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg') and f.stat().st_size > MAX_IMAGE_KB * 1024:
            errors.append(f'{page}: {ref} is {f.stat().st_size // 1024} KB (limit {MAX_IMAGE_KB} KB). Use a resized copy; see tools/web-images.py')

home = (ROOT / 'index.html').read_text(encoding='utf-8')
cards = re.findall(r'<article class="app-card[^"]*"[^>]*>.*?</article>', home, flags=re.S)
if not cards:
    errors.append('index.html: no app cards found')
for card in cards:
    name = re.search(r'class="app-link"[^>]*>([^<]+)<', card)
    label = name.group(1) if name else card[:60]
    if not name:
        errors.append(f'index.html: card without an app-link: {label}')
    icon = re.search(r'class="app-icon-mega" src="([^"]+)"', card)
    if not icon or not icon.group(1).endswith('.webp'):
        errors.append(f'index.html: {label} card should load its icon as icons/<slug>.webp')

# Every page must scale to the phone and carry the fit-the-screen rules
import subprocess
for page in subprocess.run(['git', 'ls-files', '*.html'], cwd=ROOT, capture_output=True, text=True).stdout.split():
    if re.match(r'(thumbnails|assets-pic)/', page) or page.endswith('og-card.html'):
        continue
    text = (ROOT / page).read_text(encoding='utf-8')
    if not re.search(r'<meta name="viewport" content="[^"]*width=device-width', text):
        errors.append(f'{page}: missing <meta name="viewport" content="width=device-width, ...">')
    if 'id="fit-screen"' not in text:
        errors.append(f'{page}: missing the <style id="fit-screen"> block (copy it from any other page)')

for page, anchors in STORE_LINKED.items():
    f = ROOT / page
    if not f.exists() or not exact(f):
        errors.append(f'store-linked page missing: {page}')
        continue
    text = f.read_text(encoding='utf-8')
    for a in anchors:
        if f'id="{a}"' not in text:
            errors.append(f'store-linked anchor missing: {page}#{a}')

if errors:
    print('Site checks failed:')
    for e in errors:
        print('  -', e)
    sys.exit(1)
print(f'Site checks passed: {len(cards)} cards, {len(STORE_LINKED)} store-linked pages, images under {MAX_IMAGE_KB} KB.')
