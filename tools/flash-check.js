#!/usr/bin/env node
// Işığa duyarlılık testi (WCAG 2.3.1 yaklaşımı). Oyunun parçası değildir, sadece geliştirme aracıdır.
// Her bölümü otomatik oynatır, saniyede 30 kare örnekler; ekranı 4x4 = 16 bölgeye ayırıp
// her bölgenin bağıl parlaklığını ve kırmızılığını izler.
// Bir "geçiş": parlaklığın son uç değerden ters yönde >= 0.10 değişmesi (koyu taraf < 0.80).
// İki geçiş = bir yanıp sönme. Herhangi bir 1 saniyede bir bölgede 3'ten fazla yanıp sönme = HATA.
// Kırmızı: kırmızı oranı (R/(R+G+B)) >= 0.8 olan doygun kırmızıya giriş-çıkış da aynı şekilde sayılır.
// Geniş bölgeler (her biri ekranın %6,25'i) WCAG'nin "küçük güvenli alan" sınırından (~%11) daha katıdır.
// Ayrıca küçük bölgeler (16x12, her biri 64 px): yerinde titreyen şeyleri yakalar (ör. eski gece şehrinde
// pencerelerin saniyede 10-11 kez yanıp sönmesi). Kayan nesneler (araç, yıldız) küçük bölgede doğal olarak
// saniyede 3-4 geçiş üretir; bu yüzden küçük bölgede HATA sınırı saniyede 5'ten fazla yanıp sönmedir.
// Saniyede 3'ü aşan küçük alan oranı bilgi olarak yazılır.
//
// Kullanım: node tools/flash-check.js [bölüm numaraları, ör. 1 5] [--seconds 60] [--world <id>|all]
// Gerekenler: Node ve Playwright (Chromium).
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const secIdx = args.indexOf('--seconds');
const SECONDS = secIdx >= 0 ? Number(args[secIdx + 1]) : 0; // 0 = bölüm bitene kadar
const levelArgs = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--seconds' && args[i - 1] !== '--world').map(n => Number(n) - 1);
// --world <id>: o dünyanın bölümleri (ör. --world duygu); --world all: serbest mod dışındaki tüm dünyalar
const worldIdx = args.indexOf('--world');
const WORLD = worldIdx >= 0 ? args[worldIdx + 1] : null;
const FPS = 30, GRID = 4, LUM_STEP = 0.1, DARK_MAX = 0.8, MAX_FLASHES = 3, FLICKER_MAX = 5, FINE_W = 16, FINE_H = 12;


