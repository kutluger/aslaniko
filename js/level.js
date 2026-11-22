// Bölüm tanımları ve bölüm üretici.
// Her bölüm bir "layout" (mekanik listesi) ile üretilir. layout yoksa varsayılan iskelet kullanılır.
// Mekanikler: ramp, megaramp, loop, doubleloop, tramp (trambolin),
// cannon (sirk topu), bumps (tümsekli yol) ve temaya özel bölgeler (puddle, bridge, ice, wave, tunnel).
const LEVELS = [
  // 1. Çiftlik: yola çıkan hayvanlar korna ile kenara çekilir (korna çalmasan da 5 sn sonra kendileri gider)
  {
    id: 'ciftlik', theme: 'farm', seed: 11, amp: 85, zone: 'puddle', length: 36000,
    stickers: ['🐔', '🐑', '🐷'], scene: ['barn', 'cow', 'sheep'],
    goal: { type: 'sequence', labels: ['A', 'S', 'L', 'A', 'N'], words: ['a', 'se', 'le', 'a', 'ne'], final: 'Aslan!', end: 'Aslan',
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'animals', f: 0.1, kinds: ['chick', 'chick', 'chick'] },
      { t: 'puddle', f: 0.17 },
      { t: 'ramp', f: 0.23 },
      { t: 'animals', f: 0.31, kinds: ['lamb', 'lamb'] },
      { t: 'bumps', f: 0.38 },
      { t: 'puddle', f: 0.46 },
      { t: 'animals', f: 0.53, kinds: ['piglet', 'chick', 'piglet'] },
      { t: 'tramp', f: 0.61 },
      { t: 'ramp', f: 0.68 },
      { t: 'animals', f: 0.75, kinds: ['duck', 'duckling', 'duckling'] },
      { t: 'puddle', f: 0.81 },
      { t: 'loop', f: 0.89, r: 220 }
    ]
  },
  // 2. Orman: kütüklerin üstünden zıpla, dereleri köprüden geç, mantar trambolinler
  {
    id: 'orman', theme: 'forest', seed: 23, amp: 70, zone: 'bridge', length: 36000,
    stickers: ['🦔', '🍄', '🦉'], scene: ['squirrel', 'mushroom', 'squirrel'],
    goal: { type: 'sequence', labels: ['1', '2', '3', '4', '5'], words: ['bir', 'iki', 'üç', 'dört', 'beş'],
      end: 'Bir, iki, üç, dört, beş', colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'logs', f: 0.1, n: 3 },
      { t: 'bridge', f: 0.17 },
      { t: 'tramp', f: 0.23 },
      { t: 'logs', f: 0.3, n: 4 },
      { t: 'loop', f: 0.38, r: 190 },
      { t: 'bridge', f: 0.45 },
      { t: 'logs', f: 0.51, n: 3 },
      { t: 'tramp', f: 0.58 },
      { t: 'megaramp', f: 0.64 },
      { t: 'logs', f: 0.73, n: 4 },
      { t: 'bridge', f: 0.8 },
      { t: 'doubleloop', f: 0.86, r: 180 }
    ]
  },
  // 3. Karlı dağ: teleferikle zirveye çık, kızakla aşağı kay
  {
    id: 'kar', theme: 'snow', seed: 37, amp: 85, zone: 'ice', length: 38000,
    stickers: ['🐧', '⛄', '🦊'], scene: ['snowman', 'igloo', 'snowpine'],
    goal: { type: 'sequence', labels: ['6', '7', '8', '9', '10'], words: ['altı', 'yedi', 'sekiz', 'dokuz', 'on'],
      end: 'Altı, yedi, sekiz, dokuz, on', colors: ['#e8333a', '#2f80ed', '#27ae60', '#9b51e0', '#ff9f1c'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'ice', f: 0.1 },
      { t: 'loop', f: 0.16, r: 190 },
      { t: 'cablecar', f: 0.23 },
      { t: 'tramp', f: 0.4 },
      { t: 'ice', f: 0.47 },
      { t: 'bumps', f: 0.53 },
      { t: 'megaramp', f: 0.6 },
      { t: 'ice', f: 0.68 },
      { t: 'loop', f: 0.75, r: 220 },
      { t: 'tramp', f: 0.82 },
      { t: 'ramp', f: 0.9 }
    ]
  },
  // 4. Sahil: araç denize girince bota dönüşür, yunuslar zıplar
  {
    id: 'sahil', theme: 'beach', seed: 41, amp: 75, zone: 'wave', length: 38000,
    stickers: ['🐬', '🦀', '🐚'], scene: ['umbrella', 'crab', 'palm'],
    goal: { type: 'sequence', labels: ['D', 'E', 'N', 'İ', 'Z'], words: ['de', 'e', 'ne', 'i', 'ze'], final: 'Deniz!', end: 'Deniz',
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'sea', f: 0.1, len: 2000 },
      { t: 'tramp', f: 0.19 },
      { t: 'loop', f: 0.26, r: 200 },
      { t: 'sea', f: 0.33, len: 2600 },
      { t: 'cannon', f: 0.44 },
      { t: 'wave', f: 0.51 },
      { t: 'sea', f: 0.56, len: 2200 },
      { t: 'megaramp', f: 0.66 },
      { t: 'sea', f: 0.74, len: 2800 },
      { t: 'loop', f: 0.87, r: 230 }
    ]
  },
  // 5. Kasaba: trafik lambasında dur, ördekleri bekle, boya atölyesinde renk değiştir
  {
    id: 'sehir', theme: 'city', seed: 53, amp: 40, zone: 'tunnel', length: 38000,
    stickers: ['🚦', '🦆', '🎨'], scene: ['bench', 'lamp', 'citytree'],
    goal: { type: 'sequence', labels: ['A', 'S', 'L', 'A', 'N', 'İ', 'K', 'O'], words: ['a', 'se', 'le', 'a', 'ne', 'i', 'ke', 'o'],
      final: 'Aslaniko!', end: 'Aslaniko',
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff', '#ff5a5f', '#2ec4b6', '#ff9f1c'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'traffic', f: 0.1 },
      { t: 'tunnel', f: 0.16 },
      { t: 'animals', f: 0.23, kinds: ['duck', 'duckling', 'duckling', 'duckling'], auto: true },
      { t: 'loop', f: 0.3, r: 190 },
      { t: 'paint', f: 0.37 },
      { t: 'traffic', f: 0.44 },
      { t: 'tunnel', f: 0.5 },
      { t: 'cannon', f: 0.56 },
      { t: 'animals', f: 0.64, kinds: ['duck', 'duckling', 'duckling'], auto: true },
      { t: 'megaramp', f: 0.7 },
      { t: 'paint', f: 0.78 },
      { t: 'traffic', f: 0.84 },
      { t: 'doubleloop', f: 0.89, r: 190 }
    ]
  },
  // 6. Meyve bahçesi: arkada römork; korna çalınca ağaçtaki meyveler römorka düşer
  {
    id: 'bahce', theme: 'orchard', seed: 61, amp: 70, zone: 'puddle', length: 36000, trailer: true,
    stickers: ['🍎', '🍐', '🐝'], scene: ['appletree', 'fence', 'appletree'],
    goal: { type: 'sequence', labels: ['E', 'L', 'M', 'A'], words: ['e', 'le', 'me', 'a'], final: 'Elma!', end: 'Elma',
      colors: ['#ff5a5f', '#2ec4b6', '#ff9f1c', '#a66cff'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'fruittree', f: 0.1, fruit: 0 },
      { t: 'fruittree', f: 0.13, fruit: 1 },
      { t: 'puddle', f: 0.19 },
      { t: 'loop', f: 0.25, r: 200 },
      { t: 'fruittree', f: 0.33, fruit: 2 },
      { t: 'fruittree', f: 0.36, fruit: 4 },
      { t: 'tramp', f: 0.43 },
      { t: 'bumps', f: 0.5 },
      { t: 'fruittree', f: 0.58, fruit: 1 },
      { t: 'fruittree', f: 0.61, fruit: 3 },
      { t: 'megaramp', f: 0.67 },
      { t: 'fruittree', f: 0.76, fruit: 0 },
      { t: 'logs', f: 0.8, n: 2 },
      { t: 'loop', f: 0.89, r: 210 }
    ]
  },
  // 7. Bulut tepeleri: balonlarla süzül; zıpla düğmesine basılı tut, yüksel
  {
    id: 'bulut', theme: 'clouds', seed: 71, amp: 90, zone: 'bridge', length: 38000,
    stickers: ['🌈', '🎈', '🦋'], scene: ['cloudpuff', 'balloons', 'cloudpuff'],
    goal: { type: 'sequence', labels: ['●', '■', '▲', '★', '♥'], words: ['daire', 'kare', 'üçgen', 'yıldız', 'kalp'],
      end: 'Daire, kare, üçgen, yıldız, kalp', colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'tramp', f: 0.1 },
      { t: 'loop', f: 0.16, r: 200 },
      { t: 'balloon', f: 0.22, len: 3200 },
      { t: 'bumps', f: 0.35 },
      { t: 'tramp', f: 0.41 },
      { t: 'balloon', f: 0.47, len: 3000 },
      { t: 'cannon', f: 0.6 },
      { t: 'megaramp', f: 0.66 },
      { t: 'balloon', f: 0.73, len: 3000 },
      { t: 'doubleloop', f: 0.88, r: 190 }
    ]
  },
  // 8. Dinozor vadisi: korna çal, uzun boyunlu dinozor boynunu köprü yapsın
  {
    id: 'dino', theme: 'dino', seed: 83, amp: 80, zone: 'puddle', length: 36000,
    stickers: ['🦕', '🥚', '🌋'], scene: ['egg', 'fern', 'egg'],
    goal: { type: 'sequence', labels: ['D', 'İ', 'N', 'O'], words: ['de', 'i', 'ne', 'o'], final: 'Dino!', end: 'Dino',
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff'] },
    layout: [
      { t: 'ramp', f: 0.05 },
      { t: 'logs', f: 0.09, n: 2 },
      { t: 'dino', f: 0.16 },
      { t: 'loop', f: 0.24, r: 200 },
      { t: 'tramp', f: 0.31 },
      { t: 'dino', f: 0.38 },
      { t: 'bumps', f: 0.46 },
      { t: 'cannon', f: 0.53 },
      { t: 'dino', f: 0.61 },
      { t: 'megaramp', f: 0.68 },
      { t: 'logs', f: 0.76, n: 3 },
      { t: 'dino', f: 0.83 },
      { t: 'loop', f: 0.9, r: 220 }
    ]
  },
  // 9. Tren yolu: yol ayrımında yolunu seç, düz vagona binip trenle git
  {
    id: 'tren', theme: 'train', seed: 97, amp: 60, zone: 'tunnel', length: 40000,
    stickers: ['🚂', '🎫', '🐄'], scene: ['signal', 'fence', 'tree'],
    goal: { type: 'sequence', labels: ['T', 'R', 'E', 'N'], words: ['te', 're', 'e', 'ne'], final: 'Tren!', end: 'Tren',
      colors: ['#ff5a5f', '#2ec4b6', '#ff9f1c', '#3fa7ff'] },
    layout: [
      { t: 'ramp', f: 0.04 },
      { t: 'fork', f: 0.08 },
      { t: 'loop', f: 0.16, r: 200 },
      { t: 'train', f: 0.22 },
      { t: 'tunnel', f: 0.33 },
      { t: 'fork', f: 0.38 },
      { t: 'bumps', f: 0.46 },
      { t: 'train', f: 0.51 },
      { t: 'megaramp', f: 0.62 },
      { t: 'fork', f: 0.69 },
      { t: 'tramp', f: 0.77 },
      { t: 'doubleloop', f: 0.86, r: 190 }
    ]
  },
  // 10. Lunapark: önceki bölümlerin hepsinden biraz; sonunda dönme dolap
  {
    id: 'lunapark', theme: 'funfair', seed: 101, amp: 50, zone: 'puddle', length: 44000,
    stickers: ['🎡', '🍭', '👑'], scene: ['tent', 'balloons', 'tent'],
    goal: { type: 'sequence', labels: ['A', 'F', 'E', 'R', 'İ', 'N'], words: ['a', 'fe', 'e', 're', 'i', 'ne'], final: 'Aferin!', end: 'Aferin',
      colors: ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff', '#ff5a5f'] },
    layout: [
      { t: 'ramp', f: 0.04 },
      { t: 'animals', f: 0.08, kinds: ['chick', 'lamb', 'piglet'] },
      { t: 'logs', f: 0.13, n: 3 },
      { t: 'loop', f: 0.19, r: 200 },
      { t: 'traffic', f: 0.24 },
      { t: 'tramp', f: 0.28 },
      { t: 'balloon', f: 0.33, len: 2400 },
      { t: 'dino', f: 0.42 },
      { t: 'paint', f: 0.47 },
      { t: 'fork', f: 0.52 },
      { t: 'train', f: 0.6 },
      { t: 'cannon', f: 0.69 },
      { t: 'fruittree', f: 0.74, fruit: 4 },
      { t: 'doubleloop', f: 0.79, r: 190 },
      { t: 'ferris', f: 0.9 }
    ]
  }
];

// Fizik sabitleri (game.js ile aynı): yıldız yaylarını hesaplamak için
const PHYS = { gravity: 1400, tramp: 1150, trampSpeed: 420, cannonVy: 980, cannonSpeed: 560, rampBoost: 450 };

function buildLevel(def) {
  let seed = def.seed * 9973;
  const rnd = () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const L = def.length || 22000;
  const finish = L - 700;
  const layout = def.layout || [
    { t: 'ramp', f: 0.17 }, { t: def.zone, f: 0.27 }, { t: 'loop', f: 0.36, r: 130 },
    { t: def.zone, f: 0.49 }, { t: 'ramp', f: 0.6 }, { t: def.zone, f: 0.71 }, { t: 'loop', f: 0.82, r: 130 }
  ];
  const ZONE_W = { puddle: 260, bridge: 340, ice: 620, wave: 300, tunnel: 760 };

  const ramps = [], loops = [], zones = [], tramps = [], cannons = [], bumps = [];
  const flats = [], busy = [], specials = [];
  const MT = typeof Mech !== 'undefined' ? Mech.TYPES : {};
  for (const it of layout) {
    const x = Math.round(L * it.f);
    if (MT[it.t]) {
      const m = MT[it.t].layout(it, x, def);
      specials.push(m.special);
      m.flats.forEach(f => flats.push(f));
      m.busy.forEach(b => busy.push(b));
    } else if (it.t === 'ramp' || it.t === 'megaramp') {
      const r = it.t === 'ramp' ? { x, len: 330, h: 85 } : { x, len: 440, h: 150, mega: true };
      ramps.push(r);
      flats.push([x - 220, x + r.len + (r.mega ? 900 : 520)]);
      busy.push([x - 120, x + r.len + (r.mega ? 800 : 420)]);
    } else if (it.t === 'loop' || it.t === 'doubleloop') {
      const r = it.r || 130;
      loops.push({ x, r, shift: 120 });
      let end = x;
      if (it.t === 'doubleloop') { end = x + 2 * r + 170; loops.push({ x: end, r, shift: 120 }); }
      flats.push([x - r - 420, end + r + 420]);
      busy.push([x - r - 280, end + r + 280]);
    } else if (it.t === 'tramp') {
      tramps.push({ x, w: 150 });
      flats.push([x - 300, x + 1000]);
      busy.push([x - 120, x + 900]);
    } else if (it.t === 'cannon') {
      cannons.push({ x });
      flats.push([x - 420, x + 1300]);
      busy.push([x - 220, x + 1200]);
    } else if (it.t === 'bumps') {
      bumps.push({ a: x, b: x + 6 * 150, n: 6, w: 150, h: 38 });
      flats.push([x - 180, x + 900 + 180]);
      busy.push([x - 40, x + 900 + 40]);
    } else {
      const w = ZONE_W[it.t] || 300;
      zones.push({ type: it.t, a: x, b: x + w });
      flats.push([x - 100, x + w + 100]);
      busy.push([x - 40, x + w + 40]);
    }
  }
  flats.push([finish - 600, L + 4000]);
  const inBusy = x => busy.some(([a, b]) => x >= a && x <= b);
  const pushOut = x => { for (let i = 0; i < 8; i++) { const z = busy.find(([a, b]) => x >= a && x <= b); if (!z) break; x = z[1] + 160; } return x; };

  // Ham tepeler
  const pts = [];
  for (let x = -2000; x <= L + 4000; x += 450) pts.push([x, x < 900 ? 0 : rnd() * def.amp]);
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
    // Tümsekler
    for (const bp of bumps) if (x >= bp.a && x <= bp.b) h += bp.h * (1 - Math.cos(TAU_L * (x - bp.a) / bp.w)) / 2;
    // Bölüme özel arazi (dağ, deniz çukuru, kütük, dinozor vadisi)
    for (const sp of specials) { const T = MT[sp.type]; if (T.terrain) h += T.terrain(sp, x); }
    ground[i] = h;
  }
  const baseH = x => {
    const f = (x - X0) / STEP;
    const i = Math.max(0, Math.min(n - 2, Math.floor(f)));
    const t = Math.max(0, Math.min(1, f - i));
    return ground[i] * (1 - t) + ground[i + 1] * t;
  };
  const flatH = x => baseH(x); // okunabilirlik için
  for (const sp of specials) { const T = MT[sp.type]; if (T.after) T.after(sp, baseH); }

  // Öğrenme nesneleri
  const items = [], signs = [];
  const g = def.goal;
  if (g.type === 'sequence') {
    const gap = 0.8 / (g.labels.length - 1); // 5 etikette 0.2, 8 etikette ~0.11
    g.labels.forEach((label, i) => {
      const x = pushOut(Math.round(L * (0.06 + i * gap)));
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

  // Yıldızlar ve altın halkalar (halkalar sadece zıplayarak alınır)
  const stars = [], rings = [];
  for (let x = 650; x < finish - 300; x += 1050 + Math.round(rnd() * 250)) {
    if (inBusy(x) || inBusy(x + 260)) continue;
    if (items.some(it => Math.abs(it.x - x) < 300)) continue;
    const count = 2;
    for (let k = 0; k < count; k++) stars.push({ x: x + k * 120, y: baseH(x + k * 120) + 62 });
  }
  // Düz yolda zıplama halkaları
  if (def.layout) {
    for (let x = 1500; x < finish - 500; x += 2600) {
      const rx = pushOut(x);
      if (rx > finish - 500 || items.some(it => Math.abs(it.x - rx) < 250)) continue;
      rings.push({ x: rx, y: baseH(rx) + 175 });
    }
  }
  ramps.forEach(r => {
    const e = r.x + r.len;
    const arc = r.mega ? [[100, 230], [220, 290], [340, 300], [460, 260]] : [[80, 150], [170, 190], [260, 170]];
    arc.forEach(([dx, dy]) => stars.push({ x: e + dx, y: baseH(e + dx) + r.h + dy - 40 }));
    if (r.mega) rings.push({ x: e + 280, y: baseH(e) + r.h + 360 });
  });
  loops.forEach(l => {
    const cy = baseH(l.x) + l.r;
    for (let k = 1; k <= 5; k++) {
      const th = (k / 6) * TAU_L;
      const px = l.x - l.shift / 2 + l.shift * (k / 6) + l.r * Math.sin(th);
      const py = cy - l.r * Math.cos(th);
      stars.push({ x: px - Math.sin(th) * 40, y: py + Math.cos(th) * 40 });
    }
  });
  // Trambolin: yay boyunca yıldızlar, tepede halka
  const arcPts = (x0, y0, vx, vy, ts) => ts.map(t => ({ x: x0 + vx * t, y: y0 + vy * t - 0.5 * PHYS.gravity * t * t }));
  tramps.forEach(tp => {
    const gy = baseH(tp.x);
    const pts2 = arcPts(tp.x + tp.w / 2, gy + 40, PHYS.trampSpeed, PHYS.tramp, [0.35, 0.55, 1.05, 1.25]);
    pts2.forEach(p => stars.push(p));
    const apexT = PHYS.tramp / PHYS.gravity;
    rings.push({ x: tp.x + tp.w / 2 + PHYS.trampSpeed * apexT, y: gy + 40 + PHYS.tramp * apexT - 0.5 * PHYS.gravity * apexT * apexT });
  });
  // Sirk topu: atış yayı
  cannons.forEach(c => {
    const gy = baseH(c.x);
    const mx = c.x + 110, my = gy + 125;
    arcPts(mx, my + 40, PHYS.cannonSpeed, PHYS.cannonVy, [0.25, 0.45, 0.95, 1.15, 1.35]).forEach(p => stars.push(p));
    const apexT = PHYS.cannonVy / PHYS.gravity;
    rings.push({ x: mx + PHYS.cannonSpeed * apexT, y: my + 40 + PHYS.cannonVy * apexT - 0.5 * PHYS.gravity * apexT * apexT });
  });
  // Tümsekler: her tümseğin üstünde halka
  bumps.forEach(bp => {
    for (let k = 1; k < bp.n; k += 2) {
      const x = bp.a + k * bp.w + bp.w / 2;
      rings.push({ x, y: baseH(bp.a) + 200 });
    }
    stars.push({ x: bp.a + bp.w * 0.5, y: baseH(bp.a + bp.w * 0.5) + 70 });
  });

  // Bölüme özel yıldızlar
  for (const sp of specials) { const T = MT[sp.type]; if (T.populate) T.populate(sp, { baseH, stars, rings }); }

  // Gizli çıkartmalar: her bölümde 3 tane, sadece zıplayınca alınabilecek yükseklikte
  const stickers = [];
  (def.stickers || []).forEach((emoji, k) => {
    let x = pushOut(Math.round(L * (0.28 + k * 0.25)));
    if (x > finish - 400) x = pushOut(Math.round(L * (0.2 + k * 0.2)));
    if (items.some(it => Math.abs(it.x - x) < 260)) x = pushOut(x + 420);
    stickers.push({ id: def.id + ':' + k, emoji, x, y: baseH(x) + 205 });
  });
  for (let i = stars.length - 1; i >= 0; i--) if (stickers.some(st => Math.abs(st.x - stars[i].x) < 140 && Math.abs(st.y - stars[i].y) < 160)) stars.splice(i, 1);

  // Süsler
  const DECOR = {
    farm: ['tree', 'barn', 'fence', 'cow', 'flowers', 'sheep', 'tree'],
    autumn: ['autumntree', 'leafpile', 'mushroom', 'autumntree', 'squirrel', 'leafpile'],
    forest: ['pine', 'mushroom', 'pine', 'squirrel', 'bush', 'pine', 'mushroom'],
    snow: ['snowpine', 'snowman', 'snowpine', 'snowpine', 'igloo'],
    beach: ['palm', 'crab', 'umbrella', 'palm', 'bucket'],
    city: ['citytree', 'bench', 'lamp', 'flowers', 'citytree'],
    orchard: ['appletree', 'fence', 'flowers', 'appletree', 'bush'],
    clouds: ['cloudpuff', 'flowers', 'cloudpuff', 'balloons'],
    dino: ['fern', 'bush', 'egg', 'fern', 'mushroom'],
    train: ['tree', 'signal', 'fence', 'cow', 'flowers'],
    funfair: ['tent', 'balloons', 'lamp', 'flowers', 'tent']
  }[def.theme];
  const decor = [];
  let di = 0;
  for (let x = 300; x < L; x += 520 + Math.round(rnd() * 420)) {
    if (busy.some(([a, b]) => x >= a - 150 && x <= b + 150)) continue;
    if (Math.abs(x - finish) < 400) continue;
    decor.push({ t: DECOR[di++ % DECOR.length], x });
  }

  return { def, L, finish, ramps, loops, zones, tramps, cannons, bumps, items, signs, stars, rings, decor, baseH, flatH, specials, stickers };
}
const TAU_L = Math.PI * 2;
