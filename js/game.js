// Araba yarışı: yandan bakış demo bölümü.
// Ekrana basılı tut = gaz. Bırak = yavaşla. Kaybetmek yok.
(() => {
  'use strict';

  // ---------- Ayarlar (sadece bu cihazda) ----------
  const DEFAULTS = { sound: true, voice: true, speed: 'normal' };
  let settings = { ...DEFAULTS };
  try {
    const saved = JSON.parse(localStorage.getItem('araba-ayarlar') || '{}');
    settings = { ...DEFAULTS, ...saved };
  } catch (e) { /* gizli mod vb. */ }
  function saveSettings() {
    try { localStorage.setItem('araba-ayarlar', JSON.stringify(settings)); } catch (e) {}
  }
  Sound.setEnabled(settings.sound);
  Sound.setVoice(settings.voice);

  // ---------- Sabitler ----------
  const NUMBER_WORDS = ['', 'bir', 'iki', 'üç', 'dört', 'beş'];
  const NUMBER_COLORS = ['', '#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff'];
  const GRAVITY = 1400;
  const RAMP_BOOST = 380;
  const SPEEDS = { slow: 220, normal: 300 };
  const CAR_COLOR = '#e8333a';

  // ---------- Tuval ----------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let cw = 0, ch = 0, dpr = 1, scale = 1, viewW = 0, viewH = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    // Hem yatay hem dikey tutuşta makul bir görüş alanı
    scale = Math.min(ch / 560, cw / 760);
    viewW = cw / scale;
    viewH = ch / scale;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Zemin ----------
  const G = LEVEL.ground;
  function baseH(x) {
    if (x <= G[0][0]) return G[0][1];
    const last = G.length - 1;
    if (x >= G[last][0]) return G[last][1];
    let lo = 0, hi = last;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (G[mid][0] <= x) lo = mid; else hi = mid;
    }
    const [x0, y0] = G[lo], [x1, y1] = G[hi];
    const t = (x - x0) / (x1 - x0);
    return y0 + (y1 - y0) * (1 - Math.cos(Math.PI * t)) / 2;
  }
  function rampH(x) {
    for (const r of LEVEL.ramps) {
      if (x >= r.x && x < r.x + r.len) return ((x - r.x) / r.len) * r.h;
    }
    return 0;
  }
  const groundH = x => baseH(x) + rampH(x);
  const slopeAt = x => (groundH(x + 4) - groundH(x - 4)) / 8;

  // ---------- Oyun durumu ----------
  let state = 'menu'; // menu | play | finish
  let paused = false;
  let car, stars, numbers, puddles, particles, confetti, popups, collectedStars, nextNumber;
  let cam = { x: 0, y: 0 };
  let gas = false;
  const pointers = new Set();
  let time = 0;
  let finishTimer = 0;

  function reset() {
    car = { x: 200, y: 0, vy: 0, speed: 0, angle: 0, onGround: true, wheel: 0, squash: 0 };
    car.y = groundH(car.x);
    stars = LEVEL.stars.map(s => ({ x: s.x, y: groundH(s.x) + s.dy, got: false, t: Math.random() * 6 }));
    numbers = LEVEL.numbers.map(b => ({ n: b.n, x: b.x, y: groundH(b.x) + 115, got: false, pulled: false }));
    puddles = LEVEL.puddles.map(p => ({ ...p, splashed: false }));
    particles = [];
    confetti = [];
    popups = [];
    collectedStars = 0;
    nextNumber = 1;
    finishTimer = 0;
    cam.x = car.x - viewW * 0.3;
    cam.y = car.y - viewH * 0.3;
    buildSlots();
    starCountEl.textContent = '0';
  }

  // ---------- Arayüz öğeleri ----------
  const $ = id => document.getElementById(id);
  const hud = $('hud'), slotsEl = $('slots'), starsEl = $('stars'), starCountEl = $('star-count');
  const hornBtn = $('horn'), pedal = $('pedal'), gear = $('gear');
  const startScreen = $('start'), finishScreen = $('finish'), finishStars = $('finish-stars');
  const parentPanel = $('parent');

  function buildSlots() {
    slotsEl.innerHTML = '';
    for (let n = 1; n <= 5; n++) {
      const d = document.createElement('div');
      d.className = 'slot';
      d.textContent = n;
      d.dataset.n = n;
      slotsEl.appendChild(d);
    }
  }

  function show(el, on) { el.classList.toggle('hidden', !on); }

  function startGame() {
    Sound.unlock();
    Sound.tap();
    reset();
    state = 'play';
    show(startScreen, false);
    show(finishScreen, false);
    show(hud, true);
    show(hornBtn, true);
    show(pedal, true);
    Sound.engineStart();
  }

  function goMenu() {
    state = 'menu';
    Sound.engineStop();
    reset();
    show(startScreen, true);
    show(finishScreen, false);
    show(hud, false);
    show(hornBtn, false);
    show(pedal, false);
  }

  function finishRace() {
    state = 'finish';
    gas = false;
    finishTimer = 0;
    Sound.fanfare();
    setTimeout(() => Sound.say('Aferin!'), 700);
    for (let i = 0; i < 160; i++) spawnConfetti(true);
    show(pedal, false);
  }

  function showFinishScreen() {
    Sound.engineStop();
    finishStars.innerHTML = '';
    const n = Math.max(collectedStars, 1);
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      s.innerHTML = '<use href="#i-star"/>';
      s.style.animationDelay = (0.3 + i * 0.08) + 's';
      finishStars.appendChild(s);
    }
    show(finishScreen, true);
    show(hornBtn, false);
  }

  // ---------- Girdi ----------
  function isUI(target) {
    return target.closest && target.closest('button, #parent, .panel');
  }
  document.addEventListener('pointerdown', e => {
    if (isUI(e.target)) return;
    pointers.add(e.pointerId);
    updateGas();
  });
  const release = e => { pointers.delete(e.pointerId); updateGas(); };
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);

  const keys = new Set();
  document.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowUp') {
      keys.add(e.code); updateGas(); e.preventDefault();
    }
    if (e.code === 'KeyH') honk();
    if (e.code === 'Enter') {
      if (state === 'menu') startGame();
      else if (state === 'finish' && !finishScreen.classList.contains('hidden')) startGame();
    }
  });
  document.addEventListener('keyup', e => { keys.delete(e.code); updateGas(); });

  function updateGas() {
    gas = state === 'play' && !paused && (pointers.size > 0 || keys.size > 0);
    pedal.classList.toggle('down', gas);
  }

  // iOS: çift dokunma ve kıstırma ile yakınlaştırmayı engelle
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => { if (!e.target.closest('.panel')) e.preventDefault(); }, { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());

  function honk() {
    if (state !== 'play' && state !== 'finish') return;
    Sound.horn();
    car.squash = 0.5;
    hornBtn.classList.add('down');
    setTimeout(() => hornBtn.classList.remove('down'), 180);
    // Kornadan küçük notalar çıksın
    for (let i = 0; i < 4; i++) {
      particles.push({ type: 'note', x: car.x + 60, y: car.y + 70, vx: 60 + Math.random() * 80,
        vy: 120 + Math.random() * 80, life: 1, max: 1 });
    }
  }
  hornBtn.addEventListener('pointerdown', e => { e.preventDefault(); honk(); });

  $('play').addEventListener('click', startGame);
  $('again').addEventListener('click', startGame);
  $('home').addEventListener('click', () => { Sound.tap(); goMenu(); });

  // ---------- Ebeveyn paneli: dişliye 3 saniye basılı tut ----------
  let gearTimer = null;
  function gearCancel() { clearTimeout(gearTimer); gearTimer = null; gear.classList.remove('holding'); }
  gear.addEventListener('pointerdown', e => {
    e.preventDefault();
    gear.classList.add('holding');
    gearTimer = setTimeout(() => { gearCancel(); openParent(); }, 3000);
  });
  gear.addEventListener('pointerup', gearCancel);
  gear.addEventListener('pointerleave', gearCancel);
  gear.addEventListener('pointercancel', gearCancel);

  const optSound = $('opt-sound'), optVoice = $('opt-voice');
  const speedBtns = parentPanel.querySelectorAll('[data-speed]');
  function syncPanel() {
    optSound.checked = settings.sound;
    optVoice.checked = settings.voice;
    speedBtns.forEach(b => b.classList.toggle('on', b.dataset.speed === settings.speed));
  }
  function openParent() {
    paused = true;
    pointers.clear();
    updateGas();
    syncPanel();
    show(parentPanel, true);
  }
  function closeParent() { paused = false; show(parentPanel, false); }
  optSound.addEventListener('change', () => { settings.sound = optSound.checked; Sound.setEnabled(settings.sound); saveSettings(); });
  optVoice.addEventListener('change', () => { settings.voice = optVoice.checked; Sound.setVoice(settings.voice); saveSettings(); });
  speedBtns.forEach(b => b.addEventListener('click', () => { settings.speed = b.dataset.speed; saveSettings(); syncPanel(); }));
  $('parent-close').addEventListener('click', closeParent);
  $('parent-menu').addEventListener('click', () => { closeParent(); goMenu(); });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pointers.clear(); keys.clear(); updateGas(); Sound.engineStop(); }
    else if (state === 'play') Sound.engineStart();
  });

  // ---------- Parçacıklar ----------
  function sparkle(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 220;
      particles.push({ type: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.7, max: 0.7, color });
    }
  }
  function splash(x, y) {
    for (let i = 0; i < 30; i++) {
      particles.push({ type: 'drop', x: x + (Math.random() - 0.5) * 60, y: y + 5,
        vx: (Math.random() - 0.3) * 260, vy: 200 + Math.random() * 380, life: 1.1, max: 1.1, g: true });
    }
  }
  function spawnConfetti(burst) {
    const colors = ['#ff5a5f', '#ffd23f', '#4cd964', '#3fa7ff', '#a66cff', '#ff9f1c'];
    confetti.push({
      x: Math.random() * cw, y: burst ? -Math.random() * ch * 0.6 : -20,
      vx: (Math.random() - 0.5) * 80, vy: 80 + Math.random() * 140,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 10,
      w: 8 + Math.random() * 8, h: 5 + Math.random() * 6,
      color: colors[(Math.random() * colors.length) | 0]
    });
  }

  // ---------- Güncelleme ----------
  function update(dt) {
    time += dt;
    if (paused) return;

    if (state === 'play' || state === 'finish') {
      const steps = 2, h = dt / steps;
      for (let i = 0; i < steps; i++) stepCar(h);
      collect();
    }

    // Kamera arabayı yumuşakça izler
    const tx = car.x - viewW * 0.3;
    const ty = car.y - viewH * (ch > cw ? 0.42 : 0.32);
    cam.x += (tx - cam.x) * Math.min(1, dt * 6);
    cam.y += (ty - cam.y) * Math.min(1, dt * 2.5);

    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.g) p.vy -= GRAVITY * 0.8 * dt;
      if (p.type === 'spark') { p.vx *= 0.94; p.vy *= 0.94; }
    }
    particles = particles.filter(p => p.life > 0);

    for (const c of confetti) {
      c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
      c.vx += Math.sin(time * 3 + c.y * 0.02) * 20 * dt;
    }
    confetti = confetti.filter(c => c.y < ch + 30);

    for (const p of popups) p.t += dt;
    popups = popups.filter(p => p.t < 1.4);

    if (state === 'finish') {
      finishTimer += dt;
      if (finishTimer < 2.5 && Math.random() < 0.5) spawnConfetti(false);
      if (finishTimer > 1.8 && finishScreen.classList.contains('hidden')) showFinishScreen();
    }

    Sound.engineUpdate(Math.min(1, car.speed / SPEEDS.normal), gas);
  }

  function stepCar(dt) {
    const max = SPEEDS[settings.speed] || SPEEDS.normal;
    const slope = slopeAt(car.x);

    if (gas) car.speed += 300 * dt;
    else car.speed -= (state === 'finish' ? 160 : 140) * dt;

    if (car.onGround) car.speed -= slope * 160 * dt; // yokuş yukarı biraz yavaşlar, aşağı hızlanır
    if (gas) car.speed = Math.max(car.speed, 90);       // gaz varken asla takılmaz
    car.speed = Math.max(0, Math.min(car.speed, max * 1.08));

    car.x += car.speed * dt;
    car.wheel += car.speed * dt / 20;

    const g = groundH(car.x);
    if (car.onGround) {
      if (car.y - g > 20) {
        // Rampadan uçuş!
        car.onGround = false;
        car.vy = Math.max(car.vy, 0) + RAMP_BOOST; // rampanın eğimiyle fırla
        Sound.boing();
        sparkle(car.x - 40, car.y, '#fff7a8', 10);
      } else {
        car.y = g;
        car.vy = slopeAt(car.x) * car.speed;
      }
    } else {
      car.vy -= GRAVITY * dt;
      car.y += car.vy * dt;
      if (car.y <= g) {
        car.y = g;
        if (car.vy < -300) { Sound.land(); car.squash = 1; }
        car.vy = slopeAt(car.x) * car.speed;
        car.onGround = true;
      }
    }

    // Açı: yerdeyken zemine uyar, havada yavaşça düzleşir; asla devrilmez
    let target;
    if (car.onGround) target = Math.atan((groundH(car.x + 42) - groundH(car.x - 42)) / 84);
    else target = Math.atan2(car.vy, Math.max(car.speed, 1)) * 0.35;
    target = Math.max(-0.6, Math.min(0.6, target));
    car.angle += (target - car.angle) * Math.min(1, dt * (car.onGround ? 14 : 4));
    car.squash = Math.max(0, car.squash - dt * 4);

    if (state === 'play' && car.x >= LEVEL.finish) finishRace();
  }

  function collect() {
    const cx = car.x, cy = car.y + 40;

    for (const s of stars) {
      if (s.got) continue;
      const dx = s.x - cx, dy = s.y - cy;
      if (dx * dx + dy * dy < 95 * 95) {
        s.got = true;
        collectedStars++;
        starCountEl.textContent = collectedStars;
        starsEl.classList.remove('bump'); void starsEl.offsetWidth; starsEl.classList.add('bump');
        Sound.star();
        sparkle(s.x, s.y, '#ffd23f');
      }
    }

    // Sayı balonları: yaklaşınca arabaya doğru süzülür, hiçbiri kaçmaz
    for (const b of numbers) {
      if (b.got) continue;
      const dx = cx - b.x;
      if (dx > -260 && b.n === nextNumber) b.pulled = true;
      if (b.pulled) {
        b.x += (cx + 20 - b.x) * 0.08;
        b.y += (cy + 40 - b.y) * 0.08;
      }
      const ddx = b.x - cx, ddy = b.y - (cy + 30);
      if (b.n === nextNumber && ddx * ddx + ddy * ddy < 80 * 80) {
        b.got = true;
        nextNumber++;
        const slot = slotsEl.querySelector(`[data-n="${b.n}"]`);
        if (slot) { slot.classList.add('got'); slot.style.background = NUMBER_COLORS[b.n]; }
        Sound.number(b.n);
        setTimeout(() => Sound.say(NUMBER_WORDS[b.n]), 250);
        sparkle(b.x, b.y, NUMBER_COLORS[b.n], 26);
        popups.push({ n: b.n, t: 0 });
      }
    }

    for (const p of puddles) {
      if (!p.splashed && car.onGround && car.x > p.x + 30 && car.x < p.x + p.w) {
        p.splashed = true;
        Sound.splash();
        splash(car.x, groundH(car.x));
      }
    }
  }

  // ---------- Çizim yardımcıları ----------
  const sx = x => (x - cam.x) * scale;
  const sy = y => (cam.y + viewH - y) * scale;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function starPath(x, y, r, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot - Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }

  // ---------- Çizim ----------
  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Gökyüzü
    const sky = ctx.createLinearGradient(0, 0, 0, ch);
    sky.addColorStop(0, '#5fb8f0');
    sky.addColorStop(1, '#c9ecff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cw, ch);

    // Güneş
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(cw - 140 * scale, 120 * scale, 55 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,224,102,0.3)';
    ctx.beginPath();
    ctx.arc(cw - 140 * scale, 120 * scale, 80 * scale, 0, Math.PI * 2);
    ctx.fill();

    drawClouds();
    drawHills(0.25, 230, 70, '#9fd88a', 0.0021, 1);
    drawHills(0.5, 150, 55, '#7cc96a', 0.0033, 2.4);

    // Süsler (zeminin arkasında)
    for (const d of LEVEL.decor) {
      if (d.x < cam.x - 400 || d.x > cam.x + viewW + 400) continue;
      drawDecor(d);
    }

    drawGround();
    drawFinish();

    for (const p of puddles) drawPuddle(p);
    for (const s of stars) if (!s.got) drawStar(s);
    for (const b of numbers) if (!b.got) drawBalloon(b);

    drawCar();
    drawParticles();
    drawPopups();
    drawConfetti();
  }

  function drawClouds() {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (let i = 0; i < 7; i++) {
      const spacing = 520;
      const wx = i * spacing - (cam.x * 0.1 + time * 8) % (spacing * 7);
      const x = ((wx % (spacing * 7)) + spacing * 7) % (spacing * 7) - spacing;
      const y = 70 + (i % 3) * 55;
      const s = (0.8 + (i % 2) * 0.4) * scale;
      const px = x * scale, py = y * scale;
      ctx.beginPath();
      ctx.arc(px, py, 34 * s, 0, Math.PI * 2);
      ctx.arc(px + 38 * s, py - 14 * s, 42 * s, 0, Math.PI * 2);
      ctx.arc(px + 80 * s, py, 32 * s, 0, Math.PI * 2);
      ctx.rect(px, py, 80 * s, 30 * s);
      ctx.fill();
    }
  }

  function drawHills(par, base, amp, color, freq, phase) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, ch);
    for (let x = 0; x <= cw + 10; x += 10) {
      const wx = x / scale + cam.x * par;
      const y = base + amp * Math.sin(wx * freq + phase) + amp * 0.5 * Math.sin(wx * freq * 2.3 + phase * 2);
      // Tepeler kameranın yüksekliğini hafifçe izler
      ctx.lineTo(x, sy(y + cam.y * (1 - par) - 40));
    }
    ctx.lineTo(cw, ch);
    ctx.closePath();
    ctx.fill();
  }

  function drawGround() {
    const x0 = cam.x - 20, x1 = cam.x + viewW + 20, step = 8;

    // Toprak
    ctx.fillStyle = '#b07a45';
    ctx.beginPath();
    ctx.moveTo(sx(x0), ch + 10);
    for (let x = x0; x <= x1; x += step) ctx.lineTo(sx(x), sy(baseH(x)));
    ctx.lineTo(sx(x1), ch + 10);
    ctx.closePath();
    ctx.fill();

    // Toprakta taşlar
    ctx.fillStyle = '#946236';
    for (let k = Math.floor(x0 / 170); k * 170 < x1; k++) {
      const x = k * 170 + ((k * 73) % 60);
      const depth = 50 + ((k * 37) % 70);
      ctx.beginPath();
      ctx.ellipse(sx(x), sy(baseH(x) - depth), 12 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Çimen şeridi
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4caf3f';
    ctx.lineWidth = 26 * scale;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) {
      const y = sy(baseH(x) - 8);
      if (x === x0) ctx.moveTo(sx(x), y); else ctx.lineTo(sx(x), y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#6ccf4f';
    ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) {
      const y = sy(baseH(x) + 2);
      if (x === x0) ctx.moveTo(sx(x), y); else ctx.lineTo(sx(x), y);
    }
    ctx.stroke();

    // Rampalar (tahta)
    for (const r of LEVEL.ramps) {
      if (r.x + r.len < x0 || r.x > x1) continue;
      ctx.fillStyle = '#e09a3e';
      ctx.strokeStyle = '#9a5a1c';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(sx(r.x), sy(baseH(r.x)));
      for (let x = r.x; x <= r.x + r.len; x += 10) ctx.lineTo(sx(x), sy(baseH(x) + rampH(x)));
      ctx.lineTo(sx(r.x + r.len), sy(baseH(r.x + r.len) + r.h));
      ctx.lineTo(sx(r.x + r.len), sy(baseH(r.x + r.len)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Sarı-siyah uç şeridi
      const ex = r.x + r.len, eb = baseH(ex);
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(sx(ex) - 12 * scale, sy(eb + r.h), 12 * scale, r.h * scale);
      ctx.fillStyle = '#333';
      for (let k = 0; k < r.h; k += 20) ctx.fillRect(sx(ex) - 12 * scale, sy(eb + r.h - k), 12 * scale, 10 * scale);
      // Ok işareti
      const mx = r.x + r.len * 0.55, my = baseH(mx) + rampH(mx) * 0.45;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.save();
      ctx.translate(sx(mx), sy(my));
      ctx.rotate(-Math.atan(r.h / r.len));
      ctx.beginPath();
      ctx.moveTo(-18 * scale, -7 * scale); ctx.lineTo(4 * scale, -7 * scale); ctx.lineTo(4 * scale, -15 * scale);
      ctx.lineTo(20 * scale, 0); ctx.lineTo(4 * scale, 15 * scale); ctx.lineTo(4 * scale, 7 * scale);
      ctx.lineTo(-18 * scale, 7 * scale); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  function drawPuddle(p) {
    if (p.x + p.w < cam.x - 50 || p.x > cam.x + viewW + 50) return;
    const mx = p.x + p.w / 2, y = baseH(mx);
    ctx.fillStyle = '#4aa8e8';
    ctx.beginPath();
    ctx.ellipse(sx(mx), sy(y - 2), (p.w / 2) * scale, 11 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(sx(mx - p.w * 0.15), sy(y), p.w * 0.12 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFinish() {
    const fx = LEVEL.finish;
    if (fx < cam.x - 300 || fx > cam.x + viewW + 300) return;
    const fy = baseH(fx);
    // Dama zemin şeridi
    const cell = 16;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff';
        ctx.fillRect(sx(fx - 32 + c * cell), sy(fy + 4 - r * cell * 0.5), cell * scale, cell * 0.5 * scale);
      }
    }
    // Kemer
    const h = 260;
    ctx.fillStyle = '#ff5a5f';
    ctx.fillRect(sx(fx - 180), sy(fy + h), 18 * scale, h * scale);
    ctx.fillRect(sx(fx + 162), sy(fy + h), 18 * scale, h * scale);
    // Bayrak bandı (dama)
    const bw = 360, bh = 56, cols = 12;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff';
        ctx.fillRect(sx(fx - 180 + c * (bw / cols)), sy(fy + h + bh - r * (bh / 2)), (bw / cols) * scale + 1, (bh / 2) * scale + 1);
      }
    }
    // Balonlar
    const cols2 = ['#ffd23f', '#3fa7ff', '#4cd964', '#a66cff'];
    [[-195, 40], [-165, 70], [195, 40], [165, 70]].forEach(([dx, dy], i) => {
      const bob = Math.sin(time * 2 + i) * 5;
      ctx.fillStyle = cols2[i];
      ctx.beginPath();
      ctx.ellipse(sx(fx + dx), sy(fy + h + dy + bob), 22 * scale, 27 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawStar(s) {
    if (s.x < cam.x - 60 || s.x > cam.x + viewW + 60) return;
    const pulse = 1 + Math.sin(time * 5 + s.t) * 0.1;
    const r = 30 * scale * pulse;
    ctx.save();
    ctx.shadowColor = 'rgba(255,210,63,0.8)';
    ctx.shadowBlur = 16 * scale;
    starPath(sx(s.x), sy(s.y), r, Math.sin(time * 2 + s.t) * 0.2);
    ctx.fillStyle = '#ffd23f';
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 3 * scale;
    ctx.strokeStyle = '#e8a200';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function drawBalloon(b) {
    if (b.x < cam.x - 100 || b.x > cam.x + viewW + 100) return;
    const bob = b.pulled ? 0 : Math.sin(time * 2.2 + b.n) * 8;
    const x = sx(b.x), y = sy(b.y + bob);
    const r = 46 * scale;
    // İp
    if (!b.pulled) {
      ctx.strokeStyle = 'rgba(60,60,60,0.6)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(x, y + r * 1.15);
      ctx.quadraticCurveTo(x + 10 * scale, y + r * 1.8, x, sy(groundH(b.x) + 6));
      ctx.stroke();
    }
    ctx.fillStyle = NUMBER_COLORS[b.n];
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 7 * scale, y + r * 1.22);
    ctx.lineTo(x + 7 * scale, y + r * 1.22);
    ctx.lineTo(x, y + r * 1.1);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.4, y - r * 0.5, r * 0.18, r * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Sayı: sıradaki balon parlar
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.round(r * 1.25)}px -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5 * scale;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.strokeText(b.n, x, y + r * 0.06);
    ctx.fillText(b.n, x, y + r * 0.06);
  }

  function drawCar() {
    const x = sx(car.x), y = sy(car.y);
    const s = scale;
    const sq = car.squash;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-car.angle);
    ctx.scale(1 + sq * 0.08, 1 - sq * 0.1);

    // Gölge
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 2 * s, 70 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gövde
    ctx.fillStyle = CAR_COLOR;
    roundRect(-72 * s, -62 * s, 144 * s, 40 * s, 16 * s);
    ctx.fill();
    // Kabin
    ctx.beginPath();
    ctx.moveTo(-46 * s, -60 * s);
    ctx.lineTo(-30 * s, -96 * s);
    ctx.quadraticCurveTo(-26 * s, -100 * s, -18 * s, -100 * s);
    ctx.lineTo(22 * s, -100 * s);
    ctx.quadraticCurveTo(30 * s, -100 * s, 34 * s, -94 * s);
    ctx.lineTo(54 * s, -60 * s);
    ctx.closePath();
    ctx.fill();
    // Camlar
    ctx.fillStyle = '#bfe7ff';
    ctx.beginPath();
    ctx.moveTo(-36 * s, -62 * s); ctx.lineTo(-24 * s, -90 * s); ctx.lineTo(-2 * s, -90 * s); ctx.lineTo(-2 * s, -62 * s);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6 * s, -62 * s); ctx.lineTo(6 * s, -90 * s); ctx.lineTo(26 * s, -90 * s); ctx.lineTo(42 * s, -62 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(-20 * s, -86 * s, 5 * s, 18 * s);
    // Sürücü (gülen yuvarlak yüz)
    ctx.fillStyle = '#ffd7a8';
    ctx.beginPath(); ctx.arc(16 * s, -74 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(20 * s, -77 * s, 1.8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.8 * s;
    ctx.beginPath(); ctx.arc(17 * s, -73 * s, 5 * s, 0.2, 1.4); ctx.stroke();
    // Kask
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(16 * s, -77 * s, 11 * s, Math.PI, 0); ctx.fill();
    // Şerit
    ctx.fillStyle = '#fff';
    ctx.fillRect(-72 * s, -46 * s, 144 * s, 7 * s);
    // Far ve stop
    ctx.fillStyle = '#fff3a0';
    roundRect(62 * s, -56 * s, 10 * s, 12 * s, 4 * s); ctx.fill();
    ctx.fillStyle = '#ff9f1c';
    roundRect(-72 * s, -56 * s, 7 * s, 11 * s, 3 * s); ctx.fill();

    // Tekerlekler
    for (const wx of [-44, 46]) {
      ctx.save();
      ctx.translate(wx * s, -20 * s);
      ctx.fillStyle = '#2b2b2b';
      ctx.beginPath(); ctx.arc(0, 0, 21 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cfd6dc';
      ctx.beginPath(); ctx.arc(0, 0, 11 * s, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(car.wheel);
      ctx.strokeStyle = '#7b858c';
      ctx.lineWidth = 3 * s;
      for (let k = 0; k < 3; k++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath(); ctx.moveTo(-10 * s, 0); ctx.lineTo(10 * s, 0); ctx.stroke();
      }
      ctx.restore();
    }

    // Hız çizgileri
    if (car.speed > 200) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 3 * s;
      const a = Math.min(1, (car.speed - 200) / 120);
      for (let k = 0; k < 3; k++) {
        const len = (20 + k * 10) * a * s;
        ctx.beginPath();
        ctx.moveTo(-82 * s, (-70 + k * 16) * s);
        ctx.lineTo(-82 * s - len, (-70 + k * 16) * s);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawDecor(d) {
    const s = scale, gx = d.x, gy = baseH(d.x);
    const x = sx(gx), y = sy(gy - 6);
    switch (d.t) {
      case 'tree':
        ctx.fillStyle = '#8a5a2b';
        ctx.fillRect(x - 10 * s, y - 90 * s, 20 * s, 90 * s);
        ctx.fillStyle = '#3e9b3a';
        ctx.beginPath();
        ctx.arc(x, y - 120 * s, 52 * s, 0, Math.PI * 2);
        ctx.arc(x - 38 * s, y - 95 * s, 36 * s, 0, Math.PI * 2);
        ctx.arc(x + 38 * s, y - 95 * s, 36 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff5a5f';
        [[-20, -130], [18, -110], [-30, -95], [30, -135]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 6 * s, 0, Math.PI * 2); ctx.fill();
        });
        break;
      case 'barn':
        ctx.fillStyle = '#c8372d';
        ctx.fillRect(x - 90 * s, y - 120 * s, 180 * s, 120 * s);
        ctx.fillStyle = '#8f231c';
        ctx.beginPath();
        ctx.moveTo(x - 105 * s, y - 118 * s); ctx.lineTo(x, y - 190 * s); ctx.lineTo(x + 105 * s, y - 118 * s);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 32 * s, y - 80 * s, 64 * s, 80 * s);
        ctx.fillStyle = '#c8372d';
        ctx.fillRect(x - 26 * s, y - 74 * s, 52 * s, 74 * s);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * s;
        ctx.beginPath();
        ctx.moveTo(x - 26 * s, y - 74 * s); ctx.lineTo(x + 26 * s, y);
        ctx.moveTo(x + 26 * s, y - 74 * s); ctx.lineTo(x - 26 * s, y);
        ctx.stroke();
        break;
      case 'fence':
        ctx.fillStyle = '#f2e3c6';
        for (let k = 0; k < 6; k++) {
          const fx = gx + k * 40, fy = baseH(fx);
          ctx.fillRect(sx(fx) - 5 * s, sy(fy + 55), 10 * s, 55 * s);
        }
        ctx.strokeStyle = '#f2e3c6'; ctx.lineWidth = 7 * s;
        for (const h of [20, 42]) {
          ctx.beginPath();
          for (let k = 0; k <= 200; k += 20) {
            const fx = gx + k;
            if (k === 0) ctx.moveTo(sx(fx), sy(baseH(fx) + h)); else ctx.lineTo(sx(fx), sy(baseH(fx) + h));
          }
          ctx.stroke();
        }
        break;
      case 'flowers':
        for (let k = 0; k < 7; k++) {
          const fx = gx + k * 28, fy = baseH(fx);
          const col = ['#ff5a5f', '#ffd23f', '#fff', '#a66cff'][k % 4];
          ctx.strokeStyle = '#3e9b3a'; ctx.lineWidth = 3 * s;
          ctx.beginPath(); ctx.moveTo(sx(fx), sy(fy)); ctx.lineTo(sx(fx), sy(fy + 26)); ctx.stroke();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(sx(fx), sy(fy + 30), 8 * s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffb000';
          ctx.beginPath(); ctx.arc(sx(fx), sy(fy + 30), 3 * s, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'cow':
      case 'sheep': {
        const sheep = d.t === 'sheep';
        const bob = Math.sin(time * 1.5 + gx) * 2 * s;
        // Bacaklar
        ctx.fillStyle = sheep ? '#333' : '#fff';
        for (const lx of [-30, -14, 14, 30]) ctx.fillRect(x + lx * s - 4 * s, y - 30 * s, 8 * s, 30 * s);
        // Gövde
        ctx.fillStyle = sheep ? '#f4f4f4' : '#fff';
        if (sheep) {
          ctx.beginPath();
          for (let k = -2; k <= 2; k++) ctx.arc(x + k * 14 * s, y - 50 * s + bob + (k % 2) * 4 * s, 18 * s, 0, Math.PI * 2);
          ctx.fill();
        } else {
          roundRect(x - 42 * s, y - 70 * s + bob, 84 * s, 44 * s, 18 * s); ctx.fill();
          ctx.fillStyle = '#333';
          ctx.beginPath(); ctx.ellipse(x - 10 * s, y - 55 * s + bob, 14 * s, 10 * s, 0.3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(x + 20 * s, y - 45 * s + bob, 9 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
        }
        // Kafa
        ctx.fillStyle = sheep ? '#333' : '#fff';
        ctx.beginPath(); ctx.ellipse(x + 50 * s, y - 70 * s + bob, 16 * s, 19 * s, 0, 0, Math.PI * 2); ctx.fill();
        if (!sheep) {
          ctx.fillStyle = '#ffb3c1';
          ctx.beginPath(); ctx.ellipse(x + 54 * s, y - 58 * s + bob, 12 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = sheep ? '#fff' : '#333';
        ctx.beginPath(); ctx.arc(x + 55 * s, y - 75 * s + bob, 2.5 * s, 0, Math.PI * 2); ctx.fill();
        break;
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const a = Math.max(0, p.life / p.max);
      const x = sx(p.x), y = sy(p.y);
      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        starPath(x, y, 9 * scale * (0.5 + a), time * 4);
        ctx.fill();
      } else if (p.type === 'drop') {
        ctx.fillStyle = '#6cc0f5';
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x, y, 6 * scale, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'note') {
        ctx.fillStyle = '#7a4b00';
        ctx.globalAlpha = a;
        ctx.font = `800 ${Math.round(30 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('♪', x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPopups() {
    for (const p of popups) {
      const t = p.t;
      const k = t < 0.3 ? t / 0.3 : 1;
      const size = (120 + 140 * Math.sin(k * Math.PI / 2)) * scale;
      const alpha = t > 1 ? 1 - (t - 1) / 0.4 : 1;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = `900 ${Math.round(size)}px -apple-system, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 14 * scale;
      ctx.strokeStyle = '#fff';
      ctx.strokeText(p.n, cw / 2, ch * 0.42);
      ctx.fillStyle = NUMBER_COLORS[p.n];
      ctx.fillText(p.n, cw / 2, ch * 0.42);
    }
    ctx.globalAlpha = 1;
  }

  function drawConfetti() {
    for (const c of confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
  }

  // ---------- Döngü ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  reset();
  requestAnimationFrame(frame);

  // Test ve hata ayıklama için küçük bir kapı
  window.__game = {
    get state() { return state; },
    get car() { return car; },
    get stars() { return collectedStars; },
    get nextNumber() { return nextNumber; }
  };

  // ---------- Çevrimdışı (Ana Ekrana Ekle) ----------
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
