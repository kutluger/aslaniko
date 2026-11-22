# Aslaniko On the Road (Aslaniko Yollarda)

Sürüm: **v0.3** · değişiklikler için `CHANGELOG.md`

Okul öncesi çocuklar için yandan bakışlı, dokunmatik bir araba oyunu. Düz HTML, CSS ve JavaScript ile yazıldı. Kaybetmek, ceza veya süre baskısı yok: araba yolda sayı balonlarını ve yıldızları topluyor, sonunda her zaman konfeti ve kupa var.

## Nasıl oynanır

1. **Garaj:** açılışta araç (araba, motosiklet, bisiklet, ATV) ve renk seçilir. Seçim cihazda hatırlanır.
2. **Harita:** önce dünyalar (adalar), dokununca o dünyanın bölüm yolu. Her bölümde en çok toplanan yıldız sayısı görünür.
   - **Serbest mod:** ilk sürümün 10 bölümü (aşağıdaki tablo).
   - **9 dünya × 5 bölüm:** Harf, Sayı, Meyve-sebze, Renk-şekil, Hayvan, Karşıtlıklar, Taşıtlar, Mevsimler, Duygular. Bölümler sırayla açılır; bir dünyada 3 bölüm bitince sıradaki dünya açılır. Ebeveyn panelinden hepsi açılabilir.
   - Dünyalarda soru yolları (iki tabeladan doğruyu seç), sayma, römorkta ayırma ve Duygular dünyasında arkadaşı neşelendirme / birlikte nefes alma var. Yanlış seçimde ceza yok; seçim yapılmazsa araç birkaç saniye sonra doğru yoldan kendiliğinden gider.
   - **Çıkartma albümü:** garajdaki sarı albüm düğmesi. Her bölümde zıplayarak alınan 3 gizli çıkartma var.
3. **Sürüş:**
   - Ekranın herhangi bir yerine **basılı tut**: araç gider. Bırakınca yavaşça durur.
   - Mavi düğme: **zıpla**. Turuncu alev düğmesi: basılı tutunca **turbo**. Sarı düğme: **korna**. Sol üstteki ev düğmesi bölümden **ana ekrana** döner.
   - Havadaki altın halkalar sadece zıplayarak alınır (+3).
   - Bilgisayarda: sağ ok tuşu gaz, boşluk tuşu zıplama, Alt Gr turbo, H korna, Enter onay.

### Bölümler

| # | Bölüm | Öğrenme | Bölümün yeni mekaniği |
|---|---|---|---|
| 1 | Çiftlik yolu | A-S-L-A-N | Yola çıkan hayvanlar: korna çal, kenara çekilsinler (çalmasan da 5 sn sonra giderler) |
| 2 | Sihirli orman | Sayılar 1–5 | Kütüklerin üstünden zıpla, dereleri köprüden geç |
| 3 | Karlı dağ | Sayılar 6–10 | Teleferikle zirveye çık, kızakla aşağı kay |
| 4 | Güneşli sahil | D-E-N-İ-Z | Denize girince araç bota dönüşür, yunuslar zıplar |
| 5 | Oyuncak kasaba | A-S-L-A-N-İ-K-O | Trafik lambasında dur, ördekler karşıya geçsin, boya atölyesinde renk değiştir |
| 6 | Meyve bahçesi | E-L-M-A | Arkada römork; korna çalınca meyveler römorka düşer (+5) |
| 7 | Bulut tepeleri | Şekiller: daire, kare, üçgen, yıldız, kalp | Balonlarla süzül: zıpla düğmesine basılı tut, yüksel |
| 8 | Dinozor vadisi | D-İ-N-O | Korna çal, dinozor boynunu köprü yapsın (çalmasan da 6 sn sonra yapar) |
| 9 | Tren yolu | T-R-E-N | Yol ayrımında üst ya da düz yolu seç; düz vagona binip trenle git |
| 10 | Lunapark | A-F-E-R-İ-N | Önceki bölümlerden birer parça; sonunda dönme dolap |

Her bölüm farklı bir kutlama köşesiyle biter. Hiçbir mekanikte kaybetmek ya da takılı kalmak yok: çocuk bir şey yapmasa da her engel birkaç saniye içinde kendiliğinden açılır.

Her bölümde normal ve mega rampa, tek ve çift 360° dönel rampa, trambolin, sirk topu ve tümsekler var; aralarda sakin düz yollar bırakıldı. Her bölüm yaklaşık 2 dakika sürer. Göz yormaması ve ışığa duyarlı epilepsiyi tetiklememesi için yanıp sönen öğe, sık desen ve gece teması yok; kurallar `CONSTRAINTS.md` dosyasında. `node tools/flash-check.js` her bölümü otomatik oynatıp yanıp sönmeyi ölçer. Ebeveyn panelindeki "Az hareket" anahtarı süs animasyonlarını ve efektleri durdurur.

## Ebeveyn ayarları

Sol üstteki küçük dişliye **1 saniye basılı tutun**. Ses, müzik, sayıların sesli okunması ve hız (yavaş/orta) buradan ayarlanır. Ayarlar yalnızca o cihazda saklanır.

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

İnternet varken oyun her açılışta en yeni sürümü alır; GitHub Pages güncellendikten 1-2 dakika sonra sayfayı yenilemek yeterli. İnternet yoksa en son açılan sürüm çalışır.

## Gizlilik

Oyun kişisel bilgi, fotoğraf veya analitik içermez ve hiçbir dış sunucuya bağlanmaz. Tüm görseller ve sesler kodla üretilir.

## Dosyalar

- `index.html`, `style.css`: sayfa ve arayüz
- `js/game.js`: garaj, harita, oyun döngüsü, fizik, çizim, girdi
- `js/vehicles.js`: araçlar, renkler ve sürüş özellikleri
- `js/level.js`: Serbest moddaki 10 bölümün tanımı ve bölüm üretici (tepeler, rampalar, nesneler, gizli çıkartmalar)
- `js/worlds.js`: dünya kaydı, kısa bölüm yazımı, kilit kuralları; `js/worlds/*.js`: her dünyanın 5 bölümü
- `js/mech-learn.js`: öğrenme mekanikleri (soru yolu, sayma, ayırma, neşelendirme)
- `docs/SPEC-dunyalar.md`: dünya yapısı ve yeni dünya ekleme
- `tools/check-worlds.js`: bölüm tanımlarını denetler
- `js/mechanics.js`: bölümlere özel mekanikler (hayvanlar, teleferik, deniz, trafik lambası, balon, dinozor, tren, dönme dolap...)
- `js/themes.js`: bölüm temaları (gökyüzü, arka plan, süsler, özel bölgeler)
- `js/sound.js`: Web Audio sesleri ve Türkçe sesli okuma
- `sw.js`, `manifest.webmanifest`, `icons/`: Ana Ekrana Ekle ve çevrimdışı çalışma
- `tools/logo/`: logo ve ikonların SVG kaynakları ve üretici (`python3 tools/logo/gen3.py`)
- `tools/flash-check.js`: yanıp sönme testi (Node + Playwright gerekir)
- `CONSTRAINTS.md`: kalite çıtası ve "bitti" listesi
