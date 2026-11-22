// Meyve ve sebze dünyası: ELMA, sebzeler, renkleriyle eşle, iki sepet, pazar (final)
Worlds.register({
  id: 'meyve', name: 'Meyve ve sebze dünyası', order: 3, icon: '🍎', color: '#b5e3a1',
  levels: [
    Worlds.from('bahce', { id: 'meyve-elma', stickers: ['🍏', '🧺', '🐛'] }),
    Worlds.level({
      id: 'meyve-sebze', theme: 'farm', seed: 301, zone: 'puddle',
      stickers: ['🥕', '🌽', '🐰'], scene: ['barn', 'fence', 'flowers'],
      goal: Worlds.seq(['🥕', '🍅', '🫑', '🌽', '🥒'], ['havuç', 'domates', 'biber', 'mısır', 'salatalık']),
      mechanics: [
        { t: 'quiz', q: 'Havuç hangisi?', a: ['🥕', 'havuç'], b: ['🍌', 'muz'] },
        { t: 'animals', kinds: ['piglet', 'piglet'] },
        { t: 'counter', n: 3, emoji: '🥕', word: 'havuç' },
        { t: 'quiz', q: 'Mısır hangisi?', a: ['🍅', 'domates'], b: ['🌽', 'mısır'], answer: 'b' },
        { t: 'animals', kinds: ['chick', 'chick'] }
      ]
    }),
    Worlds.level({
      id: 'meyve-renk', theme: 'orchard', seed: 302, zone: 'puddle',
      stickers: ['🍓', '🍋', '🍇'], scene: ['appletree', 'flowers', 'appletree'],
      goal: Worlds.seq(['🍓', '🍊', '🍋', '🍏', '🍇'], ['çilek, kırmızı', 'portakal, turuncu', 'limon, sarı', 'elma, yeşil', 'üzüm, mor'], { end: 'Kırmızı, turuncu, sarı, yeşil, mor' }),
      mechanics: [
        { t: 'quiz', q: 'Kırmızı olanı seç!', a: ['🍓', 'çilek'], b: ['🍋', 'limon'] },
        { t: 'fruittree', fruit: 3 },
        { t: 'quiz', q: 'Sarı olanı seç!', a: ['🍇', 'üzüm'], b: ['🍌', 'muz'], answer: 'b' },
        { t: 'fruittree', fruit: 1 },
        { t: 'quiz', q: 'Mor olanı seç!', a: ['🍇', 'üzüm'], b: ['🍊', 'portakal'] }
      ]
    }),
    Worlds.level({
      id: 'meyve-sepet', theme: 'orchard', seed: 303, zone: 'puddle',
      stickers: ['🧺', '🥦', '🍐'], scene: ['fence', 'appletree', 'fence'],
      goal: Worlds.seq(['M', 'E', 'Y', 'V', 'E'], ['me', 'e', 'ye', 've', 'e'], { final: 'Meyve!', end: 'Meyve' }),
      mechanics: [
        { t: 'sort', cats: [['🍎', 'meyve'], ['🥕', 'sebze']], items: [['🍐', 'armut', 0], ['🥒', 'salatalık', 1], ['🍌', 'muz', 0], ['🍅', 'domates', 1]] },
        { t: 'logs', n: 2 },
        { t: 'sort', cats: [['🍎', 'meyve'], ['🥕', 'sebze']], items: [['🌽', 'mısır', 1], ['🍓', 'çilek', 0], ['🥦', 'brokoli', 1], ['🍑', 'şeftali', 0]] },
        { t: 'quiz', q: 'Hangisi sebze?', a: ['🍉', 'karpuz'], b: ['🥕', 'havuç'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'meyve-pazar', theme: 'city', seed: 304, zone: 'tunnel',
      stickers: ['🛒', '🍉', '🥬'], scene: ['bench', 'lamp', 'citytree'],
      goal: Worlds.seq(['P', 'A', 'Z', 'A', 'R'], ['pe', 'a', 'ze', 'a', 're'], { final: 'Pazar!', end: 'Pazar' }),
      mechanics: [
        { t: 'counter', n: 3, emoji: '🍉', word: 'karpuz' },
        { t: 'traffic' },
        { t: 'sort', cats: [['🍎', 'meyve'], ['🥕', 'sebze']], items: [['🍒', 'kiraz', 0], ['🫑', 'biber', 1], ['🍍', 'ananas', 0], ['🥬', 'marul', 1]] },
        { t: 'quiz', q: 'Turuncu olanı seç!', a: ['🍊', 'portakal'], b: ['🍏', 'yeşil elma'] },
        { t: 'counter', n: 4, emoji: '🍋', word: 'limon' }
      ]
    })
  ]
});
