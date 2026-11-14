# Memur Alım

KPSS **P93** ve **önlisans** mezunları için kamu personel alım ilanlarını tek yerde toplayan, uygunluğunu gösteren ve başvuruları takip eden çevrimdışı PWA.

Canlı: https://nora-seed.github.io/memur-pwa/

## Özellikler

- KPSS merkezi atama, kurum sözleşmeli personel ve kamu işçi ilanları
- P93 puanı ve mezuniyete göre **uygunluk** hesabı
- Son başvuru tarihine göre **geri sayım** ve durum etiketleri
- Şehir, mezuniyet, tür, durum ve uygunluk **filtreleri**
- Favoriler, başvuru durumu ve not takibi
- Profil, tema (açık/koyu/cihaz), JSON yedek al/yükle
- Çevrimdışı çalışma (service worker) ve ana ekrana ekleme

## Veri

Tüm ilanlar `data.json` dosyasından gelir; sunucu/veritabanı yoktur. Uygulama aynı zamanda veriyi `localStorage` içinde önbelleğe alır.

```json
{
  "version": 1,
  "isSample": false,
  "updatedAt": "2026-11-14",
  "announcements": [
    {
      "id": "ornek-ilan-2026",
      "institution": "Kurum adı",
      "title": "Kadro",
      "type": "kpss",
      "city": "Ankara",
      "quota": 10,
      "education": "onlisans",
      "departments": ["Büro Yönetimi"],
      "scoreType": "P93",
      "requiredScore": 70,
      "lastCutoff": 78.6,
      "applicationStart": "2026-11-20",
      "applicationEnd": "2026-11-27",
      "examDate": "",
      "resultDate": "",
      "conditions": "Şartlar…",
      "description": "Açıklama…",
      "sourceUrl": "https://…",
      "publishedAt": "2026-11-14",
      "tags": ["etiket"],
      "sample": false
    }
  ]
}
```

- `type`: `kpss` | `sozlesmeli` | `isci`
- `education`: `ilkokul` | `ortaokul` | `lise` | `onlisans` | `lisans` | `farketmez`
- `requiredScore`: ilanın istediği **asgari** P93 puanı (uygunluk için kullanılır)
- `lastCutoff`: geçen yılın **taban** puanı; yalnızca fikir verir, uygunluk hesabına girmez
- `scoreType`: `"P93"` veya `""`

Mevcut `data.json` **örnek ilanlar** içerir (`isSample: true`). Gerçek ilanlara geçerken kayıtları güncelleyip `isSample` ve `sample` alanlarını `false` yap.

## Geliştirme

Derleme adımı yoktur; statik dosyalar doğrudan servis edilir.

```bash
python -m http.server 8080
# http://localhost:8080
```

Kontroller (DOM testleri için jsdom gerekir):

```bash
npm install
npm run check      # sözdizimi
npm run validate   # data.json
npm test           # birim + DOM testleri
```

## Dağıtım

`main` dalına gönderim GitHub Pages üzerinden otomatik yayınlanır (kök dizin). `.github/workflows/validate.yml` veri ve test doğrulaması yapar.

## Not

Bu uygulama resmi bir ilan sitesi değildir. Başvuru öncesi ilgili kurumun resmi ilanını kontrol edin.
