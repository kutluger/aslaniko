# Değişiklikler

## v0.3.1 (2026-11-22)
- Emojiler artık her boyutta bir kez çizilip resim olarak ölçekleniyor: emoji toplarken büyüyen yazının Firefox'ta yaptığı takılma için.
- Korna için klavyede sağ Ctrl tuşu da çalışıyor (H tuşu da duruyor).
- Korna gereken yerde korna düğmesi hafifçe büyüyüp küçülüyor ve etrafından yumuşak ses dalgaları yayılıyor (yanıp sönme yok; "Az hareket" ve azaltılmış hareket ayarında kapalı).

## v0.3 (2026-11-22)

### Dünyalar
- Harita iki katmanlı: önce 10 ada (Serbest mod + 9 dünya), dokununca o dünyanın 5 bölümlük yolu.
- **Serbest mod:** ilk sürümün 10 bölümü aynen duruyor; eski yıldızlar ve çıkartmalar korunur.
- **9 dünya, 45 bölüm:** Harf, Sayı, Meyve-sebze, Renk-şekil, Hayvan, Karşıtlıklar, Taşıtlar, Mevsimler, Duygular. Serbest moddaki 8 bölümün kopyaları ilgili dünyalarda.
- Dünya içinde bölümler sırayla açılır. Bir dünyada 3 bölüm bitince sıradaki kilitli dünya açılır. Harf ve Sayı baştan açık. Ebeveyn panelinde "Tüm dünyalar ve bölümler açık".
- Albüm dünya dünya sekmeli; bir dünyanın 5 bölümü de bitince dünya ve albüm sekmesi 🏆 rozeti alır.

### Yeni öğrenme mekanikleri
- **Soru yolu:** iki tabelalı yol ayrımı ve sesli soru ("Hangisi A ile başlar?"). 8 sn seçim olmazsa doğru yoldan kendiliğinden gider; yanlış seçimde ceza yok, doğrusu söylenir.
- **Sayma:** tabelada sayı ve noktalar, yoldaki nesneler toplanırken sesle sayılır.
- **Ayırma:** iki bölmeli römork; meyve/sebze gibi nesneler toplanınca kendi bölmesine düşer.
- **Neşelendirme (Duygular):** yoldaki üzgün ya da korkmuş arkadaşa korna çal, neşelensin. Kızgın arkadaşla birlikte yavaşça nefes alınır (8 sn büyüyüp küçülen sakin daire).
- Yeni sonbahar teması (Mevsimler).

### Modüler yapı
- Her dünya kendi dosyasında (`js/worlds/<id>.js`); yeni dünya bir dosya ve iki satırla eklenir. Yeni mekanik `Mech.register` ile eklenir. Ayrıntı: `docs/SPEC-dunyalar.md`.
- `tools/check-worlds.js` tüm bölüm tanımlarını denetler; `tools/flash-check.js --world all` dünyaları yanıp sönmeye karşı test eder.
- Ücretli bölümler için tek bir erişim kapısı (`Worlds.Access`) hazır; şimdilik her şey ücretsiz.

## v0.2 (taslak, 2026-11-22)

### 10 bölüm, her bölümde yeni bir mekanik
- 1-5. bölümler yenilendi: çiftlikte yoldaki hayvanlar (korna), ormanda kütükler, karlı dağda teleferik ve kızak, sahilde bota dönüşen araç ve yunuslar, kasabada trafik lambası, ördek geçidi ve boya atölyesi.
- 5 yeni bölüm: Meyve bahçesi (ELMA, römork ve meyve ağaçları), Bulut tepeleri (şekiller, balonla süzülme), Dinozor vadisi (DİNO, dinozor köprüsü), Tren yolu (TREN, yol ayrımı ve tren yolculuğu), Lunapark (AFERİN, dönme dolap).
- 5 yeni tema ve harita simgesi.
- Bölümler sırayla açılır; ebeveyn panelinde "Tüm bölümler açık" anahtarı.
- Her bölümde 3 gizli çıkartma (zıplayarak alınır) ve garajda çıkartma albümü.
- Her bölümün sonunda temaya uygun kutlama köşesi.
- Korna gereken yerlerde korna düğmesi, balonla süzülürken zıpla düğmesi yavaşça büyüyüp küçülerek ipucu verir (yanıp sönmez).

## v0.1 (2026-11-21)

Aslaniko On the Road (Aslaniko Yollarda) oyununun ilk sürümü. Oyun tasarım: Dayko. Okul öncesi çocuklar için yandan bakışlı, dokunmatik araba oyunu.

### Oyun
- **Garaj:** araba, motosiklet, bisiklet ve ATV; her araç için renk seçenekleri. Seçim cihazda hatırlanır.
- **Harita ve 5 bölüm:** Çiftlik yolu, Sihirli orman, Karlı dağ, Güneşli sahil ve gündüz Oyuncak kasaba. Her bölüm yaklaşık 100 saniye.
- **Öğrenme:** her bölümde sırayla toplanan harf ya da sayılar: ASLAN, 1-2-3-4-5, 6-7-8-9-10, DENİZ, ASLANİKO.
- **Bölüm sonu:** toplanan kelime ya da sayılar bitiş bayrağının yanındaki tabelada ve bitiş ekranında renkli görünür, sesle bir kez daha okunur.
- **Mekanikler:** normal ve mega rampa, tek ve çift 360° dönel rampa, trambolin, sirk topu, tümsekler, havada altın halkalar (+3).
- **Kontroller:** basılı tut ve git, zıpla, turbo (basılı tut), korna, ana ekrana dönüş. Bilgisayarda klavye desteği.
- **Ana karakter:** logodaki yuvarlak gözlüklü aslan dört aracı da sürer (şimdilik kasksız).
- Kaybetmek, ceza ve süre baskısı yok; her bölüm konfeti ve kupayla biter.

### Logo ve görünüm
- Yeni logo: gözlüklü aslan mavi arabasıyla yolda. Oyun açılırken logo yaklaşık 2,5 saniye görünür (dokununca geçer).
- Yeni uygulama ikonu (iPad ana ekranı) ve tarayıcı sekmesi ikonu.
- Uygulama adı: "Aslaniko On the Road".

### Ses
- Motor sesi kaldırıldı; yerine kısık sesli, sakin bir müzik kutusu melodisi garaj, harita ve sürüşte döngüde çalar.
- Harf ve sayılar sesli okunurken müzik bir anlığına kısılır.
- Ebeveyn panelinde ayrı "Müzik" anahtarı.

### Göz dostu tasarım
- Yanıp sönen öğe, sık desen ve gece teması yok; sakin renk geçişleri ve yumuşak kamera (`CONSTRAINTS.md`).
- `tools/flash-check.js` her bölümü otomatik oynatıp yanıp sönmeyi ölçer.
- Ebeveyn panelinde "Az hareket" anahtarı.

### Ebeveyn ve gizlilik
- Dişliye 1 saniye basılı tutunca açılan ebeveyn paneli: ses, müzik, sesli okuma, hız, az hareket. Panelde sürüm numarası görünür.
- Kişisel bilgi, fotoğraf veya analitik yok; dış sunucuya bağlanmaz.
- iPad'de GitHub Pages + Ana Ekrana Ekle ile çevrimdışı çalışır.
