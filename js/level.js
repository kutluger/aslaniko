// Demo bölüm: "Çiftlik yolu" ve 1'den 5'e sayı balonları.
// Dünya birimleri: x sağa, y yukarı. Zemin yüksekliği aşağıdaki noktalardan üretilir.
const LEVEL = {
  name: 'ciftlik',
  // [x, yükseklik] — aralar yumuşak eğriyle birleştirilir
  ground: [
    [-2000, 0], [0, 0], [900, 0], [1300, 60], [1700, 20], [2100, 90], [2500, 30],
    [3300, 30], [3700, 120], [4100, 60], [4400, 40], [5100, 40], [5500, 110],
    [5900, 170], [6300, 90], [6650, 60], [7400, 60], [7800, 40], [8300, 40],
    [8700, 130], [9100, 60], [9500, 150], [9900, 80], [10300, 30], [10800, 60],
    [11200, 40], [14000, 40]
  ],
  // Rampalar: yükselir, sonra dik düşer; araba kısa bir uçuş yapar
  ramps: [
    { x: 2620, len: 300, h: 75 },
    { x: 6720, len: 330, h: 95 },
    { x: 10380, len: 300, h: 70 }
  ],
  // Su birikintileri: geçerken su sıçrar (ceza yok)
  puddles: [
    { x: 4560, w: 260 },
    { x: 7900, w: 260 },
    { x: 11300, w: 200 }
  ],
  // Sayı balonları sırayla
  numbers: [
    { x: 1500, n: 1 },
    { x: 3500, n: 2 },
    { x: 5300, n: 3 },
    { x: 8500, n: 4 },
    { x: 10000, n: 5 }
  ],
  // Yıldızlar: dy = zeminden yükseklik
  stars: [
    { x: 700, dy: 60 }, { x: 820, dy: 60 }, { x: 940, dy: 70 },
    { x: 2250, dy: 60 }, { x: 2350, dy: 60 },
    { x: 3020, dy: 170 }, { x: 3140, dy: 200 }, { x: 3260, dy: 170 },
    { x: 4250, dy: 60 }, { x: 4700, dy: 60 }, { x: 4820, dy: 60 },
    { x: 6000, dy: 60 }, { x: 6120, dy: 60 },
    { x: 7120, dy: 190 }, { x: 7250, dy: 220 }, { x: 7380, dy: 190 },
    { x: 8000, dy: 60 }, { x: 9300, dy: 60 }, { x: 9420, dy: 60 },
    { x: 10780, dy: 170 }, { x: 10900, dy: 190 },
    { x: 11500, dy: 60 }, { x: 11620, dy: 60 }
  ],
  // Süs: ağaçlar, çit, çiçek, ahır, inek
  decor: [
    { t: 'barn', x: 300 }, { t: 'tree', x: 1100 }, { t: 'fence', x: 1900 },
    { t: 'cow', x: 2400 }, { t: 'tree', x: 3400 }, { t: 'flowers', x: 4000 },
    { t: 'tree', x: 4300 }, { t: 'fence', x: 5000 }, { t: 'sheep', x: 5700 },
    { t: 'tree', x: 6400 }, { t: 'flowers', x: 7600 }, { t: 'tree', x: 8200 },
    { t: 'cow', x: 9000 }, { t: 'tree', x: 9700 }, { t: 'flowers', x: 10600 },
    { t: 'tree', x: 11000 }, { t: 'barn', x: 12300 }
  ],
  finish: 11800
};
