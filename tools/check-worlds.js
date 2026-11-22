#!/usr/bin/env node
// Dünya ve bölüm tanımlarını denetler (tarayıcı gerekmez).
// Kullanım: node tools/check-worlds.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !/themes|game|sound/.test(s));
const ctx = { console, Math, Draw: { rr() {} }, window: {} };
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8') + '\n;this.Worlds = typeof Worlds !== "undefined" ? Worlds : this.Worlds; this.buildLevel = typeof buildLevel !== "undefined" ? buildLevel : this.buildLevel;', ctx, { filename: s });
const { Worlds, buildLevel } = ctx;
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
let errors = 0;
const err = m => { errors++; console.log('HATA:', m); };
const ids = new Set();
for (const w of Worlds.list) {
  if (!w.free && w.levels.length !== 5) console.log(`not: ${w.id} dünyasında ${w.levels.length} bölüm var`);
  for (const l of w.levels) {
    if (ids.has(l.id)) err(`yinelenen bölüm kimliği ${l.id}`);
    ids.add(l.id);
    const g = l.goal;
    if (!g || g.type !== 'sequence') err(`${l.id}: hedef yok`);
    else if (g.labels.length !== g.words.length) err(`${l.id}: etiket (${g.labels.length}) ve okuma (${g.words.length}) sayısı farklı`);
    if (!l.stickers || l.stickers.length !== 3) err(`${l.id}: 3 çıkartma olmalı`);
    try {
      const lv = buildLevel(l);
      if (lv.items.length !== g.labels.length) err(`${l.id}: nesne sayısı yanlış`);
      const bad = lv.items.filter(it => it.x > lv.finish);
      if (bad.length) err(`${l.id}: ${bad.length} nesne bitişten sonra`);
    } catch (e) { err(`${l.id}: üretilemedi: ${e.message}`); }
  }
}
for (const s of scripts) if (!sw.includes(`'${s}'`)) err(`sw.js listesinde yok: ${s}`);
console.log(`${Worlds.list.length} dünya, ${ids.size} bölüm denetlendi; ${errors} hata`);
process.exit(errors ? 1 : 0);
