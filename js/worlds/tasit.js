// Taşıtlar dünyası: kara taşıtları, TREN, deniz ve hava, görevli araçlar, sesten bul (final)
// Görevli araçların ışıkları çizilmez ve yanıp sönmez (görsel güvenlik).
Worlds.register({
  id: 'tasit', name: 'Taşıtlar dünyası', order: 7, icon: '🚒', color: '#ffb38a',
  levels: [
    Worlds.level({
      id: 'tasit-kara', theme: 'city', seed: 701, zone: 'tunnel',
      stickers: ['🚌', '🚲', '🛵'], scene: ['bench', 'lamp', 'citytree'],
      goal: Worlds.seq(['🚗', '🚌', '🚚', '🚲', '🛵'], ['araba', 'otobüs', 'kamyon', 'bisiklet', 'motosiklet']),
      mechanics: [
        { t: 'traffic' },
        { t: 'quiz', q: 'Otobüs hangisi?', a: ['🚌', 'otobüs'], b: ['🚲', 'bisiklet'] },
        { t: 'animals', kinds: ['duck', 'duckling', 'duckling'], auto: true },
        { t: 'counter', n: 3, emoji: '🚕', word: 'taksi' },
        { t: 'traffic' }
      ]
    }),
    Worlds.from('tren', { id: 'tasit-tren', stickers: ['🚃', '🛤️', '🚉'] }),
    Worlds.level({
      id: 'tasit-deniz-hava', theme: 'beach', seed: 702, zone: 'wave',
      stickers: ['✈️', '🚁', '⛵'], scene: ['umbrella', 'palm', 'crab'],
      goal: Worlds.seq(['🚢', '⛵', '✈️', '🚁', '🚀'], ['gemi', 'yelkenli', 'uçak', 'helikopter', 'roket']),
      mechanics: [
        { t: 'sea', len: 2000 },
        { t: 'quiz', q: 'Denizde giden hangisi?', a: ['✈️', 'uçak'], b: ['🚢', 'gemi'], answer: 'b' },
        { t: 'balloon', len: 2000 },
        { t: 'quiz', q: 'Havada uçan hangisi?', a: ['🚁', 'helikopter'], b: ['🚂', 'tren'] },
        { t: 'sea', len: 1800 }
      ]
    }),
    Worlds.level({
      id: 'tasit-gorevli', theme: 'city', seed: 703, zone: 'tunnel',
      stickers: ['🚒', '🚑', '🚜'], scene: ['bench', 'citytree', 'lamp'],
      goal: Worlds.seq(['🚒', '🚑', '🚓', '🚜', '🏗️'], ['itfaiye', 'ambulans', 'polis arabası', 'traktör', 'vinç']),
      mechanics: [
        { t: 'quiz', q: 'Yangını söndüren hangisi?', a: ['🚒', 'itfaiye'], b: ['🚜', 'traktör'] },
        { t: 'traffic' },
        { t: 'quiz', q: 'Hastaları taşıyan hangisi?', a: ['🚓', 'polis arabası'], b: ['🚑', 'ambulans'], answer: 'b' },
        { t: 'paint' },
        { t: 'quiz', q: 'Tarlada çalışan hangisi?', a: ['🚜', 'traktör'], b: ['🚒', 'itfaiye'] }
      ]
    }),
    Worlds.level({
      id: 'tasit-ses', theme: 'train', seed: 704, zone: 'tunnel',
      stickers: ['📯', '🛞', '🏁'], scene: ['signal', 'fence', 'tree'],
      goal: Worlds.seq(['🚂', '✈️', '🚗', '🚢'], ['tren', 'uçak', 'araba', 'gemi']),
      mechanics: [
        { t: 'quiz', q: 'Çuf çuf! Bu ses hangi taşıtın?', a: ['🚂', 'tren'], b: ['🚲', 'bisiklet'] },
        { t: 'train' },
        { t: 'quiz', q: 'Vınnn! Gökyüzünden gelen ses hangisinin?', a: ['🚌', 'otobüs'], b: ['✈️', 'uçak'], answer: 'b' },
        { t: 'fork' },
        { t: 'quiz', q: 'Düüüt! Denizden gelen ses hangisinin?', a: ['🚢', 'gemi'], b: ['🚚', 'kamyon'] }
      ]
    })
  ]
});
