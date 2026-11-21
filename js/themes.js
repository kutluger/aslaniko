// Bölüm temaları: gökyüzü, arka plan katmanları, zemin renkleri, süsler ve özel bölgeler.
// e = { ctx, cw, ch, scale, cam, viewW, viewH, time, sx, sy, baseH }
const Themes = (() => {
  const TAU = Math.PI * 2;
  const rr = (...a) => Draw.rr(...a);

  // ---------- Ortak yardımcılar ----------
  function skyGrad(e, top, bottom) {
    const g = e.ctx.createLinearGradient(0, 0, 0, e.ch);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    e.ctx.fillStyle = g; e.ctx.fillRect(0, 0, e.cw, e.ch);
  }
  function sun(e, color, r = 55) {
    const { ctx, cw, scale: s } = e;
    ctx.fillStyle = color + '55';
    ctx.beginPath(); ctx.arc(cw - 140 * s, 110 * s, r * 1.45 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cw - 140 * s, 110 * s, r * s, 0, TAU); ctx.fill();
  }
  function clouds(e, color = 'rgba(255,255,255,0.92)') {
    const { ctx, scale, cam, time } = e;
    ctx.fillStyle = color;
    const spacing = 520, span = spacing * 7;
    for (let i = 0; i < 7; i++) {
      const wx = i * spacing - (cam.x * 0.1 + time * 8);
      const x = ((wx % span) + span) % span - spacing;
      const y = 70 + (i % 3) * 55;
      const s = (0.8 + (i % 2) * 0.4) * scale;
      const px = x * scale, py = y * scale;
      ctx.beginPath();
      ctx.arc(px, py, 34 * s, 0, TAU);
      ctx.arc(px + 38 * s, py - 14 * s, 42 * s, 0, TAU);
      ctx.arc(px + 80 * s, py, 32 * s, 0, TAU);
      ctx.rect(px, py, 80 * s, 30 * s);
      ctx.fill();
    }
  }
  // Parallaks tepeler
  function hills(e, par, base, amp, color, freq, phase) {
    const { ctx, cw, ch, scale, cam } = e;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, ch);
    for (let x = 0; x <= cw + 10; x += 10) {
      const wx = x / scale + cam.x * par;
      const y = base + amp * Math.sin(wx * freq + phase) + amp * 0.5 * Math.sin(wx * freq * 2.3 + phase * 2);
      ctx.lineTo(x, e.sy(y + cam.y * (1 - par) - 40));
    }
    ctx.lineTo(cw, ch); ctx.closePath(); ctx.fill();
  }
  // Tekrar eden siluetler (parallaks)
  function repeatLayer(e, par, spacing, drawFn) {
    const { cw, scale, cam } = e;
    const off = cam.x * par;
    const first = Math.floor(off / spacing) - 1;
    const last = Math.ceil((off + cw / scale) / spacing) + 1;
    for (let k = first; k <= last; k++) {
      const x = (k * spacing - off) * scale;
      drawFn(x, k);
    }
  }
  const hash = k => { const v = Math.sin(k * 127.1) * 43758.5453; return v - Math.floor(v); };

  function pineShape(ctx, x, y, s, color, snow) {
    ctx.fillStyle = '#6b4423'; ctx.fillRect(x - 6 * s, y - 22 * s, 12 * s, 22 * s);
    for (let k = 0; k < 3; k++) {
      const w = (46 - k * 10) * s, top = y - (20 + k * 30) * s - 44 * s, base = y - (16 + k * 30) * s;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x, top); ctx.lineTo(x + w, base); ctx.closePath(); ctx.fill();
      if (snow) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.42, top + (base - top) * 0.42); ctx.lineTo(x, top); ctx.lineTo(x + w * 0.42, top + (base - top) * 0.42);
        ctx.quadraticCurveTo(x, top + (base - top) * 0.55, x - w * 0.42, top + (base - top) * 0.42);
        ctx.fill();
      }
    }
  }

  // ---------- Tema tanımları ----------
  const T = {};

  T.farm = {
    ground: { top: '#4caf3f', mid: '#6ccf4f', soil: '#b07a45', stone: '#946236' },
    sky(e) { skyGrad(e, '#5fb8f0', '#c9ecff'); sun(e, '#ffe066'); clouds(e); },
    back(e) {
      hills(e, 0.25, 230, 70, '#9fd88a', 0.0021, 1);
      hills(e, 0.5, 150, 55, '#7cc96a', 0.0033, 2.4);
    }
  };

  T.forest = {
    ground: { top: '#3f9a42', mid: '#64c45a', soil: '#7a5233', stone: '#5f3f26' },
    sky(e) {
      skyGrad(e, '#8fd3c7', '#e4f7e9');
      const { ctx, cw, scale: s } = e;
      ctx.fillStyle = 'rgba(255,255,220,0.22)';
      ctx.beginPath(); ctx.moveTo(140 * s, 70 * s); ctx.lineTo(cw * 0.45, e.ch); ctx.lineTo(cw * 0.62, e.ch); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff1a855'; ctx.beginPath(); ctx.arc(140 * s, 80 * s, 50 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.arc(140 * s, 80 * s, 34 * s, 0, TAU); ctx.fill();
    },
    back(e) {
      const { ctx, scale: s } = e;
      const y1 = e.sy(e.cam.y * 0.75 + 150);
      repeatLayer(e, 0.25, 70, x => pineShape(ctx, x, y1, 1.1 * s, '#7fbf98', false));
      const y2 = e.sy(e.cam.y * 0.5 + 90);
      repeatLayer(e, 0.5, 95, (x, k) => pineShape(ctx, x, y2 + hash(k) * 20 * s, (1.3 + hash(k + 3) * 0.3) * s, '#3f8f5e', false));
      ctx.fillStyle = '#3f8f5e'; ctx.fillRect(0, y2 - 2, e.cw, e.ch);
    }
  };

  T.snow = {
    ground: { top: '#ffffff', mid: '#ffffff', soil: '#c8daea', stone: '#b3c8dc' },
    sky(e) { skyGrad(e, '#9ccaf0', '#eef7ff'); sun(e, '#fff6c8', 40); },
    back(e) {
      const { ctx, scale: s } = e;
      const base = e.sy(e.cam.y * 0.85 + 120);
      repeatLayer(e, 0.15, 420, (x, k) => {
        const w = (200 + hash(k) * 60) * s, h = (190 + hash(k + 7) * 80) * s;
        ctx.fillStyle = k % 2 ? '#8fa8c8' : '#7d97ba';
        ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x, base - h); ctx.lineTo(x + w, base); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.32, base - h * 0.68); ctx.lineTo(x, base - h); ctx.lineTo(x + w * 0.32, base - h * 0.68);
        ctx.lineTo(x + w * 0.14, base - h * 0.6); ctx.lineTo(x, base - h * 0.7); ctx.lineTo(x - w * 0.14, base - h * 0.6);
        ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = '#7d97ba'; ctx.fillRect(0, base, e.cw, e.ch);
      hills(e, 0.4, 150, 40, '#e3eef8', 0.003, 0.4);
      const y2 = e.sy(e.cam.y * 0.5 + 80);
      repeatLayer(e, 0.5, 150, (x, k) => pineShape(ctx, x + hash(k) * 40 * s, y2, 0.95 * s, '#2f7a57', true));
    },
    overlay(e) {
      // yağan kar
      const { ctx, cw, ch, time } = e;
      // az ve yavaş kar taneleri (göz yormasın)
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let k = 0; k < 30; k++) {
        const x = ((hash(k) * cw + Math.sin(time * 0.6 + k) * 14 - e.cam.x * 0.08 * (0.5 + hash(k + 1))) % cw + cw) % cw;
        const y = ((hash(k + 9) * ch + time * (18 + hash(k + 5) * 22)) % ch);
        ctx.beginPath(); ctx.arc(x, y, (1.5 + hash(k + 2) * 2.5) * e.scale, 0, TAU); ctx.fill();
      }
    }
  };

  T.beach = {
    ground: { top: '#f6d98c', mid: '#fbe7b0', soil: '#e9c06b', stone: '#d9a94e' },
    sky(e) { skyGrad(e, '#46b5f2', '#bfeaff'); sun(e, '#ffe066', 50); clouds(e); },
    back(e) {
      const { ctx, cw, ch, scale: s, time } = e;
      const horizon = e.sy(e.cam.y * 0.9 + 170);
      ctx.fillStyle = '#1f9ad6'; ctx.fillRect(0, horizon, cw, ch);
      ctx.fillStyle = '#3cb4ea'; ctx.fillRect(0, horizon, cw, 12 * s);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3 * s;
      for (let r = 0; r < 6; r++) {
        ctx.beginPath();
        for (let x = 0; x <= cw; x += 12) {
          const y = horizon + (26 + r * 22) * s + Math.sin(x * 0.03 + r + time * 1.5 + e.cam.x * 0.002 * (r + 1)) * 3 * s;
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      // yelkenliler
      repeatLayer(e, 0.2, 900, (x, k) => {
        const bx = x + hash(k) * 300 * s, by = horizon - 4 * s + Math.sin(time + k) * 2 * s;
        ctx.fillStyle = k % 2 ? '#e8333a' : '#2f80ed';
        ctx.beginPath(); ctx.moveTo(bx - 40 * s, by); ctx.lineTo(bx + 40 * s, by); ctx.lineTo(bx + 28 * s, by + 16 * s); ctx.lineTo(bx - 28 * s, by + 16 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(bx, by - 76 * s); ctx.lineTo(bx, by - 4 * s); ctx.lineTo(bx + 40 * s, by - 4 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(bx - 3 * s, by - 68 * s); ctx.lineTo(bx - 3 * s, by - 4 * s); ctx.lineTo(bx - 34 * s, by - 4 * s); ctx.closePath(); ctx.fill();
      });
    }
  };

  T.city = {
    ground: { top: '#3a4a5c', mid: '#55677b', soil: '#2a3542', stone: null, road: true },
    night: true,
    sky(e) {
      const { ctx, cw, scale: s } = e;
      skyGrad(e, '#0e1f45', '#2c4a86');
      ctx.fillStyle = '#fff';
      for (let k = 0; k < 70; k++) {
        ctx.globalAlpha = 0.35 + hash(k + 4) * 0.6;
        ctx.beginPath(); ctx.arc(hash(k) * cw, hash(k + 20) * e.ch * 0.55, (1 + hash(k + 8) * 1.6) * s, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(cw - 150 * s, 90 * s, 38 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = '#16295a'; ctx.beginPath(); ctx.arc(cw - 132 * s, 78 * s, 33 * s, 0, TAU); ctx.fill();
    },
    back(e) {
      const { ctx, scale: s } = e;
      const building = (x, k, base, col, par) => {
        const w = (70 + hash(k * 3 + par) * 60) * s, h = (140 + hash(k * 5 + par) * 140) * s;
        ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h + 400 * s);
        // Pencereler binaya bağlı (satır/sütun numarasıyla), kayarken değişmez; az ve soluk.
        ctx.fillStyle = 'rgba(255,220,140,0.45)';
        let r = 0;
        for (let yy = base - h + 18 * s; yy < base - 24 * s; yy += 34 * s, r++) {
          let c = 0;
          for (let xx = x + 12 * s; xx < x + w - 20 * s; xx += 30 * s, c++)
            if (hash(k * 31 + r * 7 + c * 13 + par * 101) < 0.3) ctx.fillRect(xx, yy, 12 * s, 14 * s);
        }
      };
      const b1 = e.sy(e.cam.y * 0.8 + 110);
      repeatLayer(e, 0.2, 105, (x, k) => building(x, k, b1, '#22355c', 1));
      const b2 = e.sy(e.cam.y * 0.55 + 70);
      repeatLayer(e, 0.45, 150, (x, k) => building(x, k, b2, '#2f4573', 2));
    }
  };

  // ---------- Süsler (zemin üstünde, dünya ölçeğinde) ----------
  function decor(e, d) {
    const { ctx, scale: s } = e;
    const gy = e.baseH(d.x);
    const x = e.sx(d.x), y = e.sy(gy - 6);
    const bob = Math.sin(e.time * 1.5 + d.x) * 2 * s;
    switch (d.t) {
      case 'tree':
      case 'citytree': {
        const k = d.t === 'citytree' ? 0.7 : 1;
        if (d.t === 'citytree') { ctx.fillStyle = '#8a6a50'; rr(ctx, x - 22 * s, y - 26 * s, 44 * s, 26 * s, 4 * s); ctx.fill(); }
        const yy = d.t === 'citytree' ? y - 24 * s : y;
        ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - 10 * s * k, yy - 90 * s * k, 20 * s * k, 90 * s * k);
        ctx.fillStyle = d.t === 'citytree' ? '#2e7d4f' : '#3e9b3a';
        ctx.beginPath();
        ctx.arc(x, yy - 120 * s * k, 52 * s * k, 0, TAU);
        ctx.arc(x - 38 * s * k, yy - 95 * s * k, 36 * s * k, 0, TAU);
        ctx.arc(x + 38 * s * k, yy - 95 * s * k, 36 * s * k, 0, TAU);
        ctx.fill();
        if (d.t === 'tree') {
          ctx.fillStyle = '#ff5a5f';
          [[-20, -130], [18, -110], [-30, -95], [30, -135]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 6 * s, 0, TAU); ctx.fill(); });
        }
        break;
      }
      case 'barn':
        ctx.fillStyle = '#c8372d'; ctx.fillRect(x - 90 * s, y - 120 * s, 180 * s, 120 * s);
        ctx.fillStyle = '#8f231c';
        ctx.beginPath(); ctx.moveTo(x - 105 * s, y - 118 * s); ctx.lineTo(x, y - 190 * s); ctx.lineTo(x + 105 * s, y - 118 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 32 * s, y - 80 * s, 64 * s, 80 * s);
        ctx.fillStyle = '#c8372d'; ctx.fillRect(x - 26 * s, y - 74 * s, 52 * s, 74 * s);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * s;
        ctx.beginPath(); ctx.moveTo(x - 26 * s, y - 74 * s); ctx.lineTo(x + 26 * s, y); ctx.moveTo(x + 26 * s, y - 74 * s); ctx.lineTo(x - 26 * s, y); ctx.stroke();
        break;
      case 'fence':
        ctx.fillStyle = '#f2e3c6';
        for (let k = 0; k < 6; k++) { const fx = d.x + k * 40; ctx.fillRect(e.sx(fx) - 5 * s, e.sy(e.baseH(fx) + 55), 10 * s, 55 * s); }
        ctx.strokeStyle = '#f2e3c6'; ctx.lineWidth = 7 * s;
        for (const h of [20, 42]) {
          ctx.beginPath();
          for (let k = 0; k <= 200; k += 20) { const fx = d.x + k; k ? ctx.lineTo(e.sx(fx), e.sy(e.baseH(fx) + h)) : ctx.moveTo(e.sx(fx), e.sy(e.baseH(fx) + h)); }
          ctx.stroke();
        }
        break;
      case 'flowers':
        for (let k = 0; k < 7; k++) {
          const fx = d.x + k * 28, fy = e.baseH(fx);
          ctx.strokeStyle = '#3e9b3a'; ctx.lineWidth = 3 * s;
          ctx.beginPath(); ctx.moveTo(e.sx(fx), e.sy(fy)); ctx.lineTo(e.sx(fx), e.sy(fy + 26)); ctx.stroke();
          ctx.fillStyle = ['#ff5a5f', '#ffd23f', '#fff', '#a66cff'][k % 4];
          ctx.beginPath(); ctx.arc(e.sx(fx), e.sy(fy + 30), 8 * s, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ffb000'; ctx.beginPath(); ctx.arc(e.sx(fx), e.sy(fy + 30), 3 * s, 0, TAU); ctx.fill();
        }
        break;
      case 'cow':
      case 'sheep': {
        const sheep = d.t === 'sheep';
        ctx.fillStyle = sheep ? '#333' : '#fff';
        for (const lx of [-30, -14, 14, 30]) ctx.fillRect(x + lx * s - 4 * s, y - 30 * s, 8 * s, 30 * s);
        ctx.fillStyle = sheep ? '#f4f4f4' : '#fff';
        if (sheep) {
          ctx.beginPath();
          for (let k = -2; k <= 2; k++) ctx.arc(x + k * 14 * s, y - 50 * s + bob + (k % 2) * 4 * s, 18 * s, 0, TAU);
          ctx.fill();
        } else {
          rr(ctx, x - 42 * s, y - 70 * s + bob, 84 * s, 44 * s, 18 * s); ctx.fill();
          ctx.fillStyle = '#333';
          ctx.beginPath(); ctx.ellipse(x - 10 * s, y - 55 * s + bob, 14 * s, 10 * s, 0.3, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.ellipse(x + 20 * s, y - 45 * s + bob, 9 * s, 7 * s, 0, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = sheep ? '#333' : '#fff';
        ctx.beginPath(); ctx.ellipse(x + 50 * s, y - 70 * s + bob, 16 * s, 19 * s, 0, 0, TAU); ctx.fill();
        if (!sheep) { ctx.fillStyle = '#ffb3c1'; ctx.beginPath(); ctx.ellipse(x + 54 * s, y - 58 * s + bob, 12 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
        ctx.fillStyle = sheep ? '#fff' : '#333';
        ctx.beginPath(); ctx.arc(x + 55 * s, y - 75 * s + bob, 2.5 * s, 0, TAU); ctx.fill();
        break;
      }
      case 'pine': pineShape(ctx, x, y + 6 * s, 1.5 * s, '#2f7d4c', false); break;
      case 'snowpine': pineShape(ctx, x, y + 6 * s, 1.4 * s, '#2f7a57', true); break;
      case 'mushroom':
        [[0, 1.4], [34, 1], [-30, 0.8]].forEach(([dx, k]) => {
          const mx = x + dx * s;
          ctx.fillStyle = '#fff4e0'; rr(ctx, mx - 7 * s * k, y - 26 * s * k, 14 * s * k, 26 * s * k, 4 * s * k); ctx.fill();
          ctx.fillStyle = '#e8333a'; ctx.beginPath(); ctx.ellipse(mx, y - 26 * s * k, 24 * s * k, 17 * s * k, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#fff';
          [[-11, -33], [4, -37], [13, -30]].forEach(([ax, ay]) => { ctx.beginPath(); ctx.arc(mx + ax * s * k, y + ay * s * k, 3.5 * s * k, 0, TAU); ctx.fill(); });
        });
        break;
      case 'bush':
        ctx.fillStyle = '#4caf50';
        ctx.beginPath(); ctx.arc(x - 26 * s, y - 20 * s, 26 * s, 0, TAU); ctx.arc(x + 4 * s, y - 32 * s, 32 * s, 0, TAU); ctx.arc(x + 34 * s, y - 18 * s, 24 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = '#7b4bb7';
        [[-20, -28], [8, -44], [30, -24], [0, -18]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 4.5 * s, 0, TAU); ctx.fill(); });
        break;
      case 'squirrel':
        ctx.fillStyle = '#c9773a';
        ctx.beginPath(); ctx.ellipse(x - 18 * s, y - 34 * s + bob, 14 * s, 26 * s, -0.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x, y - 16 * s, 12 * s, 16 * s, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 6 * s, y - 36 * s, 10 * s, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + 2 * s, y - 44 * s); ctx.lineTo(x + 5 * s, y - 54 * s); ctx.lineTo(x + 9 * s, y - 44 * s); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x + 10 * s, y - 38 * s, 1.8 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = '#8a5a2b'; ctx.beginPath(); ctx.arc(x + 14 * s, y - 22 * s, 5 * s, 0, TAU); ctx.fill();
        break;
      case 'snowman': {
        const k = 1.2;
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#c8daea'; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.arc(x, y - 24 * s * k, 24 * s * k, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - 62 * s * k, 17 * s * k, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff8a1c'; ctx.beginPath(); ctx.moveTo(x + 4 * s * k, y - 64 * s * k); ctx.lineTo(x + 20 * s * k, y - 61 * s * k); ctx.lineTo(x + 4 * s * k, y - 58 * s * k); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x - 4 * s * k, y - 67 * s * k, 2 * s * k, 0, TAU); ctx.arc(x + 6 * s * k, y - 67 * s * k, 2 * s * k, 0, TAU); ctx.fill();
        ctx.fillStyle = '#e8333a'; ctx.fillRect(x - 15 * s * k, y - 50 * s * k, 30 * s * k, 6 * s * k);
        ctx.save(); ctx.translate(x, y - 78 * s * k); ctx.rotate(Math.sin(e.time * 2 + d.x) * 0.15);
        ctx.fillStyle = '#333'; ctx.fillRect(-15 * s * k, -3 * s * k, 30 * s * k, 5 * s * k); ctx.fillRect(-10 * s * k, -22 * s * k, 20 * s * k, 20 * s * k);
        ctx.restore();
        break;
      }
      case 'igloo':
        ctx.fillStyle = '#f4f9ff'; ctx.strokeStyle = '#c8daea'; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.arc(x, y, 70 * s, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        for (const h of [22, 44]) { ctx.beginPath(); ctx.moveTo(x - Math.sqrt(70 * 70 - h * h) * s, y - h * s); ctx.lineTo(x + Math.sqrt(70 * 70 - h * h) * s, y - h * s); ctx.stroke(); }
        ctx.fillStyle = '#5b7a99'; ctx.beginPath(); ctx.arc(x + 30 * s, y, 20 * s, Math.PI, 0); ctx.fill();
        break;
      case 'palm': {
        ctx.strokeStyle = '#9a6233'; ctx.lineWidth = 13 * s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 12 * s, y - 80 * s, x + 16 * s, y - 160 * s); ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.fillStyle = '#2fa84f';
        for (let k = 0; k < 6; k++) {
          ctx.save(); ctx.translate(x + 16 * s, y - 160 * s); ctx.rotate(-Math.PI / 2 + (k - 2.5) * 0.55 + Math.sin(e.time + k) * 0.04);
          ctx.beginPath(); ctx.ellipse(40 * s, 0, 46 * s, 11 * s, 0.25, 0, TAU); ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#7a4a22';
        ctx.beginPath(); ctx.arc(x + 9 * s, y - 151 * s, 7 * s, 0, TAU); ctx.arc(x + 23 * s, y - 149 * s, 7 * s, 0, TAU); ctx.fill();
        break;
      }
      case 'crab':
        ctx.fillStyle = '#ff5a3c';
        ctx.beginPath(); ctx.ellipse(x, y - 12 * s, 20 * s, 13 * s, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(x - 26 * s, y - 24 * s + bob, 7 * s, 0, TAU); ctx.arc(x + 26 * s, y - 24 * s - bob, 7 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 6 * s, y - 26 * s, 4 * s, 0, TAU); ctx.arc(x + 6 * s, y - 26 * s, 4 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x - 6 * s, y - 26 * s, 2 * s, 0, TAU); ctx.arc(x + 6 * s, y - 26 * s, 2 * s, 0, TAU); ctx.fill();
        break;
      case 'umbrella':
        ctx.fillStyle = '#ddd'; ctx.fillRect(x - 3 * s, y - 130 * s, 6 * s, 130 * s);
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = k % 2 ? '#fff' : '#ff5a5f';
          ctx.beginPath(); ctx.moveTo(x, y - 140 * s);
          ctx.arc(x, y - 110 * s, 80 * s, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6);
          ctx.closePath(); ctx.fill();
        }
        break;
      case 'bucket':
        ctx.fillStyle = '#2f80ed';
        ctx.beginPath(); ctx.moveTo(x - 16 * s, y); ctx.lineTo(x + 16 * s, y); ctx.lineTo(x + 20 * s, y - 34 * s); ctx.lineTo(x - 20 * s, y - 34 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 26 * s, y - 40 * s, 5 * s, 40 * s);
        ctx.beginPath(); ctx.ellipse(x + 28 * s, y - 6 * s, 10 * s, 6 * s, 0, 0, TAU); ctx.fill();
        break;
      case 'lamp': {
        ctx.fillStyle = '#7b858c'; ctx.fillRect(x - 3 * s, y - 150 * s, 6 * s, 150 * s); ctx.fillRect(x - 3 * s, y - 150 * s, 30 * s, 6 * s);
        ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(x + 26 * s, y - 140 * s, 9 * s, 0, TAU); ctx.fill();
        const g = ctx.createLinearGradient(0, y - 140 * s, 0, y);
        g.addColorStop(0, 'rgba(255,243,160,0.35)'); g.addColorStop(1, 'rgba(255,243,160,0.05)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 26 * s, y - 140 * s); ctx.lineTo(x - 30 * s, y); ctx.lineTo(x + 82 * s, y); ctx.closePath(); ctx.fill();
        break;
      }
      case 'hydrant':
        ctx.fillStyle = '#e8333a'; rr(ctx, x - 12 * s, y - 44 * s, 24 * s, 44 * s, 6 * s); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - 44 * s, 12 * s, Math.PI, 0); ctx.fill();
        ctx.fillRect(x - 18 * s, y - 32 * s, 36 * s, 8 * s);
        break;
      case 'bench':
        ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - 50 * s, y - 30 * s, 100 * s, 8 * s); ctx.fillRect(x - 50 * s, y - 56 * s, 100 * s, 8 * s);
        ctx.fillStyle = '#555'; ctx.fillRect(x - 44 * s, y - 30 * s, 6 * s, 30 * s); ctx.fillRect(x + 38 * s, y - 30 * s, 6 * s, 30 * s);
        break;
    }
  }

  // ---------- Özel bölgeler ----------
  // Zeminden önce (arkada) çizilenler
  function zoneBack(e, z) {
    const { ctx, scale: s } = e;
    if (z.type === 'bridge') {
      // dere: zeminin altına su
      const y = e.baseH(z.a);
      ctx.fillStyle = '#3d9be0';
      ctx.fillRect(e.sx(z.a), e.sy(y - 12), (z.b - z.a) * s, e.ch);
    }
  }
  // Zemin çizildikten sonra (önde) çizilenler
  function zoneFront(e, z, carInside) {
    const { ctx, scale: s, time } = e;
    const mid = (z.a + z.b) / 2, w = z.b - z.a;
    const y = e.baseH(mid);
    if (z.type === 'puddle') {
      ctx.fillStyle = '#4aa8e8';
      ctx.beginPath(); ctx.ellipse(e.sx(mid), e.sy(y - 2), (w / 2) * s, 11 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.ellipse(e.sx(mid - w * 0.15), e.sy(y), w * 0.12 * s, 3 * s, 0, 0, TAU); ctx.fill();
    } else if (z.type === 'bridge') {
      const gy = e.baseH(z.a);
      // zemini dere boyunca kes: dere suyu ve kütük
      ctx.fillStyle = '#3d9be0';
      ctx.fillRect(e.sx(z.a + 30), e.sy(gy - 8), (w - 60) * s, e.ch);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let k = 0; k < 4; k++) { rr(ctx, e.sx(z.a + 60 + k * 60 + Math.sin(time * 2 + k) * 8), e.sy(gy - 40 - (k % 2) * 20), 30 * s, 4 * s, 2 * s); ctx.fill(); }
      ctx.fillStyle = '#9a6233';
      rr(ctx, e.sx(z.a), e.sy(gy + 2), w * s, 20 * s, 10 * s); ctx.fill();
      ctx.fillStyle = '#c48a52';
      for (const ex of [z.a, z.b]) { ctx.beginPath(); ctx.ellipse(e.sx(ex), e.sy(gy - 8), 6 * s, 10 * s, 0, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(e.sx(z.a + 20), e.sy(gy - 4)); ctx.lineTo(e.sx(z.b - 20), e.sy(gy - 4)); ctx.stroke();
    } else if (z.type === 'ice') {
      ctx.fillStyle = 'rgba(170,220,255,0.95)';
      ctx.beginPath();
      for (let x = z.a; x <= z.b; x += 10) { const p = [e.sx(x), e.sy(e.baseH(x) + 1)]; x === z.a ? ctx.moveTo(...p) : ctx.lineTo(...p); }
      for (let x = z.b; x >= z.a; x -= 10) ctx.lineTo(e.sx(x), e.sy(e.baseH(x) - 12));
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 * s;
      for (let k = 0; k < 4; k++) {
        const x = z.a + 60 + k * 140;
        ctx.beginPath(); ctx.moveTo(e.sx(x), e.sy(e.baseH(x) - 4)); ctx.lineTo(e.sx(x + 50), e.sy(e.baseH(x + 50) - 4)); ctx.stroke();
      }
    } else if (z.type === 'wave') {
      ctx.fillStyle = '#4ab8ec';
      ctx.beginPath(); ctx.ellipse(e.sx(mid), e.sy(y - 3), (w / 2) * s, 14 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * s;
      ctx.beginPath();
      for (let x = z.a + 20; x <= z.b - 20; x += 8) {
        const yy = e.sy(y + 4 + Math.sin(x * 0.08 + time * 4) * 3);
        x === z.a + 20 ? ctx.moveTo(e.sx(x), yy) : ctx.lineTo(e.sx(x), yy);
      }
      ctx.stroke();
    } else if (z.type === 'tunnel') {
      const gy = e.baseH(z.a);
      const top = 210;
      ctx.fillStyle = '#6d5a4a';
      ctx.beginPath();
      ctx.moveTo(e.sx(z.a - 60), e.sy(gy - 10));
      ctx.lineTo(e.sx(z.a - 60), e.sy(gy + top - 40));
      ctx.quadraticCurveTo(e.sx(mid), e.sy(gy + top + 90), e.sx(z.b + 60), e.sy(gy + top - 40));
      ctx.lineTo(e.sx(z.b + 60), e.sy(gy - 10));
      ctx.lineTo(e.sx(z.b - 10), e.sy(gy - 10));
      ctx.lineTo(e.sx(z.b - 10), e.sy(gy + 150));
      ctx.lineTo(e.sx(z.a + 10), e.sy(gy + 150));
      ctx.lineTo(e.sx(z.a + 10), e.sy(gy - 10));
      ctx.closePath(); ctx.fill();
      // giriş ve çıkış kemerleri
      ctx.strokeStyle = '#8a7462'; ctx.lineWidth = 10 * s;
      for (const ex of [z.a + 10, z.b - 10]) {
        ctx.beginPath(); ctx.moveTo(e.sx(ex), e.sy(gy)); ctx.lineTo(e.sx(ex), e.sy(gy + 150)); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(e.sx(z.a + 10), e.sy(gy + 150)); ctx.lineTo(e.sx(z.b - 10), e.sy(gy + 150)); ctx.stroke();
      // tünel lambaları
      for (let x = z.a + 80; x < z.b - 40; x += 120) {
        ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.arc(e.sx(x), e.sy(gy + 135), 6 * s, 0, TAU); ctx.fill();
      }
    }
  }
  // Tünelin içinde iken arka plan karartması (araçtan önce çizilir)
  function tunnelShade(e, z) {
    const { ctx, scale: s } = e;
    const gy = e.baseH(z.a);
    ctx.fillStyle = 'rgba(10,12,22,0.88)';
    ctx.fillRect(e.sx(z.a + 10), e.sy(gy + 150), (z.b - z.a - 20) * s, 150 * s);
  }

  return { T, decor, zoneBack, zoneFront, tunnelShade };
})();
