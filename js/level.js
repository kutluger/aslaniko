// Bölüm tanımları ve bölüm üretici.
// Her bölüm aynı iskeletle üretilir: tepeler, 2 normal rampa, 2 adet 360° dönel rampa,
// temaya özel bölgeler (su birikintisi, köprü, buz, dalga, tünel) ve öğrenme nesneleri.
const LEVELS = [
  {
    id: 'ciftlik', theme: 'farm', seed: 11, amp: 110, zone: 'puddle',
    goal: { type: 'sequence', labels: ['1', '2', '3', '4', '5'], words: ['bir', 'iki', 'üç', 'dört', 'beş'],
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'] }
  },
  {
    id: 'orman', theme: 'forest', seed: 23, amp: 90, zone: 'bridge',
    goal: { type: 'hunt', target: 'A', count: 5, decoys: ['M', 'E', 'O', 'K', 'T'], word: 'a',
      color: '#ff5a5f' }
  },
  {
    id: 'kar', theme: 'snow', seed: 37, amp: 120, zone: 'ice',
    goal: { type: 'count', rounds: [2, 3, 4], words: ['', 'bir', 'iki', 'üç', 'dört', 'beş'],
      colors: ['#e8333a', '#2f80ed', '#27ae60', '#9b51e0'] }
  },
  {
    id: 'sahil', theme: 'beach', seed: 41, amp: 100, zone: 'wave',
    goal: { type: 'sequence', labels: ['D', 'E', 'N', 'İ', 'Z'], words: ['de', 'e', 'ne', 'i', 'ze'], final: 'Deniz!',
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'] }
  },
  {
    id: 'sehir', theme: 'city', seed: 53, amp: 45, zone: 'tunnel', night: true,
    goal: { type: 'sequence', labels: ['6', '7', '8', '9', '10'], words: ['altı', 'yedi', 'sekiz', 'dokuz', 'on'],
      colors: ['#2ec4b6', '#a66cff', '#ff5a5f', '#ff9f1c', '#3fa7ff'], glow: true }
  }
];

const LEVEL_LENGTH = 22000;

function buildLevel(def) {
  // Tekrarlanabilir rastgelelik: bölüm her açılışta aynı görünür
  let seed = def.seed * 9973;
  const rnd = () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const L = LEVEL_LENGTH;
  const finish = L - 700;
  const ramps = [0.17, 0.6].map(f => ({ x: Math.round(L * f), len: 330, h: 85 }));
  const loops = [0.36, 0.82].map(f => ({ x: Math.round(L * f), r: 130, shift: 120 }));
  const zoneWidth = { puddle: 260, bridge: 340, ice: 620, wave: 300, tunnel: 760 }[def.zone];
  const zones = [0.27, 0.49, 0.71].map(f => ({ type: def.zone, a: Math.round(L * f), b: Math.round(L * f) + zoneWidth }));

  // Düz kalması gereken aralıklar
  const flats = [
    ...ramps.map(r => [r.x - 220, r.x + r.len + 520]),
    ...loops.map(l => [l.x - 520, l.x + 520]),
    ...zones.map(z => [z.a - 100, z.b + 100]),
    [finish - 600, L + 4000]
  ];
  const busy = [
    ...ramps.map(r => [r.x - 120, r.x + r.len + 420]),
    ...loops.map(l => [l.x - 380, l.x + 380]),
    ...zones.map(z => [z.a - 40, z.b + 40])
  ];
  const inBusy = x => busy.some(([a, b]) => x >= a && x <= b);
  const pushOut = x => { for (let i = 0; i < 6; i++) { const z = busy.find(([a, b]) => x >= a && x <= b); if (!z) break; x = z[1] + 160; } return x; };

  // Ham tepeler
  const pts = [];
  for (let x = -2000; x <= L + 4000; x += 450) {
    let h = x < 900 ? 0 : rnd() * def.amp;
    pts.push([x, h]);
  }
  const raw = x => {
    const i = Math.max(0, Math.min(pts.length - 2, Math.floor((x + 2000) / 450)));
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const t = Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
    return y0 + (y1 - y0) * (1 - Math.cos(Math.PI * t)) / 2;
  };
  const smooth = t => t * t * (3 - 2 * t);
  const flatLevel = flats.map(([a, b]) => raw((a + b) / 2));

  const X0 = -2000, STEP = 4;
  const n = Math.ceil((L + 6000) / STEP);
  const ground = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = X0 + i * STEP;
    let h = raw(x);
    flats.forEach(([a, b], k) => {
      let w = 0;
      if (x >= a && x <= b) w = 1;
      else if (x < a && a - x < 300) w = smooth(1 - (a - x) / 300);
      else if (x > b && x - b < 300) w = smooth(1 - (x - b) / 300);
      if (w > 0) h = h * (1 - w) + flatLevel[k] * w;
    });
    ground[i] = h;
  }
  const baseH = x => {
    const f = (x - X0) / STEP;
    const i = Math.max(0, Math.min(n - 2, Math.floor(f)));
    const t = Math.max(0, Math.min(1, f - i));
    return ground[i] * (1 - t) + ground[i + 1] * t;
  };

  // Öğrenme nesneleri
  const items = [];
  const signs = [];
  const g = def.goal;
  if (g.type === 'sequence') {
    g.labels.forEach((label, i) => {
      const x = pushOut(Math.round(L * (0.08 + i * 0.19)));
      items.push({ kind: 'seq', i, label, x, color: g.colors[i] });
    });
  } else if (g.type === 'hunt') {
    for (let i = 0; i < 10; i++) {
      const x = pushOut(Math.round(L * (0.07 + i * 0.087)));
      const target = i % 2 === 0;
      items.push({ kind: target ? 'target' : 'decoy', label: target ? g.target : g.decoys[(i >> 1) % g.decoys.length], x,
        color: target ? g.color : '#9aa7b1' });
    }
  } else if (g.type === 'count') {
    g.rounds.forEach((nGift, r) => {
      let x = pushOut(Math.round(L * (0.07 + r * 0.29)));
      signs.push({ x, n: nGift, round: r });
      x += 320;
      for (let k = 0; k < nGift; k++) {
        x = pushOut(x);
        items.push({ kind: 'gift', round: r, x, color: g.colors[(r + k) % g.colors.length] });
        x += 230;
      }
    });
  }
  items.forEach(it => { it.y = baseH(it.x) + (it.kind === 'gift' ? 62 : 118); });

  // Yıldızlar
  const stars = [];
  for (let x = 650; x < finish - 300; x += 720 + Math.round(rnd() * 200)) {
    if (inBusy(x) || inBusy(x + 260)) continue;
    if (items.some(it => Math.abs(it.x - x) < 300)) continue;
    const count = 2 + Math.round(rnd());
    for (let k = 0; k < count; k++) stars.push({ x: x + k * 120, dy: 62 });
  }
  ramps.forEach(r => {
    const e = r.x + r.len;
    [[80, 150], [170, 190], [260, 170]].forEach(([dx, dy]) => stars.push({ x: e + dx, dy: r.h + dy - 40 }));
  });
  stars.forEach(s => { s.y = baseH(s.x) + s.dy; });
  // Dönel rampanın içindeki yıldızlar (araç merkezinin geçtiği çember üzerinde)
  loops.forEach(l => {
    const cy = baseH(l.x) + l.r;
    [Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(th => {
      const t = th / (Math.PI * 2);
      const px = l.x - l.shift / 2 + l.shift * t + l.r * Math.sin(th);
      const py = cy - l.r * Math.cos(th);
      // aracın merkezi çemberin içine doğru 40 birim
      stars.push({ x: px - Math.sin(th) * 40, y: py + Math.cos(th) * 40, loop: true });
    });
  });

  // Süsler
  const DECOR = {
    farm: ['tree', 'barn', 'fence', 'cow', 'flowers', 'sheep', 'tree'],
    forest: ['pine', 'mushroom', 'pine', 'squirrel', 'bush', 'pine', 'mushroom'],
    snow: ['snowpine', 'snowman', 'snowpine', 'snowpine', 'igloo'],
    beach: ['palm', 'crab', 'umbrella', 'palm', 'bucket'],
    city: ['lamp', 'citytree', 'lamp', 'hydrant', 'bench']
  }[def.theme];
  const decor = [];
  let di = 0;
  for (let x = 300; x < L; x += 520 + Math.round(rnd() * 420)) {
    if (busy.some(([a, b]) => x >= a - 150 && x <= b + 150)) continue;
    if (Math.abs(x - finish) < 400) continue;
    decor.push({ t: DECOR[di++ % DECOR.length], x });
  }

  return { def, L, finish, ramps, loops, zones, items, signs, stars, decor, baseH };
}
