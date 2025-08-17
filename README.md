# 🤖 Kodlama Arkadaşım - Kids Coding Assistant

Çocuklar için tasarlanmış speech-to-text destekli kod üretimi uygulaması! Çocuklar seslerini kullanarak Arduino kodları oluşturabilir ve eğlenceli animasyonlarla kodlama deneyimi yaşayabilirler.

## ✨ Özellikler

- 🎤 **Speech-to-Text API**: Gerçek ses tanıma teknolojisi
- 🎨 **Çocuk Dostu Arayüz**: Renkli, eğlenceli ve mobil uyumlu tasarım
- 🤖 **3D Robot Animasyonları**: Kodlar oluşturulurken eğlenceli robot animasyonları
- 📱 **Responsive Design**: Tablet ve telefonda mükemmel çalışır
- 🎯 **Arduino Kod Üretimi**: LED, motor, sensör ve servo için hazır kod şablonları
- 🎉 **Başarı Animasyonları**: Konfeti ve kutlama efektleri
- 🔄 **Kolay Yeniden Başlatma**: Tek tuşla yeni projeler

## 🛠️ Teknolojiler

- **HTML5**: Yapısal içerik
- **CSS3**: 3D animasyonlar ve responsive tasarım
- **JavaScript**: Web Speech API entegrasyonu
- **Font Awesome**: İkonlar
- **Google Fonts**: Çocuk dostu tipografi

## 🚀 Kurulum ve Çalıştırma

1. **Projeyi klonlayın:**
   ```bash
   git clone [repository-url]
   cd 1507-Ranka-Demo
   ```

2. **Local server başlatın:**
   ```bash
   # Python kullanarak
   python -m http.server 8000
   
   # Node.js kullanarak
   npx serve .
   
   # VS Code Live Server extension kullanarak
   # index.html'e sağ tıklayıp "Open with Live Server"
   ```

3. **Tarayıcıda açın:**
   - `http://localhost:8000` adresine gidin
   - HTTPS gereklidir (Speech API için)

## 📱 Kullanım

1. **🎤 Mikrofon Butonu**: Ses kaydını başlatmak için tıklayın
2. **🗣️ Konuşun**: Ne yapmak istediğinizi söyleyin:
   - "LED yakmak istiyorum"
   - "Motor çalıştırmak istiyorum" 
   - "Mesafe sensörü kullanmak istiyorum"
   - "Servo motor çevirmek istiyorum"
3. **🤖 AI İşleme**: Robot kodları oluştururken bekleyin
4. **📝 Kod Görüntüleme**: Oluşturulan Arduino kodlarını inceleyin
5. **⬆️ Yükleme**: "Kodları Yükle" butonuna basın
6. **🎉 Başarı**: Kutlama animasyonunu izleyin!

## 🎨 Desteklenen Komutlar

| Ses Komutu | Kod Türü | Açıklama |
|------------|----------|----------|
| "led", "ışık", "lamba" | LED Kontrol | LED yakıp söndürme kodu |
| "motor", "hareket" | Motor Kontrol | Motor hız kontrolü |
| "sensör", "mesafe" | Ultrasonic Sensör | Mesafe ölçüm kodu |
| "servo", "döndür" | Servo Motor | Servo hareket kodu |
| Diğer komutlar | Varsayılan | Buton + LED kombine kod |

## 🔧 Geliştirme

### Dosya Yapısı
```
1507-Ranka-Demo/
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri ve animasyonlar
├── script.js           # JavaScript mantığı
├── README.md           # Bu dosya
└── .github/
    └── copilot-instructions.md
```

### Yeni Kod Şablonu Ekleme

`script.js` dosyasındaki `codeTemplates` objesine yeni kod türleri ekleyebilirsiniz:

```javascript
const codeTemplates = {
    // ... mevcut şablonlar
    'yeniTur': `// Yeni Arduino Kodu
    // Kodunuz buraya...`
};
```

## 🌟 Özelleştirme

### Renk Teması Değiştirme
`style.css` dosyasındaki CSS değişkenlerini düzenleyerek renk temasını değiştirebilirsiniz.

### Animasyon Hızları
CSS animasyon süreleri `@keyframes` bölümlerinde ayarlanabilir.

### Ses Tanıma Dili
`script.js` dosyasında `recognition.lang` değerini değiştirerek farklı diller ekleyebilirsiniz.

## 📋 Gereksinimler

- **Modern Tarayıcı**: Chrome, Safari, Edge (Speech API desteği için)
- **HTTPS**: Ses izni için güvenli bağlantı gerekli
- **Mikrofon**: Ses tanıma için mikrofon erişimi

## 🔒 Gizlilik

- Ses verileri sadece tarayıcıda işlenir
- Hiçbir ses verisi sunucuya gönderilmez
- Web Speech API tarayıcı seviyesinde çalışır

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje eğitim amaçlı oluşturulmuştur. Çocuklar için özgürce kullanılabilir.

## 🙏 Teşekkürler

- Web Speech API
- Font Awesome
- Google Fonts
- Tüm çocuk kullanıcılarımıza ❤️

---

**Made with ❤️ for kids who love coding!** 

*Bu uygulama çocukların kodlamaya olan ilgisini artırmak ve teknoloji ile eğlenceli bir şekilde tanışmalarını sağlamak amacıyla geliştirilmiştir.*
