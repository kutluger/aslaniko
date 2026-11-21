// Araçlar: çizim ve sürüş özellikleri.
// Çizim yerel koordinatta: (0,0) = aracın zemine değdiği orta nokta, y aşağı, birim = dünya birimi.
const COLORS = [
  { id: 'kirmizi', c: '#e8333a' },
  { id: 'mavi', c: '#2f80ed' },
  { id: 'sari', c: '#f5b800' },
  { id: 'yesil', c: '#27ae60' },
  { id: 'mor', c: '#9b51e0' }
];

// speed: en yüksek hız çarpanı · climb: yokuşta yavaşlama çarpanı (küçük = iyi tırmanır)
// fly: rampa/zıplama gücü · horn: korna sesi
const VEHICLES = [
  { id: 'car', color: 0, speed: 1.0, climb: 1.0, fly: 1.0, horn: 'car' },
  { id: 'moto', color: 1, speed: 1.15, climb: 1.0, fly: 1.2, horn: 'moto' },
  { id: 'bike', color: 3, speed: 0.8, climb: 1.1, fly: 0.85, horn: 'bike' },
  { id: 'atv', color: 2, speed: 1.0, climb: 0.35, fly: 1.0, horn: 'atv' }
];

const Draw = (() => {
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
    return '#' + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1);
  }

  // Ana karakter: kısa kahverengi saçlı, yuvarlak siyah gözlüklü, güler yüzlü çocuk (sağa bakar).
  // (x, y) = başın merkezi, r = baş yarıçapı. helmet verilirse saçın üstüne kask çizilir.
  const SKIN = '#f8d5b5', HAIR = '#6b4226', HAIR_D = '#4e2f1a', SHIRT = '#b8bdc3', JEANS = '#3d5a80';
  function kidHead(ctx, x, y, r, helmet) {
    ctx.save();
    ctx.translate(x, y);
    // yüz
    ctx.fillStyle = SKIN;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    // kulak
    ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.12, r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,120,90,0.35)';
    ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.12, r * 0.11, 0, Math.PI * 2); ctx.fill();
    // saç: arkadan tepeye, önde kısa kâkül
    ctx.fillStyle = HAIR;
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, r * 0.42);
    ctx.quadraticCurveTo(-r * 1.15, -r * 0.2, -r * 0.6, -r * 0.85);
    ctx.quadraticCurveTo(0, -r * 1.35, r * 0.75, -r * 0.82);
    ctx.quadraticCurveTo(r * 1.05, -r * 0.55, r * 0.95, -r * 0.3);
    ctx.quadraticCurveTo(r * 0.75, -r * 0.5, r * 0.55, -r * 0.42);
    ctx.quadraticCurveTo(r * 0.4, -r * 0.6, r * 0.2, -r * 0.46);
    ctx.quadraticCurveTo(0, -r * 0.62, -r * 0.15, -r * 0.42);
    ctx.quadraticCurveTo(-r * 0.25, -r * 0.1, -r * 0.12, r * 0.05);
    ctx.quadraticCurveTo(-r * 0.4, -r * 0.1, -r * 0.62, r * 0.42);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = HAIR_D; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.8); ctx.quadraticCurveTo(r * 0.1, -r * 1.0, r * 0.45, -r * 0.8); ctx.stroke();
    if (helmet) {
      ctx.fillStyle = helmet;
      ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 1.12, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.85, r * 0.32, r * 0.16, -0.3, 0, Math.PI * 2); ctx.fill();
    }
    // yanak
    ctx.fillStyle = 'rgba(255,120,120,0.4)';
    ctx.beginPath(); ctx.arc(r * 0.55, r * 0.35, r * 0.18, 0, Math.PI * 2); ctx.fill();
    // gözlük: iki yuvarlak siyah çerçeve, köprü ve kulak sapı
    const ey = -r * 0.08, lr = r * 0.3, e1 = r * 0.18, e2 = r * 0.8;
    ctx.fillStyle = 'rgba(220,240,255,0.55)';
    ctx.beginPath(); ctx.arc(e1, ey, lr, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(e2, ey, lr * 0.7, lr, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(e1 + lr * 0.2, ey + lr * 0.08, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(e2 + lr * 0.12, ey + lr * 0.08, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(e1 + lr * 0.32, ey - lr * 0.1, r * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#151515'; ctx.lineWidth = r * 0.13;
    ctx.beginPath(); ctx.arc(e1, ey, lr, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(e2, ey, lr * 0.7, lr, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.moveTo(e1 + lr, ey - lr * 0.2); ctx.lineTo(e2 - lr * 0.7, ey - lr * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(e1 - lr, ey - lr * 0.1); ctx.lineTo(-r * 0.35, -r * 0.02); ctx.stroke();
    // gülümseme
    ctx.strokeStyle = '#7a3b2e'; ctx.lineWidth = r * 0.11;
    ctx.beginPath(); ctx.arc(r * 0.48, r * 0.3, r * 0.3, 0.25, 1.6); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.restore();
  }

  function rider(ctx, x, y, helmet, lean = 0, kid = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    const hs = kid ? 1.05 : 1;
    // gri tişört, göğüste yeşil şerit
    ctx.fillStyle = SHIRT;
    rr(ctx, -9, -4, 18, 30, 8); ctx.fill();
    ctx.fillStyle = '#2f9e6b'; ctx.fillRect(-9, 6, 18, 3.5);
    kidHead(ctx, 2, -17, 11.5 * hs, helmet);
    ctx.restore();
  }

  function wheel(ctx, x, y, r, spin, opts = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    if (opts.knobby) {
      for (let k = 0; k < 14; k++) {
        ctx.save(); ctx.rotate(spin + k * Math.PI / 7);
        ctx.fillRect(-3, -r - 3, 6, 5);
        ctx.restore();
      }
    }
    if (opts.thin) {
      ctx.strokeStyle = '#9aa4ab'; ctx.lineWidth = 1.2;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < 8; k++) {
        ctx.save(); ctx.rotate(spin + k * Math.PI / 8);
        ctx.beginPath(); ctx.moveTo(0, -(r - 4)); ctx.lineTo(0, r - 4); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#7b858c';
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = opts.hub || '#cfd6dc';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(spin);
      ctx.strokeStyle = '#7b858c'; ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(r * 0.45, 0); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function lights(ctx, x, y) {
    const g = ctx.createLinearGradient(x, y, x + 220, y);
    g.addColorStop(0, 'rgba(255,243,160,0.7)');
    g.addColorStop(1, 'rgba(255,243,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 230, y - 50); ctx.lineTo(x + 230, y + 50); ctx.closePath(); ctx.fill();
  }

  function car(ctx, c, w, o) {
    const dark = shade(c, -0.25);
    if (o.lights) lights(ctx, 70, -50);
    ctx.fillStyle = c;
    rr(ctx, -72, -62, 144, 40, 16); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-46, -60); ctx.lineTo(-30, -96);
    ctx.quadraticCurveTo(-26, -100, -18, -100); ctx.lineTo(22, -100);
    ctx.quadraticCurveTo(30, -100, 34, -94); ctx.lineTo(54, -60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#bfe7ff';
    ctx.beginPath(); ctx.moveTo(-36, -62); ctx.lineTo(-24, -90); ctx.lineTo(-2, -90); ctx.lineTo(-2, -62); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, -62); ctx.lineTo(6, -90); ctx.lineTo(26, -90); ctx.lineTo(42, -62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-20, -86, 5, 18);
    kidHead(ctx, 15, -75, 11, null);
    ctx.fillStyle = '#fff'; ctx.fillRect(-72, -46, 144, 7);
    ctx.fillStyle = dark; ctx.fillRect(-4, -60, 3, 36);
    ctx.fillStyle = '#fff3a0'; rr(ctx, 62, -56, 10, 12, 4); ctx.fill();
    ctx.fillStyle = '#ff9f1c'; rr(ctx, -72, -56, 7, 11, 3); ctx.fill();
    wheel(ctx, -44, -20, 21, w);
    wheel(ctx, 46, -20, 21, w);
  }

  function moto(ctx, c, w, o) {
    const dark = shade(c, -0.3);
    if (o.lights) lights(ctx, 40, -62);
    ctx.fillStyle = '#9aa4ab'; rr(ctx, -52, -36, 44, 9, 4); ctx.fill();
    ctx.fillStyle = '#6d777e'; ctx.beginPath(); ctx.arc(-52, -31.5, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a4f55'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-44, -20); ctx.lineTo(-8, -40); ctx.lineTo(22, -40); ctx.stroke();
    ctx.strokeStyle = '#7b858c'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(44, -20); ctx.lineTo(30, -66); ctx.stroke();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(30, -66); ctx.lineTo(20, -74); ctx.stroke();
    ctx.fillStyle = '#5b6168'; rr(ctx, -12, -42, 30, 22, 6); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-6, -46); ctx.quadraticCurveTo(10, -66, 34, -58); ctx.lineTo(30, -42); ctx.lineTo(-6, -42); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-70, -42); ctx.quadraticCurveTo(-56, -52, -30, -48); ctx.lineTo(-30, -42); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(44, -20, 26, Math.PI * 1.15, Math.PI * 1.7); ctx.lineWidth = 6; ctx.strokeStyle = c; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(0, -52, 26, 4);
    ctx.beginPath(); ctx.arc(40, -50, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dark; ctx.font = '800 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', 40, -49);
    ctx.fillStyle = '#222'; rr(ctx, -38, -54, 38, 9, 4.5); ctx.fill();
    ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.ellipse(37, -62, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3d5a80'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-18, -56); ctx.lineTo(0, -46); ctx.lineTo(4, -30); ctx.stroke();
    rider(ctx, -16, -82, c, 0.35);
    ctx.strokeStyle = SHIRT; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-6, -80); ctx.lineTo(19, -73); ctx.stroke();
    ctx.lineCap = 'butt';
    wheel(ctx, -44, -20, 20, w, { hub: '#e6eaee' });
    wheel(ctx, 44, -20, 20, w, { hub: '#e6eaee' });
  }

  function bike(ctx, c, w, o) {
    if (o.lights) lights(ctx, 50, -70);
    wheel(ctx, -38, -23, 23, w, { thin: true });
    wheel(ctx, 38, -23, 23, w, { thin: true });
    ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-38, -23); ctx.lineTo(-4, -23); ctx.lineTo(-14, -58); ctx.closePath();
    ctx.moveTo(-4, -23); ctx.lineTo(26, -56); ctx.lineTo(-14, -58);
    ctx.moveTo(26, -56); ctx.lineTo(38, -23);
    ctx.stroke();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(26, -56); ctx.lineTo(24, -70); ctx.lineTo(14, -72); ctx.stroke();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(22, -74, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c98b4a'; rr(ctx, 30, -76, 24, 16, 3); ctx.fill();
    ctx.strokeStyle = '#a06a32'; ctx.lineWidth = 1.5;
    for (let k = 34; k < 54; k += 5) { ctx.beginPath(); ctx.moveTo(k, -76); ctx.lineTo(k, -60); ctx.stroke(); }
    ctx.strokeStyle = '#3e9b3a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, -76); ctx.lineTo(38, -86); ctx.moveTo(46, -76); ctx.lineTo(48, -84); ctx.stroke();
    ctx.fillStyle = '#ff5a5f'; ctx.beginPath(); ctx.arc(38, -88, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48, -86, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; rr(ctx, -24, -64, 20, 6, 3); ctx.fill();
    // dönen pedal
    const px = Math.cos(w * 0.6) * 10, py = Math.sin(w * 0.6) * 10;
    ctx.strokeStyle = '#777'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4 - px, -23 - py); ctx.lineTo(-4 + px, -23 + py); ctx.stroke();
    ctx.fillStyle = '#999'; ctx.beginPath(); ctx.arc(-4, -23, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3d5a80'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(-12, -66); ctx.lineTo(6 + px * 0.4, -46); ctx.lineTo(-4 + px, -23 + py); ctx.stroke();
    rider(ctx, -10, -92, c, 0.12, true);
    ctx.strokeStyle = SHIRT; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-4, -86); ctx.lineTo(14, -72); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  }

  function atv(ctx, c, w, o) {
    const dark = shade(c, -0.3);
    if (o.lights) lights(ctx, 78, -58);
    ctx.fillStyle = '#4a4f55'; rr(ctx, -50, -40, 100, 12, 5); ctx.fill();
    wheel(ctx, -46, -26, 26, w, { knobby: true, hub: '#b8c0c6' });
    wheel(ctx, 46, -26, 26, w, { knobby: true, hub: '#b8c0c6' });
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(-80, -44); ctx.quadraticCurveTo(-70, -70, -36, -66); ctx.lineTo(-18, -52); ctx.lineTo(-18, -44); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(80, -44); ctx.quadraticCurveTo(70, -70, 36, -66); ctx.lineTo(18, -52); ctx.lineTo(18, -44); ctx.closePath(); ctx.fill();
    rr(ctx, -30, -64, 60, 22, 8); ctx.fill();
    ctx.fillStyle = dark; ctx.fillRect(-30, -50, 60, 4);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-74, -72); ctx.lineTo(-44, -72); ctx.moveTo(-70, -72); ctx.lineTo(-66, -64); ctx.moveTo(-50, -72); ctx.lineTo(-52, -66); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(48, -74); ctx.lineTo(74, -74); ctx.moveTo(52, -74); ctx.lineTo(54, -66); ctx.moveTo(70, -74); ctx.lineTo(66, -66); ctx.stroke();
    ctx.fillStyle = '#fff3a0'; rr(ctx, 70, -62, 10, 9, 3); ctx.fill();
    ctx.fillStyle = '#222'; rr(ctx, -34, -72, 40, 10, 5); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(22, -62); ctx.lineTo(28, -84); ctx.lineTo(18, -88); ctx.stroke();
    ctx.strokeStyle = '#3d5a80'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-12, -74); ctx.lineTo(8, -64); ctx.lineTo(10, -48); ctx.stroke();
    rider(ctx, -12, -100, c, 0.15);
    ctx.strokeStyle = SHIRT; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-4, -96); ctx.lineTo(18, -86); ctx.stroke();
    ctx.lineCap = 'butt';
  }

  const FN = { car, moto, bike, atv };

  // Gölge zemine, araç gövdesi döndürülmüş olarak çizilir
  function vehicle(ctx, id, color, spin = 0, opts = {}) {
    if (!opts.noShadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath(); ctx.ellipse(0, 2, 68, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    FN[id](ctx, color, spin, opts);
  }

  return { vehicle, rr, shade };
})();
