import { PermissionsAndroid, Platform } from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';

export interface DeviceSettings {
  isAutoMode: boolean;
  temperature: number;
  humidity: number;
  lightLevel: number;
  soundLevel: number;
  aromatherapyLevel: number;
  selectedScent: string;
}

class BluetoothService {
  private static instance: BluetoothService;
  private isInitialized: boolean = false;
  private connectedDevice: Peripheral | null = null;

  private constructor() {}

  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await BleManager.start({ showAlert: false });
      
      // Android için izinleri kontrol et
      if (Platform.OS === 'android') {
        await this.requestAndroidPermissions();
      }

      this.isInitialized = true;
      console.log('Bluetooth servisi başlatıldı');
    } catch (error) {
      console.error('Bluetooth başlatma hatası:', error);
      throw error;
    }
  }

  private async requestAndroidPermissions(): Promise<void> {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      const hasPermissions = Object.values(results).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!hasPermissions) {
        throw new Error('Bluetooth izinleri reddedildi');
      }
    }
  }

  public async scanForDevices(): Promise<Peripheral[]> {
    try {
      await BleManager.scan([], 5, true); // 5 saniye tara
      return new Promise((resolve) => {
        setTimeout(async () => {
          const devices = await BleManager.getDiscoveredPeripherals();
          resolve(devices);
        }, 5000);
      });
    } catch (error) {
      console.error('Cihaz tarama hatası:', error);
      throw error;
    }
  }

  public async connectToDevice(deviceId: string): Promise<void> {
    try {
      await BleManager.connect(deviceId);
      const peripheralInfo = await BleManager.retrieveServices(deviceId);
      this.connectedDevice = peripheralInfo;
      console.log('Cihaza bağlanıldı:', deviceId);
    } catch (error) {
      console.error('Cihaz bağlantı hatası:', error);
      throw error;
    }
  }

  public async disconnectDevice(): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      await BleManager.disconnect(this.connectedDevice.id);
      this.connectedDevice = null;
      console.log('Cihaz bağlantısı kesildi');
    } catch (error) {
      console.error('Cihaz bağlantısını kesme hatası:', error);
      throw error;
    }
  }

  public async sendSettings(settings: DeviceSettings): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('Bağlı cihaz bulunamadı');
    }

    try {
      // Ayarları JSON formatına çevir
      const settingsData = JSON.stringify(settings);
      const data = this.stringToBytes(settingsData);

      // Karakteristik UUID'yi cihazınıza göre değiştirin
      const serviceUUID = 'YOUR_SERVICE_UUID';
      const characteristicUUID = 'YOUR_CHARACTERISTIC_UUID';

      await BleManager.write(
        this.connectedDevice.id,
        serviceUUID,
        characteristicUUID,
        data,
        data.length
      );

      console.log('Ayarlar gönderildi');
    } catch (error) {
      console.error('Ayar gönderme hatası:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  private stringToBytes(str: string): number[] {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }
}

export default BluetoothService; 