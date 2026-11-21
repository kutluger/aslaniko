"""Logo ve ikon SVG kaynaklarını üretir: python3 tools/logo/gen3.py
PNG'ler Chromium ile bu SVG'lerden alınır (icons/ klasörü)."""
import math
from gen import lion, car, svg, FONT
ROAD="#6b7c8c"
def logo():
    b=['<path id="arc" d="M90,250 Q450,40 810,250" fill="none"/>',
       f'<text {FONT} font-size="138" fill="#f08a24" stroke="#35556b" stroke-width="20" paint-order="stroke" stroke-linejoin="round" letter-spacing="2"><textPath href="#arc" startOffset="50%" text-anchor="middle">Aslaniko</textPath></text>',
       f'<path d="M150,430 C300,430 330,370 450,370 S620,430 750,410" stroke="{ROAD}" stroke-width="36" fill="none" stroke-linecap="round"/>',
       '<path d="M150,430 C300,430 330,370 450,370 S620,430 750,410" stroke="#fff" stroke-width="4" stroke-dasharray="22 18" fill="none"/>']
    c,h=car(-120,0,240,"#3fa7ff")
    b.append(f'<g transform="translate(450,362)">{lion(0,-h-34,56,glasses=True)}{c}</g>')
    b.append(f'<text x="450" y="515" {FONT} font-size="52" text-anchor="middle" fill="#2a9d8f" letter-spacing="8" stroke="#fff" stroke-width="10" paint-order="stroke" stroke-linejoin="round">ON THE ROAD</text>')
    return svg(900,545,'\n'.join(b))

def icon(rounded):
    rx=110 if rounded else 0
    b=['<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2b0"/><stop offset="1" stop-color="#fff3df"/></linearGradient>'
       f'<clipPath id="k"><rect width="512" height="512" rx="{rx}"/></clipPath></defs>',
       '<g clip-path="url(#k)">',
       '<rect width="512" height="512" fill="url(#bg)"/>',
       f'<path d="M-20,470 C120,470 160,410 256,410 S400,470 540,450 L540,560 L-20,560Z" fill="{ROAD}"/>',
       '<path d="M-20,494 C120,494 160,436 256,436 S400,494 540,474" stroke="#fff" stroke-width="8" stroke-dasharray="34 26" fill="none"/>']
    c,h=car(-190,0,380,"#3fa7ff")
    b.append(f'<g transform="translate(256,420)">{lion(0,-h-70,128,glasses=True)}{c}</g>')
    b.append('</g>')
    return svg(512,512,'\n'.join(b))

def favicon():
    # tiny sizes: only lion head with glasses on peach rounded square
    b=['<rect width="64" height="64" rx="14" fill="#ffe2b0"/>', lion(32,33,23,glasses=True)]
    return svg(64,64,'\n'.join(b))

open('logo-yeni.svg','w').write(logo())
open('icon-512.svg','w').write(icon(False))
open('icon-rounded.svg','w').write(icon(True))
open('favicon.svg','w').write(favicon())
