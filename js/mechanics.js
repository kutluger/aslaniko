// Bölümlere özel oyun mekanikleri (her bölümün "yıldız" mekaniği).
// Kurallar: kaybetmek yok, süre baskısı yok, yanıp sönme yok. Çocuk bir şey yapmasa da
// birkaç saniye sonra her engel kendiliğinden açılır; araç hiçbir yerde takılı kalmaz.
//
// Her tür için:
//   layout(it, x, def)  -> { special, flats: [[a,b]], busy: [[a,b]] }   (level.js çağırır)
//   terrain(s, x)       -> zemine eklenecek yükseklik (dağ, çukur, kütük...)
//   populate(s, L)      -> yıldız/halka ekler (L: { baseH, stars, rings })
// Oyun sırasında (game.js, Mech.init ile bağlanır):
//   control(s, dt)      -> true ise aracı bu mekanik yönetiyor (teleferik, tren, dönme dolap, balon)
//   limit(s)            -> aracın geçemeyeceği x (hayvanlar, trafik lambası, dinozor, yol ayrımı)
//   surface(s, x)       -> zemin yerine kullanılacak yükseklik (deniz yüzeyi, köprü) ya da null
//   honk(s)             -> korna çalınınca
//   update(s, dt)       -> canlandırma
//   drawBack / drawFront(e, s) -> araçtan önce / sonra çizim
const Mech = (() => {
  const TAU = Math.PI * 2;
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  let G = null; // oyun bağlantısı (game.js)

  const FONT = '-apple-system, "Segoe UI", Roboto, sans-serif';

  // ---------- Küçük çizim yardımcıları ----------
  function ellipse(ctx, x, y, rx, ry, color, rot = 0) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); ctx.fill();
  }
  function circle(ctx, x, y, r, color) { ellipse(ctx, x, y, r, r, color); }
  function eye(ctx, x, y, s) { circle(ctx, x, y, 3.2 * s, '#2a1a10'); circle(ctx, x + 1 * s, y - 1 * s, 1.1 * s, '#fff'); }
  // Korna simgeli konuşma balonu (çocuğa "korna çal" ipucu; yanıp sönmez, yavaşça büyüyüp küçülür)
  function hornBubble(e, wx, wy) {
    const { ctx, scale: s } = e;
    const x = e.sx(wx), y = e.sy(wy);
    const k = 1 + Math.sin(e.time * 2.2) * 0.05;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = '#fff';
    Draw.rr(ctx, -40 * s, -34 * s, 80 * s, 62 * s, 22 * s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8 * s, 26 * s); ctx.lineTo(0, 42 * s); ctx.lineTo(10 * s, 26 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath(); ctx.moveTo(-22 * s, -10 * s); ctx.lineTo(-12 * s, -10 * s); ctx.lineTo(4 * s, -22 * s); ctx.lineTo(4 * s, 16 * s); ctx.lineTo(-12 * s, 4 * s); ctx.lineTo(-22 * s, 4 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f2b705'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(8 * s, -3 * s, 10 * s, -0.8, 0.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(8 * s, -3 * s, 19 * s, -0.8, 0.8); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.restore();
  }

  // ---------- Hayvanlar (çiftlik: korna ile yoldan çekilirler; kasaba: ördekler yaya geçidinden geçer) ----------
  function drawCritter(ctx, kind, x, y, s, t, flip) {
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
    const hop = Math.abs(Math.sin(t * 6)) * 6 * s * (t > 0 ? 1 : 0);
    ctx.translate(0, -hop);
    if (kind === 'chick') {
      circle(ctx, 0, -18 * s, 18 * s, '#ffd84a');
      circle(ctx, 10 * s, -36 * s, 12 * s, '#ffd84a');
      ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(20 * s, -37 * s); ctx.lineTo(30 * s, -34 * s); ctx.lineTo(20 * s, -31 * s); ctx.fill();
      eye(ctx, 13 * s, -39 * s, s);
      ellipse(ctx, -6 * s, -18 * s, 9 * s, 6 * s, '#f2c22e', -0.4);
      ctx.strokeStyle = '#ff9f1c'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(-4 * s, 0); ctx.lineTo(-4 * s, -4 * s); ctx.moveTo(5 * s, 0); ctx.lineTo(5 * s, -4 * s); ctx.stroke();
    } else if (kind === 'duck' || kind === 'duckling') {
      const k = kind === 'duck' ? 1.25 : 0.75;
      ctx.scale(k, k);
      ellipse(ctx, 0, -18 * s, 24 * s, 16 * s, kind === 'duck' ? '#ffffff' : '#ffe066');
      circle(ctx, 16 * s, -40 * s, 12 * s, kind === 'duck' ? '#ffffff' : '#ffe066');
      ellipse(ctx, 30 * s, -38 * s, 9 * s, 4.5 * s, '#ff9f1c');
      eye(ctx, 19 * s, -43 * s, s);
      ellipse(ctx, -4 * s, -20 * s, 12 * s, 7 * s, kind === 'duck' ? '#e8eef2' : '#f5d24a', -0.3);
      ctx.fillStyle = '#ff9f1c'; ctx.fillRect(-6 * s, -4 * s, 5 * s, 4 * s); ctx.fillRect(4 * s, -4 * s, 5 * s, 4 * s);
    } else if (kind === 'lamb') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      [[-16, -22], [0, -28], [16, -22], [-8, -14], [10, -14]].forEach(([dx, dy]) => { ctx.moveTo(dx * s + 14 * s, dy * s); ctx.arc(dx * s, dy * s, 14 * s, 0, TAU); });
      ctx.fill();
      ellipse(ctx, 24 * s, -30 * s, 11 * s, 13 * s, '#4a3b35');
      eye(ctx, 28 * s, -33 * s, s);
      ellipse(ctx, 16 * s, -38 * s, 6 * s, 3 * s, '#4a3b35', -0.5);
      ctx.fillStyle = '#4a3b35'; ctx.fillRect(-14 * s, -8 * s, 5 * s, 8 * s); ctx.fillRect(10 * s, -8 * s, 5 * s, 8 * s);
    } else if (kind === 'piglet') {
      ellipse(ctx, 0, -20 * s, 24 * s, 17 * s, '#f6b3c0');
      circle(ctx, 20 * s, -28 * s, 13 * s, '#f6b3c0');
      ellipse(ctx, 32 * s, -27 * s, 6 * s, 5 * s, '#ee95a6');
      circle(ctx, 30 * s, -27 * s, 1.3 * s, '#a05060'); circle(ctx, 34 * s, -27 * s, 1.3 * s, '#a05060');
      eye(ctx, 22 * s, -33 * s, s);
      ctx.fillStyle = '#ee95a6'; ctx.beginPath(); ctx.moveTo(10 * s, -38 * s); ctx.lineTo(16 * s, -46 * s); ctx.lineTo(20 * s, -38 * s); ctx.fill();
      ctx.fillRect(-14 * s, -6 * s, 6 * s, 6 * s); ctx.fillRect(10 * s, -6 * s, 6 * s, 6 * s);
    }
    ctx.restore();
  }

  const animals = {
    layout(it, x) {
      const kinds = it.kinds || ['chick', 'lamb', 'piglet'];
      return {
        special: { type: 'animals', x, kinds, auto: !!it.auto, state: 'wait', t: 0, wait: 0, leave: 0 },
        flats: [[x - 500, x + 500]], busy: [[x - 360, x + 260]]
      };
    },
    reset(s) { s.state = 'wait'; s.t = 0; s.wait = 0; s.leave = 0; },
    limit(s) { return s.state === 'wait' || (s.state === 'leaving' && s.leave < 0.6) ? s.x - 240 : Infinity; },
    honk(s) { const c = G.car; if (s.state === 'wait' && s.x - c.x < 1100 && s.x - c.x > -100) go(s); },
    update(s, dt) {
      s.t += dt;
      const c = G.car;
      if (s.state === 'wait') {
        if (s.x - c.x < 520) s.wait += dt;
        // ördekler (auto) araç yaklaşınca kendileri karşıya geçer; diğerleri 5 sn sonra kendiliğinden çekilir
        if ((s.auto && s.x - c.x < 700) || s.wait > (s.auto ? 0 : 5)) go(s);
        G.hornHint(!s.auto && s.x - c.x < 1000 && s.x - c.x > 0);
      } else if (s.state === 'leaving') {
        s.leave += dt / (s.auto ? 2.6 : 1.4);
        if (s.leave >= 1) s.state = 'gone';
      }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const n = s.kinds.length;
      const p = s.state === 'wait' ? 0 : smooth(s.leave);
      if (s.auto) { // yaya geçidi
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        for (let k = 0; k < 4; k++) ctx.fillRect(e.sx(s.x - 120 + k * 60), e.sy(gy - 4), 34 * sc, 8 * sc);
      }
      for (let i = 0; i < n; i++) {
        const kind = s.kinds[i];
        let wx = s.x - 60 + i * 70, wy = gy;
        if (s.auto) { wx = s.x - 100 + i * 46; wy = gy + p * 140; } // karşıya (arka plana) geçerler
        else { wx += p * (160 + i * 40); wy = gy + p * (110 + (i % 2) * 30); } // kenara, çimene çekilirler
        const size = sc * (1 - p * 0.35);
        const moving = s.state === 'leaving' ? s.t + i : 0;
        drawCritter(ctx, kind, e.sx(wx), e.sy(wy), size, moving, false);
      }
      if (s.state === 'wait' && !s.auto && s.x - G.car.x < 1100) hornBubble(e, s.x + 10, gy + 170);
    }
  };
  function go(s) { if (s.state === 'wait') { s.state = 'leaving'; s.leave = 0; G.sound('quack'); } }

  // ---------- Kütükler (orman: zıplayarak geçilir, zıplamazsan araç yavaşça tırmanır) ----------
  const logs = {
    layout(it, x) {
      const n = it.n || 3, gap = 520;
      const xs = []; for (let k = 0; k < n; k++) xs.push(x + k * gap);
      return { special: { type: 'logs', x, xs, h: 46, w: 96 }, flats: [[x - 300, x + n * gap + 200]], busy: [[x - 200, x + n * gap]] };
    },
    terrain(s, x) {
      for (const lx of s.xs) { const d = Math.abs(x - lx); if (d < s.w / 2) return s.h * Math.cos((d / (s.w / 2)) * Math.PI / 2); }
      return 0;
    },
    populate(s, L) { for (const lx of s.xs) L.stars.push({ x: lx, y: L.baseH(lx) + 190 }); },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      for (const lx of s.xs) {
        const gy = e.baseH(lx - 60);
        const x = e.sx(lx), y = e.sy(gy + s.h * 0.5);
        ellipse(ctx, x, y, s.w * 0.55 * sc, s.h * 0.55 * sc, '#9a6233');
        ellipse(ctx, x + s.w * 0.5 * sc, y, s.h * 0.24 * sc, s.h * 0.55 * sc, '#d9a066');
        ellipse(ctx, x + s.w * 0.5 * sc, y, s.h * 0.12 * sc, s.h * 0.3 * sc, '#b8804a');
        ellipse(ctx, x - 12 * sc, y - 20 * sc, 14 * sc, 7 * sc, '#6aa84f', -0.2);
      }
    }
  };

  // ---------- Teleferik + kızak (karlı dağ) ----------
  const CABLE = { len: 1800, H: 560, plat: 420, down: 2600 };
  const cablecar = {
    layout(it, x) {
      const end = x + CABLE.len + CABLE.plat + CABLE.down;
      return { special: { type: 'cablecar', x, end, ride: 0, done: false }, flats: [[x - 500, end + 500]], busy: [[x - 400, end + 300]] };
    },
    reset(s) { s.ride = 0; s.done = false; s.riding = false; },
    terrain(s, x) {
      const a = s.x + 120, top = s.x + CABLE.len, pe = top + CABLE.plat, end = s.end;
      if (x < a || x > end) return 0;
      if (x < top) return CABLE.H * smooth((x - a) / (top - a)) * 1.0;
      if (x < pe) return CABLE.H;
      return CABLE.H * (1 - smooth((x - pe) / (end - pe)));
    },
    populate(s, L) {
      const pe = s.x + CABLE.len + CABLE.plat;
      for (let k = 1; k < 9; k++) { const x = pe + k * 280; L.stars.push({ x, y: L.baseH(x) + 70 }); }
    },
    control(s, dt) {
      const c = G.car;
      if (!s.riding && !s.done && c.x >= s.x && c.x < s.x + 200 && G.playing()) {
        s.riding = true; s.ride = 0; s.y0 = G.groundH(s.x);
        G.sound('click');
      }
      if (!s.riding) return false;
      s.ride += dt / 6.5;
      const t = Math.min(1, s.ride);
      const top = s.x + CABLE.len;
      c.x = lerp(s.x, top + 60, t);
      const hang = lerp(s.y0, G.baseH(top + 60), t);
      c.y = Math.max(hang + Math.sin(t * Math.PI) * 60, G.baseH(c.x) + 30 * Math.sin(t * Math.PI));
      c.angle = 0; c.vy = 0; c.speed = 120; c.onGround = true; c.ballistic = false;
      c.wheel += dt * 2;
      if (t >= 1) { s.riding = false; s.done = true; c.y = G.baseH(c.x); c.speed = 160; }
      return true;
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const top = s.x + CABLE.len;
      const y0 = e.baseH(s.x), y1 = e.baseH(top);
      // istasyon direkleri
      ctx.fillStyle = '#8a96a0';
      ctx.fillRect(e.sx(s.x - 60), e.sy(y0 + 300), 16 * sc, 300 * sc);
      ctx.fillRect(e.sx(top + 120), e.sy(y1 + 300), 16 * sc, 300 * sc);
      ctx.fillStyle = '#e8333a';
      Draw.rr(ctx, e.sx(s.x - 110), e.sy(y0 + 330), 120 * sc, 36 * sc, 8 * sc); ctx.fill();
      Draw.rr(ctx, e.sx(top + 70), e.sy(y1 + 330), 120 * sc, 36 * sc, 8 * sc); ctx.fill();
      // halat
      ctx.strokeStyle = '#4a5560'; ctx.lineWidth = 4 * sc;
      ctx.beginPath(); ctx.moveTo(e.sx(s.x - 50), e.sy(y0 + 300)); ctx.lineTo(e.sx(top + 130), e.sy(y1 + 300)); ctx.stroke();
      // tepede düzlük: küçük kulübe
      ctx.fillStyle = '#c98b4a'; ctx.fillRect(e.sx(top + 200), e.sy(y1 + 90), 110 * sc, 90 * sc);
      ctx.fillStyle = '#8f5a2b'; ctx.beginPath(); ctx.moveTo(e.sx(top + 185), e.sy(y1 + 88)); ctx.lineTo(e.sx(top + 255), e.sy(y1 + 140)); ctx.lineTo(e.sx(top + 325), e.sy(y1 + 88)); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(e.sx(top + 185), e.sy(y1 + 92)); ctx.lineTo(e.sx(top + 255), e.sy(y1 + 144)); ctx.lineTo(e.sx(top + 325), e.sy(y1 + 92)); ctx.lineTo(e.sx(top + 325), e.sy(y1 + 86)); ctx.lineTo(e.sx(top + 255), e.sy(y1 + 132)); ctx.lineTo(e.sx(top + 185), e.sy(y1 + 86)); ctx.fill();
    },
    // Araç halata asılıyken askı ve kabin (araçtan sonra çizilir)
    drawFront(e, s) {
      if (!s.riding) return;
      const { ctx, scale: sc } = e;
      const c = G.car;
      const top = s.x + CABLE.len;
      const t = Math.min(1, s.ride);
      const y0 = e.baseH(s.x), y1 = e.baseH(top);
      const cx = c.x, cyCable = lerp(y0 + 300, y1 + 300, (cx - (s.x - 50)) / (top + 180 - s.x));
      ctx.strokeStyle = '#4a5560'; ctx.lineWidth = 5 * sc;
      ctx.beginPath(); ctx.moveTo(e.sx(cx), e.sy(cyCable)); ctx.lineTo(e.sx(cx), e.sy(c.y + 150)); ctx.stroke();
      circle(ctx, e.sx(cx), e.sy(cyCable), 9 * sc, '#e8333a');
      // kabin çerçevesi
      ctx.strokeStyle = '#e8333a'; ctx.lineWidth = 6 * sc;
      ctx.beginPath();
      ctx.moveTo(e.sx(cx - 105), e.sy(c.y - 6)); ctx.lineTo(e.sx(cx + 105), e.sy(c.y - 6));
      ctx.moveTo(e.sx(cx - 105), e.sy(c.y - 6)); ctx.lineTo(e.sx(cx - 105), e.sy(c.y + 150)); ctx.lineTo(e.sx(cx + 105), e.sy(c.y + 150)); ctx.lineTo(e.sx(cx + 105), e.sy(c.y - 6));
      ctx.stroke();
      void t;
    },
    // Kızak: inişte aracın altında kırmızı kızak
    sled(s, x) { const pe = s.x + CABLE.len + CABLE.plat; return s.done && x > pe - 100 && x < s.end + 200; }
  };

  // ---------- Deniz (sahil: araç denize uçunca bota dönüşür) ----------
  const sea = {
    layout(it, x) {
      const len = it.len || 2200;
      return { special: { type: 'sea', x, len, depth: 170, level: 0 }, flats: [[x - 700, x + len + 300]], busy: [[x - 500, x + len + 200]] };
    },
    terrain(s, x) {
      if (x < s.x || x > s.x + s.len) return 0;
      const edge = 260;
      const a = smooth((x - s.x) / edge), b = smooth((s.x + s.len - x) / edge);
      return -s.depth * Math.min(a, b);
    },
    after(s, baseH) { s.level = baseH(s.x - 10); },
    populate(s, L) {
      for (let k = 1; k < 7; k++) { const x = s.x + k * (s.len / 7); L.stars.push({ x, y: s.level + 70 + (k % 2) * 60 }); }
      L.rings.push({ x: s.x + s.len * 0.5, y: s.level + 230 });
    },
    waterY(s, x) { return s.level - 10 + Math.sin(x * 0.01 + G.time() * 1.4) * 5; },
    surface(s, x) {
      if (x < s.x || x > s.x + s.len) return null;
      return Math.max(G.baseH(x), sea.waterY(s, x) - 26);
    },
    inWater(s, x) { return x > s.x + 140 && x < s.x + s.len - 140; },
    update(s, dt) {
      const c = G.car;
      const inside = sea.inWater(s, c.x);
      if (inside && !s.wet) { s.wet = true; G.splash(c.x, s.level); }
      if (!inside) s.wet = false;
      s.t = (s.t || 0) + dt;
    },
    reset(s) { s.wet = false; s.t = 0; },
    drawBack(e, s) { // yunuslar suyun arkasında yavaşça zıplar
      const { ctx, scale: sc } = e;
      for (let k = 0; k < 2; k++) {
        const period = 5.5, ph = ((G.anim() + k * 2.7) % period) / period;
        if (ph > 0.45) continue;
        const p = ph / 0.45;
        const dx = s.x + s.len * (0.3 + k * 0.4) + p * 240;
        const dy = s.level + Math.sin(p * Math.PI) * 170 - 30;
        ctx.save();
        ctx.translate(e.sx(dx), e.sy(dy));
        ctx.rotate(-Math.cos(p * Math.PI) * 0.8);
        ellipse(ctx, 0, 0, 46 * sc, 18 * sc, '#6aa9d8');
        ellipse(ctx, 6 * sc, 6 * sc, 30 * sc, 8 * sc, '#cfe6f5');
        ctx.fillStyle = '#6aa9d8';
        ctx.beginPath(); ctx.moveTo(-4 * sc, -16 * sc); ctx.lineTo(8 * sc, -32 * sc); ctx.lineTo(14 * sc, -14 * sc); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-42 * sc, 0); ctx.lineTo(-62 * sc, -14 * sc); ctx.lineTo(-58 * sc, 12 * sc); ctx.fill();
        eye(ctx, 30 * sc, -4 * sc, sc);
        ctx.restore();
      }
    },
    drawFront(e, s) {
      const { ctx, scale: sc } = e;
      const x0 = s.x + 40, x1 = s.x + s.len - 40;
      ctx.fillStyle = 'rgba(80,170,225,0.62)';
      ctx.beginPath();
      ctx.moveTo(e.sx(x0), e.sy(e.baseH(x0) - 4));
      for (let x = x0; x <= x1; x += 20) ctx.lineTo(e.sx(x), e.sy(Math.max(e.baseH(x), sea.waterY(s, x))));
      for (let x = x1; x >= x0; x -= 20) ctx.lineTo(e.sx(x), e.sy(e.baseH(x) - 4));
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4 * sc;
      ctx.beginPath();
      let started = false;
      for (let x = x0; x <= x1; x += 20) {
        const wy = sea.waterY(s, x);
        if (wy < e.baseH(x)) { started = false; continue; }
        const px = e.sx(x), py = e.sy(wy);
        started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true;
      }
      ctx.stroke();
    },
    boat(s, x) { return sea.inWater(s, x); }
  };

  // ---------- Trafik lambası (kasaba: kırmızıda dur, yeşilde geç; renk yavaşça değişir) ----------
  const traffic = {
    layout(it, x) { return { special: { type: 'traffic', x, phase: 'green', t: 0 }, flats: [[x - 500, x + 300]], busy: [[x - 300, x + 160]] }; },
    reset(s) { s.phase = 'green'; s.t = 0; s.used = false; },
    update(s, dt) {
      const c = G.car;
      s.t += dt;
      if (s.phase === 'green' && !s.used && s.x - c.x < 650 && s.x - c.x > 0) { s.phase = 'red'; s.t = 0; s.used = true; }
      else if (s.phase === 'red' && s.t > 3.2) { s.phase = 'yellow'; s.t = 0; }
      else if (s.phase === 'yellow' && s.t > 1) { s.phase = 'green'; s.t = 0; G.sound('ding'); }
    },
    limit(s) { return s.phase === 'green' ? Infinity : s.x - 170; },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const x = e.sx(s.x), y = e.sy(gy);
      ctx.fillStyle = '#6d7a85'; ctx.fillRect(x - 6 * sc, y - 150 * sc, 12 * sc, 150 * sc);
      ctx.fillStyle = '#34404a'; Draw.rr(ctx, x - 30 * sc, y - 300 * sc, 60 * sc, 160 * sc, 14 * sc); ctx.fill();
      const fade = Math.min(1, s.t / 0.4); // renk değişimi 0.4 sn'de yumuşakça
      const on = { red: s.phase === 'red', yellow: s.phase === 'yellow', green: s.phase === 'green' };
      const lamp = (cy, col, dim, active) => {
        circle(ctx, x, y - cy * sc, 20 * sc, dim);
        if (active) { ctx.globalAlpha = fade; circle(ctx, x, y - cy * sc, 20 * sc, col); ctx.globalAlpha = 1; }
      };
      lamp(270, '#ff6b6b', '#5a3a3a', on.red);
      lamp(220, '#ffd166', '#5a523a', on.yellow);
      lamp(170, '#5cd38a', '#3a5a45', on.green);
      // durma çizgisi
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(e.sx(s.x - 150), e.sy(gy - 4), 12 * sc, 10 * sc);
    }
  };

  // ---------- Boya atölyesi (kasaba: içinden geçen aracın rengi değişir) ----------
  const paint = {
    layout(it, x) { return { special: { type: 'paint', x, done: false }, flats: [[x - 400, x + 400]], busy: [[x - 250, x + 250]] }; },
    reset(s) { s.done = false; },
    update(s) {
      const c = G.car;
      if (!s.done && c.x > s.x) { s.done = true; G.repaint(); }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const x = e.sx(s.x), y = e.sy(gy);
      ctx.fillStyle = '#f3e8bd'; ctx.fillRect(x - 140 * sc, y - 230 * sc, 280 * sc, 230 * sc);
      ctx.fillStyle = 'rgba(120,90,70,0.25)'; ctx.fillRect(x - 110 * sc, y - 190 * sc, 220 * sc, 190 * sc);
    },
    drawFront(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const x = e.sx(s.x), y = e.sy(gy);
      const cols = ['#ff6b6b', '#ffd166', '#5cd38a', '#4ea8ff', '#b388ff'];
      ctx.fillStyle = '#dd9c8c'; ctx.fillRect(x - 150 * sc, y - 250 * sc, 40 * sc, 250 * sc); ctx.fillRect(x + 110 * sc, y - 250 * sc, 40 * sc, 250 * sc);
      cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x - 150 * sc + i * 60 * sc, y - 270 * sc, 60 * sc, 30 * sc); });
      // boya kovaları
      cols.slice(0, 3).forEach((c, i) => {
        ctx.fillStyle = '#c9d2d9'; Draw.rr(ctx, x + 170 * sc + i * 46 * sc, y - 44 * sc, 36 * sc, 44 * sc, 6 * sc); ctx.fill();
        ctx.fillStyle = c; ctx.fillRect(x + 170 * sc + i * 46 * sc, y - 44 * sc, 36 * sc, 10 * sc);
      });
      // fırça tabelası
      ctx.fillStyle = '#fff'; Draw.rr(ctx, x - 70 * sc, y - 330 * sc, 140 * sc, 52 * sc, 12 * sc); ctx.fill();
      ctx.save(); ctx.translate(x, y - 304 * sc); ctx.rotate(-0.5);
      ctx.fillStyle = '#9a6233'; ctx.fillRect(-36 * sc, -5 * sc, 46 * sc, 10 * sc);
      ctx.fillStyle = '#ccc'; ctx.fillRect(8 * sc, -8 * sc, 10 * sc, 16 * sc);
      ctx.fillStyle = cols[3]; Draw.rr(ctx, 16 * sc, -10 * sc, 22 * sc, 20 * sc, 6 * sc); ctx.fill();
      ctx.restore();
    }
  };

  // ---------- Meyve ağacı (meyve bahçesi: korna çalınca meyveler römorka düşer) ----------
  const FRUITS = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#e8333a', '#a66cff'];
  const fruittree = {
    layout(it, x) { return { special: { type: 'fruittree', x, fruit: it.fruit || 0, state: 'full', t: 0 }, flats: [[x - 300, x + 300]], busy: [[x - 120, x + 120]] }; },
    reset(s) { s.state = 'full'; s.t = 0; },
    honk(s) {
      const c = G.car;
      if (s.state === 'full' && Math.abs(s.x - c.x) < 650) { s.state = 'drop'; s.t = 0; G.sound('pop'); }
    },
    update(s, dt) {
      const c = G.car;
      if (s.state === 'full') G.hornHint(Math.abs(s.x - c.x) < 650);
      if (s.state === 'drop') { s.t += dt; if (s.t > 1.1) { s.state = 'empty'; G.addBonus(5, FRUITS[s.fruit % FRUITS.length]); G.trailerAdd(5, FRUITS[s.fruit % FRUITS.length]); } }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const x = e.sx(s.x), y = e.sy(gy);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - 14 * sc, y - 170 * sc, 28 * sc, 170 * sc);
      circle(ctx, x, y - 230 * sc, 90 * sc, '#4caf50'); circle(ctx, x - 70 * sc, y - 190 * sc, 60 * sc, '#4caf50'); circle(ctx, x + 70 * sc, y - 190 * sc, 60 * sc, '#4caf50');
      const col = FRUITS[s.fruit % FRUITS.length];
      const spots = [[-50, -220], [10, -260], [50, -200], [-20, -180], [70, -240]];
      const c = G.car;
      spots.forEach(([dx, dy], i) => {
        if (s.state === 'empty') return;
        let px = s.x + dx, py = gy - dy;
        if (s.state === 'drop') { // römorka doğru yay
          const t = smooth(Math.min(1, s.t / (0.7 + i * 0.08)));
          px = lerp(px, c.x - 150, t); py = lerp(py, c.y + 60, t) + Math.sin(t * Math.PI) * 60;
        }
        circle(ctx, e.sx(px), e.sy(py), 15 * sc, col);
        ellipse(ctx, e.sx(px) + 4 * sc, e.sy(py) - 15 * sc, 6 * sc, 3 * sc, '#2e7d32', -0.4);
      });
      if (s.state === 'full' && Math.abs(s.x - c.x) < 900) hornBubble(e, s.x + 150, gy + 230);
    }
  };

  // ---------- Balonla süzülme (bulut tepeleri: zıpla düğmesine basılı tutunca yükselir) ----------
  const balloon = {
    layout(it, x) {
      const len = it.len || 3200;
      return { special: { type: 'balloon', x, len, on: false, done: false, up: 0 }, flats: [[x - 400, x + 200]], busy: [[x - 300, x + len + 400]] };
    },
    reset(s) { s.on = false; s.done = false; s.up = 0; s.away = 0; },
    populate(s, L) {
      for (let k = 1; k < 12; k++) {
        const x = s.x + k * (s.len / 12);
        L.stars.push({ x, y: L.baseH(x) + 230 + Math.sin(k * 0.9) * 110 });
      }
      L.rings.push({ x: s.x + s.len * 0.35, y: L.baseH(s.x + s.len * 0.35) + 330 });
      L.rings.push({ x: s.x + s.len * 0.7, y: L.baseH(s.x + s.len * 0.7) + 330 });
    },
    control(s, dt) {
      const c = G.car;
      if (!s.on && !s.done && c.x >= s.x && c.x < s.x + 300 && G.playing()) { s.on = true; G.sound('pop'); c.vy = 200; }
      if (s.done && s.away < 1) s.away += dt / 2;
      if (!s.on) return false;
      G.jumpHint && G.jumpHint();
      const g = G.groundH(c.x);
      const lift = G.jumpHeld();
      c.vy += (lift ? 700 : -260) * dt;
      c.vy = Math.max(-150, Math.min(lift ? 320 : 120, c.vy));
      c.y += c.vy * dt;
      if (c.y > g + 380) { c.y = g + 380; c.vy = Math.min(0, c.vy); }
      if (c.y < g) { c.y = g; c.vy = Math.max(0, c.vy); }
      c.speed = Math.max(260, Math.min(340, c.speed + (G.gas() ? 200 : -60) * dt));
      c.x += c.speed * dt;
      c.wheel += c.speed * dt / 40;
      c.onGround = c.y <= g + 1;
      c.ballistic = false;
      c.angle += (Math.max(-0.15, Math.min(0.15, c.vy / 1200)) - c.angle) * Math.min(1, dt * 4);
      if (c.x > s.x + s.len) { s.on = false; s.done = true; s.away = 0; c.onGround = c.y <= g + 1; c.ballistic = !c.onGround; }
      return true;
    },
    // Aracın üstündeki balonlar (araç yerel koordinatında, araçtan önce çizilir)
    carBack(ctx, s, sc) {
      if (!s.on && !(s.done && s.away < 1)) return;
      const lift = s.on ? 0 : s.away * 500;
      const cols = ['#ff8fa3', '#ffd166', '#8fd3ff', '#b9f2a1', '#cdb4ff'];
      ctx.strokeStyle = 'rgba(80,80,80,0.6)'; ctx.lineWidth = 2;
      cols.forEach((c, i) => {
        const bx = -60 + i * 30, by = -250 - (i % 2) * 40 - lift;
        if (s.on) { ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(bx, by + 34); ctx.stroke(); }
        ellipse(ctx, bx, by, 26, 32, c);
        ellipse(ctx, bx - 8, by - 10, 6, 9, 'rgba(255,255,255,0.6)');
      });
      void sc;
    },
    drawBack(e, s) { // başlangıç direği
      if (s.on || s.done) return;
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      ctx.fillStyle = '#9a6233'; ctx.fillRect(e.sx(s.x + 60), e.sy(gy + 200), 10 * sc, 200 * sc);
      ['#ff8fa3', '#ffd166', '#8fd3ff'].forEach((c, i) => {
        ctx.strokeStyle = 'rgba(80,80,80,0.6)'; ctx.lineWidth = 2 * sc;
        const bx = e.sx(s.x + 40 + i * 20), by = e.sy(gy + 260 + (i % 2) * 30);
        ctx.beginPath(); ctx.moveTo(e.sx(s.x + 65), e.sy(gy + 200)); ctx.lineTo(bx, by + 30 * sc); ctx.stroke();
        ellipse(ctx, bx, by, 24 * sc, 30 * sc, c);
      });
    }
  };

  // ---------- Dinozor köprüsü (korna çalınca uzun boyunlu dinozor boynunu köprü yapar) ----------
  const dino = {
    layout(it, x) {
      const w = 520;
      return { special: { type: 'dino', x, w, state: 'wait', t: 0, wait: 0 }, flats: [[x - 600, x + w + 500]], busy: [[x - 420, x + w + 300]] };
    },
    reset(s) { s.state = 'wait'; s.t = 0; s.wait = 0; },
    terrain(s, x) {
      if (x < s.x || x > s.x + s.w) return 0;
      const edge = 50;
      const a = smooth((x - s.x) / edge), b = smooth((s.x + s.w - x) / edge);
      return -300 * Math.min(a, b);
    },
    after(s, baseH) { s.level = baseH(s.x - 5); s.level2 = baseH(s.x + s.w + 5); },
    populate(s, L) { for (let k = 1; k < 4; k++) L.stars.push({ x: s.x + k * s.w / 4, y: s.level + 70 }); },
    limit(s) { return s.state === 'bridge' ? Infinity : s.x - 60; },
    surface(s, x) {
      if (s.state !== 'bridge' || x < s.x - 5 || x > s.x + s.w + 5) return null;
      return lerp(s.level, s.level2, (x - s.x) / s.w);
    },
    honk(s) { const c = G.car; if (s.state === 'wait' && s.x - c.x < 1100 && s.x - c.x > -50) bend(s); },
    update(s, dt) {
      const c = G.car;
      s.t += dt;
      if (s.state === 'wait') {
        if (s.x - c.x < 500) s.wait += dt;
        if (s.wait > 6) bend(s);
        G.hornHint(s.x - c.x < 1000 && s.x - c.x > 0);
      } else if (s.state === 'bending') {
        s.bend += dt / 1.6;
        if (s.bend >= 1) { s.bend = 1; s.state = 'bridge'; }
      }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const p = s.state === 'wait' ? 0 : smooth(s.bend || 0);
      const bodyX = s.x + s.w * 0.15, bodyY = s.level - 300 + 40;
      const green = '#7bc47f', dark = '#5aa35e';
      // gövde ve bacaklar çukurun içinde
      ctx.fillStyle = dark;
      [-70, -20, 40, 90].forEach(dx => ctx.fillRect(e.sx(bodyX + dx), e.sy(bodyY + 40), 34 * sc, 60 * sc));
      ellipse(ctx, e.sx(bodyX + 20), e.sy(bodyY + 110), 130 * sc, 80 * sc, green);
      // kuyruk
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.moveTo(e.sx(bodyX - 90), e.sy(bodyY + 140)); ctx.quadraticCurveTo(e.sx(bodyX - 200), e.sy(bodyY + 120), e.sx(bodyX - 230), e.sy(bodyY + 60)); ctx.lineTo(e.sx(bodyX - 90), e.sy(bodyY + 90)); ctx.fill();
      // boyun: dik konumdan köprü konumuna
      const baseX = bodyX + 100, baseY = bodyY + 150;
      const upHead = { x: baseX + 60, y: s.level + 320 };
      const brHead = { x: s.x + s.w + 30, y: s.level2 + 10 };
      const hx = lerp(upHead.x, brHead.x, p), hy = lerp(upHead.y, brHead.y, p);
      const ctrl = { x: lerp(baseX + 20, s.x + s.w * 0.6, p), y: lerp(s.level + 200, s.level - 10, p) };
      ctx.strokeStyle = green; ctx.lineCap = 'round'; ctx.lineWidth = 46 * sc;
      ctx.beginPath(); ctx.moveTo(e.sx(baseX), e.sy(baseY)); ctx.quadraticCurveTo(e.sx(ctrl.x), e.sy(ctrl.y), e.sx(hx), e.sy(hy)); ctx.stroke();
      ctx.strokeStyle = '#a8dca9'; ctx.lineWidth = 14 * sc;
      ctx.beginPath(); ctx.moveTo(e.sx(baseX), e.sy(baseY + 10)); ctx.quadraticCurveTo(e.sx(ctrl.x), e.sy(ctrl.y + 14), e.sx(hx), e.sy(hy + 14)); ctx.stroke();
      ctx.lineCap = 'butt';
      // köprü haline gelince boynun üstü düz bir yol (görünmez değil: açık yeşil şerit)
      if (p >= 1) {
        ctx.fillStyle = '#a8dca9';
        ctx.fillRect(e.sx(s.x - 5), e.sy(s.level + 4), (s.w + 10) * sc, 10 * sc);
      }
      // kafa
      ellipse(ctx, e.sx(hx), e.sy(hy + 8), 46 * sc, 32 * sc, green);
      eye(ctx, e.sx(hx + 14), e.sy(hy + 20), sc * 1.4);
      ctx.strokeStyle = '#3f7f43'; ctx.lineWidth = 3 * sc;
      ctx.beginPath(); ctx.arc(e.sx(hx + 18), e.sy(hy + 4), 14 * sc, 0.2, 1.3); ctx.stroke();
      circle(ctx, e.sx(hx - 18), e.sy(hy + 2), 7 * sc, '#f2a0a0');
      if (s.state === 'wait' && s.x - G.car.x < 1100) hornBubble(e, s.x - 140, s.level + 220);
    }
  };
  function bend(s) { if (s.state === 'wait') { s.state = 'bending'; s.bend = 0; G.sound('roar'); } }

  // ---------- Yol ayrımı (tren yolu: üst ya da alt yol; ikisi de bitişe gider) ----------
  const FORK = { up: 220, ramp: 340, len: 2000 };
  const fork = {
    layout(it, x) { return { special: { type: 'fork', x, choice: null, wait: 0 }, flats: [[x - 500, x + FORK.len + 400]], busy: [[x - 360, x + FORK.len + 200]] }; },
    reset(s) { s.choice = null; s.wait = 0; s.asked = false; },
    after(s, baseH) { s.level = baseH(s.x); },
    deck(s, x) {
      const a = s.x + 60, b = a + FORK.len;
      if (x < a || x > b) return null;
      const up = FORK.up;
      if (x < a + FORK.ramp) return s.level + up * smooth((x - a) / FORK.ramp);
      if (x > b - FORK.ramp) return s.level + up * smooth((b - x) / FORK.ramp);
      return s.level + up;
    },
    populate(s, L) {
      for (let k = 1; k < 7; k++) {
        const x = s.x + 60 + FORK.ramp + k * ((FORK.len - 2 * FORK.ramp) / 7);
        L.stars.push({ x, y: L.baseH(s.x) + FORK.up + 70 }); // üst yol
        L.stars.push({ x: x + 80, y: L.baseH(x + 80) + 70 }); // alt yol
      }
    },
    limit(s) { return s.choice ? Infinity : s.x - 40; },
    surface(s, x) { return s.choice === 'up' ? fork.deck(s, x) : null; },
    update(s, dt) {
      const c = G.car;
      if (!s.choice && s.x - c.x < 450) {
        if (!s.asked) { s.asked = true; G.askPath(s); }
        s.wait += dt;
        if (s.wait > 7) fork.choose(s, 'up'); // çocuk seçmezse kendiliğinden üst yol
      }
    },
    choose(s, which) { if (!s.choice) { s.choice = which; G.askPath(null); G.sound('ding'); } },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const a = s.x + 60, b = a + FORK.len;
      // köprü ayakları
      ctx.fillStyle = '#a8794a';
      for (let x = a + FORK.ramp; x <= b - FORK.ramp; x += 260) ctx.fillRect(e.sx(x), e.sy(s.level + FORK.up), 16 * sc, FORK.up * sc);
      // tabliye
      ctx.strokeStyle = '#c98b4a'; ctx.lineWidth = 22 * sc; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let x = a; x <= b; x += 20) { const y = e.sy(fork.deck(s, x) - 10); x === a ? ctx.moveTo(e.sx(x), y) : ctx.lineTo(e.sx(x), y); }
      ctx.stroke();
      ctx.strokeStyle = '#8f5a2b'; ctx.lineWidth = 4 * sc;
      ctx.beginPath();
      for (let x = a; x <= b; x += 20) { const y = e.sy(fork.deck(s, x) + 30); x === a ? ctx.moveTo(e.sx(x), y) : ctx.lineTo(e.sx(x), y); }
      ctx.stroke();
      // iki oklu tabela
      const gx = e.sx(s.x - 120), gy = e.sy(s.level);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(gx - 5 * sc, gy - 200 * sc, 10 * sc, 200 * sc);
      ctx.fillStyle = '#4ea8ff'; Draw.rr(ctx, gx - 40 * sc, gy - 250 * sc, 80 * sc, 44 * sc, 10 * sc); ctx.fill();
      ctx.fillStyle = '#ff9f1c'; Draw.rr(ctx, gx - 40 * sc, gy - 196 * sc, 80 * sc, 44 * sc, 10 * sc); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(gx - 14 * sc, gy - 218 * sc); ctx.lineTo(gx, gy - 240 * sc); ctx.lineTo(gx + 14 * sc, gy - 218 * sc); ctx.fill();
      ctx.beginPath(); ctx.moveTo(gx - 10 * sc, gy - 188 * sc); ctx.lineTo(gx + 14 * sc, gy - 174 * sc); ctx.lineTo(gx - 10 * sc, gy - 160 * sc); ctx.closePath();
      ctx.fill();
    }
  };

  // ---------- Tren yolculuğu (araç düz vagona biner, kısa bir yolculuk yapar) ----------
  const TRAIN = { len: 2600 };
  const train = {
    layout(it, x) { return { special: { type: 'train', x, ride: 0, done: false }, flats: [[x - 500, x + TRAIN.len + 700]], busy: [[x - 400, x + TRAIN.len + 500]] }; },
    reset(s) { s.ride = 0; s.done = false; s.on = false; s.tx = s.x - 40; },
    control(s, dt) {
      const c = G.car;
      if (!s.on && !s.done && c.x >= s.x && c.x < s.x + 200 && G.playing()) { s.on = true; s.ride = 0; G.sound('whistle'); }
      if (!s.on) return false;
      s.ride += dt;
      const v = Math.min(400, 120 + s.ride * 160);
      c.x += v * dt; s.tx = c.x;
      c.y = G.baseH(c.x) + 34; c.angle = Math.atan((G.baseH(c.x + 60) - G.baseH(c.x - 60)) / 120);
      c.speed = v; c.onGround = true; c.ballistic = false; c.vy = 0;
      if (Math.random() < dt * 3 && !G.calm()) G.puff(c.x + 330, c.y + 150);
      if (c.x > s.x + TRAIN.len) { s.on = false; s.done = true; c.y = G.baseH(c.x); c.speed = 260; }
      return true;
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      // raylar
      const a = s.x - 200, b = s.x + TRAIN.len + 500;
      ctx.fillStyle = '#8a6a50';
      for (let x = a; x < b; x += 60) { if (x < e.cam.x - 100 || x > e.cam.x + e.viewW + 100) continue; ctx.fillRect(e.sx(x), e.sy(e.baseH(x) - 2), 30 * sc, 10 * sc); }
      ctx.strokeStyle = '#7d8a93'; ctx.lineWidth = 5 * sc;
      ctx.beginPath();
      for (let x = Math.max(a, e.cam.x - 100); x < Math.min(b, e.cam.x + e.viewW + 100); x += 20) { const y = e.sy(e.baseH(x) + 2); x === Math.max(a, e.cam.x - 100) ? ctx.moveTo(e.sx(x), y) : ctx.lineTo(e.sx(x), y); }
      ctx.stroke();
      // istasyon
      const gy = e.baseH(s.x - 150);
      ctx.fillStyle = '#f6dccb'; ctx.fillRect(e.sx(s.x - 420), e.sy(gy + 150), 200 * sc, 150 * sc);
      ctx.fillStyle = '#dd9c8c'; ctx.beginPath(); ctx.moveTo(e.sx(s.x - 440), e.sy(gy + 150)); ctx.lineTo(e.sx(s.x - 320), e.sy(gy + 220)); ctx.lineTo(e.sx(s.x - 200), e.sy(gy + 150)); ctx.fill();
      ctx.fillStyle = '#fff'; circle(ctx, e.sx(s.x - 320), e.sy(gy + 120), 18 * sc, '#fffaf0');
      // tren
      const tx = s.on ? s.tx : s.done ? s.x + TRAIN.len : s.x;
      const flat = (x, col) => {
        const y = e.baseH(x);
        ctx.fillStyle = col; Draw.rr(ctx, e.sx(x - 120), e.sy(y + 34), 240 * sc, 20 * sc, 6 * sc); ctx.fill();
        circle(ctx, e.sx(x - 70), e.sy(y + 14), 16 * sc, '#34404a'); circle(ctx, e.sx(x + 70), e.sy(y + 14), 16 * sc, '#34404a');
      };
      flat(tx, '#4ea8ff');
      // vagon (arkada)
      const wx = tx - 280, wy = e.baseH(wx);
      ctx.fillStyle = '#ffd166'; Draw.rr(ctx, e.sx(wx - 120), e.sy(wy + 150), 240 * sc, 116 * sc, 14 * sc); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; Draw.rr(ctx, e.sx(wx - 90), e.sy(wy + 130), 70 * sc, 44 * sc, 8 * sc); ctx.fill(); Draw.rr(ctx, e.sx(wx + 20), e.sy(wy + 130), 70 * sc, 44 * sc, 8 * sc); ctx.fill();
      circle(ctx, e.sx(wx - 70), e.sy(wy + 14), 16 * sc, '#34404a'); circle(ctx, e.sx(wx + 70), e.sy(wy + 14), 16 * sc, '#34404a');
      // lokomotif (önde)
      const lx = tx + 300, ly = e.baseH(lx);
      ctx.fillStyle = '#ff6b6b'; Draw.rr(ctx, e.sx(lx - 140), e.sy(ly + 120), 200 * sc, 86 * sc, 16 * sc); ctx.fill();
      ctx.fillStyle = '#e04f4f'; Draw.rr(ctx, e.sx(lx - 150), e.sy(ly + 200), 100 * sc, 166 * sc, 12 * sc); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; Draw.rr(ctx, e.sx(lx - 130), e.sy(ly + 185), 60 * sc, 50 * sc, 8 * sc); ctx.fill();
      ctx.fillStyle = '#34404a'; ctx.fillRect(e.sx(lx + 20), e.sy(ly + 175), 26 * sc, 55 * sc);
      circle(ctx, e.sx(lx - 90), e.sy(ly + 20), 22 * sc, '#34404a'); circle(ctx, e.sx(lx), e.sy(ly + 20), 22 * sc, '#34404a');
      ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(e.sx(lx + 60), e.sy(ly + 40)); ctx.lineTo(e.sx(lx + 100), e.sy(ly + 10)); ctx.lineTo(e.sx(lx + 60), e.sy(ly + 10)); ctx.fill();
    }
  };

  // ---------- Dönme dolap (lunapark final: araç kabinde yavaşça bir tur döner) ----------
  const FERRIS = { r: 330 };
  const ferris = {
    layout(it, x) { return { special: { type: 'ferris', x, on: false, done: false, th: 0 }, flats: [[x - 600, x + 600]], busy: [[x - 450, x + 450]] }; },
    reset(s) { s.on = false; s.done = false; s.th = 0; },
    after(s, baseH) { s.gy = baseH(s.x); s.cy = s.gy + FERRIS.r + 70; },
    populate(s, L) {
      for (let k = 1; k < 10; k++) {
        const th = -Math.PI / 2 + k * TAU / 10;
        L.stars.push({ x: s.x + FERRIS.r * Math.cos(th), y: s.cy + FERRIS.r * Math.sin(th) - 30 });
      }
    },
    control(s, dt) {
      const c = G.car;
      if (!s.on && !s.done && c.x >= s.x && c.x < s.x + 150 && G.playing()) { s.on = true; s.th = 0; G.sound('click'); }
      if (!s.on) return false;
      s.th += dt * TAU / 9; // 9 saniyede bir tur
      const a = -Math.PI / 2 + s.th;
      c.x = s.x + FERRIS.r * Math.cos(a);
      c.y = s.cy + FERRIS.r * Math.sin(a) - 70;
      c.angle = 0; c.speed = 60; c.vy = 0; c.onGround = true; c.ballistic = false;
      if (s.th >= TAU) { s.on = false; s.done = true; c.x = s.x + 2; c.y = s.gy; c.speed = 220; }
      return true;
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const cx = e.sx(s.x), cy = e.sy(s.cy), R = FERRIS.r * sc;
      const rot = s.on ? s.th : 0;
      ctx.strokeStyle = '#b39ddb'; ctx.lineWidth = 16 * sc;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 200 * sc, e.sy(s.gy)); ctx.moveTo(cx, cy); ctx.lineTo(cx + 200 * sc, e.sy(s.gy)); ctx.stroke();
      ctx.strokeStyle = '#f2a0c0'; ctx.lineWidth = 12 * sc;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#f7c6d9'; ctx.lineWidth = 5 * sc;
      for (let k = 0; k < 8; k++) {
        const a = rot + k * TAU / 8;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      }
      circle(ctx, cx, cy, 24 * sc, '#ffd166');
      const cols = ['#ff8fa3', '#ffd166', '#8fd3ff', '#b9f2a1', '#cdb4ff', '#ffb38a', '#8fe3d0'];
      for (let k = 1; k < 8; k++) { // diğer kabinler (boş)
        const a = Math.PI / 2 + rot + k * TAU / 8;
        const gx = cx + Math.cos(a) * R, gyy = cy + Math.sin(a) * R;
        ctx.fillStyle = cols[k % cols.length]; Draw.rr(ctx, gx - 46 * sc, gyy + 10 * sc, 92 * sc, 56 * sc, 14 * sc); ctx.fill();
        ctx.strokeStyle = '#999'; ctx.lineWidth = 3 * sc; ctx.beginPath(); ctx.moveTo(gx, gyy); ctx.lineTo(gx, gyy + 12 * sc); ctx.stroke();
      }
    },
    drawFront(e, s) { // aracın kabini
      const { ctx, scale: sc } = e;
      const c = G.car;
      let gx, gyy;
      if (s.on) { gx = e.sx(c.x); gyy = e.sy(c.y); }
      else { gx = e.sx(s.x); gyy = e.sy(s.gy); if (s.done || Math.abs(c.x - s.x) > 1) { /* bekleyen kabin */ } }
      // kabin: aracın altında tepsi, iki yanda direk, üstte çatı
      ctx.strokeStyle = '#f2a0c0'; ctx.lineWidth = 6 * sc;
      ctx.beginPath();
      ctx.moveTo(gx - 125 * sc, gyy); ctx.lineTo(gx - 125 * sc, gyy - 175 * sc);
      ctx.moveTo(gx + 125 * sc, gyy); ctx.lineTo(gx + 125 * sc, gyy - 175 * sc);
      ctx.stroke();
      ctx.fillStyle = '#ff8fa3';
      Draw.rr(ctx, gx - 140 * sc, gyy - 4 * sc, 280 * sc, 26 * sc, 12 * sc); ctx.fill();
      Draw.rr(ctx, gx - 140 * sc, gyy - 190 * sc, 280 * sc, 20 * sc, 10 * sc); ctx.fill();
    }
  };

  const TYPES = { animals, logs, cablecar, sea, traffic, paint, fruittree, balloon, dino, fork, train, ferris };

  // ---------- Oyun bağlantısı ----------
  function init(g) { G = g; }
  function list() { return (G.level && G.level.specials) || []; }
  function reset(level) { for (const s of level.specials || []) if (TYPES[s.type].reset) TYPES[s.type].reset(s); }
  function control(dt) { for (const s of list()) { const T = TYPES[s.type]; if (T.control && T.control(s, dt)) return true; } return false; }
  function limit() { let m = Infinity; for (const s of list()) { const T = TYPES[s.type]; if (T.limit && G.car.x < s.x + 10) m = Math.min(m, T.limit(s)); } return m; }
  function surface(x) {
    for (const s of list()) { const T = TYPES[s.type]; if (T.surface) { const v = T.surface(s, x); if (v !== null && v !== undefined) return v; } }
    return null;
  }
  function honk() { for (const s of list()) { const T = TYPES[s.type]; if (T.honk) T.honk(s); } }
  function update(dt) { G.hornHint(false, true); for (const s of list()) { const T = TYPES[s.type]; if (T.update) T.update(s, dt); } G.hornHint(false, false, true); }
  const near = (e, s) => s.x > e.cam.x - 3500 && s.x < e.cam.x + e.viewW + 1200;
  function drawBack(e) { for (const s of list()) { const T = TYPES[s.type]; if (T.drawBack && near(e, s)) T.drawBack(e, s); } }
  function drawFront(e) { for (const s of list()) { const T = TYPES[s.type]; if (T.drawFront && near(e, s)) T.drawFront(e, s); } }
  function carState(x) {
    const out = { boat: false, sled: false, balloon: null, ride: false };
    for (const s of list()) {
      if (s.type === 'sea' && sea.boat(s, x)) out.boat = true;
      if (s.type === 'cablecar' && cablecar.sled(s, x)) out.sled = true;
      if (s.type === 'balloon' && (s.on || (s.done && s.away < 1))) out.balloon = s;
      if ((s.type === 'ferris' && s.on) || (s.type === 'cablecar' && s.riding)) out.ride = true;
    }
    return out;
  }

  // Bot gövdesi ve kızak (araç yerel koordinatında, araçtan sonra çizilir)
  function drawBoat(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-110, -42); ctx.lineTo(115, -42); ctx.quadraticCurveTo(100, 6, 60, 10); ctx.lineTo(-80, 10); ctx.quadraticCurveTo(-110, 0, -110, -42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4ea8ff'; ctx.fillRect(-100, -30, 200, 10);
    ctx.fillStyle = '#ff6b6b'; circle(ctx, 70, -18, 9, '#ff6b6b');
  }
  function drawSled(ctx) {
    ctx.strokeStyle = '#9a6233'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-100, 4); ctx.lineTo(95, 4); ctx.quadraticCurveTo(125, 2, 120, -22); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#e8333a'; Draw.rr(ctx, -95, -14, 190, 12, 5); ctx.fill();
    ctx.fillStyle = '#9a6233'; ctx.fillRect(-60, -4, 8, 8); ctx.fillRect(50, -4, 8, 8);
  }
  // Römork (meyve bahçesi)
  function drawTrailer(ctx, count, cols, wheel) {
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-95, -24); ctx.lineTo(-130, -24); ctx.stroke();
    ctx.fillStyle = '#c98b4a'; Draw.rr(ctx, -250, -78, 125, 60, 10); ctx.fill();
    ctx.strokeStyle = '#9a6233'; ctx.lineWidth = 3;
    for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-250 + k * 31, -78); ctx.lineTo(-250 + k * 31, -18); ctx.stroke(); }
    for (let i = 0; i < Math.min(count, 14); i++) {
      const fx = -235 + (i % 7) * 16, fy = -84 - Math.floor(i / 7) * 14;
      circle(ctx, fx, fy, 9, cols[i % cols.length] || '#ff5a5f');
    }
    ctx.save(); ctx.translate(-188, -14); ctx.rotate(wheel);
    circle(ctx, 0, 0, 18, '#333'); circle(ctx, 0, 0, 8, '#bbb');
    ctx.fillStyle = '#333'; ctx.fillRect(-2, -16, 4, 32);
    ctx.restore();
  }

  return { TYPES, init, reset, control, limit, surface, honk, update, drawBack, drawFront, carState, drawBoat, drawSled, drawTrailer, drawCritter, FRUITS, smooth };
})();
