// Tüm sesler kodla üretilir (Web Audio). Ses dosyası yok, çevrimdışı çalışır.
const Sound = (() => {
  let ctx = null;
  let master = null;
  let enabled = true;

  // iOS sesi ancak bir dokunuştan sonra açar; Başla düğmesinde çağrılır.
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? 0.8 : 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    startMusic();
  }

  function setEnabled(on) {
    enabled = on;
    if (master) master.gain.value = on ? 0.8 : 0;
  }

  function tone(freq, start, dur, type = 'sine', vol = 0.3, slideTo = null) {
    if (!ctx) return;
    const t = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(start, dur, vol = 0.3, filterFreq = 1200) {
    if (!ctx) return;
    const t = ctx.currentTime + start;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(master);
    src.start(t);
  }

  // Yıldız: kısa parlak "ding"
  function star() {
    tone(1320, 0, 0.12, 'triangle', 0.25);
    tone(1760, 0.06, 0.18, 'triangle', 0.2);
  }

  // Sayı balonu: her sayıda biraz daha tiz bir melodi
  function number(n) {
    const base = [523, 587, 659, 698, 784][(n - 1) % 5];
    tone(base, 0, 0.18, 'square', 0.12);
    tone(base * 1.5, 0.1, 0.25, 'triangle', 0.22);
    tone(base * 2, 0.2, 0.3, 'sine', 0.18);
  }

  function horn() {
    tone(392, 0, 0.18, 'square', 0.14);
    tone(494, 0, 0.18, 'square', 0.1);
    tone(392, 0.24, 0.26, 'square', 0.14);
    tone(494, 0.24, 0.26, 'square', 0.1);
  }

  function splash() {
    noise(0, 0.45, 0.35, 900);
    tone(300, 0, 0.2, 'sine', 0.12, 120);
  }

  function boing() {
    tone(180, 0, 0.25, 'sine', 0.25, 420);
  }

  function land() {
    noise(0, 0.12, 0.25, 400);
  }

  function fanfare() {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => tone(f, i * 0.13, i === 5 ? 0.6 : 0.16, 'triangle', 0.25));
    noise(0.8, 0.9, 0.12, 3000); // alkış benzeri hışırtı
  }

  function jump() {
    tone(260, 0, 0.22, 'sine', 0.25, 620);
    tone(520, 0.05, 0.15, 'triangle', 0.1, 900);
  }

  function pop() {
    tone(900, 0, 0.08, 'sine', 0.18, 300);
  }

  function whoosh() {
    noise(0, 1.2, 0.2, 1800);
    tone(300, 0, 1.0, 'sine', 0.12, 700);
  }

  // Araç kornaları
  function hornFor(type) {
    if (type === 'bike') {
      tone(1568, 0, 0.12, 'sine', 0.22); tone(2093, 0, 0.12, 'sine', 0.12);
      tone(1568, 0.16, 0.25, 'sine', 0.22); tone(2093, 0.16, 0.25, 'sine', 0.12);
    } else if (type === 'moto') {
      tone(140, 0, 0.6, 'sawtooth', 0.14, 420);
    } else if (type === 'atv') {
      tone(660, 0, 0.12, 'square', 0.12); tone(660, 0.18, 0.12, 'square', 0.12);
    } else {
      horn();
    }
  }

  function boom() {
    noise(0, 0.6, 0.5, 600);
    tone(110, 0, 0.5, 'sine', 0.4, 40);
  }

  function turbo() {
    tone(200, 0, 0.5, 'sawtooth', 0.12, 900);
    noise(0, 0.5, 0.15, 2500);
  }

  function ring() {
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.06, 0.2, 'triangle', 0.2));
  }

  function flip() {
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.18, 'square', 0.08));
  }

  function bounce() {
    tone(150, 0, 0.35, 'sine', 0.35, 600);
    tone(300, 0.05, 0.3, 'triangle', 0.12, 1200);
  }

  function tap() {
    tone(660, 0, 0.08, 'triangle', 0.2);
  }

  // ---- Arka müzik: sakin bir müzik kutusu melodisi (96 BPM, Do majör pentatonik), döngüde çalar ----
  // Notalar kodla üretilir; harf/sayı sesli okunurken müzik bir anlığına kısılır.
  const BPM = 96, BEAT = 60 / BPM;
  const N = { C3: 130.81, D3: 146.83, E3: 164.81, F2: 87.31, G2: 98.0, A2: 110.0, G3: 196.0,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5 };
  const parse = str => str.trim().split(/\s+/).map(tok => { const [n, d] = tok.split(':'); return [n === '-' ? 0 : N[n], +d]; });
  const MELODY = parse('E5:1 G5:1 A5:1 G5:1 E5:1 D5:1 C5:2 D5:1 E5:1 G5:1 E5:1 D5:2 -:2 ' +
    'E5:1 G5:1 A5:1 C6:1 A5:1 G5:1 E5:2 D5:1 E5:1 D5:1 C5:1 C5:2 -:2');
  const BASS = parse('C3:2 G3:2 A2:2 E3:2 F2:2 C3:2 G2:2 D3:2 C3:2 G3:2 A2:2 E3:2 F2:2 C3:2 G2:2 D3:2');
  const MUSIC_VOL = 0.5, DUCK_VOL = 0.15;
  let musicOn = true, musicGain = null, musicTimer = null, musicStart = 0, nextIdx = [0, 0], nextTime = [0, 0], duckTimer = null;

  function boxNote(freq, t, vol, bass) {
    const dur = bass ? 1.6 : 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(musicGain);
    const partials = bass ? [[1, 1], [2, 0.2]] : [[1, 1], [2, 0.35], [4.01, 0.1]];
    partials.forEach(([m, a]) => {
      const o = ctx.createOscillator(), ga = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq * m; ga.gain.value = a;
      o.connect(ga).connect(g);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  // Küçük bir ileriye bakan zamanlayıcı: notaları 0.4 sn önceden yerleştirir
  function musicTick() {
    if (!ctx || !musicGain) return;
    const ahead = ctx.currentTime + 0.4;
    [[MELODY, 0.16, false], [BASS, 0.07, true]].forEach(([seq, vol, bass], k) => {
      while (nextTime[k] < ahead) {
        const [f, d] = seq[nextIdx[k]];
        if (f && nextTime[k] >= ctx.currentTime - 0.05) boxNote(f, Math.max(nextTime[k], ctx.currentTime), vol, bass);
        nextTime[k] += d * BEAT;
        nextIdx[k] = (nextIdx[k] + 1) % seq.length;
      }
    });
  }

  function startMusic() {
    if (!ctx || musicTimer || !musicOn) return;
    if (!musicGain) {
      musicGain = ctx.createGain();
      musicGain.connect(master);
    }
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(MUSIC_VOL, ctx.currentTime + 1.5);
    nextIdx = [0, 0];
    nextTime = [ctx.currentTime + 0.1, ctx.currentTime + 0.1];
    musicTick();
    musicTimer = setInterval(musicTick, 100);
  }

  function stopMusic() {
    clearInterval(musicTimer); musicTimer = null;
    if (musicGain) {
      musicGain.gain.cancelScheduledValues(ctx.currentTime);
      musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    }
  }

  function setMusic(on) {
    musicOn = on;
    if (on) startMusic(); else stopMusic();
  }

  // Sesli okuma sırasında müziği kıs, sonra yavaşça geri aç
  function duck(ms) {
    if (!musicGain || !musicTimer) return;
    const t = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setTargetAtTime(DUCK_VOL, t, 0.08);
    clearTimeout(duckTimer);
    duckTimer = setTimeout(unduck, ms);
  }
  function unduck() {
    clearTimeout(duckTimer);
    if (!musicGain || !musicTimer) return;
    musicGain.gain.setTargetAtTime(MUSIC_VOL, ctx.currentTime, 0.4);
  }

  // Uygulama arka plana geçince sesi tamamen durdur
  function setHidden(hidden) {
    if (!ctx) return;
    if (hidden) { clearInterval(musicTimer); musicTimer = null; ctx.suspend(); }
    else { ctx.resume().then(() => { if (musicOn) startMusic(); }); }
  }

  // ---- Türkçe sesli okuma (cihazın kendi sesi) ----
  let voiceOn = true;
  let trVoice = null;

  // Bölüm mekanikleri için kısa, yumuşak efektler
  function fx(name) {
    switch (name) {
      case 'quack': tone(520, 0, 0.09, 'triangle', 0.16, 380); tone(500, 0.14, 0.09, 'triangle', 0.16, 360); break;
      case 'click': tone(660, 0, 0.05, 'triangle', 0.15); tone(880, 0.07, 0.06, 'triangle', 0.15); break;
      case 'ding': tone(1175, 0, 0.35, 'sine', 0.16); tone(1568, 0.08, 0.4, 'sine', 0.1); break;
      case 'roar': tone(170, 0, 0.5, 'triangle', 0.22, 120); tone(230, 0.05, 0.45, 'sine', 0.12, 160); break;
      case 'whistle': tone(1320, 0, 0.25, 'sine', 0.14); tone(1100, 0.28, 0.35, 'sine', 0.14); break;
      case 'pop': pop(); break;
      case 'sticker': [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.25, 'sine', 0.16)); break;
    }
  }
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = speechSynthesis.getVoices();
    trVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('tr')) || null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  function say(text) {
    if (!voiceOn || !enabled || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    if (trVoice) u.voice = trVoice;
    u.rate = 0.85;
    u.pitch = 1.2;
    u.onend = u.onerror = unduck;
    duck(Math.min(6000, 1200 + text.length * 120)); // onend gelmezse yine de geri açılır
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function setVoice(on) { voiceOn = on; }

  return { fx, unlock, setEnabled, setVoice, star, number, horn, hornFor, jump, pop, whoosh, boom, turbo, ring, flip, bounce, splash, boing, land, fanfare, tap,
           setMusic, setHidden, say };
})();
