#!/usr/bin/env python3
"""Writes sitemap.xml: every page search engines should index, at its canonical address.

    python3 tools/make-sitemap.py

Run it after adding or removing a page; tools/check-site.py fails when the sitemap misses one.
Pages marked noindex, the og-card templates and the local-only folders are left out.
"""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://playpal.au'


def indexable_pages():
    """(page path, canonical URL) for every page that belongs in the sitemap."""
    out = []
    for page in subprocess.run(['git', 'ls-files', '*.html'], cwd=ROOT, capture_output=True, text=True).stdout.split():
        if re.match(r'(thumbnails|assets-pic)/', page) or page.endswith('og-card.html'):
            continue
        text = (ROOT / page).read_text(encoding='utf-8')
        if re.search(r'<meta name="robots" content="[^"]*noindex', text):
            continue
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text)
        url = canonical.group(1) if canonical else ORIGIN + '/' + re.sub(r'(^|/)index\.html$', r'\1', page)
        out.append((page, url))
    return out


def rank(item):
    page = item[0]
    return (page != 'index.html', page != 'naveen-raj/index.html', not page.endswith('index.html'), page.lower())


if __name__ == '__main__':
    rows = []
    for page, url in sorted(indexable_pages(), key=rank):
        date = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', page], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        rows.append(f'  <url><loc>{url}</loc>' + (f'<lastmod>{date}</lastmod>' if date else '') + '</url>')
    (ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
                                      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                      + '\n'.join(rows) + '\n</urlset>\n', encoding='utf-8')
    print(f'sitemap.xml: {len(rows)} pages')
