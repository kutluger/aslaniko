// Sayı dünyası: 1-5, 6-10, sayma, ikişer sayma ve az-çok, geri sayma (final)
Worlds.register({
  id: 'sayi', name: 'Sayı dünyası', order: 2, icon: '🔢', color: '#8fd3ff', open: true,
  levels: [
    Worlds.from('orman', { id: 'sayi-1-5', stickers: ['1️⃣', '🦔', '🌲'] }),
    Worlds.from('kar', { id: 'sayi-6-10', stickers: ['🔟', '🐧', '❄️'] }),
    Worlds.level({
      id: 'sayi-say', theme: 'city', seed: 203, zone: 'tunnel',
      stickers: ['🎁', '🎈', '🧮'], scene: ['bench', 'lamp', 'citytree'],
      goal: Worlds.seq(['1', '2', '3', '4', '5'], ['bir', 'iki', 'üç', 'dört', 'beş']),
      mechanics: [
        { t: 'counter', n: 2, emoji: '🎁', word: 'hediye' },
        { t: 'traffic' },
        { t: 'counter', n: 3, emoji: '🍎', word: 'elma' },
        { t: 'animals', kinds: ['duck', 'duckling', 'duckling'], auto: true },
        { t: 'counter', n: 4, emoji: '🎈', word: 'balon' },
        { t: 'counter', n: 5, emoji: '🐤', word: 'civciv' }
      ]
    }),
    Worlds.level({
      id: 'sayi-azcok', theme: 'forest', seed: 204, zone: 'bridge',
      stickers: ['🍓', '🐿️', '🍄'], scene: ['squirrel', 'mushroom', 'squirrel'],
      goal: Worlds.seq(['2', '4', '6', '8', '10'], ['iki', 'dört', 'altı', 'sekiz', 'on']),
      mechanics: [
        { t: 'quiz', q: 'Çok elma olan yoldan git!', a: ['🍎🍎🍎', 'üç elma'], b: ['🍎', 'bir elma'] },
        { t: 'logs', n: 3 },
        { t: 'quiz', q: 'Az balon olan yoldan git!', a: ['🎈🎈🎈🎈', 'dört balon'], b: ['🎈', 'bir balon'], answer: 'b' },
        { t: 'counter', n: 2, emoji: '🍄', word: 'mantar' },
        { t: 'quiz', q: 'Çok yıldız olan yoldan git!', a: ['⭐', 'bir yıldız'], b: ['⭐⭐⭐', 'üç yıldız'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'sayi-final', theme: 'beach', seed: 205, zone: 'wave',
      stickers: ['🚀', '🐳', '🏖️'], scene: ['umbrella', 'crab', 'palm'],
      goal: Worlds.seq(['5', '4', '3', '2', '1'], ['beş', 'dört', 'üç', 'iki', 'bir'], { end: 'Beş, dört, üç, iki, bir... Hadi!' }),
      mechanics: [
        { t: 'quiz', q: 'Üç hangisi?', a: ['3', 'üç'], b: ['5', 'beş'] },
        { t: 'sea', len: 1800 },
        { t: 'counter', n: 3, emoji: '🐚', word: 'deniz kabuğu' },
        { t: 'quiz', q: 'Kaç balık var? İki olan yoldan git!', a: ['🐟🐟🐟', 'üç balık'], b: ['🐟🐟', 'iki balık'], answer: 'b' },
        { t: 'counter', n: 5, emoji: '🦀', word: 'yengeç' }
      ]
    })
  ]
});
