# Google Fit Entegrasyonu Kurulum Talimatları

## Google API Projesi Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin ve Google hesabınızla giriş yapın.
2. Yeni bir proje oluşturun ("Proje Oluştur" düğmesine tıklayın).
3. Projenize bir isim verin (örneğin "BiorestMobil") ve "Oluştur" düğmesine tıklayın.
4. Proje oluşturulduktan sonra, soldaki menüden "APIs & Services" > "Library" seçeneğini tıklayın.
5. Arama çubuğuna "Fitness" yazın ve "Fitness API" öğesini bulun.
6. "Fitness API"yi seçin ve "Etkinleştir" düğmesine tıklayın.

## OAuth Kimlik Bilgilerini Oluşturma

1. Sol menüden "APIs & Services" > "Credentials" seçeneğine tıklayın.
2. "Create Credentials" düğmesine tıklayın ve "OAuth client ID" seçeneğini seçin.
3. "Application type" olarak "Android" seçin.
4. Uygulamanıza bir isim verin (örneğin "BiorestMobil Android").
5. "Package name" alanına uygulamanızın paket adını girin (örneğin "com.biorest.bioapp").
6. "SHA-1 certificate fingerprint" oluşturmak için aşağıdaki komutu çalıştırın:

```bash
cd android && ./gradlew signingReport
```

7. Komut çıktısından "SHA1" değerini kopyalayın ve Google Cloud Console'da ilgili alana yapıştırın.
8. "Create" düğmesine tıklayın.

## Android Projesinde Yapılandırma

1. `android/app/src/main/AndroidManifest.xml` dosyasında gerekli izinlerin eklendiğinden emin olun:

```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
```

2. Google Fit verilerini almak için uygulamanızda `GoogleFitService.ts` dosyasını kullanabilirsiniz.

## Test Etme

1. Uygulamanızı başlatın ve "Sağlık" sekmesine gidin.
2. "Google Fit'e Bağlan" düğmesine tıklayın.
3. Google hesabınızla giriş yapmanız ve gerekli izinleri vermeniz istenecektir.
4. İzinleri verdikten sonra sağlık verileriniz uygulamada görüntülenecektir.

## Sorun Giderme

- **Bağlantı Hatası Alıyorsanız**: SHA-1 parmak izinin doğru olduğundan ve Google Cloud Console'da doğru paket adını kullandığınızdan emin olun.
- **Veri Göremiyorsanız**: Google Fit uygulamasının cihazınızda yüklü olduğundan ve gerekli verileri topladığından emin olun.
- **Yetkilendirme Hatası Alıyorsanız**: Google Cloud Console'da Fitness API'nin etkinleştirildiğinden emin olun.

## Notlar

- Google Fit API, kullanıcının cihazında Google Fit uygulamasının yüklü olmasını gerektirmez, ancak kullanıcının bir Google hesabı olması gerekir.
- Sağlık verileri hassas kişisel veriler içerir, kullanıcı aydınlatma metninizde bu verilerin nasıl kullanılacağını belirttiğinizden emin olun.
- Farklı Android sürümleri için farklı izin mekanizmaları gerekebilir. Android 10+ için özellikle ACTIVITY_RECOGNITION izni önemlidir. 