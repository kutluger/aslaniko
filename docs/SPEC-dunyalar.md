# Spec: Aslaniko Dünyaları

Onaylayan: Lütfi (2026-11-22). Kaynak tasarım: "Aslaniko Dünyaları" belgesi.

## Varsayımlar
1. Oyun düz HTML/CSS/JS olarak kalır; derleme adımı, paket yöneticisi ve dış kütüphane yok (file:// ve çevrimdışı çalışır).
2. Kavram nesneleri (meyve, hayvan, taşıt, yüz) ilk aşamada sistem emojisiyle çizilir; iPad'de Apple emojileri görünür.
3. Sesler: harf/kelime okuma `speechSynthesis` (tr-TR); hayvan ve taşıt sesleri yansıma sözcüklerle okunur ("Möö!").
4. Mevcut kayıtlar (en iyi yıldızlar, çıkartmalar) korunur: Serbest mod bölüm kimlikleri değişmez.
5. Ödeme yok. Erişim tek bir fonksiyondan geçer (`Access.isAvailable`), bugün hep `true`.

## Hedef
4-6 yaş için kavram öğreten 9 dünya × 5 bölüm (45) + Serbest mod (bugünkü 10 bölüm). Kaybetmek, süre baskısı, yanıp sönme yok.

## Modüler yapı (yeni dünya eklemek = bir dosya eklemek)
| Modül | Dosya | Sorumluluk | Bağımlı |
|---|---|---|---|
| mechanics | `js/mechanics.js` | Mekanik kaydı `Mech.register(ad, tanım)` ve oyun bağlantısı | — |
| learn-mechanics | `js/mech-learn.js` | Öğretici mekanikler: quiz (sesli yol ayrımı / ses bulmacası), counter (sayma tabelası), sort (iki sepet), cheer (duygular) | mechanics |
| level-gen | `js/level.js` | Bölüm tanımından harita üretir; Serbest mod bölümleri (`LEVELS`) | mechanics |
| worlds | `js/worlds.js` | Dünya kaydı `Worlds.register({...})`, bölüm kısa yazımı `Worlds.level({...})`, ilerleme ve kilit kuralları, `Access` | level-gen |
| world içerikleri | `js/worlds/<id>.js` | Her dünya kendi dosyasında kendini kaydeder | worlds |
| game | `js/game.js` | Ekranlar (garaj, dünya haritası, bölüm yolu, oyun, albüm) | hepsi |

Yeni dünya eklemek: `js/worlds/<id>.js` oluştur, `index.html` ve `sw.js` listesine ekle. `node tools/check-worlds.js` tanımları doğrular.

### Dünya tanımı örneği
```js
Worlds.register({
  id: 'harf', name: 'Harf dünyası', order: 1, icon: '🔤', color: '#ffd166', reward: { color: 7 },
  levels: [
    Worlds.level({ id: 'harf-sesli', theme: 'farm', seed: 201,
      goal: Worlds.seq(['A', 'E', 'I', 'İ', 'O'], ['a', 'e', 'ı', 'i', 'o']),
      mechanics: [{ t: 'quiz', q: 'A harfi hangisi?', a: 'A', b: 'E' }, { t: 'animals' }] }),
    Worlds.from('ciftlik', { id: 'harf-aslan' }) // Serbest mod bölümünün aynısı
  ]
});
```

## İlerleme kuralları
- Kayıt: `settings.progress[worldId] = { unlocked: n }`, en iyi yıldız `settings.best[levelId]`.
- Dünya içinde bölümler sırayla açılır. Bir dünyada 3 bölüm bitince sıradaki kilitli dünya açılır.
- Harf ve Sayı dünyaları ile Serbest mod baştan açık. Panelde "Tüm bölümler açık" her şeyi açar.
- Dünyanın 5 bölümü bitince ödül: o dünyaya özel araç rengi açılır.

## Test
- `node tools/check-worlds.js`: her bölüm üretilir, kimlikler benzersiz, etiket/okuma sayıları eşit.
- Otomatik oynanış (Playwright): her bölüm gaz basılı bitirilir, tüm hedefler toplanır, sayfa hatası yok, en uzun bekleme ≤ 8 sn.
- `node tools/flash-check.js`: yanıp sönme kontrolü.

## Sınırlar
- Her zaman: CONSTRAINTS.md kuralları, Türkçe arayüz sesleri, kişisel veri yok.
- Önce sor: ödeme, dış servis, yeni bağımlılık.
- Asla: yanıp sönen ışık, kaybetme/ceza, süre baskısı.
