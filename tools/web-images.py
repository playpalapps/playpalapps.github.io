#!/usr/bin/env python3
"""Make the light web copies the listing pages load.

The originals stay as they are (full-size masters). For every icons/<slug>.png this writes
icons/<slug>.webp at 256 px, plus a few resized brand assets. Run it after adding an app icon:

    python3 tools/web-images.py

Only files that are missing or older than their source are rewritten. With --missing-only
(used by the GitHub check, where checkout times say nothing about which file is newer)
only missing copies are made.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MISSING_ONLY = '--missing-only' in sys.argv

def make(src, dst, max_px, quality=86, by='longest'):
    src, dst = ROOT / src, ROOT / dst
    if dst.exists() and (MISSING_ONLY or dst.stat().st_mtime >= src.stat().st_mtime):
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
    ('naveen-raj/assets/playpal-logo.png', 'naveen-raj/assets/playpal-logo-192.webp', 192),
    ('naveen-raj/assets/naveen-portrait.png', 'naveen-raj/assets/naveen-portrait-640.webp', 640),  # the silhouette in the sun and moon
]
# Real screens for the homepage "In action" showcase: showcase/<slug>-<n>.webp, 540 px wide
# (960 px for the landscape games in LANDSCAPE, whose cards also carry data-orient="landscape").
# To add an app, list its screenshots here and add data-shots="..." to its card in index.html.
SHOWCASE = {
    'palettely': ['Palettely/shots/generate.jpg', 'Palettely/shots/palette.jpg', 'Palettely/shots/library.jpg'],
    'canwasa': ['canwasa/shots/home.jpg', 'canwasa/shots/editor.jpg', 'canwasa/shots/export.jpg'],
    'nightbloom': ['NightBloom/shots/home.jpg', 'NightBloom/shots/breathe.jpg', 'NightBloom/shots/mixer.jpg'],
    'tooltrunk': ['ToolTrunk/shots/home.jpg', 'ToolTrunk/shots/compass.jpg', 'ToolTrunk/shots/sound-meter.jpg'],
    'hydropanda': ['HydroPanda/shots/home.jpg', 'HydroPanda/shots/containers.jpg', 'HydroPanda/shots/history.jpg'],
    'paperlens': ['PaperLens/shots/library.jpg', 'PaperLens/shots/tools.jpg', 'PaperLens/shots/templates.jpg'],
    'qito': ['Qito/shots/home.jpg', 'Qito/shots/templates.jpg', 'Qito/shots/styles.jpg'],
    'astroorbit': ['AstroOrbit/shots/title.jpg', 'AstroOrbit/shots/combo.jpg', 'AstroOrbit/shots/play.jpg'],
    'fuzzypop': ['FuzzyPop/shots/menu.jpg', 'FuzzyPop/shots/animal-match.jpg', 'FuzzyPop/shots/count-pop.jpg'],
    'inkline': ['Inkline/shots/menu.jpg', 'Inkline/shots/play.jpg', 'Inkline/shots/strand.jpg'],
    'pippet': ['Pippet/shots/title.jpg', 'Pippet/shots/play.jpg', 'Pippet/shots/choose-pip.jpg'],
    'utilify': ['UtilifyApp/shots/home.jpg', 'UtilifyApp/shots/categories.jpg', 'UtilifyApp/shots/dark.jpg'],
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
    'timezoneconnect': ['TimezoneConnect/shots/world-clock.jpg', 'TimezoneConnect/shots/find-a-time.jpg', 'TimezoneConnect/shots/convert-time.jpg'],
    'circusarcade': ['CircusArcade/shots/phone-cannonball.jpg', 'CircusArcade/shots/phone-high-dive.jpg', 'CircusArcade/shots/phone-grand-tour.jpg'],
}
LANDSCAPE = {'circusarcade'}
(ROOT / 'showcase').mkdir(exist_ok=True)
for slug, shots in SHOWCASE.items():
    for n, src in enumerate(shots, 1):
        jobs.append((src, f'showcase/{slug}-{n}.webp', 960 if slug in LANDSCAPE else 540, 'width'))

for job in jobs:
    src, dst, px = job[:3]
    by = job[3] if len(job) > 3 else 'longest'
    if make(src, dst, px, by=by):
        print(f'{dst}  {(ROOT / dst).stat().st_size // 1024} KB')
