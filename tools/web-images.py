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
# Real screens for the homepage "In action" showcase: showcase/<slug>-<n>.webp, 540 px wide.
# To add an app, list its screenshots here and add data-shots="..." to its card in index.html.
SHOWCASE = {
    'pomma': ['Pomma/shots/timer.jpg', 'Pomma/shots/tasks.jpg', 'Pomma/shots/stats.jpg'],
    'postela': ['Postela/shots/home.jpg', 'Postela/shots/post.jpg', 'Postela/shots/flyer.jpg'],
    'nota': ['Nota/shots/note.jpg', 'Nota/shots/sketch-note.jpg', 'Nota/shots/checklist.jpg'],
    'fidgety': ['Fidgety/shots/home.jpg', 'Fidgety/shots/pop.jpg', 'Fidgety/shots/sand.jpg'],
    'tinywins': ['TinyWins/shots/today.jpg', 'TinyWins/shots/add.jpg', 'TinyWins/shots/insights.jpg'],
    'dailystreak': ['DailyStreak/shots/home.jpg', 'DailyStreak/shots/detail.jpg', 'DailyStreak/shots/achievements.jpg'],
    'twistandturnquest': ['TwistAndTurnQuest/shots/quest.png', 'TwistAndTurnQuest/shots/prism.png', 'TwistAndTurnQuest/shots/modes.png'],
    'mergerise': ['MergeRise/shots/01-home-citadel.png', 'MergeRise/shots/02-gameplay.png', 'MergeRise/shots/05-home-supernova.png'],
    'bloomblocks': ['BloomBlocks/shots/01-rings.jpg', 'BloomBlocks/shots/03-twist.jpg', 'BloomBlocks/shots/04-grow.jpg'],
    'colourwise': ['ColourWise/shots/home.jpg', 'ColourWise/shots/balloons.jpg', 'ColourWise/shots/paint.jpg'],
    'fruithugs': ['FruitHugs/shots/home.jpg', 'FruitHugs/shots/play.jpg', 'FruitHugs/shots/zen.jpg'],
    'veggiepop': ['VeggiePop/shots/home.jpg', 'VeggiePop/shots/play.jpg', 'VeggiePop/shots/book.jpg'],
    'gramam': ['Gramam/shots/1.jpg', 'Gramam/shots/2.jpg', 'Gramam/shots/3.jpg'],
}
(ROOT / 'showcase').mkdir(exist_ok=True)
for slug, shots in SHOWCASE.items():
    for n, src in enumerate(shots, 1):
        jobs.append((src, f'showcase/{slug}-{n}.webp', 540, 'width'))

for job in jobs:
    src, dst, px = job[:3]
    by = job[3] if len(job) > 3 else 'longest'
    if make(src, dst, px, by=by):
        print(f'{dst}  {(ROOT / dst).stat().st_size // 1024} KB')
