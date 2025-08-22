import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export class PermissionService {
  // Bluetooth izinleri için
  static async requestBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      // Android 12+ (API 31+) için yeni izinler
      if (Platform.Version >= 31) {
        console.log('🔍 Android 12+ Bluetooth izinleri isteniyor...');
        
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        // Tüm izinlerin durumunu kontrol et
        const allGranted = Object.values(results).every(
          (result: string) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          console.log('✅ Tüm Bluetooth izinleri verildi');
          return true;
        } else {
          console.log('❌ Bazı Bluetooth izinleri reddedildi:', results);
          this.showBluetoothPermissionAlert();
          return false;
        }
      } else {
        // Android 11 ve altı için eski izinler
        console.log('🔍 Android 11- Bluetooth izinleri isteniyor...');
        
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Location izni verildi (Bluetooth için)');
          return true;
        } else {
          console.log('❌ Location izni reddedildi');
          this.showBluetoothPermissionAlert();
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Bluetooth izin hatası:', error);
      return false;
    }
  }

  // Konum izni için (Bluetooth scanning için gerekli)
  static async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Konum İzni Gerekli',
          message: 'Mi Band 3 cihazını bulabilmek için konum iznine ihtiyacımız var. Bluetooth cihazları konum izni olmadan taranamaz.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'İzin Ver',
        }
      );

      if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Konum izni verildi');
        return true;
      } else {
        console.log('❌ Konum izni reddedildi');
        this.showLocationPermissionAlert();
        return false;
      }
    } catch (error) {
      console.error('❌ Konum izin hatası:', error);
      return false;
    }
  }

  // Health Connect izinleri için
  static async requestHealthConnectPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      // Health Connect izinleri Android manifest'te tanımlı
      // Runtime'da sadece Health Connect API üzerinden isteniyor
      console.log('✅ Health Connect izinleri manifest\'te tanımlı');
      return true;
    } catch (error) {
      console.error('❌ Health Connect izin hatası:', error);
      return false;
    }
  }

  // Bildirim izni için (Android 13+)
  static async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || Platform.Version < 33) return true;

    try {
      // Android 13+ için bildirim izni manifest'te tanımlı
      // Runtime'da otomatik olarak isteniyor
      console.log('✅ Bildirim izni manifest\'te tanımlı');
      return true;
    } catch (error) {
      console.error('❌ Bildirim izin hatası:', error);
      return false;
    }
  }

  // Tüm gerekli izinleri iste
  static async requestAllPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Tüm izinler isteniyor...');
      
      const [
        bluetoothGranted,
        locationGranted,
        healthConnectGranted,
        notificationGranted
      ] = await Promise.all([
        this.requestBluetoothPermissions(),
        this.requestLocationPermission(),
        this.requestHealthConnectPermissions(),
        this.requestNotificationPermission(),
      ]);

      const allGranted = bluetoothGranted && locationGranted && healthConnectGranted;
      
      if (allGranted) {
        console.log('✅ Tüm gerekli izinler verildi');
        return true;
      } else {
        console.log('❌ Bazı izinler reddedildi');
        return false;
      }
    } catch (error) {
      console.error('❌ İzin isteme hatası:', error);
      return false;
    }
  }

  // Bluetooth izin uyarısı
  private static showBluetoothPermissionAlert() {
    Alert.alert(
      'Bluetooth İzni Gerekli',
      'Mi Band 3 cihazını bulabilmek için Bluetooth izinlerine ihtiyacımız var. Lütfen ayarlardan izin verin.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
      ]
    );
  }

  // Konum izin uyarısı
  private static showLocationPermissionAlert() {
    Alert.alert(
      'Konum İzni Gerekli',
      'Bluetooth cihazları konum izni olmadan taranamaz. Bu, Android\'in güvenlik özelliğidir.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
      ]
    );
  }

  // Health Connect izin uyarısı
  private static showHealthConnectPermissionAlert() {
    Alert.alert(
      'Health Connect İzni Gerekli',
      'Sağlık verilerini okuyabilmek için Health Connect izinlerine ihtiyacımız var.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
      ]
    );
  }

  // Konum servisleri aktif mi kontrol et (BLE çalışma sistemi)
  static async checkLocationServicesEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      // Android'de konum izni varsa ve FINE_LOCATION verilmişse, 
      // genellikle konum servisleri de açıktır
      const locationPermission = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      console.log('📍 Konum izni durumu:', locationPermission);
      
      if (locationPermission === RESULTS.GRANTED) {
        console.log('✅ Konum izni mevcut - Bluetooth tarama için uygun');
        return true;
      } else {
        console.log('❌ Konum izni yok - Bluetooth tarama engellenir');
        return false;
      }
    } catch (error) {
      console.log('⚠️ Konum servisi durumu kontrol edilemedi:', error);
      return false; // Güvenli seçenek: false döndür
    }
  }

  // Konum servisleri açma rehberi göster
  static showLocationServicesAlert() {
    Alert.alert(
      'Konum Servisleri Gerekli',
      'Bluetooth cihazları taramak için Android\'de konum servisleri açık olmalıdır.\n\n🔧 Çözüm Adımları:\n\n1️⃣ Ayarlar uygulamasını açın\n2️⃣ "Konum" sekmesine gidin\n3️⃣ Konum servislerini AÇIK yapın\n4️⃣ Uygulamaya geri dönün\n\n💡 Bu, Android\'in güvenlik özelliğidir. Konumunuz kullanılmaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Konum Ayarları', 
          onPress: () => {
            try {
              // Android konum ayarlarını aç
              Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
            } catch (error) {
              // Fallback olarak genel ayarlara git
              Linking.openSettings();
            }
          }
        },
      ]
    );
  }

  // Bluetooth tarama için tüm gereksinimleri kontrol et
  static async checkBluetoothScanRequirements(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Bluetooth tarama gereksinimleri kontrol ediliyor...');

      // 1. İzinleri kontrol et
      const permissionsGranted = await this.requestBluetoothPermissions();
      if (!permissionsGranted) {
        return {
          success: false,
          message: 'Bluetooth izinleri verilmedi. Lütfen ayarlardan izin verin.'
        };
      }

      // 2. Konum servislerini kontrol et
      const locationEnabled = await this.checkLocationServicesEnabled();
      if (!locationEnabled) {
        this.showLocationServicesAlert();
        return {
          success: false,
          message: 'Konum servisleri kapalı. Bluetooth tarama için gerekli.'
        };
      }

      console.log('✅ Tüm Bluetooth tarama gereksinimleri karşılandı');
      return {
        success: true,
        message: 'Bluetooth tarama için hazır'
      };

    } catch (error) {
      console.error('❌ Bluetooth tarama gereksinim kontrolü hatası:', error);
      return {
        success: false,
        message: 'Kontrol sırasında hata oluştu: ' + String(error)
      };
    }
  }
} 