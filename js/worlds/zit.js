// Karşıtlıklar dünyası: büyük-küçük, yukarı-aşağı, hızlı-yavaş, sıcak-soğuk, final
Worlds.register({
  id: 'zit', name: 'Karşıtlıklar dünyası', order: 6, icon: '↕️', color: '#cdb4ff',
  levels: [
    Worlds.level({
      id: 'zit-buyuk', theme: 'dino', seed: 601, zone: 'puddle',
      stickers: ['🐘', '🐭', '🦒'], scene: ['egg', 'fern', 'egg'],
      goal: Worlds.seq(['🐘', '🐭', '🌳', '🌱'], ['büyük fil', 'küçük fare', 'büyük ağaç', 'küçük filiz'], { end: 'Büyük, küçük, büyük, küçük' }),
      mechanics: [
        { t: 'quiz', q: 'Büyük olanı seç!', a: ['🐘', 'fil'], b: ['🐭', 'fare'] },
        { t: 'dino' },
        { t: 'quiz', q: 'Küçük olanı seç!', a: ['🦒', 'zürafa'], b: ['🐜', 'karınca'], answer: 'b' },
        { t: 'logs', n: 2 },
        { t: 'quiz', q: 'Büyük olanı seç!', a: ['🐞', 'uğur böceği'], b: ['🐳', 'balina'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'zit-yukari', theme: 'clouds', seed: 602,
      stickers: ['🪁', '🎈', '🪂'], scene: ['cloudpuff', 'balloons', 'cloudpuff'],
      goal: Worlds.seq(['⬆️', '⬇️', '⬅️', '➡️'], ['yukarı', 'aşağı', 'sol', 'sağ']),
      mechanics: [
        { t: 'quiz', q: 'Yukarı yoldan git!', a: ['⬆️', 'yukarı'], b: ['➡️', 'düz'], after: 'Yukarı çıkıyoruz!' },
        { t: 'balloon', len: 2400 },
        { t: 'quiz', q: 'Düz yoldan git!', a: ['⬆️', 'yukarı'], b: ['➡️', 'düz'], answer: 'b' },
        { t: 'tramp' },
        { t: 'balloon', len: 2000 }
      ]
    }),
    Worlds.level({
      id: 'zit-hizli', theme: 'train', seed: 603, zone: 'tunnel',
      stickers: ['🐇', '🐢', '🐌'], scene: ['signal', 'fence', 'tree'],
      goal: Worlds.seq(['🐇', '🐢', '🚀', '🐌'], ['hızlı tavşan', 'yavaş kaplumbağa', 'hızlı roket', 'yavaş salyangoz'], { end: 'Hızlı, yavaş, hızlı, yavaş' }),
      mechanics: [
        { t: 'quiz', q: 'Hızlı olanı seç!', a: ['🐢', 'kaplumbağa'], b: ['🐇', 'tavşan'], answer: 'b' },
        { t: 'train' },
        { t: 'traffic' },
        { t: 'quiz', q: 'Yavaş olanı seç!', a: ['🐌', 'salyangoz'], b: ['🚀', 'roket'] },
        { t: 'traffic' }
      ]
    }),
    Worlds.level({
      id: 'zit-sicak', theme: 'snow', seed: 604, zone: 'ice',
      stickers: ['☕', '🍦', '🧊'], scene: ['snowman', 'igloo', 'snowpine'],
      goal: Worlds.seq(['☀️', '❄️', '☕', '🍦'], ['sıcak güneş', 'soğuk kar', 'sıcak çay', 'soğuk dondurma'], { end: 'Sıcak, soğuk, sıcak, soğuk' }),
      mechanics: [
        { t: 'quiz', q: 'Soğuk olanı seç!', a: ['🧊', 'buz'], b: ['☀️', 'güneş'] },
        { t: 'ice' },
        { t: 'quiz', q: 'Sıcak olanı seç!', a: ['🍦', 'dondurma'], b: ['🍲', 'çorba'], answer: 'b' },
        { t: 'counter', n: 3, emoji: '⛄', word: 'kardan adam' },
        { t: 'quiz', q: 'Soğuk olanı seç!', a: ['⛄', 'kardan adam'], b: ['🔥', 'ateş'] }
      ]
    }),
    Worlds.level({
      id: 'zit-final', theme: 'funfair', seed: 605, zone: 'puddle',
      stickers: ['🌞', '🌙', '🎭'], scene: ['tent', 'balloons', 'tent'],
      goal: Worlds.seq(['🌞', '🌙', '⬆️', '⬇️'], ['gündüz', 'gece', 'yukarı', 'aşağı']),
      mechanics: [
        { t: 'quiz', q: 'Küçük olanı seç!', a: ['🐭', 'fare'], b: ['🐘', 'fil'] },
        { t: 'ferris' },
        { t: 'quiz', q: 'Yavaş olanı seç!', a: ['🐇', 'tavşan'], b: ['🐢', 'kaplumbağa'], answer: 'b' },
        { t: 'traffic' },
        { t: 'quiz', q: 'Gece hangisi?', a: ['🌙', 'ay'], b: ['🌞', 'güneş'] }
      ]
    })
  ]
});
