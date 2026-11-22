# Değişiklikler

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
