// Mevsimler dünyası: ilkbahar, yaz, sonbahar, kış, "hangi mevsim?" (final)
// Hava olayları yumuşak: şimşek ve ani parlama yok.
Worlds.register({
  id: 'mevsim', name: 'Mevsimler dünyası', order: 8, icon: '🍂', color: '#ffd6a5',
  levels: [
    Worlds.level({
      id: 'mevsim-ilkbahar', theme: 'orchard', seed: 801, zone: 'puddle',
      stickers: ['🌷', '🦋', '🌱'], scene: ['appletree', 'flowers', 'appletree'],
      goal: Worlds.seq(['🌷', '🦋', '🐝', '🌱', '🌧️'], ['lale', 'kelebek', 'arı', 'filiz', 'yağmur'], { end: 'İlkbahar!' }),
      mechanics: [
        { t: 'quiz', q: 'İlkbaharda hangisi açar?', a: ['🌷', 'çiçek'], b: ['⛄', 'kardan adam'] },
        { t: 'fruittree', fruit: 2 },
        { t: 'counter', n: 4, emoji: '🌼', word: 'papatya' },
        { t: 'animals', kinds: ['duck', 'duckling', 'duckling'] },
        { t: 'quiz', q: 'Kelebek hangisi?', a: ['🐞', 'uğur böceği'], b: ['🦋', 'kelebek'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'mevsim-yaz', theme: 'beach', seed: 802, zone: 'wave',
      stickers: ['🍉', '🏖️', '🕶️'], scene: ['umbrella', 'crab', 'bucket'],
      goal: Worlds.seq(['☀️', '🏖️', '🍉', '🍦'], ['güneş', 'kumsal', 'karpuz', 'dondurma'], { end: 'Yaz!' }),
      mechanics: [
        { t: 'sea', len: 2000 },
        { t: 'quiz', q: 'Yazın ne giyeriz?', a: ['🩳', 'şort'], b: ['🧥', 'mont'] },
        { t: 'counter', n: 3, emoji: '🍉', word: 'karpuz' },
        { t: 'sea', len: 2200 },
        { t: 'quiz', q: 'Yazın ne yeriz?', a: ['🧣', 'atkı'], b: ['🍦', 'dondurma'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'mevsim-sonbahar', theme: 'autumn', seed: 803, zone: 'bridge',
      stickers: ['🍁', '🌰', '☂️'], scene: ['autumntree', 'leafpile', 'autumntree'],
      goal: Worlds.seq(['🍂', '🍁', '🌰', '🍄', '☂️'], ['yaprak', 'kırmızı yaprak', 'kestane', 'mantar', 'şemsiye'], { end: 'Sonbahar!' }),
      mechanics: [
        { t: 'logs', n: 3 },
        { t: 'quiz', q: 'Sonbaharda ağaçtan ne düşer?', a: ['🍂', 'yaprak'], b: ['❄️', 'kar'] },
        { t: 'counter', n: 3, emoji: '🌰', word: 'kestane' },
        { t: 'logs', n: 2 },
        { t: 'quiz', q: 'Yağmurda ne açarız?', a: ['🕶️', 'gözlük'], b: ['☂️', 'şemsiye'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'mevsim-kis', theme: 'snow', seed: 804, zone: 'ice',
      stickers: ['🧤', '🎿', '🧣'], scene: ['snowman', 'igloo', 'snowpine'],
      goal: Worlds.seq(['❄️', '⛄', '🧣', '🧤', '🎿'], ['kar tanesi', 'kardan adam', 'atkı', 'eldiven', 'kayak'], { end: 'Kış!' }),
      mechanics: [
        { t: 'quiz', q: 'Kışın ne giyeriz?', a: ['🧤', 'eldiven'], b: ['🩳', 'şort'] },
        { t: 'cablecar' },
        { t: 'counter', n: 3, emoji: '⛄', word: 'kardan adam' }
      ]
    }),
    Worlds.level({
      id: 'mevsim-final', theme: 'farm', seed: 805, zone: 'puddle',
      stickers: ['🗓️', '🌈', '🌻'], scene: ['barn', 'flowers', 'tree'],
      goal: Worlds.seq(['🌷', '☀️', '🍂', '❄️'], ['ilkbahar', 'yaz', 'sonbahar', 'kış']),
      mechanics: [
        { t: 'quiz', q: 'Kar yağıyor. Hangi mevsim?', a: ['❄️', 'kış'], b: ['☀️', 'yaz'] },
        { t: 'animals', kinds: ['lamb', 'lamb'] },
        { t: 'quiz', q: 'Yapraklar dökülüyor. Hangi mevsim?', a: ['🌷', 'ilkbahar'], b: ['🍂', 'sonbahar'], answer: 'b' },
        { t: 'fruittree', fruit: 0 },
        { t: 'quiz', q: 'Çiçekler açıyor. Hangi mevsim?', a: ['🌷', 'ilkbahar'], b: ['❄️', 'kış'] }
      ]
    })
  ]
});
