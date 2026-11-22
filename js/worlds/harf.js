// Harf dünyası: sesli harfler, ASLAN, kısa kelime (DENİZ), baş harf, final (AFERİN)
Worlds.register({
  id: 'harf', name: 'Harf dünyası', order: 1, icon: '🔤', color: '#ffd166', open: true,
  levels: [
    Worlds.level({
      id: 'harf-sesli', theme: 'farm', seed: 201, zone: 'puddle',
      stickers: ['🅰️', '🐣', '🌼'], scene: ['barn', 'flowers', 'sheep'],
      goal: Worlds.seq(['A', 'E', 'I', 'İ', 'O'], ['a', 'e', 'ı', 'i', 'o'], { end: 'A, e, ı, i, o' }),
      mechanics: [
        { t: 'quiz', q: 'A harfi hangisi?', a: ['A', 'a'], b: ['E', 'e'] },
        { t: 'animals', kinds: ['chick', 'chick', 'chick'] },
        { t: 'quiz', q: 'O harfi hangisi?', a: ['İ', 'i'], b: ['O', 'o'], answer: 'b' },
        { t: 'animals', kinds: ['lamb', 'lamb'] },
        { t: 'quiz', q: 'I harfi hangisi?', a: ['I', 'ı'], b: ['A', 'a'] }
      ]
    }),
    Worlds.from('ciftlik', { id: 'harf-aslan', stickers: ['🦁', '🐄', '🚜'] }),
    Worlds.from('sahil', { id: 'harf-deniz', stickers: ['🌊', '⛵', '🐠'] }),
    Worlds.level({
      id: 'harf-bas', theme: 'orchard', seed: 202, zone: 'puddle',
      stickers: ['🐝', '🐟', '🍋'], scene: ['appletree', 'fence', 'appletree'],
      goal: Worlds.seq(['A', 'B', 'E', 'K', 'L'], ['a, arı', 'be, balık', 'e, elma', 'ke, kedi', 'le, limon'], { end: 'Arı, balık, elma, kedi, limon' }),
      mechanics: [
        { t: 'quiz', q: 'Hangisi A ile başlar?', a: ['🐝', 'arı'], b: ['🐟', 'balık'] },
        { t: 'fruittree', fruit: 0 },
        { t: 'quiz', q: 'Hangisi B ile başlar?', a: ['🍎', 'elma'], b: ['🐟', 'balık'], answer: 'b' },
        { t: 'logs', n: 2 },
        { t: 'quiz', q: 'Hangisi K ile başlar?', a: ['🐱', 'kedi'], b: ['🍋', 'limon'] }
      ]
    }),
    Worlds.from('lunapark', { id: 'harf-aferin', stickers: ['🎠', '🎪', '🎉'] })
  ]
});
