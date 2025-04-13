import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { isMiui, getBrand } from './DeviceInfoUtils';

class PermissionService {
  /**
   * Tüm gerekli izinleri ister
   */
  async requestAllPermissions(): Promise<boolean> {
    try {
      // Xiaomi/MIUI cihazlar için özel kontrol
      const brand = await getBrand();
      if (brand.toLowerCase() === 'xiaomi' || await isMiui()) {
        await this.checkMiuiPermissions();
      }
      
      // Android 10 (API 29) ve sonrası için aktivite tanıma izinleri
      if (Platform.OS === 'android' && Platform.Version >= 29) {
        const activityRecognitionGranted = await this.requestActivityRecognitionPermission();
        if (!activityRecognitionGranted) {
          console.log('Aktivite tanıma izni reddedildi');
          return false;
        }
      }

      // Konum izinleri
      const locationGranted = await this.requestLocationPermissions();
      if (!locationGranted) {
        console.log('Konum izinleri reddedildi');
        return false;
      }

      // Bluetooth izinleri
      const bluetoothGranted = await this.requestBluetoothPermissions();
      if (!bluetoothGranted) {
        console.log('Bluetooth izinleri reddedildi');
        return false;
      }

      return true;
    } catch (error) {
      console.error('İzin isteme hatası:', error);
      return false;
    }
  }
  
  /**
   * Xiaomi/MIUI telefonlarda özel izin ayarları için kontrol
   */
  async checkMiuiPermissions(): Promise<void> {
    try {
      Alert.alert(
        'Xiaomi Cihaz Tespit Edildi',
        'Xiaomi cihazınızda Google Fit bağlantısının düzgün çalışması için, "Pil ve performans" ayarlarından uygulamanın arka plan aktivitesine izin verdiğinizden emin olun.',
        [
          { text: 'Daha Sonra', style: 'cancel' },
          { 
            text: 'Ayarlara Git', 
            onPress: () => {
              // Xiaomi pil ayarlarına yönlendir
              Linking.openSettings();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Xiaomi izin kontrolü hatası:', error);
    }
  }

  /**
   * Aktivite tanıma izni ister
   */
  async requestActivityRecognitionPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android' || Platform.Version < 29) {
        return true; // Android 10'dan düşük sürümler için gerekli değil
      }

      const granted = await PermissionsAndroid.request(
        'android.permission.ACTIVITY_RECOGNITION',
        {
          title: 'Aktivite Tanıma İzni',
          message: 
            'Uyku ve sağlık verilerinizi analiz etmek için ' +
            'aktivite tanıma izni gereklidir.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Aktivite tanıma izni hatası:', error);
      return false;
    }
  }

  /**
   * Konum izinlerini ister
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return true; // Sadece Android için gerekli
      }

      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Hassas Konum İzni',
          message: 'Hassas konum izni gereklidir.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        }
      );

      const coarseLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Yaklaşık Konum İzni',
          message: 'Yaklaşık konum izni gereklidir.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        }
      );

      // Android 10 ve üzeri için arka plan konum izni
      let backgroundLocationGranted = true;
      if (Platform.Version >= 29) {
        backgroundLocationGranted = await PermissionsAndroid.request(
          'android.permission.ACCESS_BACKGROUND_LOCATION',
          {
            title: 'Arka Plan Konum İzni',
            message: 
              'Uygulamanın arka planda çalışırken de ' +
              'konumunuza erişmesine izin verir.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          }
        ) === PermissionsAndroid.RESULTS.GRANTED;
      }

      return (
        fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        backgroundLocationGranted
      );
    } catch (error) {
      console.error('Konum izinleri hatası:', error);
      return false;
    }
  }

  /**
   * Bluetooth izinlerini ister
   */
  async requestBluetoothPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return true; // Sadece Android için gerekli
      }

      // Android 12 ve üzeri için Bluetooth tarama ve bağlantı izinleri
      if (Platform.Version >= 31) {
        const scanGranted = await PermissionsAndroid.request(
          'android.permission.BLUETOOTH_SCAN',
          {
            title: 'Bluetooth Tarama İzni',
            message: 'Bluetooth cihazlarını taramak için izin gereklidir.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          }
        );

        const connectGranted = await PermissionsAndroid.request(
          'android.permission.BLUETOOTH_CONNECT',
          {
            title: 'Bluetooth Bağlantı İzni',
            message: 'Bluetooth cihazlarına bağlanmak için izin gereklidir.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          }
        );

        return (
          scanGranted === PermissionsAndroid.RESULTS.GRANTED &&
          connectGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      }

      // Android 12'den düşük sürümler için eski Bluetooth izinleri
      return true;
    } catch (error) {
      console.error('Bluetooth izinleri hatası:', error);
      return false;
    }
  }
}

export default new PermissionService(); 