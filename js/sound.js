// Tüm sesler kodla üretilir (Web Audio). Ses dosyası yok, çevrimdışı çalışır.
const Sound = (() => {
  let ctx = null;
  let master = null;
  let engine = null;
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

  function tap() {
    tone(660, 0, 0.08, 'triangle', 0.2);
  }

  // Motor: alçak testere dişi + filtre, hızla tizleşir
  function engineStart() {
    if (!ctx || engine) return;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o2.type = 'square';
    o.frequency.value = 50;
    o2.frequency.value = 25;
    f.type = 'lowpass';
    f.frequency.value = 400;
    g.gain.value = 0.0;
    o.connect(f);
    o2.connect(f);
    f.connect(g).connect(master);
    o.start();
    o2.start();
    engine = { o, o2, f, g };
  }

  function engineUpdate(speed01, throttle) {
    if (!engine) return;
    const t = ctx.currentTime;
    const freq = 45 + speed01 * 70 + (throttle ? 10 : 0);
    engine.o.frequency.setTargetAtTime(freq, t, 0.1);
    engine.o2.frequency.setTargetAtTime(freq / 2, t, 0.1);
    engine.f.frequency.setTargetAtTime(300 + speed01 * 500, t, 0.1);
    engine.g.gain.setTargetAtTime(0.05 + speed01 * 0.05 + (throttle ? 0.02 : 0), t, 0.15);
  }

  function engineStop() {
    if (!engine) return;
    const e = engine;
    engine = null;
    e.g.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    setTimeout(() => { e.o.stop(); e.o2.stop(); }, 500);
  }

  // ---- Türkçe sesli okuma (cihazın kendi sesi) ----
  let voiceOn = true;
  let trVoice = null;

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
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function setVoice(on) { voiceOn = on; }

  return { unlock, setEnabled, setVoice, star, number, horn, splash, boing, land, fanfare, tap,
           engineStart, engineUpdate, engineStop, say };
})();
