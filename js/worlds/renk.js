// Renk ve şekil dünyası: ana renkler, ara renkler, şekiller, boya atölyesi, final (renkli şekiller)
Worlds.register({
  id: 'renk', name: 'Renk ve şekil dünyası', order: 4, icon: '🎨', color: '#f8c6dc',
  levels: [
    Worlds.level({
      id: 'renk-ana', theme: 'clouds', seed: 401,
      stickers: ['🔴', '🌈', '🖍️'], scene: ['cloudpuff', 'balloons', 'cloudpuff'],
      goal: Worlds.seq(['🔴', '🔵', '🟡'], ['kırmızı', 'mavi', 'sarı']),
      mechanics: [
        { t: 'quiz', q: 'Kırmızı olanı seç!', a: ['🔴', 'kırmızı'], b: ['🔵', 'mavi'] },
        { t: 'balloon', len: 2000 },
        { t: 'quiz', q: 'Sarı olanı seç!', a: ['🔵', 'mavi'], b: ['🟡', 'sarı'], answer: 'b' },
        { t: 'counter', n: 3, emoji: '🎈', word: 'balon' },
        { t: 'quiz', q: 'Mavi olanı seç!', a: ['🔵', 'mavi'], b: ['🔴', 'kırmızı'] }
      ]
    }),
    Worlds.level({
      id: 'renk-ara', theme: 'funfair', seed: 402, zone: 'puddle',
      stickers: ['🟣', '🎡', '🍭'], scene: ['tent', 'balloons', 'tent'],
      goal: Worlds.seq(['🟢', '🟠', '🟣', '⚫', '⚪'], ['yeşil', 'turuncu', 'mor', 'siyah', 'beyaz']),
      mechanics: [
        { t: 'quiz', q: 'Yeşil olanı seç!', a: ['🟢', 'yeşil'], b: ['🟠', 'turuncu'] },
        { t: 'paint' },
        { t: 'quiz', q: 'Mor olanı seç!', a: ['🟠', 'turuncu'], b: ['🟣', 'mor'], answer: 'b' },
        { t: 'animals', kinds: ['duck', 'duckling', 'duckling'], auto: true },
        { t: 'quiz', q: 'Siyah olanı seç!', a: ['⚫', 'siyah'], b: ['⚪', 'beyaz'] }
      ]
    }),
    Worlds.from('bulut', { id: 'renk-sekil', stickers: ['🔺', '☁️', '💜'] }),
    Worlds.level({
      id: 'renk-boya', theme: 'city', seed: 403, zone: 'tunnel',
      stickers: ['🎨', '🖌️', '🚗'], scene: ['bench', 'lamp', 'citytree'],
      goal: Worlds.seq(['🟥', '🟦', '🟨', '🟩', '🟪'], ['kırmızı kare', 'mavi kare', 'sarı kare', 'yeşil kare', 'mor kare']),
      mechanics: [
        { t: 'paint' },
        { t: 'quiz', q: 'Mavi olan yoldan git!', a: ['🟦', 'mavi'], b: ['🟥', 'kırmızı'] },
        { t: 'paint' },
        { t: 'quiz', q: 'Yeşil olan yoldan git!', a: ['🟨', 'sarı'], b: ['🟩', 'yeşil'], answer: 'b' },
        { t: 'paint' }
      ]
    }),
    Worlds.level({
      id: 'renk-final', theme: 'clouds', seed: 404,
      stickers: ['🔷', '🎆', '🏅'], scene: ['cloudpuff', 'balloons', 'cloudpuff'],
      goal: Worlds.seq(['🔺', '🟦', '🟡', '🟩', '🔶'], ['kırmızı üçgen', 'mavi kare', 'sarı daire', 'yeşil kare', 'turuncu elmas']),
      mechanics: [
        { t: 'quiz', q: 'Kırmızı üçgen hangisi?', a: ['🔺', 'kırmızı üçgen'], b: ['🟦', 'mavi kare'] },
        { t: 'balloon', len: 2200 },
        { t: 'quiz', q: 'Sarı daire hangisi?', a: ['🟩', 'yeşil kare'], b: ['🟡', 'sarı daire'], answer: 'b' },
        { t: 'counter', n: 4, emoji: '🔷', word: 'elmas' },
        { t: 'quiz', q: 'Yeşil kare hangisi?', a: ['🟩', 'yeşil kare'], b: ['🔴', 'kırmızı daire'] }
      ]
    })
  ]
});
