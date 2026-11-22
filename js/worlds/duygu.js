// Duygular dünyası: mutlu, üzgün, kızgın (birlikte nefes), şaşkın ve korkmuş, final
// Yüzler sakin; korkutucu görüntü ve ses yok.
Worlds.register({
  id: 'duygu', name: 'Duygular dünyası', order: 9, icon: '😊', color: '#ffe066',
  levels: [
    Worlds.level({
      id: 'duygu-mutlu', theme: 'funfair', seed: 901, zone: 'puddle',
      stickers: ['😄', '🎉', '🤗'], scene: ['tent', 'balloons', 'tent'],
      goal: Worlds.seq(['😊', '😄', '🥰', '🤗'], ['mutlu', 'gülüyor', 'sevgi dolu', 'sarılıyor']),
      mechanics: [
        { t: 'quiz', q: 'Mutlu yüz hangisi?', a: ['😊', 'mutlu'], b: ['😢', 'üzgün'] },
        { t: 'counter', n: 3, emoji: '😄', word: 'gülen yüz' },
        { t: 'cheer', from: '😐', to: '😄', say: 'Arkadaşımız sıkılmış. Korna çalıp güldürelim!', done: 'Güldü! Şimdi mutlu.' },
        { t: 'quiz', q: 'Gülen yüz hangisi?', a: ['😠', 'kızgın'], b: ['😄', 'gülüyor'], answer: 'b' }
      ]
    }),
    Worlds.level({
      id: 'duygu-uzgun', theme: 'farm', seed: 902, zone: 'puddle',
      stickers: ['🧸', '🌈', '💛'], scene: ['barn', 'flowers', 'sheep'],
      goal: Worlds.seq(['😢', '🤗', '😊'], ['üzgün', 'sarıl', 'mutlu'], { end: 'Üzgünken sarılırız, mutlu oluruz' }),
      mechanics: [
        { t: 'cheer', from: '😢', to: '😊', say: 'Bu arkadaş üzgün. Korna çalıp neşelendirelim!', done: 'Neşelendi! Teşekkürler.' },
        { t: 'animals', kinds: ['lamb', 'lamb'] },
        { t: 'quiz', q: 'Üzgün yüz hangisi?', a: ['😢', 'üzgün'], b: ['😊', 'mutlu'] },
        { t: 'cheer', from: '😟', to: '🙂', say: 'Bu arkadaş da üzgün. Korna çalalım!', done: 'Gülümsedi!' }
      ]
    }),
    Worlds.level({
      id: 'duygu-kizgin', theme: 'clouds', seed: 903,
      stickers: ['🌬️', '🫧', '🕊️'], scene: ['cloudpuff', 'balloons', 'cloudpuff'],
      goal: Worlds.seq(['😠', '🌬️', '🙂'], ['kızgın', 'nefes al', 'sakin'], { end: 'Kızınca derin nefes alırız, sakinleşiriz' }),
      mechanics: [
        { t: 'cheer', from: '😠', to: '🙂', breathe: true, say: 'Bu arkadaş kızgın.', done: 'Sakinleşti!' },
        { t: 'balloon', len: 2000 },
        { t: 'quiz', q: 'Sakin yüz hangisi?', a: ['😠', 'kızgın'], b: ['😌', 'sakin'], answer: 'b' },
        { t: 'cheer', from: '😤', to: '😌', breathe: true, say: 'Bu arkadaş da kızgın.', done: 'Şimdi sakin!' }
      ]
    }),
    Worlds.level({
      id: 'duygu-saskin', theme: 'forest', seed: 904, zone: 'bridge',
      stickers: ['😲', '🦉', '🔦'], scene: ['squirrel', 'mushroom', 'squirrel'],
      goal: Worlds.seq(['😲', '😨', '🙂'], ['şaşkın', 'korkmuş', 'rahatladı']),
      mechanics: [
        { t: 'quiz', q: 'Şaşkın yüz hangisi?', a: ['😲', 'şaşkın'], b: ['😊', 'mutlu'] },
        { t: 'logs', n: 2 },
        { t: 'cheer', from: '😨', to: '🙂', say: 'Bu arkadaş korkmuş. Korna çalıp yanındayız diyelim!', done: 'Rahatladı!' },
        { t: 'counter', n: 3, emoji: '🍄', word: 'mantar' }
      ]
    }),
    Worlds.level({
      id: 'duygu-final', theme: 'city', seed: 905, zone: 'tunnel',
      stickers: ['💖', '🎈', '🏅'], scene: ['bench', 'lamp', 'citytree'],
      goal: Worlds.seq(['😊', '😢', '😠', '😲'], ['mutlu', 'üzgün', 'kızgın', 'şaşkın']),
      mechanics: [
        { t: 'quiz', q: 'Üzgün yüz hangisi?', a: ['😄', 'mutlu'], b: ['😢', 'üzgün'], answer: 'b' },
        { t: 'cheer', from: '😢', to: '😊', say: 'Üzgün bir arkadaş! Korna çalalım.', done: 'Mutlu oldu!' },
        { t: 'quiz', q: 'Kızgın yüz hangisi?', a: ['😠', 'kızgın'], b: ['😲', 'şaşkın'] },
        { t: 'traffic' },
        { t: 'quiz', q: 'Mutlu yüz hangisi?', a: ['😊', 'mutlu'], b: ['😨', 'korkmuş'] }
      ]
    })
  ]
});
