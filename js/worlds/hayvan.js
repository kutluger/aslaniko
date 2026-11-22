// Hayvan dünyası: çiftlik, deniz, orman, dinozorlar (DİNO), sesten bul ve yavrular (final)
Worlds.register({
  id: 'hayvan', name: 'Hayvan dünyası', order: 5, icon: '🐮', color: '#ffe0a3',
  levels: [
    Worlds.level({
      id: 'hayvan-ciftlik', theme: 'farm', seed: 501, zone: 'puddle',
      stickers: ['🐴', '🐶', '🌾'], scene: ['barn', 'cow', 'sheep'],
      goal: Worlds.seq(['🐄', '🐑', '🐔', '🐴', '🐶'], ['inek', 'koyun', 'tavuk', 'at', 'köpek']),
      mechanics: [
        { t: 'quiz', q: 'Möö! Bu ses kimin?', a: ['🐄', 'inek'], b: ['🐑', 'koyun'] },
        { t: 'animals', kinds: ['chick', 'chick', 'chick'] },
        { t: 'quiz', q: 'Hav hav! Bu ses kimin?', a: ['🐱', 'kedi'], b: ['🐶', 'köpek'], answer: 'b' },
        { t: 'animals', kinds: ['lamb', 'lamb'] },
        { t: 'quiz', q: 'Meee! Bu ses kimin?', a: ['🐑', 'koyun'], b: ['🐴', 'at'] }
      ]
    }),
    Worlds.level({
      id: 'hayvan-deniz', theme: 'beach', seed: 502, zone: 'wave',
      stickers: ['🐙', '🐢', '🦈'], scene: ['umbrella', 'crab', 'palm'],
      goal: Worlds.seq(['🐟', '🐙', '🐢', '🐬', '🦀'], ['balık', 'ahtapot', 'kaplumbağa', 'yunus', 'yengeç']),
      mechanics: [
        { t: 'sea', len: 2000 },
        { t: 'quiz', q: 'Ahtapot hangisi?', a: ['🐙', 'ahtapot'], b: ['🐢', 'kaplumbağa'] },
        { t: 'sea', len: 2400 },
        { t: 'counter', n: 3, emoji: '🐠', word: 'balık' },
        { t: 'sea', len: 2000 }
      ]
    }),
    Worlds.level({
      id: 'hayvan-orman', theme: 'forest', seed: 503, zone: 'bridge',
      stickers: ['🦉', '🐻', '🍯'], scene: ['squirrel', 'mushroom', 'squirrel'],
      goal: Worlds.seq(['🐻', '🦊', '🐿️', '🦉', '🦔'], ['ayı', 'tilki', 'sincap', 'baykuş', 'kirpi']),
      mechanics: [
        { t: 'logs', n: 3 },
        { t: 'quiz', q: 'Hu hu! Bu ses kimin?', a: ['🐻', 'ayı'], b: ['🦉', 'baykuş'], answer: 'b' },
        { t: 'logs', n: 3 },
        { t: 'counter', n: 3, emoji: '🌰', word: 'fındık' },
        { t: 'quiz', q: 'Kirpi hangisi?', a: ['🦔', 'kirpi'], b: ['🦊', 'tilki'] }
      ]
    }),
    Worlds.from('dino', { id: 'hayvan-dino', stickers: ['🦖', '🦴', '🌿'] }),
    Worlds.level({
      id: 'hayvan-final', theme: 'farm', seed: 504, zone: 'puddle',
      stickers: ['🐣', '🐾', '🏡'], scene: ['barn', 'sheep', 'cow'],
      goal: Worlds.seq(['🐔', '🐑', '🐄', '🐴', '🐱'], ['tavuk ve civciv', 'koyun ve kuzu', 'inek ve buzağı', 'at ve tay', 'kedi ve yavru kedi'], { end: 'Civciv, kuzu, buzağı, tay, yavru kedi' }),
      mechanics: [
        { t: 'quiz', q: 'Tavuğun yavrusu hangisi?', a: ['🐣', 'civciv'], b: ['🐟', 'balık'] },
        { t: 'animals', kinds: ['chick', 'chick', 'chick'] },
        { t: 'quiz', q: 'Miyav! Bu ses kimin?', a: ['🐶', 'köpek'], b: ['🐱', 'kedi'], answer: 'b' },
        { t: 'animals', kinds: ['duck', 'duckling', 'duckling'] },
        { t: 'quiz', q: 'Vak vak! Bu ses kimin?', a: ['🦆', 'ördek'], b: ['🐄', 'inek'] }
      ]
    })
  ]
});
