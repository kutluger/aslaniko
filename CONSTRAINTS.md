# Kalite çıtası (CONSTRAINTS)

Bu oyunun her değişiklikte aşmaması gereken sınırlar. Oyun 4-6 yaş çocuklar için. Bu yüzden göz sağlığı ve gizlilik ilk sırada.
Bir değişiklik bu listeden bir maddeyi gevşetiyorsa önce Lütfi'nin onayı gerekir.

## 1. Işığa duyarlılık ve göz yorgunluğu (engelleyici)

| Kural | Sınır | Nasıl ölçülür |
|---|---|---|
| Yanıp sönme | Herhangi bir 1 saniyede 3'ten fazla yanıp sönme yok (ekranın %6,25'lik her bölgesinde; WCAG'den katı). Hedef 0. | `node tools/flash-check.js`: 4x4 geniş bölge |
| Küçük alan titremesi | 64 px'lik küçük bölgelerde saniyede 5'ten fazla yanıp sönme yok. Kayan nesneler burada doğal olarak 3-4 üretir; yerinde titreme (eski pencere hatası 10-11) bu sınırı aşar. | Aynı araç, küçük bölge sütunu |
| Kırmızı yanıp sönme | Doygun kırmızıda (R/(R+G+B) >= 0,8) hiç yanıp sönme yok. Kırmızı öğeler nabız gibi atmaz. | Aynı araç, kırmızı sütunu 0 olmalı |
| Desen | Büyük alanlarda ince, sık, yüksek kontrastlı ve tekrar eden çizgi veya ızgara yok (pencere ızgarası, kesik çizgili rampa, sık dalga çizgisi). | Kod incelemesi ve ekran görüntüsü |
| Rastgele titreme | Her karede rastgele değişen boyut, renk veya konum yok (`Math.random` çizimde kullanılmaz). | Kod incelemesi: `grep -n "Math.random" js/game.js js/themes.js` çizim fonksiyonlarında boş olmalı |
| Ani parlaklık değişimi | Tüm ekranı kaplayan kararma veya açılma en az 0,4 sn sürer, tünelde kararma en çok %40. | Kod incelemesi |
| Süs hareketleri | Sallanma, nabız, dönme saniyede en çok 1 tur ve küçük (en çok %5 büyüme). | Kod incelemesi |
| Renk | Arka plan ön plandan soluk. Büyük alanlarda saf beyaz veya saf siyah yok. Gece teması yok. | Ekran görüntüsü |
| Az hareket | Ebeveyn panelinde "Az hareket" anahtarı süs animasyonlarını, paralaksı ve parçacıkları durdurur. Cihazda "Hareketi Azalt" açıksa kendiliğinden açılır. | Elle deneme |

## 2. Gizlilik (engelleyici)

- Oyunda kişisel bilgi, fotoğraf, isim girişi, analitik veya reklam yok.
- Oyun internete veri göndermez. Ayarlar sadece cihazdaki `localStorage` içinde durur.

## 3. Çalışma ortamı (engelleyici)

- Düz HTML, CSS ve JavaScript. Derleme adımı yok. ES modülü yok, `index.html` dosyadan (`file://`) çift tıklayarak açılır.
- Çevrimdışı çalışır (service worker). Her yayında `sw.js` içindeki `CACHE` sürümü artırılır.
- iPad Safari'de dokunmatik kontrollerle oynanır. Düğmeler en az 64 px.

## 4. Oynanış (engelleyici)

- Kaybetmek, ceza veya süre baskısı yok.
- Turbo sadece oyuncu isteyince çalışır (Alt Gr veya turbo düğmesi). Zıplama takla attırmaz.
- Her bölüm yaklaşık 80-110 saniye.

## 5. Her değişiklikte "bitti" listesi

- [ ] `node tools/flash-check.js` tüm bölümlerde GEÇTİ diyor.
- [ ] Değişen bölümler tarayıcıda oynatıldı, ekran görüntüsüne bakıldı, konsolda hata yok.
- [ ] Kod incelemesi yapıldı: kapsam dışı değişiklik, ölü kod, hata ayıklama çıktısı yok.
- [ ] `README.md` güncel.
- [ ] `sw.js` önbellek sürümü artırıldı.
- [ ] Lütfi birleştirmeyi istedi veya onayladı.