// Tarayıcı içinde çalışan çözümleyici: her hücre için son uç değer, yön ve son 1 sn'deki geçişler
function analyzer(W, H, G, FPS, STEP, DARK) {
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const mk = n => ({ ref: new Float32Array(n).fill(NaN), dir: new Int8Array(n), tr: [...Array(n)].map(() => []), max: new Uint8Array(n) });
  const fine = mk(W * H), coarse = mk(G * G), red = mk(G * G);
  function feed(S, k, v, f, step, dark) {
    if (Number.isNaN(S.ref[k])) { S.ref[k] = v; return; }
    let ref = S.ref[k], dir = S.dir[k], hit = false;
    if (dir === 0) {
      // henüz yön yok: başlangıç değerinden ilk büyük sapma ilk geçiştir
      if (Math.abs(v - ref) >= step && Math.min(ref, v) < dark) { hit = true; dir = v > ref ? 1 : -1; ref = v; }
    } else {
      if (dir > 0 && v > ref) ref = v;          // yükselişte tepeyi izle
      if (dir < 0 && v < ref) ref = v;          // inişte dibi izle
      if (dir > 0 && ref - v >= step && Math.min(ref, v) < dark) { hit = true; dir = -1; ref = v; }
      else if (dir < 0 && v - ref >= step && Math.min(ref, v) < dark) { hit = true; dir = 1; ref = v; }
    }
    S.ref[k] = ref; S.dir[k] = dir;
    if (hit) {
      const t = S.tr[k]; t.push(f);
      while (f - t[0] >= FPS) t.shift();
      const fl = Math.floor(t.length / 2);
      if (fl > S.max[k]) S.max[k] = fl;
    }
  }
  const LIN = new Float32Array(256).map((_, i) => lin(i));
  return {
    sample(f) {
      // tam çözünürlükte oku ve hücrelere ortala (drawImage ile küçültmek örnekleme hatası yapar)
      const src = document.getElementById('game');
      const sw = src.width, sh = src.height;
      const d = src.getContext('2d').getImageData(0, 0, sw, sh).data;
      const fs = new Float64Array(W * H * 2);
      const cs = new Float64Array(G * G * 4);
      for (let y = 0; y < sh; y += 2) {
        const fy = Math.floor(y * H / sh) * W, gy = Math.floor(y * G / sh) * G;
        for (let i = 0; i < sw; i += 2) {
          const k = (y * sw + i) * 4, R = d[k], Gr = d[k + 1], B = d[k + 2];
          const L = 0.2126 * LIN[R] + 0.7152 * LIN[Gr] + 0.0722 * LIN[B];
          const fc = (fy + Math.floor(i * W / sw)) * 2; fs[fc] += L; fs[fc + 1]++;
          const g = (gy + Math.floor(i * G / sw)) * 4;
          cs[g] += L; cs[g + 1] += R; cs[g + 2] += Gr + B + R; cs[g + 3]++;
        }
      }
      for (let k = 0; k < W * H; k++) feed(fine, k, fs[k * 2] / fs[k * 2 + 1], f, STEP, DARK);
      for (let g = 0; g < G * G; g++) {
        feed(coarse, g, cs[g * 4] / cs[g * 4 + 3], f, STEP, DARK);
        feed(red, g, cs[g * 4 + 1] / (cs[g * 4 + 2] + 1e-6) >= 0.8 ? 1 : 0, f, 1, 2);
      }
      return __game.state;
    },
    report(limit) {
      let bad = 0, fineMax = 0;
      for (const m of fine.max) { if (m > limit) bad++; if (m > fineMax) fineMax = m; }
      const map = []; for (let y = 0; y < H; y++) map.push([...fine.max.slice(y * W, y * W + W)].map(m => m > 9 ? '#' : String(m)).join(''));
      return { coarse: Math.max(...coarse.max), red: Math.max(...red.max), fineMax, fineBadPct: 100 * bad / (W * H), map };
    }
  };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install();
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.addScriptTag({ content: analyzer.toString() });
  // Oynatılacak bölümler: [dünya kimliği, sıra]
  const worlds = WORLD === 'all' ? await page.evaluate(() => Worlds.list.filter(w => !w.free).map(w => w.id)) : [WORLD || 'serbest'];
  const runs = [];
  for (const w of worlds) {
    const count = await page.evaluate(id => Worlds.find(id).levels.length, w);
    (levelArgs.length ? levelArgs : [...Array(count).keys()]).forEach(i => runs.push([w, i]));
  }
  let failed = false;

  for (const [w, lv] of runs) {
    await page.evaluate(([w, i, a]) => { __game.startIn(w, i); window.__fa = analyzer(...a); }, [w, lv, [FINE_W, FINE_H, GRID, FPS, LUM_STEP, DARK_MAX]]);
    await page.keyboard.down('ArrowRight');
    const maxFrames = (SECONDS || 400) * FPS;
    let f = 0;
    for (; f < maxFrames; f++) {
      await page.clock.runFor(1000 / FPS);
      if (!process.env.NOJUMP && f % 45 === 44) await page.keyboard.press('Space'); // ara sıra zıpla: halkalar, efektler
      const state = await page.evaluate(n => __fa.sample(n), f);
      if (state !== 'play' && !SECONDS) break;
    }
    await page.keyboard.up('ArrowRight');
    const r = await page.evaluate(l => __fa.report(l), MAX_FLASHES);
    const ok = r.coarse <= MAX_FLASHES && r.red === 0 && r.fineMax <= FLICKER_MAX;
    if (!ok) failed = true;
    console.log(`${w === 'serbest' ? 'Bölüm' : w} ${lv + 1}: ${(f / FPS).toFixed(0)} sn | geniş alan en çok ${r.coarse}/sn | kırmızı ${r.red}/sn | ` +
      `küçük alan titreme en çok ${r.fineMax}/sn (sınır ${FLICKER_MAX}; 3/sn üstü alan %${r.fineBadPct.toFixed(1)}) -> ${ok ? 'GEÇTİ' : 'KALDI'}`);
    if (!ok && process.env.FLASH_MAP) console.log(r.map.join('\n'));
  }
  if (errors.length) { console.log('Sayfa hataları:', errors); failed = true; }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
