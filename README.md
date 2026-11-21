# Aslaniko: Araba Yarışı

Okul öncesi çocuklar için yandan bakışlı, dokunmatik bir araba oyunu. Düz HTML, CSS ve JavaScript ile yazıldı. Kaybetmek, ceza veya süre baskısı yok: araba yolda sayı balonlarını ve yıldızları topluyor, sonunda her zaman konfeti ve kupa var.

## Nasıl oynanır

- Ekranın herhangi bir yerine **basılı tut**: araba gider. Bırakınca yavaşça durur.
- Sarı düğme: **korna**.
- Yolda 1'den 5'e kadar sayı balonları sırayla toplanır, her biri sesli okunur.
- Rampalardan uçarken havadaki yıldızlar toplanır.
- Bilgisayarda: Boşluk veya sağ ok tuşu gaz, H tuşu korna.

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

Oyunu güncellediğinizde `sw.js` içindeki `CACHE` sürümünü (`araba-v1` → `araba-v2`) artırın, yoksa iPad eski sürümü göstermeye devam edebilir.

## Gizlilik

Oyun kişisel bilgi, fotoğraf veya analitik içermez ve hiçbir dış sunucuya bağlanmaz. Tüm görseller ve sesler kodla üretilir.

## Dosyalar

- `index.html`, `style.css`: sayfa ve arayüz
- `js/game.js`: oyun döngüsü, fizik, çizim, girdi
- `js/level.js`: demo bölümün haritası (zemin, rampalar, balonlar, yıldızlar)
- `js/sound.js`: Web Audio sesleri ve Türkçe sesli okuma
- `sw.js`, `manifest.webmanifest`, `icons/`: Ana Ekrana Ekle ve çevrimdışı çalışma
- `tools/make_icons.py`: simgeleri yeniden üretmek için
