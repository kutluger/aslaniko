"""Aslaniko logo çizim yardımcıları (aslan, araba, yazı). gen3.py tarafından kullanılır."""
import math
def lion(cx,cy,r,glasses=False):
    s=[]
    # mane scallops
    n=14
    for i in range(n):
        a=2*math.pi*i/n
        s.append(f'<circle cx="{cx+r*0.92*math.cos(a):.1f}" cy="{cy+r*0.92*math.sin(a):.1f}" r="{r*0.32:.1f}" fill="#e07a2a"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.95:.1f}" fill="#e88a34"/>')
    # ears
    for d in (-1,1):
        s.append(f'<circle cx="{cx+d*r*0.5:.1f}" cy="{cy-r*0.55:.1f}" r="{r*0.2:.1f}" fill="#f6c46a"/>')
        s.append(f'<circle cx="{cx+d*r*0.5:.1f}" cy="{cy-r*0.55:.1f}" r="{r*0.1:.1f}" fill="#e8a24f"/>')
    s.append(f'<circle cx="{cx}" cy="{cy+r*0.05:.1f}" r="{r*0.62:.1f}" fill="#f6c46a"/>')
    # muzzle
    s.append(f'<ellipse cx="{cx}" cy="{cy+r*0.3:.1f}" rx="{r*0.34:.1f}" ry="{r*0.24:.1f}" fill="#fde7b8"/>')
    ey=cy-r*0.08; ex=r*0.24
    if glasses:
        for d in (-1,1):
            s.append(f'<circle cx="{cx+d*ex:.1f}" cy="{ey:.1f}" r="{r*0.17:.1f}" fill="#fff" stroke="#222" stroke-width="{r*0.06:.1f}"/>')
        s.append(f'<path d="M{cx-ex+r*0.17:.1f},{ey:.1f} Q{cx},{ey-r*0.07:.1f} {cx+ex-r*0.17:.1f},{ey:.1f}" stroke="#222" stroke-width="{r*0.05:.1f}" fill="none"/>')
    for d in (-1,1):
        s.append(f'<circle cx="{cx+d*ex:.1f}" cy="{ey:.1f}" r="{r*0.075:.1f}" fill="#3a2414"/>')
        s.append(f'<circle cx="{cx+d*ex+r*0.025:.1f}" cy="{ey-r*0.03:.1f}" r="{r*0.025:.1f}" fill="#fff"/>')
    # nose & mouth
    ny=cy+r*0.18
    s.append(f'<path d="M{cx-r*0.11:.1f},{ny:.1f} L{cx+r*0.11:.1f},{ny:.1f} L{cx},{ny+r*0.11:.1f} Z" fill="#7a3e22" stroke="#7a3e22" stroke-width="{r*0.04:.1f}" stroke-linejoin="round"/>')
    my=ny+r*0.12
    s.append(f'<path d="M{cx-r*0.16:.1f},{my+r*0.02:.1f} Q{cx-r*0.08:.1f},{my+r*0.13:.1f} {cx},{my:.1f} Q{cx+r*0.08:.1f},{my+r*0.13:.1f} {cx+r*0.16:.1f},{my+r*0.02:.1f}" stroke="#7a3e22" stroke-width="{r*0.045:.1f}" fill="none" stroke-linecap="round"/>')
    # cheeks
    for d in (-1,1):
        s.append(f'<circle cx="{cx+d*r*0.42:.1f}" cy="{cy+r*0.22:.1f}" r="{r*0.08:.1f}" fill="#f2a07a" opacity="0.6"/>')
    return '\n'.join(s)

def car(x,y,w,color="#e54b4b"):
    # body at x..x+w, baseline y (wheel centers)
    h=w*0.28; wr=w*0.12
    s=[]
    s.append(f'<path d="M{x},{y-wr*0.3} Q{x},{y-h} {x+w*0.15},{y-h} L{x+w*0.85},{y-h} Q{x+w},{y-h} {x+w},{y-wr*0.3} Z" fill="{color}"/>')
    s.append(f'<rect x="{x+w*0.04}" y="{y-h*0.62}" width="{w*0.92}" height="{h*0.12}" rx="{h*0.06}" fill="#fff" opacity="0.35"/>')
    s.append(f'<circle cx="{x+w*0.95}" cy="{y-h*0.55}" r="{w*0.03}" fill="#ffe9a0"/>')
    for wx in (x+w*0.22,x+w*0.78):
        s.append(f'<circle cx="{wx}" cy="{y}" r="{wr}" fill="#2f3640"/><circle cx="{wx}" cy="{y}" r="{wr*0.45}" fill="#cfd8dc"/>')
    return '\n'.join(s),h

FONT="font-family=\"Inter, 'Arial Rounded MT Bold', sans-serif\" font-weight=\"900\""
def title(x,y,size,text,fill,stroke="#ffffff",sw=None,anchor="middle",ls=0):
    sw=sw or size*0.16
    return (f'<text x="{x}" y="{y}" {FONT} font-size="{size}" text-anchor="{anchor}" letter-spacing="{ls}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" paint-order="stroke">{text}</text>')

def svg(w,h,body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>'

