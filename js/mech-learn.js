// Öğretici mekanikler (dünyalar için). Her biri Mech.register ile kaydolur; yeni bir mekanik
// eklemek için bu dosyaya (ya da yeni bir dosyaya) aynı biçimde bir tanım eklemek yeterli.
// Kurallar: yanlış seçim cezası yok, süre baskısı yok; çocuk bir şey yapmasa da her şey birkaç saniyede kendiliğinden ilerler.
(() => {
  const { ellipse, circle, drawEmoji, isEmoji, smooth } = Mech;
  const G = () => Mech.game();
  const NUM = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'];
  const cap = w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1);
  const FONT = '-apple-system, "Segoe UI", Roboto, sans-serif';

  // Etiket çizimi: emoji ise emoji, değilse kalın yazı
  function label(ctx, text, x, y, size, color = '#fff') {
    if (isEmoji(text) && !/^[A-Za-zÇĞİÖŞÜçğıöşü0-9]+$/.test(text)) {
      const n = [...text.replace(/\uFE0F/g, '')].length;
      if (n > 1) size *= 1.7 / (n + 0.7);
      ctx.font = `${Math.round(size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + size * 0.06);
    } else {
      ctx.font = `900 ${Math.round(size * (text.length > 2 ? 0.6 : 0.85))}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = color; ctx.fillText(text, x, y + size * 0.05);
    }
  }
  // Toplama: araç merkezine yakınsa true
  function near(x, y, r = 115) { const c = G().carCenter(); const dx = x - c.x, dy = y - c.y; return dx * dx + dy * dy < r * r; }

  // ---------- quiz: sesli yol ayrımı / ses bulmacası ----------
  // { t:'quiz', q:'Kırmızı olanı seç', a:['🍎','elma'], b:['🍌','muz'], answer:'a' }
  // a = üst yol (mavi), b = düz yol (turuncu). Doğru yolda +5, yanlışta +1 ve doğru cevap nazikçe söylenir.
  const F = Mech.TYPES.fork;
  const quiz = Object.assign({}, F, {
    layout(it, x, def) {
      const m = F.layout(it, x, def);
      Object.assign(m.special, { type: 'quiz', q: it.q, a: it.a, b: it.b, answer: it.answer || 'a', after: it.after });
      return m;
    },
    reset(s) { F.reset(s); s.auto = false; },
    update(s, dt) {
      const c = G().car;
      if (!s.choice && s.x - c.x < 450) {
        if (!s.asked) { s.asked = true; G().askPath(s, { up: s.a[0], down: s.b[0], say: s.q }); }
        s.wait += dt;
        if (s.wait > 8) { // çocuk seçmezse doğru yol gösterilir
          const right = s.answer === 'a' ? s.a : s.b;
          s.auto = true;
          quiz.choose(s, s.answer === 'a' ? 'up' : 'down');
          G().say('Hadi ' + right[1] + ' yolundan gidelim!');
        }
      }
    },
    choose(s, which) {
      if (s.choice) return;
      s.choice = which;
      G().askPath(null);
      const picked = which === 'up' ? s.a : s.b, right = s.answer === 'a' ? s.a : s.b;
      const ok = picked === right;
      if (s.auto) { G().addBonus(2, '#ffd23f'); return; }
      G().sound(ok ? 'ding' : 'pop');
      if (ok) { G().addBonus(5, '#ffd23f'); G().say('Evet! ' + cap(right[1]) + (s.after ? '. ' + s.after : '!')); }
      else { G().addBonus(1, '#ffd23f'); G().say('Bu ' + picked[1] + '. ' + cap(right[1]) + ' öbür yoldaydı.'); }
    },
    drawBack(e, s) {
      F.drawBack(e, s);
      // yol ayrımı tabelasındaki okların üstüne seçenekleri yaz
      const { ctx, scale: sc } = e;
      const gx = e.sx(s.x - 120), gy = e.sy(s.level);
      ctx.fillStyle = '#4ea8ff'; Draw.rr(ctx, gx - 46 * sc, gy - 256 * sc, 92 * sc, 56 * sc, 12 * sc); ctx.fill();
      ctx.fillStyle = '#ff9f1c'; Draw.rr(ctx, gx - 46 * sc, gy - 196 * sc, 92 * sc, 56 * sc, 12 * sc); ctx.fill();
      label(ctx, s.a[0], gx, gy - 228 * sc, 46 * sc);
      label(ctx, s.b[0], gx, gy - 168 * sc, 46 * sc);
      // üst yolun girişinde ve düz yolda büyük seçenek balonları
      const a = s.x + 60;
      const bubble = (wx, wy, text, col) => {
        const x = e.sx(wx), y = e.sy(wy);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 46 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * sc; ctx.stroke();
        label(ctx, text, x, y, 54 * sc);
      };
      bubble(a + 520, s.level + 220 + 150, s.a[0], '#4ea8ff');
      bubble(a + 600, s.level + 150, s.b[0], '#ff9f1c');
    }
  });
  Mech.register('quiz', quiz);

  // ---------- counter: sayma tabelası ----------
  // { t:'counter', n:3, emoji:'🎁', word:'hediye' } Tabelada sayı ve noktalar; nesneler yolda, her biri sayılarak toplanır.
  Mech.register('counter', {
    layout(it, x) {
      const n = it.n || 3;
      return { special: { type: 'counter', x, n, emoji: it.emoji || '🎁', word: it.word || '', got: 0 },
        flats: [[x - 400, x + 400 + n * 260 + 300]], busy: [[x - 250, x + 300 + n * 260 + 200]] };
    },
    after(s, baseH) { s.items = []; for (let k = 0; k < s.n; k++) { const ix = s.x + 360 + k * 260; s.items.push({ x: ix, y: baseH(ix) + 70, got: false }); } },
    reset(s) { s.got = 0; s.done = false; (s.items || []).forEach(i => { i.got = false; }); },
    update(s) {
      for (const it of s.items) {
        if (it.got || !near(it.x, it.y)) continue;
        it.got = true; s.got++;
        G().say(cap(NUM[s.got] || String(s.got)));
        G().popup(String(s.got), '#2f80ed');
        G().sparkle(it.x, it.y, '#ffd23f', 12);
        G().sound('pop');
        if (s.got === s.n && !s.done) {
          s.done = true;
          setTimeout(() => G().say(cap(NUM[s.n] || String(s.n)) + (s.word ? ' ' + s.word : '') + '! Aferin!'), 900);
          G().addBonus(s.n, '#2f80ed');
        }
      }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const x = e.sx(s.x), y = e.sy(gy);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - 6 * sc, y - 170 * sc, 12 * sc, 170 * sc);
      ctx.fillStyle = '#fff'; Draw.rr(ctx, x - 80 * sc, y - 300 * sc, 160 * sc, 140 * sc, 18 * sc); ctx.fill();
      ctx.strokeStyle = '#2f80ed'; ctx.lineWidth = 6 * sc; ctx.stroke();
      ctx.font = `900 ${Math.round(72 * sc)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#2f80ed'; ctx.fillText(String(s.n), x, y - 250 * sc);
      const per = Math.min(s.n, 5);
      for (let k = 0; k < s.n; k++) {
        const row = Math.floor(k / per), col = k % per, cols = Math.min(per, s.n - row * per);
        circle(ctx, x + (col - (cols - 1) / 2) * 24 * sc, y - (196 - row * 20) * sc, 8 * sc, k < s.got ? '#ffd23f' : '#c9d6e3');
      }
      for (const it of s.items) {
        if (it.got) continue;
        const bob = e.calm ? 0 : Math.sin(e.time * 2 + it.x) * 5;
        drawEmoji(ctx, s.emoji, e.sx(it.x), e.sy(it.y - 30 + bob), 64 * sc);
      }
    }
  });

  // ---------- sort: iki sepet (römorkta iki bölme) ----------
  // { t:'sort', cats:[['🍎','meyve'],['🥕','sebze']], items:[['🍐','armut',0],['🥒','salatalık',1]] }
  Mech.register('sort', {
    layout(it, x) {
      const n = it.items.length;
      return { special: { type: 'sort', x, cats: it.cats, list: it.items },
        flats: [[x - 300, x + n * 320 + 400]], busy: [[x - 200, x + n * 320 + 200]] };
    },
    after(s, baseH) { s.items = s.list.map(([emoji, word, cat], k) => { const ix = s.x + 200 + k * 320; return { x: ix, y: baseH(ix) + 70, emoji, word, cat, got: false, fly: 0 }; }); },
    reset(s) { s.bins = [[], []]; (s.items || []).forEach(i => { i.got = false; i.fly = 0; }); },
    update(s, dt) {
      for (const it of s.items) {
        if (it.got) { if (it.fly < 1) it.fly = Math.min(1, it.fly + dt * 2); continue; }
        if (!near(it.x, it.y)) continue;
        it.got = true; it.fly = 0;
        s.bins[it.cat].push(it.emoji);
        G().say(cap(it.word) + ', ' + s.cats[it.cat][1] + '!');
        G().sound('pop');
        G().addBonus(1, it.cat ? '#ff9f1c' : '#5cd38a');
      }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      for (const it of s.items) {
        if (it.got) continue;
        const bob = e.calm ? 0 : Math.sin(e.time * 2 + it.x) * 5;
        drawEmoji(ctx, it.emoji, e.sx(it.x), e.sy(it.y - 30 + bob), 64 * sc);
      }
      // başlangıçta iki sepet tabelası
      const gy = e.baseH(s.x - 120), x = e.sx(s.x - 120), y = e.sy(gy);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - 5 * sc, y - 150 * sc, 10 * sc, 150 * sc);
      [['#5cd38a', -55], ['#ff9f1c', 55]].forEach(([col, dx], k) => {
        ctx.fillStyle = col; Draw.rr(ctx, x + dx * sc - 50 * sc, y - 250 * sc, 100 * sc, 90 * sc, 14 * sc); ctx.fill();
        label(ctx, s.cats[k][0], x + dx * sc, y - 205 * sc, 56 * sc);
      });
    },
    // iki bölmeli römork (araç yerel koordinatında)
    carDraw(ctx, s) {
      ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-95, -24); ctx.lineTo(-130, -24); ctx.stroke();
      ['#5cd38a', '#ff9f1c'].forEach((col, k) => {
        const bx = -270 + k * 72;
        ctx.fillStyle = col; Draw.rr(ctx, bx, -80, 68, 62, 10); ctx.fill();
        ctx.font = '30px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.85; ctx.fillText(s.cats[k][0], bx + 34, -48); ctx.globalAlpha = 1;
        (s.bins ? s.bins[k] : []).slice(-6).forEach((em, i) => {
          ctx.font = '26px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
          ctx.fillText(em, bx + 14 + (i % 3) * 20, -92 - Math.floor(i / 3) * 20);
        });
      });
      circle(ctx, -200, -14, 18, '#333'); circle(ctx, -200, -14, 8, '#bbb');
    }
  });

  // ---------- cheer: duygular (yolda duygulu bir yüz; korna ya da nefes ile neşelenir) ----------
  // { t:'cheer', from:'😢', to:'😊', say:'Üzgün. Korna çalıp neşelendirelim!', done:'Mutlu oldu!', breathe:false }
  Mech.register('cheer', {
    layout(it, x) {
      return { special: { type: 'cheer', x, from: it.from || '😢', to: it.to || '😊', say: it.say || '', doneSay: it.done || 'Mutlu oldu!', breathe: !!it.breathe, state: 'wait', t: 0, wait: 0, p: 0 },
        flats: [[x - 500, x + 500]], busy: [[x - 360, x + 260]] };
    },
    reset(s) { s.state = 'wait'; s.t = 0; s.wait = 0; s.p = 0; s.said = false; },
    limit(s) { return s.state === 'wait' || s.state === 'breath' ? s.x - 240 : Infinity; },
    honk(s) { const c = G().car; if (!s.breathe && s.state === 'wait' && s.x - c.x < 1100 && s.x - c.x > -100) cheerUp(s); },
    update(s, dt) {
      const c = G().car;
      s.t += dt;
      if (s.state === 'wait') {
        if (s.x - c.x < 700 && !s.said) { s.said = true; if (s.say) G().say(s.say); }
        if (s.x - c.x < 520) s.wait += dt;
        if (s.breathe && s.wait > 0.5) { s.state = 'breath'; s.t = 0; G().say('Birlikte yavaşça nefes alalım. Al... ver...'); }
        else if (!s.breathe && s.wait > 6) cheerUp(s);
        if (!s.breathe) G().hornHint(s.x - c.x < 1000 && s.x - c.x > 0);
      } else if (s.state === 'breath') {
        if (s.t > 8) cheerUp(s);
      } else if (s.state === 'happy') {
        s.p = Math.min(1, s.p + dt / 2.2);
      }
    },
    drawBack(e, s) {
      const { ctx, scale: sc } = e;
      const gy = e.baseH(s.x);
      const p = smooth(s.p);
      const wx = s.x + p * 180, wy = gy + p * 120;
      const size = (110 - p * 30) * sc;
      if (s.state === 'breath') { // yavaşça büyüyüp küçülen nefes halkası (4 sn al, 4 sn ver; yanıp sönmez)
        const k = 0.5 - 0.5 * Math.cos(s.t * Math.PI / 4);
        ctx.fillStyle = 'rgba(143,211,255,0.35)';
        ctx.beginPath(); ctx.arc(e.sx(wx), e.sy(wy + 60), (70 + k * 70) * sc, 0, Math.PI * 2); ctx.fill();
      }
      drawEmoji(ctx, s.state === 'happy' ? s.to : s.from, e.sx(wx), e.sy(wy), size);
      if (s.state === 'wait' && !s.breathe && s.x - G().car.x < 1100) Mech.hornBubble(e, s.x + 20, gy + 200);
    }
  });
  function cheerUp(s) {
    if (s.state === 'happy') return;
    s.state = 'happy'; s.p = 0;
    G().sound('ding');
    G().say(s.doneSay);
    G().addBonus(3, '#ffd23f');
  }
})();
