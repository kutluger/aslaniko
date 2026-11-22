// Dünyalar: kayıt, bölüm kısa yazımı, ilerleme ve kilit kuralları.
// Yeni dünya eklemek: js/worlds/<id>.js dosyasında Worlds.register({...}) çağır, dosyayı index.html ve sw.js listesine ekle.
// Tanımları denetlemek: node tools/check-worlds.js
const Worlds = (() => {
  const list = [];
  const COLORS = ['#ff5a5f', '#ff9f1c', '#2ec4b6', '#3fa7ff', '#a66cff', '#ff5a5f', '#2ec4b6', '#ff9f1c'];

  // w: { id, name, order, icon (emoji), color, open (baştan açık mı), free (serbest mod), levels: [...] }
  function register(w) {
    w.levels.forEach((l, i) => { l.world = w.id; l.index = i; });
    list.push(w);
    list.sort((a, b) => a.order - b.order);
    return w;
  }
  const find = id => list.find(w => w.id === id);

  // Sıralı toplama hedefi: etiketler, okunuşları, bitişte okunan söz
  function seq(labels, words, opts = {}) {
    return Object.assign({ type: 'sequence', labels, words, colors: labels.map((_, i) => COLORS[i % COLORS.length]),
      end: opts.end || words.map(w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1)).join(', ') }, opts);
  }

  // Bölüm boyunca araya serpiştirilen eğlence mekanikleri (rampa, dönel rampa...)
  const FILLERS = ['ramp', 'loop', 'tramp', 'bumps', 'megaramp', 'cannon', 'doubleloop', 'ramp', 'loop'];
  // Mekaniklerin yaklaşık genişliği (dünya birimi); bölüm uzunluğu bunlardan hesaplanır
  const WIDTH = {
    ramp: 900, megaramp: 1400, loop: 1200, doubleloop: 2000, tramp: 1150, cannon: 1500, bumps: 1150,
    puddle: 500, bridge: 550, wave: 500, ice: 800, tunnel: 950,
    animals: 900, logs: 1900, cablecar: 5400, traffic: 650, paint: 750, fruittree: 450, dino: 1300,
    fork: 2700, train: 3400, ferris: 1200, quiz: 2700, cheer: 900
  };
  const widthOf = m => {
    if (m.t === 'sea' || m.t === 'balloon') return (m.len || 2400) + 900;
    if (m.t === 'logs') return (m.n || 3) * 520 + 400;
    if (m.t === 'counter') return (m.n || 3) * 340 + 1000;
    if (m.t === 'sort') return m.items.length * 320 + 700;
    return WIDTH[m.t] || 900;
  };

  // Bölüm kısa yazımı: mekanik listesi verilir, araya eğlence mekanikleri eklenir, konumlar hesaplanır.
  // def: { id, theme, seed, goal, mechanics: [...], zone?, fillers?: [...], stickers: [3 emoji], scene?: [...] }
  function level(def) {
    const fill = def.fillers || FILLERS;
    const seq2 = [];
    let fi = (def.seed || 0) % fill.length;
    seq2.push({ t: 'ramp' });
    def.mechanics.forEach((m, i) => {
      seq2.push(Object.assign({}, m));
      seq2.push({ t: fill[fi++ % fill.length] });
      if (def.zone && i % 2 === 0) seq2.push({ t: def.zone });
    });
    seq2.push({ t: 'loop', r: 210 });
    let x = 1600;
    const placed = seq2.map(m => { const at = x; x += widthOf(m) + 650; return Object.assign(m, { at }); });
    const L = x + 2600;
    const layout = placed.map(m => { const o = Object.assign({}, m, { f: m.at / L }); delete o.at; return o; });
    return Object.assign({ amp: 70, length: L, stickers: ['⭐', '🌟', '✨'] }, def, { layout });
  }

  // Serbest mod bölümünün aynısı, yeni kimlikle (kendi yıldızı ve çıkartmaları olur)
  function from(freeId, extra = {}) {
    const base = LEVELS.find(l => l.id === freeId);
    return Object.assign({}, base, extra);
  }

  // ---------- İlerleme ----------
  const done = (S, l) => S.best[l.id] !== undefined;
  const doneCount = (S, w) => w.levels.filter(l => done(S, l)).length;
  // Erişim (ileride ücretli bölümler için tek kapı; şimdilik her şey ücretsiz)
  const Access = { isAvailable: (world, i) => true };

  // Açık dünyalar: baştan açık olanlar + en az 3 bölümü bitmiş dünya sayısı kadar sıradaki dünya
  function worldOpen(S, w) {
    if (S.allOpen || w.open || w.free) return true;
    const mastered = list.filter(x => !x.free && doneCount(S, x) >= 3).length;
    const locked = list.filter(x => !x.open && !x.free);
    return locked.indexOf(w) < mastered;
  }
  function levelOpen(S, w, i) {
    if (!Access.isAvailable(w, i)) return false;
    if (S.allOpen || i === 0) return true;
    if (w.free && i <= (S.unlocked || 0)) return true;
    return done(S, w.levels[i - 1]);
  }

  return { list, register, find, seq, level, from, done, doneCount, worldOpen, levelOpen, Access, widthOf };
})();

// Serbest mod: ilk sürümün 10 bölümü (kimlikleri değişmez, eski kayıtlar korunur)
Worlds.register({ id: 'serbest', name: 'Serbest mod', order: 0, icon: '🏁', color: '#8ed07a', free: true, levels: LEVELS });
