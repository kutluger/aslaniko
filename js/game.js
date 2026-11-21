// Araba yarışı: garaj, bölüm haritası ve 5 bölüm.
// Ekrana basılı tut = gaz. Zıpla düğmesi (veya boşluk tuşu) = zıpla. Kaybetmek yok.
(() => {
  'use strict';
  const TAU = Math.PI * 2;

  // ---------- Ayarlar (sadece bu cihazda) ----------
  const DEFAULTS = {
    sound: true, voice: true, speed: 'normal',
    vehicle: 0, colors: VEHICLES.map(v => v.color), best: {}
  };
  let settings = { ...DEFAULTS };
  try {
    const saved = JSON.parse(localStorage.getItem('araba-ayarlar') || '{}');
    settings = { ...DEFAULTS, ...saved };
    if (!Array.isArray(settings.colors) || settings.colors.length !== VEHICLES.length) settings.colors = DEFAULTS.colors.slice();
    if (!(settings.vehicle >= 0 && settings.vehicle < VEHICLES.length)) settings.vehicle = 0;
    if (typeof settings.best !== 'object' || !settings.best) settings.best = {};
  } catch (e) { /* gizli mod vb. */ }
  function saveSettings() {
    try { localStorage.setItem('araba-ayarlar', JSON.stringify(settings)); } catch (e) {}
  }
  Sound.setEnabled(settings.sound);
  Sound.setVoice(settings.voice);

  const GRAVITY = 1400;
  const RAMP_BOOST = 450;
  const JUMP = 600;
  const SPEEDS = { slow: 230, normal: 310 };
  const vehicle = () => VEHICLES[settings.vehicle];
  const vehicleColor = (i = settings.vehicle) => COLORS[settings.colors[i]].c;

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
    scale = Math.min(ch / 560, cw / 760);
    viewW = cw / scale;
    viewH = ch / scale;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Durum ----------
  let state = 'garage'; // garage | map | play | finish
  let paused = false;
  let level = null, levelIndex = 0;
  let car, items, stars, signs, particles, confetti, popups, collectedStars;
  let goal = null; // ilerleme: { next, got, round, count }
  const cam = { x: 0, y: 0 };
  let gas = false, jumpQueued = false, hintShown = false;
  const pointers = new Set();
  const keys = new Set();
  let time = 0, finishTimer = 0;

  const groundH = x => {
    let h = level.baseH(x);
    for (const r of level.ramps) if (x >= r.x && x < r.x + r.len) h += ((x - r.x) / r.len) * r.h;
    return h;
  };
  const slopeAt = x => (groundH(x + 4) - groundH(x - 4)) / 8;
  const zoneAt = x => level.zones.find(z => x >= z.a && x <= z.b);

  // ---------- Arayüz ----------
  const $ = id => document.getElementById(id);
  const garageEl = $('garage'), mapEl = $('map'), finishEl = $('finish');
  const hud = $('hud'), slotsEl = $('slots'), starsEl = $('stars'), starCountEl = $('star-count');
  const hornBtn = $('horn'), jumpBtn = $('jump'), hintEl = $('hint'), gear = $('gear');
  const finishStars = $('finish-stars'), parentPanel = $('parent');
  const show = (el, on) => el.classList.toggle('hidden', !on);

  // Garaj: küçük araç resimleri ve renkler
  const vehicleRow = $('vehicle-row'), colorRow = $('color-row');
  const thumbs = VEHICLES.map((v, i) => {
    const b = document.createElement('button');
    b.className = 'vthumb';
    b.setAttribute('aria-label', 'Araç ' + (i + 1));
    const c = document.createElement('canvas');
    b.appendChild(c);
    b.addEventListener('click', () => { selectVehicle(i); });
    vehicleRow.appendChild(b);
    return { b, c };
  });
  const swatches = COLORS.map((col, i) => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = col.c;
    b.setAttribute('aria-label', 'Renk ' + (i + 1));
    b.addEventListener('click', () => {
      settings.colors[settings.vehicle] = i;
      saveSettings();
      Sound.tap();
      refreshGarage();
    });
    colorRow.appendChild(b);
    return b;
  });

  function drawThumb(t, i) {
    const w = 84, h = 56;
    const k = Math.min(window.devicePixelRatio || 1, 2);
    t.c.width = w * k; t.c.height = h * k;
    const c = t.c.getContext('2d');
    c.setTransform(k * 0.36, 0, 0, k * 0.36, w * k / 2, h * k - 6 * k);
    Draw.vehicle(c, VEHICLES[i].id, vehicleColor(i), 0.3, { noShadow: true });
  }
  function refreshGarage() {
    thumbs.forEach((t, i) => { t.b.classList.toggle('on', i === settings.vehicle); drawThumb(t, i); });
    swatches.forEach((b, i) => b.classList.toggle('on', i === settings.colors[settings.vehicle]));
  }
  let garageBounce = 0;
  function selectVehicle(i) {
    settings.vehicle = (i + VEHICLES.length) % VEHICLES.length;
    saveSettings();
    garageBounce = 1;
    Sound.unlock();
    Sound.hornFor(vehicle().horn);
    refreshGarage();
  }
  $('prev').addEventListener('click', () => selectVehicle(settings.vehicle - 1));
  $('next').addEventListener('click', () => selectVehicle(settings.vehicle + 1));
  $('go').addEventListener('click', () => { Sound.unlock(); Sound.tap(); goMap(); });

  // Harita: bölüm düğmeleri
  const LEVEL_STYLE = {
    farm: { bg: '#8ed07a', icon: 'lv-farm' },
    forest: { bg: '#4f9e6a', icon: 'lv-forest' },
    snow: { bg: '#cfe4f7', icon: 'lv-snow' },
    beach: { bg: '#7fd0f5', icon: 'lv-beach' },
    city: { bg: '#2c4a86', icon: 'lv-city' }
  };
  const levelRow = $('level-row');
  const levelBtns = LEVELS.map((def, i) => {
    const b = document.createElement('button');
    b.className = 'level-btn';
    b.style.background = LEVEL_STYLE[def.theme].bg;
    b.setAttribute('aria-label', 'Bölüm ' + (i + 1));
    b.innerHTML = `<svg viewBox="0 0 64 64"><use href="#${LEVEL_STYLE[def.theme].icon}"/></svg>
      <span class="badge">${i + 1}</span>
      <span class="best hidden"><svg viewBox="0 0 24 24"><use href="#i-star"/></svg><span></span></span>`;
    b.addEventListener('click', () => startLevel(i));
    levelRow.appendChild(b);
    return b;
  });
  function refreshMap() {
    levelBtns.forEach((b, i) => {
      const best = settings.best[LEVELS[i].id] || 0;
      const el = b.querySelector('.best');
      show(el, best > 0);
      el.querySelector('span').textContent = best;
    });
  }
  $('to-garage').addEventListener('click', () => { Sound.tap(); goGarage(); });
  $('again').addEventListener('click', () => startLevel(levelIndex));
  $('to-map').addEventListener('click', () => { Sound.tap(); goMap(); });

  function hideAll() {
    [garageEl, mapEl, finishEl, hud, hornBtn, jumpBtn, hintEl].forEach(el => show(el, false));
  }
  function goGarage() {
    state = 'garage';
    Sound.engineStop();
    hideAll();
    show(garageEl, true);
    refreshGarage();
  }
  function goMap() {
    state = 'map';
    Sound.engineStop();
    hideAll();
    show(mapEl, true);
    refreshMap();
  }

  // ---------- Bölüm başlat ----------
  function startLevel(i) {
    Sound.unlock();
    Sound.tap();
    levelIndex = i;
    level = buildLevel(LEVELS[i]);
    car = { x: 200, y: 0, vy: 0, speed: 0, angle: 0, onGround: true, wheel: 0, squash: 0, loop: null };
    car.y = groundH(car.x);
    items = level.items.map(it => ({ ...it, got: false, pulled: false, bumped: 0 }));
    stars = level.stars.map(s => ({ ...s, got: false, t: Math.random() * 6 }));
    signs = level.signs.map(s => ({ ...s, done: false }));
    level.loops.forEach(l => { l.done = false; });
    level.zones.forEach(z => { z.splashed = false; });
    particles = []; confetti = []; popups = [];
    collectedStars = 0;
    goal = { next: 0, got: 0, round: 0, count: 0 };
    finishTimer = 0;
    cam.x = car.x - viewW * 0.3;
    cam.y = car.y - viewH * 0.3;
    buildHud();
    starCountEl.textContent = '0';
    state = 'play';
    hideAll();
    show(hud, true); show(hornBtn, true); show(jumpBtn, true);
    hintShown = true; show(hintEl, true);
    if (vehicle().id !== 'bike') Sound.engineStart();
  }

  function slot(text, cls) {
    const d = document.createElement('div');
    d.className = 'slot' + (cls ? ' ' + cls : '');
    d.textContent = text;
    slotsEl.appendChild(d);
    return d;
  }
  function buildHud() {
    slotsEl.innerHTML = '';
    const g = level.def.goal;
    if (g.type === 'sequence') g.labels.forEach(l => slot(l));
    else if (g.type === 'hunt') for (let k = 0; k < g.count; k++) slot(g.target);
    else if (g.type === 'count') {
      const n = g.rounds[goal.round];
      slot(n, 'count-num');
      for (let k = 0; k < n; k++) slot('');
    }
  }
  function fillSlot(index, color) {
    const s = slotsEl.querySelectorAll('.slot:not(.count-num)')[index];
    if (!s) return;
    s.classList.add('got');
    s.style.background = color;
  }

  function finishRace() {
    state = 'finish';
    gas = false;
    finishTimer = 0;
    Sound.fanfare();
    setTimeout(() => Sound.say('Aferin!'), 700);
    for (let i = 0; i < 160; i++) spawnConfetti(true);
    show(jumpBtn, false); show(hintEl, false);
    const id = level.def.id;
    settings.best[id] = Math.max(settings.best[id] || 0, collectedStars);
    saveSettings();
  }
  function showFinishScreen() {
    Sound.engineStop();
    finishStars.innerHTML = '';
    const n = Math.max(collectedStars, 1);
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      s.innerHTML = '<use href="#i-star"/>';
      s.style.animationDelay = (0.2 + i * 0.05) + 's';
      finishStars.appendChild(s);
    }
    show(finishEl, true);
    show(hornBtn, false);
  }

  // ---------- Girdi ----------
  const isUI = t => t.closest && t.closest('button, #parent, .panel');
  document.addEventListener('pointerdown', e => {
    if (isUI(e.target)) return;
    pointers.add(e.pointerId);
    updateGas();
  });
  const release = e => { pointers.delete(e.pointerId); updateGas(); };
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);

  const GAS_KEYS = ['ArrowRight', 'KeyD'];
  const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
  document.addEventListener('keydown', e => {
    if (GAS_KEYS.includes(e.code) || JUMP_KEYS.includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    if (GAS_KEYS.includes(e.code)) { keys.add(e.code); updateGas(); }
    if (JUMP_KEYS.includes(e.code)) {
      if (state === 'play') requestJump();
      else if (e.code === 'Space') confirmKey();
    }
    if (e.code === 'KeyH') honk();
    if (e.code === 'Enter') confirmKey();
    if (state === 'garage' && e.code === 'ArrowLeft') selectVehicle(settings.vehicle - 1);
    if (state === 'garage' && e.code === 'ArrowRight') selectVehicle(settings.vehicle + 1);
  });
  document.addEventListener('keyup', e => { keys.delete(e.code); updateGas(); });
  function confirmKey() {
    if (paused) return;
    if (state === 'garage') { Sound.unlock(); goMap(); }
    else if (state === 'map') startLevel(levelIndex);
    else if (state === 'finish' && !finishEl.classList.contains('hidden')) startLevel(levelIndex);
  }

  function updateGas() {
    gas = state === 'play' && !paused && (pointers.size > 0 || keys.size > 0);
    if (gas && hintShown) { hintShown = false; show(hintEl, false); }
  }
  function requestJump() {
    if (state !== 'play' || paused) return;
    jumpQueued = true;
    jumpBtn.classList.add('down');
    setTimeout(() => jumpBtn.classList.remove('down'), 160);
  }
  jumpBtn.addEventListener('pointerdown', e => { e.preventDefault(); requestJump(); });

  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => { if (!e.target.closest('.panel')) e.preventDefault(); }, { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());

  function honk() {
    if (state !== 'play' && state !== 'finish') return;
    Sound.hornFor(vehicle().horn);
    car.squash = 0.5;
    hornBtn.classList.add('down');
    setTimeout(() => hornBtn.classList.remove('down'), 180);
    for (let i = 0; i < 4; i++) {
      particles.push({ type: 'note', x: car.x + 60, y: car.y + 80, vx: 60 + Math.random() * 80,
        vy: 120 + Math.random() * 80, life: 1, max: 1 });
    }
  }
  hornBtn.addEventListener('pointerdown', e => { e.preventDefault(); honk(); });

  // ---------- Ebeveyn paneli ----------
  let gearTimer = null;
  function gearCancel() { clearTimeout(gearTimer); gearTimer = null; gear.classList.remove('holding'); }
  gear.addEventListener('pointerdown', e => {
    e.preventDefault();
    gear.classList.add('holding');
    gearTimer = setTimeout(() => { gearCancel(); openParent(); }, 3000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => gear.addEventListener(ev, gearCancel));
  const optSound = $('opt-sound'), optVoice = $('opt-voice');
  const speedBtns = parentPanel.querySelectorAll('[data-speed]');
  function syncPanel() {
    optSound.checked = settings.sound;
    optVoice.checked = settings.voice;
    speedBtns.forEach(b => b.classList.toggle('on', b.dataset.speed === settings.speed));
  }
  function openParent() { paused = true; pointers.clear(); updateGas(); syncPanel(); show(parentPanel, true); }
  function closeParent() { paused = false; show(parentPanel, false); }
  optSound.addEventListener('change', () => { settings.sound = optSound.checked; Sound.setEnabled(settings.sound); saveSettings(); });
  optVoice.addEventListener('change', () => { settings.voice = optVoice.checked; Sound.setVoice(settings.voice); saveSettings(); });
  speedBtns.forEach(b => b.addEventListener('click', () => { settings.speed = b.dataset.speed; saveSettings(); syncPanel(); }));
  $('parent-close').addEventListener('click', closeParent);
  $('parent-menu').addEventListener('click', () => { closeParent(); goGarage(); });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pointers.clear(); keys.clear(); updateGas(); Sound.engineStop(); }
    else if (state === 'play' && vehicle().id !== 'bike') Sound.engineStart();
  });

  // ---------- Parçacıklar ----------
  function sparkle(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU, v = 120 + Math.random() * 220;
      particles.push({ type: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.7, max: 0.7, color });
    }
  }
  function splash(x, y, n = 30) {
    for (let i = 0; i < n; i++) {
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
    garageBounce = Math.max(0, garageBounce - dt * 3);
    if (paused || !level || (state !== 'play' && state !== 'finish')) return;

    const steps = 2, h = dt / steps;
    for (let i = 0; i < steps; i++) stepCar(h);
    jumpQueued = false;
    collect();

    const groundY = car.loop ? car.loop.gy : car.y;
    const tx = car.x - viewW * 0.3;
    const ty = groundY - viewH * (ch > cw ? 0.42 : 0.3);
    cam.x += (tx - cam.x) * Math.min(1, dt * 6);
    cam.y += (ty - cam.y) * Math.min(1, dt * 2.5);

    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
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
      if (finishTimer > 1.8 && finishEl.classList.contains('hidden')) showFinishScreen();
    }
    const v = vehicle();
    Sound.engineUpdate(Math.min(1, car.speed / (SPEEDS.normal * v.speed)) * (v.id === 'moto' ? 1.3 : 1), gas);
  }

  function stepCar(dt) {
    const v = vehicle();
    const max = (SPEEDS[settings.speed] || SPEEDS.normal) * v.speed;

    // 360° dönel rampa: araç çember üzerinde kendiliğinden döner
    if (car.loop) {
      const L = car.loop;
      L.th += L.speed * dt / L.l.r;
      car.wheel += L.speed * dt / 20;
      if (L.th >= TAU) {
        car.loop = null;
        L.l.done = true;
        car.x = L.l.x + L.l.shift / 2;
        car.y = groundH(car.x);
        car.angle = 0;
        car.vy = 0;
        car.onGround = true;
        sparkle(car.x, car.y + 60, '#fff7a8', 18);
        return;
      }
      const t = L.th / TAU;
      car.x = L.l.x - L.l.shift / 2 + L.l.shift * t + L.l.r * Math.sin(L.th);
      car.y = L.cy - L.l.r * Math.cos(L.th);
      car.angle = L.th;
      car.speed = L.speed;
      return;
    }

    const zone = zoneAt(car.x);
    const onIce = zone && zone.type === 'ice' && car.onGround;
    const slope = slopeAt(car.x);

    if (gas) car.speed += (onIce ? 160 : 300) * dt;
    else car.speed -= (onIce ? 30 : state === 'finish' ? 160 : 140) * dt;
    if (car.onGround) car.speed -= slope * 160 * v.climb * dt;
    if (gas) car.speed = Math.max(car.speed, 90);
    car.speed = Math.max(0, Math.min(car.speed, max * 1.08));

    const prevX = car.x;
    car.x += car.speed * dt;
    car.wheel += car.speed * dt / 20;

    // Dönel rampaya giriş (havadayken bile yakalanır, hiçbiri kaçmaz)
    if (state === 'play') {
      for (const l of level.loops) {
        const entry = l.x - l.shift / 2;
        if (!l.done && prevX < entry && car.x >= entry) {
          const gy = level.baseH(l.x);
          car.loop = { l, th: 0, cy: gy + l.r, gy, speed: Math.max(car.speed, 420) };
          car.x = entry; car.y = gy; car.onGround = true;
          Sound.whoosh();
          return;
        }
      }
    }

    const g = groundH(car.x);
    if (car.onGround) {
      if (jumpQueued) {
        car.onGround = false;
        car.vy = Math.max(0, slope * car.speed) + JUMP * v.fly;
        car.y = g + 1;
        Sound.jump();
        sparkle(car.x - 30, car.y + 5, '#ffffff', 8);
      } else if (car.y - g > 20) {
        // Rampanın ucundan uçuş
        car.onGround = false;
        car.vy = Math.max(car.vy, 0) + RAMP_BOOST * v.fly;
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

    let target;
    if (car.onGround) target = Math.atan((groundH(car.x + 42) - groundH(car.x - 42)) / 84);
    else target = Math.atan2(car.vy, Math.max(car.speed, 1)) * 0.35;
    target = Math.max(-0.6, Math.min(0.6, target));
    if (onIce) target += Math.sin(time * 9) * 0.05;
    // döngüden sonra açıyı 0'a yakın tut
    car.angle = ((car.angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
    car.angle += (target - car.angle) * Math.min(1, dt * (car.onGround ? 14 : 4));
    car.squash = Math.max(0, car.squash - dt * 4);

    if (state === 'play' && car.x >= level.finish) finishRace();
  }

  function carCenter() {
    return { x: car.x - Math.sin(car.angle) * 40, y: car.y + Math.cos(car.angle) * 40 };
  }

  function collect() {
    const c = carCenter();
    const g = level.def.goal;

    for (const s of stars) {
      if (s.got) continue;
      const dx = s.x - c.x, dy = s.y - c.y;
      if (dx * dx + dy * dy < 100 * 100) {
        s.got = true;
        collectedStars++;
        starCountEl.textContent = collectedStars;
        starsEl.classList.remove('bump'); void starsEl.offsetWidth; starsEl.classList.add('bump');
        Sound.star();
        sparkle(s.x, s.y, '#ffd23f');
      }
    }

    for (const it of items) {
      if (it.got) continue;
      if (it.kind === 'decoy') {
        if (it.bumped) { it.y += 60 * (1 / 60); it.bumped += 1 / 60; continue; }
        const dx = it.x - c.x, dy = it.y - (c.y + 30);
        if (dx * dx + dy * dy < 75 * 75) { it.bumped = 0.01; Sound.pop(); }
        continue;
      }
      const wanted =
        (it.kind === 'seq' && it.i === goal.next) ||
        (it.kind === 'target') ||
        (it.kind === 'gift' && it.round === goal.round);
      if (!wanted) continue;
      if (it.x - c.x < 300) it.pulled = true;
      if (it.pulled) {
        it.x += (c.x + 20 - it.x) * 0.08;
        it.y += (c.y + 40 - it.y) * 0.08;
      }
      const dx = it.x - c.x, dy = it.y - (c.y + 30);
      if (dx * dx + dy * dy < 80 * 80) {
        it.got = true;
        sparkle(it.x, it.y, it.color, 24);
        if (it.kind === 'seq') {
          fillSlot(it.i, it.color);
          Sound.number(it.i + 1);
          const word = g.words[it.i];
          setTimeout(() => Sound.say(word), 250);
          popups.push({ text: it.label, color: it.color, t: 0 });
          goal.next++;
          if (goal.next === g.labels.length && g.final) setTimeout(() => Sound.say(g.final), 1400);
        } else if (it.kind === 'target') {
          fillSlot(goal.got, it.color);
          goal.got++;
          Sound.number(goal.got);
          setTimeout(() => Sound.say(g.target), 250);
          popups.push({ text: it.label, color: it.color, t: 0 });
        } else if (it.kind === 'gift') {
          fillSlot(goal.count, it.color);
          goal.count++;
          Sound.star();
          const n = goal.count;
          setTimeout(() => Sound.say(g.words[n]), 150);
          const need = g.rounds[goal.round];
          if (goal.count >= need) {
            const sign = signs.find(s => s.round === goal.round);
            if (sign) sign.done = true;
            setTimeout(() => Sound.number(need), 500);
            popups.push({ text: String(need), color: '#2f80ed', t: -0.4 });
            goal.round++;
            goal.count = 0;
            if (goal.round < g.rounds.length) setTimeout(buildHud, 1200);
          }
        }
      }
    }

    for (const z of level.zones) {
      if (z.splashed || !car.onGround) continue;
      if ((z.type === 'puddle' || z.type === 'wave') && car.x > z.a + 30 && car.x < z.b) {
        z.splashed = true;
        Sound.splash();
        splash(car.x, groundH(car.x), z.type === 'wave' ? 45 : 30);
      }
      if (z.type === 'tunnel' && car.x > z.b - 20) {
        z.splashed = true;
        // tünel çıkışında yıldız yağmuru
        for (let k = 0; k < 18; k++) particles.push({ type: 'spark', x: car.x + Math.random() * 300, y: car.y + 250 + Math.random() * 100,
          vx: (Math.random() - 0.5) * 60, vy: -120 - Math.random() * 80, life: 1.6, max: 1.6, color: ['#ffd23f', '#fff', '#a66cff'][k % 3] });
      }
    }
  }

  // ---------- Çizim ----------
  const sx = x => (x - cam.x) * scale;
  const sy = y => (cam.y + viewH - y) * scale;
  const env = () => ({ ctx, cw, ch, scale, cam, viewW, viewH, time, sx, sy, baseH: level ? level.baseH : () => 0 });

  function starPath(x, y, r, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot - Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state === 'garage') return renderGarage();
    if (state === 'map') return renderMap();
    if (!level) return;
    const e = env();
    const theme = Themes.T[level.def.theme];
    theme.sky(e);
    theme.back(e);
    const inView = (a, b = a) => b > cam.x - 400 && a < cam.x + viewW + 400;

    for (const d of level.decor) if (inView(d.x)) Themes.decor(e, d);
    for (const z of level.zones) if (inView(z.a, z.b)) Themes.zoneBack(e, z);
    drawGround(theme.ground);
    for (const r of level.ramps) if (inView(r.x, r.x + r.len)) drawRamp(r);
    for (const l of level.loops) if (inView(l.x - 200, l.x + 200)) drawLoop(l);
    drawFinish();
    for (const z of level.zones) if (z.type !== 'tunnel' && inView(z.a, z.b)) Themes.zoneFront(e, z);
    for (const s of signs) if (inView(s.x)) drawSign(s);
    for (const it of items) if (!it.got && inView(it.x)) drawItem(it);
    for (const s of stars) if (!s.got && inView(s.x)) drawStar(s);
    for (const z of level.zones) if (z.type === 'tunnel' && inView(z.a, z.b)) Themes.tunnelShade(e, z);
    drawCar(theme.night);
    for (const z of level.zones) if (z.type === 'tunnel' && inView(z.a, z.b)) Themes.zoneFront(e, z);
    drawParticles();
    if (theme.overlay) theme.overlay(e);
    drawPopups();
    drawConfetti();
  }

  function drawGround(gs) {
    const x0 = cam.x - 20, x1 = cam.x + viewW + 20, step = 8;
    const bh = level.baseH;
    ctx.fillStyle = gs.soil;
    ctx.beginPath();
    ctx.moveTo(sx(x0), ch + 10);
    for (let x = x0; x <= x1; x += step) ctx.lineTo(sx(x), sy(bh(x)));
    ctx.lineTo(sx(x1), ch + 10);
    ctx.closePath(); ctx.fill();
    if (gs.stone) {
      ctx.fillStyle = gs.stone;
      for (let k = Math.floor(x0 / 170); k * 170 < x1; k++) {
        const x = k * 170 + ((k * 73) % 60);
        const depth = 50 + (((k * 37) % 70) + 70) % 70;
        ctx.beginPath(); ctx.ellipse(sx(x), sy(bh(x) - depth), 12 * scale, 7 * scale, 0, 0, TAU); ctx.fill();
      }
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = gs.top; ctx.lineWidth = 26 * scale;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) { const y = sy(bh(x) - 8); x === x0 ? ctx.moveTo(sx(x), y) : ctx.lineTo(sx(x), y); }
    ctx.stroke();
    ctx.strokeStyle = gs.mid; ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) { const y = sy(bh(x) + 2); x === x0 ? ctx.moveTo(sx(x), y) : ctx.lineTo(sx(x), y); }
    ctx.stroke();
    if (gs.road) {
      ctx.fillStyle = '#ffd23f';
      for (let k = Math.floor(x0 / 140); k * 140 < x1; k++) {
        const x = k * 140;
        ctx.fillRect(sx(x), sy(bh(x) - 34), 64 * scale, 6 * scale);
      }
    }
    ctx.lineCap = 'butt';
  }

  function drawRamp(r) {
    const bh = level.baseH;
    ctx.fillStyle = '#e09a3e'; ctx.strokeStyle = '#9a5a1c'; ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(sx(r.x), sy(bh(r.x)));
    for (let x = r.x; x <= r.x + r.len; x += 10) ctx.lineTo(sx(x), sy(bh(x) + ((x - r.x) / r.len) * r.h));
    ctx.lineTo(sx(r.x + r.len), sy(bh(r.x + r.len) + r.h));
    ctx.lineTo(sx(r.x + r.len), sy(bh(r.x + r.len)));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    const ex = r.x + r.len, eb = bh(ex);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(sx(ex) - 12 * scale, sy(eb + r.h), 12 * scale, r.h * scale);
    ctx.fillStyle = '#333';
    for (let k = 0; k < r.h; k += 20) ctx.fillRect(sx(ex) - 12 * scale, sy(eb + r.h - k), 12 * scale, 10 * scale);
    const mx = r.x + r.len * 0.55, my = bh(mx) + ((mx - r.x) / r.len) * r.h * 0.45;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.save();
    ctx.translate(sx(mx), sy(my));
    ctx.rotate(-Math.atan(r.h / r.len));
    const s = scale;
    ctx.beginPath();
    ctx.moveTo(-18 * s, -7 * s); ctx.lineTo(4 * s, -7 * s); ctx.lineTo(4 * s, -15 * s);
    ctx.lineTo(20 * s, 0); ctx.lineTo(4 * s, 15 * s); ctx.lineTo(4 * s, 7 * s);
    ctx.lineTo(-18 * s, 7 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawLoop(l) {
    const gy = level.baseH(l.x);
    const cy = gy + l.r;
    // destek ayakları
    ctx.fillStyle = '#8a96a0';
    for (const dx of [-l.r - 30, l.r + 20]) ctx.fillRect(sx(l.x + dx), sy(cy + 10), 12 * scale, (l.r + 10) * scale);
    // ray (araç tekerinin değdiği çemberin hemen dışında)
    const path = (rad) => {
      ctx.beginPath();
      for (let k = 0; k <= 72; k++) {
        const th = (k / 72) * TAU;
        const x = l.x - l.shift / 2 + l.shift * (k / 72) + rad * Math.sin(th);
        const y = cy - rad * Math.cos(th);
        k ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y));
      }
    };
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#c62d33'; ctx.lineWidth = 20 * scale; path(l.r + 10); ctx.stroke();
    ctx.strokeStyle = '#ff5a5f'; ctx.lineWidth = 14 * scale; path(l.r + 10); ctx.stroke();
    ctx.setLineDash([18 * scale, 18 * scale]);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * scale; path(l.r + 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
  }

  function drawFinish() {
    const fx = level.finish;
    if (fx < cam.x - 300 || fx > cam.x + viewW + 300) return;
    const fy = level.baseH(fx);
    const cell = 16;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff';
      ctx.fillRect(sx(fx - 32 + c * cell), sy(fy + 4 - r * cell * 0.5), cell * scale, cell * 0.5 * scale);
    }
    const h = 260;
    ctx.fillStyle = '#ff5a5f';
    ctx.fillRect(sx(fx - 180), sy(fy + h), 18 * scale, h * scale);
    ctx.fillRect(sx(fx + 162), sy(fy + h), 18 * scale, h * scale);
    const bw = 360, bhh = 56, cols = 12;
    for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff';
      ctx.fillRect(sx(fx - 180 + c * (bw / cols)), sy(fy + h + bhh - r * (bhh / 2)), (bw / cols) * scale + 1, (bhh / 2) * scale + 1);
    }
    const cols2 = ['#ffd23f', '#3fa7ff', '#4cd964', '#a66cff'];
    [[-195, 40], [-165, 70], [195, 40], [165, 70]].forEach(([dx, dy], i) => {
      const bob = Math.sin(time * 2 + i) * 5;
      ctx.fillStyle = cols2[i];
      ctx.beginPath(); ctx.ellipse(sx(fx + dx), sy(fy + h + dy + bob), 22 * scale, 27 * scale, 0, 0, TAU); ctx.fill();
    });
  }

  function drawSign(s) {
    const gy = level.baseH(s.x), k = scale;
    const x = sx(s.x), y = sy(gy);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - 5 * k, y - 120 * k, 10 * k, 120 * k);
    const w = (70 + s.n * 34) * k, h = 70 * k, top = y - 190 * k;
    ctx.fillStyle = s.done ? '#c9f2cf' : '#fff';
    Draw.rr(ctx, x - w / 2, top, w, h, 14 * k); ctx.fill();
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 5 * k; ctx.stroke();
    ctx.font = `900 ${Math.round(52 * k)}px -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2f80ed';
    ctx.fillText(s.n, x - w / 2 + 38 * k, top + h / 2 + 3 * k);
    for (let d = 0; d < s.n; d++) {
      ctx.fillStyle = '#e8333a';
      ctx.beginPath(); ctx.arc(x - w / 2 + 84 * k + d * 34 * k, top + h / 2, 12 * k, 0, TAU); ctx.fill();
    }
  }

  function drawItem(it) {
    if (it.kind === 'gift') return drawGift(it);
    const pulled = it.pulled || it.bumped;
    const bob = pulled ? 0 : Math.sin(time * 2.2 + it.x) * 8;
    const x = sx(it.x), y = sy(it.y + bob);
    const r = 46 * scale;
    let alpha = 1;
    if (it.bumped) alpha = Math.max(0, 1 - it.bumped * 0.8);
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    if (!pulled) {
      ctx.strokeStyle = 'rgba(60,60,60,0.6)'; ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.moveTo(x, y + r * 1.15);
      ctx.quadraticCurveTo(x + 10 * scale, y + r * 1.8, x, sy(level.baseH(it.x) + 6));
      ctx.stroke();
    }
    const glow = level.def.goal.glow || it.kind === 'target';
    if (glow) { ctx.save(); ctx.shadowColor = it.color; ctx.shadowBlur = 26 * scale; }
    ctx.fillStyle = it.color;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.15, 0, 0, TAU); ctx.fill();
    if (glow) ctx.restore();
    ctx.beginPath(); ctx.moveTo(x - 7 * scale, y + r * 1.22); ctx.lineTo(x + 7 * scale, y + r * 1.22); ctx.lineTo(x, y + r * 1.1); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.5, r * 0.18, r * 0.3, -0.5, 0, TAU); ctx.fill();
    const label = it.label;
    ctx.font = `800 ${Math.round(r * (label.length > 1 ? 0.95 : 1.25))}px -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5 * scale; ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.strokeText(label, x, y + r * 0.08);
    ctx.fillStyle = '#fff'; ctx.fillText(label, x, y + r * 0.08);
    ctx.globalAlpha = 1;
  }

  function drawGift(it) {
    const bob = it.pulled ? 0 : Math.sin(time * 3 + it.x) * 5;
    const x = sx(it.x), y = sy(it.y + bob), s = scale * 1.4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * 2 + it.x) * 0.08);
    ctx.fillStyle = it.color; Draw.rr(ctx, -18 * s, -18 * s, 36 * s, 36 * s, 5 * s); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(-4 * s, -18 * s, 8 * s, 36 * s); ctx.fillRect(-18 * s, -4 * s, 36 * s, 8 * s);
    ctx.beginPath(); ctx.ellipse(-8 * s, -22 * s, 8 * s, 5 * s, -0.4, 0, TAU); ctx.ellipse(8 * s, -22 * s, 8 * s, 5 * s, 0.4, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawStar(s) {
    const pulse = 1 + Math.sin(time * 5 + s.t) * 0.1;
    const r = 30 * scale * pulse;
    ctx.save();
    ctx.shadowColor = 'rgba(255,210,63,0.8)'; ctx.shadowBlur = 16 * scale;
    starPath(sx(s.x), sy(s.y), r, Math.sin(time * 2 + s.t) * 0.2);
    ctx.fillStyle = '#ffd23f'; ctx.fill();
    ctx.restore();
    ctx.lineWidth = 3 * scale; ctx.strokeStyle = '#e8a200'; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function drawCar(night) {
    const v = vehicle();
    ctx.save();
    ctx.translate(sx(car.x), sy(car.y));
    ctx.rotate(-car.angle);
    ctx.scale(scale * (1 + car.squash * 0.08), scale * (1 - car.squash * 0.1));
    Draw.vehicle(ctx, v.id, vehicleColor(), car.wheel, { lights: night, noShadow: !!car.loop || !car.onGround });
    if (car.speed > 200 && !car.loop) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
      const a = Math.min(1, (car.speed - 200) / 120);
      for (let k = 0; k < 3; k++) {
        const len = (20 + k * 10) * a;
        ctx.beginPath(); ctx.moveTo(-86, -70 + k * 16); ctx.lineTo(-86 - len, -70 + k * 16); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      const a = Math.max(0, p.life / p.max);
      const x = sx(p.x), y = sy(p.y);
      ctx.globalAlpha = a;
      if (p.type === 'spark') { ctx.fillStyle = p.color; starPath(x, y, 9 * scale * (0.5 + a), time * 4); ctx.fill(); }
      else if (p.type === 'drop') { ctx.fillStyle = '#6cc0f5'; ctx.beginPath(); ctx.arc(x, y, 6 * scale, 0, TAU); ctx.fill(); }
      else if (p.type === 'note') {
        ctx.fillStyle = '#7a4b00'; ctx.font = `800 ${Math.round(30 * scale)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.fillText('♪', x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPopups() {
    for (const p of popups) {
      if (p.t < 0) continue;
      const t = p.t;
      const k = t < 0.3 ? t / 0.3 : 1;
      const size = (120 + 140 * Math.sin(k * Math.PI / 2)) * scale;
      ctx.globalAlpha = Math.max(0, t > 1 ? 1 - (t - 1) / 0.4 : 1);
      ctx.font = `900 ${Math.round(size)}px -apple-system, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 14 * scale; ctx.strokeStyle = '#fff';
      ctx.strokeText(p.text, cw / 2, ch * 0.42);
      ctx.fillStyle = p.color; ctx.fillText(p.text, cw / 2, ch * 0.42);
    }
    ctx.globalAlpha = 1;
  }

  function drawConfetti() {
    for (const c of confetti) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
      ctx.fillStyle = c.color; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
  }

  // ---------- Garaj ve harita arka planları ----------
  function renderGarage() {
    const wall = ctx.createLinearGradient(0, 0, 0, ch);
    wall.addColorStop(0, '#ffe7b8'); wall.addColorStop(1, '#ffd38a');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, cw, ch);
    const s = scale;
    ctx.strokeStyle = 'rgba(180,120,40,0.18)'; ctx.lineWidth = 2;
    for (let y = 40 * s; y < ch * 0.72; y += 40 * s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }
    const floor = ch * 0.72;
    // alet panosu ve lastikler
    ctx.fillStyle = '#c98b4a'; Draw.rr(ctx, 40 * s, floor - 330 * s, 170 * s, 110 * s, 10 * s); ctx.fill();
    ctx.fillStyle = '#7b858c'; ctx.fillRect(64 * s, floor - 310 * s, 8 * s, 60 * s);
    ctx.beginPath(); ctx.arc(68 * s, floor - 310 * s, 12 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e8333a'; Draw.rr(ctx, 100 * s, floor - 308 * s, 22 * s, 56 * s, 6 * s); ctx.fill();
    ctx.fillStyle = '#2f80ed'; ctx.beginPath(); ctx.arc(165 * s, floor - 280 * s, 22 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd38a'; ctx.beginPath(); ctx.arc(165 * s, floor - 280 * s, 9 * s, 0, TAU); ctx.fill();
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = '#333'; Draw.rr(ctx, cw - 160 * s, floor - (k + 1) * 26 * s, 110 * s, 24 * s, 12 * s); ctx.fill();
      ctx.fillStyle = '#555'; Draw.rr(ctx, cw - 140 * s, floor - (k + 1) * 26 * s + 6 * s, 70 * s, 12 * s, 6 * s); ctx.fill();
    }
    ctx.fillStyle = '#9aa7b1'; ctx.fillRect(0, floor, cw, ch - floor);
    ctx.fillStyle = '#b8c3cb'; ctx.fillRect(0, floor, cw, 8 * s);
    const cx = cw / 2;
    ctx.fillStyle = '#6d7a85'; ctx.beginPath(); ctx.ellipse(cx, floor + 8 * s, 210 * s, 24 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c6d0d7'; ctx.beginPath(); ctx.ellipse(cx, floor, 210 * s, 24 * s, 0, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(cx, floor - 120 * s, 10, cx, floor - 120 * s, 280 * s);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    const v = vehicle();
    const k = 2.0 * s;
    const hop = Math.sin(garageBounce * Math.PI) * 30 * s;
    ctx.save();
    ctx.translate(cx, floor - hop);
    ctx.scale(k, k);
    Draw.vehicle(ctx, v.id, vehicleColor(), time * 2);
    ctx.restore();
  }

  function renderMap() {
    const e = { ctx, cw, ch, scale, cam: { x: time * 20, y: 0 }, viewW, viewH, time, sx, sy: y => (viewH - y) * scale };
    Themes.T.farm.sky(e);
    Themes.T.farm.back(e);
    // kıvrımlı yol
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 14 * scale; ctx.setLineDash([2, 30 * scale]); ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 0; x <= cw; x += 10) { const y = ch * 0.62 + Math.sin(x / cw * Math.PI * 2.5) * ch * 0.06; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
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
  goGarage();
  requestAnimationFrame(frame);

  // Test ve hata ayıklama için küçük bir kapı
  window.__game = {
    get state() { return state; },
    get car() { return car; },
    get stars() { return collectedStars; },
    get goal() { return goal; },
    get level() { return level; },
    startLevel, selectVehicle
  };

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
