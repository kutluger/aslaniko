# Aslaniko: Araba Yarışı

Okul öncesi çocuklar için yandan bakışlı, dokunmatik bir araba oyunu. Düz HTML, CSS ve JavaScript ile yazıldı. Kaybetmek, ceza veya süre baskısı yok: araba yolda sayı balonlarını ve yıldızları topluyor, sonunda her zaman konfeti ve kupa var.

## Nasıl oynanır

1. **Garaj:** açılışta araç (araba, motosiklet, bisiklet, ATV) ve renk seçilir. Seçim cihazda hatırlanır.
2. **Harita:** 5 bölümden biri seçilir. Her bölümde en çok toplanan yıldız sayısı görünür.
3. **Sürüş:**
   - Ekranın herhangi bir yerine **basılı tut**: araç gider. Bırakınca yavaşça durur.
   - Mavi düğme: **zıpla**. Havadayken bir daha basınca araç **takla** atar (+2). Sarı düğme: **korna**.
   - Havadaki altın halkalar sadece zıplayarak alınır (+3).
   - Bilgisayarda: sağ ok tuşu gaz, boşluk tuşu zıplama, H korna, Enter onay.

### Bölümler

| # | Bölüm | Öğrenme | Özel bölge |
|---|---|---|---|
| 1 | Çiftlik yolu | Sayılar 1–5 sırayla | Turbo şeridi, trambolin, sirk topu, tümsekler, mega rampa, büyük ve çift dönel rampa |
| 2 | Sihirli orman | Harf avı (A) | Kütük köprü ve dere |
| 3 | Karlı dağ | Kaç tane? (2, 3, 4 hediye) | Buz pisti |
| 4 | Güneşli sahil | D-E-N-İ-Z kelimesi | Dalgalar |
| 5 | Gece şehri | Sayılar 6–10 | Farlar ve tünel |

Her bölümde normal rampalar ve 360° dönel rampalar var. Çiftlik bölümü yaklaşık 80 saniye, diğerleri şimdilik yaklaşık 45 saniye sürer.

## Ebeveyn ayarları

Sol üstteki küçük dişliye **3 saniye basılı tutun**. Ses, sayıların sesli okunması ve hız (yavaş/orta) buradan ayarlanır. Ayarlar yalnızca o cihazda saklanır.

## Bilgisayarda çalıştırma

`index.html` dosyasını tarayıcıda açmak yeterli. Çevrimdışı önbellek (service worker) sadece bir web sunucusu üzerinden çalışır; denemek isterseniz:

```
python3 -m http.server 8000
```

ve tarayıcıda `http://localhost:8000` adresini açın.

## iPad'de kullanım (GitHub Pages)

1. GitHub'da repo **Settings → Pages** bölümünde, kaynak olarak `main` dalını ve `/ (root)` klasörünü seçin.
2. Birkaç dakika sonra oyun `https://kutluger.github.io/aslaniko/` adresinde açılır.
3. iPad'de Safari ile bu adresi açın, **Paylaş → Ana Ekrana Ekle** deyin.
4. Bir kez açıldıktan sonra oyun internetsiz de çalışır.

Oyunu güncellediğinizde `sw.js` içindeki `CACHE` sürümünü (örneğin `araba-v2` → `araba-v3`) artırın, yoksa iPad eski sürümü göstermeye devam edebilir.

## Gizlilik

Oyun kişisel bilgi, fotoğraf veya analitik içermez ve hiçbir dış sunucuya bağlanmaz. Tüm görseller ve sesler kodla üretilir.

## Dosyalar

- `index.html`, `style.css`: sayfa ve arayüz
- `js/game.js`: garaj, harita, oyun döngüsü, fizik, çizim, girdi
- `js/vehicles.js`: araçlar, renkler ve sürüş özellikleri
- `js/level.js`: 5 bölümün tanımı ve bölüm üretici (tepeler, rampalar, nesneler)
- `js/themes.js`: bölüm temaları (gökyüzü, arka plan, süsler, özel bölgeler)
- `js/sound.js`: Web Audio sesleri ve Türkçe sesli okuma
- `sw.js`, `manifest.webmanifest`, `icons/`: Ana Ekrana Ekle ve çevrimdışı çalışma
- `tools/make_icons.py`: simgeleri yeniden üretmek için
