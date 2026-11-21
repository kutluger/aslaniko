"""Uygulama simgelerini üretir: python3 tools/make_icons.py"""
from PIL import Image, ImageDraw

def icon(size):
    S = 4  # yumuşak kenarlar için büyük çiz, sonra küçült
    W = size * S
    im = Image.new('RGB', (W, W), '#7ec8f2')
    d = ImageDraw.Draw(im)
    u = W / 100
    d.rectangle([0, 68 * u, W, W], fill='#4caf3f')
    d.ellipse([70 * u, 8 * u, 90 * u, 28 * u], fill='#ffe066')
    # gövde
    d.rounded_rectangle([14 * u, 44 * u, 86 * u, 64 * u], radius=8 * u, fill='#e8333a')
    d.polygon([(27 * u, 45 * u), (35 * u, 28 * u), (62 * u, 28 * u), (73 * u, 45 * u)], fill='#e8333a')
    d.polygon([(32 * u, 44 * u), (38 * u, 32 * u), (49 * u, 32 * u), (49 * u, 44 * u)], fill='#bfe7ff')
    d.polygon([(53 * u, 44 * u), (53 * u, 32 * u), (61 * u, 32 * u), (68 * u, 44 * u)], fill='#bfe7ff')
    d.rectangle([14 * u, 52 * u, 86 * u, 55 * u], fill='#ffffff')
    for cx in (32, 68):
        d.ellipse([(cx - 11) * u, 56 * u, (cx + 11) * u, 78 * u], fill='#2b2b2b')
        d.ellipse([(cx - 5) * u, 62 * u, (cx + 5) * u, 72 * u], fill='#cfd6dc')
    return im.resize((size, size), Image.LANCZOS)

for s in (180, 192, 512):
    icon(s).save(f'icons/icon-{s}.png', optimize=True)
