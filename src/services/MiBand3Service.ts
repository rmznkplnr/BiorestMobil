import { BleManager, Device, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { store } from '../store';
import { 
  setMiBand3Connection,
  addMiBand3HeartRate,
  setMiBand3Monitoring 
} from '../store/slices/deviceSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { PermissionService } from './PermissionService';

// 🆕 KALICI VERİ SAKLAMA KEYS
const STORAGE_KEYS = {
  HEART_RATE_DATA: 'miband3_heart_rate_data',
  SLEEP_SESSIONS: 'miband3_sleep_sessions',
  DEVICE_INFO: 'miband3_device_info',
  LAST_SYNC: 'miband3_last_sync',
};

export class MiBand3Service {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private isPaired = false;
  private isScanning = false;
  private isMonitoring = false;
  private scannedDevices: Device[] = [];
  private authKey: string | null = null;

  // UUID'ler
  private readonly AUTH_SERVICE_UUID = '0000fee1-0000-1000-8000-00805f9b34fb';
  private readonly AUTH_CHAR_UUID = '00000009-0000-3512-2118-0009af100700';
  
  // Alternative Auth UUIDs (Mi Band 3 variations)
  private readonly AUTH_CHAR_ALT1 = '00000009-0000-3512-2118-0009af100700';
  private readonly AUTH_CHAR_ALT2 = '00000009-0000-1000-8000-00805f9b34fb';
  private readonly AUTH_CHAR_ALT3 = '00000010-0000-3512-2118-0009af100700';
  
  private readonly HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
  private readonly HR_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
  private readonly HR_CONTROL_UUID = '00002a39-0000-1000-8000-00805f9b34fb';
  
  private readonly USER_INFO_SERVICE_UUID = '0000fee0-0000-1000-8000-00805f9b34fb';
  private readonly USER_INFO_CHAR_UUID = '00000008-0000-3512-2118-0009af100700';

  // 🆕 SLEEP DETECTION - Gadgetbridge Protocol
  private readonly SLEEP_DETECTION_SERVICE_UUID = '0000fee0-0000-1000-8000-00805f9b34fb';
  private readonly SLEEP_DETECTION_CHAR_UUID = '00000010-0000-3512-2118-0009af100700';

  // Sleep state tracking
  private currentSleepState: 'AWAKE' | 'ASLEEP' | 'LIGHT_SLEEP' | 'DEEP_SLEEP' = 'AWAKE';
  private sleepStartTime: Date | null = null;
  private sleepHeartRateData: Array<{heartRate: number, timestamp: string}> = [];
  private sleepHeartRateMonitoring: boolean = false;

  // 🆕 Periyodik nabız ölçümü için
  private periodicHRTimer: NodeJS.Timeout | null = null;
  private isPeriodicHRActive: boolean = false;
  private periodicHRInterval: number = 30000; // 30 saniye default
  private periodicHRMonitoring: any = null; // Aktif monitoring referansı
  private isPeriodicMeasuring: boolean = false; // Ölçüm sırasında çakışma önleme
  private lastHeartRateSavedAtMs: number = 0; // Son kaydedilen HR zamanı (duplikasyon önleme)
  private periodicPausedSleepMonitoring: boolean = false; // Periyodik ölçüm için sleep monitoring durduruldu mu

  // Periyodik ölçüm için Sleep HR monitoring'i durdur
  private async pauseSleepMonitoringForPeriodic(): Promise<void> {
    if (this.sleepHeartRateMonitoring) {
      try {
        console.log('⏸️ Sleep HR monitoring periyodik ölçüm için durduruluyor...');
        await this.stopSleepHeartRateMonitoring();
        this.periodicPausedSleepMonitoring = true;
        console.log('✅ Sleep HR monitoring durduruldu (periyodik)');
      } catch (error) {
        console.log('ℹ️ Sleep HR monitoring durdurulamadı (devam ediliyor):', error);
      }
    }
  }

  // Periyodik ölçüm bittiğinde Sleep HR monitoring'i tekrar başlat
  private resumeSleepMonitoringIfPaused(): void {
    if (this.periodicPausedSleepMonitoring) {
      console.log('▶️ Sleep HR monitoring tekrar başlatılıyor (periyodik bitti)...');
      this.startSleepHeartRateMonitoring()
        .then(() => {
          console.log('✅ Sleep HR monitoring tekrar aktif');
        })
        .catch((err) => {
          console.log('⚠️ Sleep HR monitoring tekrar başlatılamadı:', err);
        })
        .finally(() => {
          this.periodicPausedSleepMonitoring = false;
        });
    }
  }

  constructor() {
    this.bleManager = new BleManager();
    this.loadAuthKey();
    
    // 🆕 Uygulama başladığında kalıcı verileri yükle
    this.loadPersistedData();
  }

  // Auth key yönetimi
  private async loadAuthKey(): Promise<void> {
    try {
      const savedKey = await AsyncStorage.getItem('miband3_auth_key');
      if (savedKey) {
        this.authKey = savedKey;
        console.log('✅ Auth key yüklendi:', savedKey.substring(0, 8) + '...');
      } else {
        // Gadgetbridge default key (loglardan)
        this.authKey = '30313233343536373839404142434445';
        await AsyncStorage.setItem('miband3_auth_key', this.authKey);
        console.log('✅ Default auth key kullanılıyor');
      }
    } catch (error) {
      console.error('❌ Auth key yükleme hatası:', error);
      this.authKey = '30313233343536373839404142434445';
    }
  }

  private async saveAuthKey(key: string): Promise<void> {
    try {
      this.authKey = key;
      await AsyncStorage.setItem('miband3_auth_key', key);
      console.log('✅ Auth key kaydedildi');
    } catch (error) {
      console.error('❌ Auth key kaydetme hatası:', error);
    }
  }

  // Bluetooth durumunu kontrol et
  private async initializeBluetooth(): Promise<void> {
    try {
      const state = await this.bleManager.state();
      console.log('🔵 Bluetooth durumu:', state);
    } catch (error) {
      console.error('❌ Bluetooth başlatma hatası:', error);
    }
  }

  // Mi Band 3 cihazlarını tara
  public async scanForMiBand3Devices(): Promise<Device[]> {
    try {
      console.log('🔍 Mi Band 3 tarama başlatılıyor...');
      
      // Önce Bluetooth tarama gereksinimlerini kontrol et
      const requirements = await PermissionService.checkBluetoothScanRequirements();
      if (!requirements.success) {
        console.error('❌ Bluetooth tarama gereksinimleri karşılanmadı:', requirements.message);
        throw new Error(requirements.message);
      }
      
      console.log('🔍 Mi Band 3 taranıyor...');
      this.scannedDevices = [];
      this.isScanning = true;

      return new Promise((resolve, reject) => {
        let scanTimeout: NodeJS.Timeout;
        
        const subscription = this.bleManager.startDeviceScan(
          null,
          { allowDuplicates: false },
          (error, device) => {
            if (error) {
              console.error('❌ Tarama hatası:', error);
              this.isScanning = false;
              if (scanTimeout) clearTimeout(scanTimeout);
              this.bleManager.stopDeviceScan();
              reject(error);
              return;
            }

            if (device && device.name) {
              console.log('📱 Bulunan cihaz:', device.name);
              
              // Mi Band 3 kontrolü
              if (device.name.includes('Mi Band') || 
                  device.name.includes('Band') ||
                  device.name.includes('Xiaomi')) {
                console.log('✅ Mi Band 3 bulundu:', device.name);
                
                const exists = this.scannedDevices.find(d => d.id === device.id);
                if (!exists) {
                  this.scannedDevices.push(device);
                }
              }
            }
          }
        );

        // 10 saniye sonra taramayı durdur
        scanTimeout = setTimeout(() => {
          this.bleManager.stopDeviceScan();
          this.isScanning = false;
          console.log('✅ Tarama tamamlandı:', this.scannedDevices.length, 'cihaz bulundu');
          resolve(this.scannedDevices);
        }, 10000);
      });
    } catch (error) {
      console.error('❌ Tarama hatası:', error);
      this.isScanning = false;
      throw error;
    }
  }

  // Gadgetbridge Authentication Protocol (Loglardan)
  private async performGadgetbridgeAuth(): Promise<boolean> {
    if (!this.connectedDevice || !this.authKey) {
      throw new Error('Cihaz bağlı değil veya auth key yok');
    }

    try {
      console.log('🔐 Gadgetbridge authentication başlatılıyor...');

      // Loglardan alınan gerçek auth key: 79 66 39 6c 70 69 4f 4f 52 31 75 50 64 6b 76 54
      const realAuthKey = '7966396c70694f4f52317550646b7654';
      console.log('🔑 Gerçek auth key kullanılıyor:', realAuthKey);

      return new Promise((resolve, reject) => {
        let authStep = 0;
        let authTimeout: NodeJS.Timeout;

        // Auth characteristic notifications'ı aktif et
        this.connectedDevice!.monitorCharacteristicForService(
          this.AUTH_SERVICE_UUID,
          '00000009-0000-3512-2118-0009af100700',
          (error: any, characteristic: any) => {
            if (error) {
              console.error('❌ Auth notification hatası:', error);
              if (authTimeout) clearTimeout(authTimeout);
              reject(error);
              return;
            }
            
            if (characteristic?.value) {
              const data = Buffer.from(characteristic.value, 'base64');
              console.log('📥 Auth response:', data.toString('hex').toUpperCase());
              
              // Step 1 Success response: 10 01 01
              if (data.length >= 3 && data[0] === 0x10 && data[1] === 0x01 && data[2] === 0x01 && authStep === 1) {
                console.log('✅ Authentication Step 1 SUCCESS!');
                authStep = 2;
                this.sendRandomRequest();
              }
              // Random data response: 10 02 01 + 16 bytes random
              else if (data.length >= 3 && data[0] === 0x10 && data[1] === 0x02 && data[2] === 0x01 && authStep === 2) {
                console.log('📥 Random data alındı, encryption yapılıyor...');
                authStep = 3;
                this.handleRandomDataResponse(data, realAuthKey);
              }
              // Final success: 10 03 01
              else if (data.length >= 3 && data[0] === 0x10 && data[1] === 0x03 && data[2] === 0x01 && authStep === 3) {
                console.log('✅ Authentication TAMAMLANDI!');
                if (authTimeout) clearTimeout(authTimeout);
                this.isPaired = true;
                resolve(true);
              }
            }
          }
        );

        // Timeout ayarla (10 saniye)
        authTimeout = setTimeout(() => {
          console.error('❌ Authentication timeout!');
          reject(new Error('Authentication timeout'));
        }, 10000);

        // Step 1: Auth key gönder
        this.sendAuthKey(realAuthKey).then(() => {
          authStep = 1;
        }).catch((error) => {
          if (authTimeout) clearTimeout(authTimeout);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('❌ Gadgetbridge auth hatası:', error);
      return false;
    }
  }

  // Auth key gönder
  private async sendAuthKey(authKey: string): Promise<void> {
    console.log('📤 Step 1: Auth key gönderiliyor...');
    const authKeyCommand = Buffer.concat([
      Buffer.from([0x01, 0x00]), // Command header
      Buffer.from(authKey, 'hex') // Auth key
    ]);
    
    console.log('📤 Auth key command:', authKeyCommand.toString('hex').toUpperCase());
    
    await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
      this.AUTH_SERVICE_UUID,
      '00000009-0000-3512-2118-0009af100700',
      authKeyCommand.toString('base64')
    );
  }

  // Random number iste
  private async sendRandomRequest(): Promise<void> {
    console.log('📤 Step 2: Random number isteniyor...');
    const randomRequest = Buffer.from([0x02, 0x00]);
    
    await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
      this.AUTH_SERVICE_UUID,
      '00000009-0000-3512-2118-0009af100700',
      randomRequest.toString('base64')
    );
  }

  // Random data response handler
  private async handleRandomDataResponse(data: Buffer, authKey: string): Promise<void> {
    try {
      if (data.length >= 19) { // 10 02 01 + 16 bytes random
        const randomData = data.slice(3, 19); // 16 byte random
        console.log('🔐 Random data:', randomData.toString('hex').toUpperCase());
        
        // AES-128-ECB ile encrypt et
        const key = CryptoJS.enc.Hex.parse(authKey);
        const dataToEncrypt = CryptoJS.enc.Hex.parse(randomData.toString('hex'));
        
        const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });

        const encryptedBuffer = Buffer.from(encrypted.ciphertext.toString(CryptoJS.enc.Hex), 'hex');
        console.log('🔐 Encrypted random:', encryptedBuffer.toString('hex').toUpperCase());

        // 3. Encrypted random gönder (Loglardan: 03 00 + encrypted data)
        const encryptedCommand = Buffer.concat([
          Buffer.from([0x03, 0x00]),
          encryptedBuffer
        ]);

        console.log('📤 Step 3: Encrypted random gönderiliyor...');
        console.log('📤 Encrypted command:', encryptedCommand.toString('hex').toUpperCase());

        await this.connectedDevice!.writeCharacteristicWithoutResponseForService(
          this.AUTH_SERVICE_UUID,
          '00000009-0000-3512-2118-0009af100700',
          encryptedCommand.toString('base64')
        );
      }
    } catch (error) {
      console.error('❌ Random data handling hatası:', error);
    }
  }

  // Cihaza bağlan ve authenticate et
  public async connectToDevice(device: Device): Promise<boolean> {
    try {
      console.log('🔗 Bağlanıyor:', device.name);
      
      // Bağlantı kur
      this.connectedDevice = await device.connect();
      await this.connectedDevice.discoverAllServicesAndCharacteristics();
      
      console.log('✅ BLE bağlantı kuruldu');

      // Gadgetbridge authentication
      const authSuccess = await this.performGadgetbridgeAuth();
      
      if (authSuccess) {
        // Redux state güncelle
        store.dispatch(setMiBand3Connection({ connected: true, paired: true }));
        
        // User info ayarla (Gadgetbridge protokolü + Saat/Tarih)
        await this.setupUserInfo();
        
        // Sleep detection başlat
        await this.startSleepDetection();
        
        console.log('✅ Mi Band 3 tamamen hazır!');
        return true;
      } else {
        throw new Error('Authentication başarısız');
      }
      
    } catch (error) {
      console.error('❌ Bağlantı hatası:', error);
      this.connectedDevice = null;
      this.isPaired = false;
      
      store.dispatch(setMiBand3Connection({ connected: false, paired: false }));
      return false;
    }
  }

  // User info setup (Gadgetbridge protokolü + Saat/Tarih)
  private async setupUserInfo(): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      console.log('👤 User info ve saat ayarları yapılıyor...');
      
      // 1. Gadgetbridge user info format
      const userInfo = Buffer.from([
        0x01, // command
        0x01, 0x00, 0x00, 0x00, // user id = 1
        0x01, // gender = male
        0x20, // age = 32
        0xB0, // height = 176cm
        0x4B, // weight = 75kg
        0x00, // type
        0x00, 0x00, 0x00 // padding
      ]);

      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.USER_INFO_SERVICE_UUID,
        this.USER_INFO_CHAR_UUID,
        userInfo.toString('base64')
      );

      console.log('✅ User info ayarlandı');

      // 2. Saat/Tarih ayarla (Current Time Characteristic)
      const now = new Date();
      console.log('🕐 Şu anki zaman:', now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));
      
      // Gadgetbridge Mi Band 3 format (exact log analysis):
      // E9 07 08 0E 0F 33 23 04 00 00 0C = 2025/08/14 15:51:35 Thursday
      // year(2) month(1) day(1) hour(1) minute(1) second(1) dayOfWeek(1) fractions(1) adjustReason(1) timezone(1)
      
      // Mi Band 3 Day of Week: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday
      // JavaScript getDay(): 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
      const jsDayOfWeek = now.getDay();
      const miBandDayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;
      
      // Timezone offset: Mi Band 3 timezone format is quarter-hours from UTC
      // Turkey UTC+3 = 3 * 4 = 12 (0x0C)
      const timezoneOffsetQuarterHours = 12; // UTC+3 = 12 quarter-hours
      
      const timeData = Buffer.from([
        now.getFullYear() & 0xFF, // year low byte (little endian)
        (now.getFullYear() >> 8) & 0xFF, // year high byte
        now.getMonth() + 1, // month (1-12)
        now.getDate(), // day (1-31)
        now.getHours(), // hour (0-23)
        now.getMinutes(), // minute (0-59)
        now.getSeconds(), // second (0-59)
        miBandDayOfWeek, // day of week (1=Monday...7=Sunday)
        0x00, // fractions (1/256 second)
        0x00, // adjust reason (0x00 = manual time update)
        timezoneOffsetQuarterHours // timezone offset in quarter-hours from UTC
      ]);

      console.log('📅 Time data buffer:', timeData.toString('hex').toUpperCase());
      console.log('📅 Detaylar:');
      console.log('  📅 Yıl:', now.getFullYear(), `(0x${now.getFullYear().toString(16).toUpperCase()})`);
      console.log('  📅 Ay:', now.getMonth() + 1);
      console.log('  📅 Gün:', now.getDate());
      console.log('  📅 Saat:', now.getHours());
      console.log('  📅 Dakika:', now.getMinutes());
      console.log('  📅 Saniye:', now.getSeconds());
      console.log('  📅 Day of week (JS):', jsDayOfWeek, '→ Mi Band:', miBandDayOfWeek);
      console.log('  📅 Timezone offset:', `UTC+3 = ${timezoneOffsetQuarterHours} quarter-hours`);

      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.USER_INFO_SERVICE_UUID,
        '00002a2b-0000-1000-8000-00805f9b34fb', // Current Time Characteristic
        timeData.toString('base64')
      );

      console.log('🕐 Saat/tarih ayarlandı:', now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));

    } catch (error) {
      console.error('❌ User info setup hatası:', error);
    }
  }

  // OPTIMIZED Manuel nabız ölçümü (PROVEN WORKING - Senaryo C Based)
  async triggerHeartRateMeasurement(): Promise<void> {
    console.log('💓 Mi Band 3 Manuel Heart Rate Measurement (OPTIMIZED)');
    
    if (!this.connectedDevice) {
      throw new Error('Mi Band 3 bağlı değil');
    }

    try {
      // STEP 1: Connection verification
      const isConnected = await this.connectedDevice.isConnected();
      if (!isConnected) {
        throw new Error('Mi Band 3 connection lost');
      }
      console.log('✅ Connection verified');

      // STEP 2: Setup monitoring (auto-enables CCCD)
      console.log('📡 Setting up heart rate monitoring...');
      
      // Reset measurement tracking
      if (this.connectedDevice) {
        (this.connectedDevice as any)._manualMeasurementCount = 0;
        (this.connectedDevice as any)._manualMeasurementStartTime = Date.now();
      }

      const manualMonitoring = this.connectedDevice.monitorCharacteristicForService(
        this.HR_SERVICE_UUID,
        this.HR_CHAR_UUID,
        (error, characteristic) => {
          const elapsed = Date.now() - ((this.connectedDevice as any)?._manualMeasurementStartTime || Date.now());
          (this.connectedDevice as any)._manualMeasurementCount = ((this.connectedDevice as any)._manualMeasurementCount || 0) + 1;
          const count = (this.connectedDevice as any)._manualMeasurementCount;
          
          if (error) {
            console.error(`❌ HR monitoring error (${elapsed}ms, #${count}):`, error);
            return;
          }

          if (characteristic?.value) {
            const rawData = Buffer.from(characteristic.value, 'base64');
            console.log(`📊 Raw HR data: ${rawData.toString('hex')} (${elapsed}ms, #${count})`);
            
            if (rawData.length >= 2) {
              const heartRate = rawData[1];
              console.log(`💓 Heart Rate: ${heartRate} BPM (${(elapsed/1000).toFixed(1)}s, #${count})`);
              
              if (heartRate > 0) {
                // Redux dispatch
                store.dispatch(addMiBand3HeartRate({
                  heartRate,
                  timestamp: new Date().toISOString(),
                  sensorContact: true
                }));
                
                // Persistent storage
                this.saveHeartRateData({
                  heartRate,
                  timestamp: new Date().toISOString()
                });
                
                console.log(`💾 Heart rate saved: ${heartRate} BPM`);
              }
            }
          }
        }
      );

      console.log('✅ Monitoring active');
      
      // STEP 3: Wait for monitoring to stabilize
      await new Promise(resolve => setTimeout(resolve, 300));

      // STEP 4: PROVEN WORKING COMMAND - SENARYO C (Minimal)
      console.log('📤 Sending heart rate start command (15 02 01)...');
      
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        this.HR_SERVICE_UUID,
        this.HR_CONTROL_UUID,
        Buffer.from([0x15, 0x02, 0x01]).toString('base64')
      );
      
      console.log('✅ Heart rate measurement command sent successfully!');
      console.log('⏳ Waiting for heart rate data...');
      console.log('📊 Expected: First result in ~5 seconds, follow-up measurements every ~2 seconds');
      
      // Auto-stop after 30 seconds
      setTimeout(async () => {
        try {
          console.log('⏰ 30 seconds elapsed, stopping manual measurement...');
          
                     const finalCount = this.connectedDevice ? (this.connectedDevice as any)._manualMeasurementCount || 0 : 0;
          console.log(`📊 Manual measurement completed: ${finalCount} measurements received`);
          
                                // Stop heart rate measurement
           if (this.connectedDevice) {
             await this.connectedDevice.writeCharacteristicWithResponseForService(
               this.HR_SERVICE_UUID,
               this.HR_CONTROL_UUID,
               Buffer.from([0x15, 0x02, 0x00]).toString('base64')
             );
             console.log('✅ Manual heart rate measurement stopped');
           }
          
        } catch (error) {
          console.log('⚠️ Auto-stop error:', error);
        }
      }, 30000);
      
    } catch (error) {
      console.error('❌ Manual heart rate measurement failed:', error);
      throw error;
    }
  }

  // Gerçek zamanlı nabız monitörünü başlat (Gadgetbridge Protocol)
  public async startHeartRateMonitoring(): Promise<void> {
    if (!this.connectedDevice || !this.isPaired) {
      console.log('❌ Cihaz bağlı değil veya eşleşmemiş');
      return;
    }

    try {
      console.log('🔄 Continuous heart rate monitoring başlatılıyor... (Gadgetbridge Protocol)');

      // Heart Rate Measurement notification'ını enable et
      await this.connectedDevice.monitorCharacteristicForService(
        this.HR_SERVICE_UUID,
        this.HR_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ Heart rate monitoring hatası:', error);
            return;
          }
          
          if (characteristic?.value) {
            const data = Buffer.from(characteristic.value, 'base64');
            
            if (data.length >= 2) {
              const flags = data[0];
              const heartRate = data[1];
              
              console.log(`💓 Continuous HR: ${heartRate} BPM`);
              
              // Redux store'a kaydet
              const heartRateData = {
                heartRate: heartRate,
                timestamp: new Date().toISOString(),
                sensorContact: true
              };
              
              store.dispatch(addMiBand3HeartRate(heartRateData));

              // 🆕 Kalıcı depoya da kaydet
              this.saveHeartRateData({
                heartRate: heartRate,
                timestamp: heartRateData.timestamp
              });
            }
          }
        }
      );

      // Continuous monitoring için komut dizisi
      console.log('📤 Continuous monitoring commands...');
      
      // Command 1: Enable notifications
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.HR_SERVICE_UUID,
        this.HR_CONTROL_UUID,
        Buffer.from([0x15, 0x01, 0x01]).toString('base64') // Continuous mode
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      // Command 2: Start continuous measurement
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.HR_SERVICE_UUID,
        this.HR_CONTROL_UUID,
        Buffer.from([0x15, 0x02, 0x01]).toString('base64')
      );

      this.isMonitoring = true;
      store.dispatch(setMiBand3Monitoring(true));
      
      console.log('✅ Continuous heart rate monitoring aktif! (Gadgetbridge Protocol)');

    } catch (error) {
      console.error('❌ Heart rate monitoring başlatma hatası:', error);
    }
  }

  // 🆕 SLEEP DETECTION - Gadgetbridge Protocol Implementation
  public async startSleepDetection(): Promise<void> {
    if (!this.connectedDevice || !this.isPaired) {
      console.log('❌ Cihaz bağlı değil veya eşleşmemiş');
      return;
    }

    try {
      console.log('💤 Sleep detection monitoring başlatılıyor... (Gadgetbridge Protocol)');

      // Sleep detection characteristic'ini monitor et
      await this.connectedDevice.monitorCharacteristicForService(
        this.SLEEP_DETECTION_SERVICE_UUID,
        this.SLEEP_DETECTION_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ Sleep detection monitoring hatası:', error);
            return;
          }
          
          if (characteristic?.value) {
            const data = Buffer.from(characteristic.value, 'base64');
            console.log('💤 Sleep detection data:', data.toString('hex').toUpperCase());
            
            if (data.length >= 1) {
              const sleepValue = data[0];
              this.handleSleepStateChange(sleepValue);
            }
          }
        }
      );

      console.log('✅ Sleep detection monitoring aktif!');

    } catch (error) {
      console.error('❌ Sleep detection başlatma hatası:', error);
    }
  }

  // Sleep state change handler (Gadgetbridge Protocol)
  private async handleSleepStateChange(value: number): Promise<void> {
    const timestamp = new Date();
    let newSleepState: 'AWAKE' | 'ASLEEP' | 'LIGHT_SLEEP' | 'DEEP_SLEEP' = 'AWAKE';
    let eventDescription = '';

    // Gadgetbridge log analysis:
    // 0x0e = "Tick 30 min (?)" - 30 dakika tick
    // 0x01 = "Fell asleep" - Uykuya daldı
    switch (value) {
      case 0x01:
        newSleepState = 'ASLEEP';
        eventDescription = 'Fell asleep';
        break;
      case 0x0e:
        eventDescription = 'Tick 30 min (?)';
        // 30 dakika tick, mevcut durumu koru
        newSleepState = this.currentSleepState;
        break;
      case 0x02:
        newSleepState = 'LIGHT_SLEEP';
        eventDescription = 'Light sleep detected';
        break;
      case 0x03:
        newSleepState = 'DEEP_SLEEP';
        eventDescription = 'Deep sleep detected';
        break;
      case 0x00:
        newSleepState = 'AWAKE';
        eventDescription = 'Woke up';
        break;
      default:
        console.log(`💤 Unknown sleep value: 0x${value.toString(16).toUpperCase()}`);
        return;
    }

    console.log(`💤 Sleep State Change: ${eventDescription} (0x${value.toString(16).toUpperCase()})`);
    console.log(`💤 Previous state: ${this.currentSleepState} → New state: ${newSleepState}`);

    // State değişikliği varsa
    if (this.currentSleepState !== newSleepState) {
      const previousState = this.currentSleepState;
      this.currentSleepState = newSleepState;

      // Uyku başladığında
      if (previousState === 'AWAKE' && newSleepState === 'ASLEEP') {
        console.log('😴 Uyku başladı! Sleep heart rate monitoring başlatılıyor...');
        this.sleepStartTime = timestamp;
        this.sleepHeartRateData = []; // Reset sleep HR data
        await this.startSleepHeartRateMonitoring();
      }
      
      // Uyku bitti
      else if (previousState !== 'AWAKE' && newSleepState === 'AWAKE') {
        console.log('😊 Uyku bitti! Sleep heart rate monitoring durduruluyor...');
        await this.stopSleepHeartRateMonitoring();
        await this.processSleepSession();
      }

      // Redux state güncelle
      store.dispatch(setMiBand3Connection({ 
        connected: true, 
        paired: true
      }));
    }

    // 30 dakika tick - uyku sırasında kalp atışı kontrol et
    if (value === 0x0e && this.currentSleepState !== 'AWAKE') {
      console.log('⏰ Sleep tick (30 min) - Heart rate durumu kontrol ediliyor...');
      if (!this.sleepHeartRateMonitoring) {
        console.log('💓 Sleep heart rate monitoring yeniden başlatılıyor...');
        await this.startSleepHeartRateMonitoring();
      }
    }
  }

  // Uyku sırasında heart rate monitoring (özel mod)
  private async startSleepHeartRateMonitoring(): Promise<void> {
    if (!this.connectedDevice || this.sleepHeartRateMonitoring) {
      return;
    }

    try {
      console.log('💤💓 Sleep heart rate monitoring başlatılıyor...');

      // Heart Rate Measurement notification'ını enable et (if not already)
      await this.connectedDevice.monitorCharacteristicForService(
        this.HR_SERVICE_UUID,
        this.HR_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ Sleep heart rate monitoring hatası:', error);
            return;
          }
          
          if (characteristic?.value) {
            const data = Buffer.from(characteristic.value, 'base64');
            
            if (data.length >= 2) {
              const flags = data[0];
              const heartRate = data[1];
              
              console.log(`💤💓 Sleep HR: ${heartRate} BPM`);
              
              // Periyodik ölçüm sırasında sleep verisini kaydetme (duplikasyonu önle)
              if (this.isPeriodicMeasuring || this.isPeriodicHRActive) {
                console.log('ℹ️ Sleep HR kaydı atlandı (periyodik ölçüm aktif)');
                return;
              }

              // 1 saniyeden sık kaydı engelle (duplikasyon önleme)
              const now = Date.now();
              if (now - this.lastHeartRateSavedAtMs < 1000) {
                console.log('ℹ️ Sleep HR duplikasyon atlandı (<1s)');
                return;
              }
              this.lastHeartRateSavedAtMs = now;

              // Sleep heart rate data'ya kaydet
              const sleepHRData = {
                heartRate: heartRate,
                timestamp: new Date().toISOString()
              };
              
              this.sleepHeartRateData.push(sleepHRData);
              
              // Redux store'a da kaydet (normal format)
              store.dispatch(addMiBand3HeartRate({
                ...sleepHRData,
                sensorContact: true
              }));

              // 🆕 Kalıcı depoya da kaydet
              this.saveHeartRateData(sleepHRData);
            }
          }
        }
      );

      // Sleep-specific heart rate commands (daha gentle monitoring)
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.HR_SERVICE_UUID,
        this.HR_CONTROL_UUID,
        Buffer.from([0x15, 0x01, 0x01]).toString('base64') // Gentle continuous mode
      );

      this.sleepHeartRateMonitoring = true;
      console.log('✅ Sleep heart rate monitoring aktif!');

    } catch (error) {
      console.error('❌ Sleep heart rate monitoring başlatma hatası:', error);
    }
  }

  // Uyku heart rate monitoring'i durdur
  private async stopSleepHeartRateMonitoring(): Promise<void> {
    if (!this.sleepHeartRateMonitoring || !this.connectedDevice) {
      return;
    }

    try {
      console.log('💤💓 Sleep heart rate monitoring durduruluyor...');

      // Stop heart rate measurement
      await this.connectedDevice.writeCharacteristicWithoutResponseForService(
        this.HR_SERVICE_UUID,
        this.HR_CONTROL_UUID,
        Buffer.from([0x15, 0x02, 0x00]).toString('base64') // Stop
      );

      this.sleepHeartRateMonitoring = false;
      console.log('✅ Sleep heart rate monitoring durduruldu');

    } catch (error) {
      console.error('❌ Sleep heart rate monitoring durdurma hatası:', error);
    }
  }

  // Uyku seansını işle ve kaydet
  private async processSleepSession(): Promise<void> {
    if (!this.sleepStartTime || this.sleepHeartRateData.length === 0) {
      console.log('💤 İşlenecek uyku verisi bulunamadı');
      return;
    }

    const sleepEndTime = new Date();
    const sleepDuration = sleepEndTime.getTime() - this.sleepStartTime.getTime();
    const sleepDurationMinutes = Math.floor(sleepDuration / (1000 * 60));

    // Sleep heart rate istatistikleri
    const heartRates = this.sleepHeartRateData.map(hr => hr.heartRate);
    const avgHeartRate = heartRates.reduce((a, b) => a + b, 0) / heartRates.length;
    const minHeartRate = Math.min(...heartRates);
    const maxHeartRate = Math.max(...heartRates);

    const sleepSession = {
      startTime: this.sleepStartTime.toISOString(),
      endTime: sleepEndTime.toISOString(),
      duration: sleepDurationMinutes,
      sleepHeartRate: {
        average: Math.round(avgHeartRate),
        min: minHeartRate,
        max: maxHeartRate,
        values: heartRates,
        times: this.sleepHeartRateData.map(hr => hr.timestamp)
      },
      sampleCount: this.sleepHeartRateData.length
    };

    console.log('💤 Uyku seansı tamamlandı:', {
      duration: `${Math.floor(sleepDurationMinutes / 60)}s ${sleepDurationMinutes % 60}dk`,
      heartRateAvg: Math.round(avgHeartRate),
      heartRateRange: `${minHeartRate}-${maxHeartRate}`,
      samples: this.sleepHeartRateData.length
    });

    // Redux store'a kaydet
    // TODO: Sleep session dispatch action'ı ekle

    // 🆕 Kalıcı depoya da kaydet
    await this.saveSleepSession(sleepSession);

    // Reset
    this.sleepStartTime = null;
    this.sleepHeartRateData = [];
  }

  // Bağlantıyı kes (Kapsamlı disconnect)
  public async disconnect(): Promise<void> {
    console.log('🔌 Mi Band 3 bağlantısı kesiliyor...');
    
    if (this.connectedDevice) {
      try {
        // 🆕 Step 1: Önce tüm monitoring'leri durdur
        console.log('⏹️ Heart rate monitoring durduruluyor...');
        try {
          await this.connectedDevice.writeCharacteristicWithoutResponseForService(
            this.HR_SERVICE_UUID,
            this.HR_CONTROL_UUID,
            Buffer.from([0x15, 0x02, 0x00]).toString('base64') // Stop heart rate monitoring
          );
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log('ℹ️ Heart rate monitoring durdurma hatası (normal olabilir)');
        }

        // 🆕 Step 2: Sleep monitoring'i de durdur
        if (this.sleepHeartRateMonitoring) {
          console.log('⏹️ Sleep heart rate monitoring durduruluyor...');
          await this.stopSleepHeartRateMonitoring();
        }

        // 🆕 Step 2.5: Periyodik nabız ölçümünü durdur
        if (this.isPeriodicHRActive) {
          console.log('⏹️ Periyodik nabız ölçümü durduruluyor...');
          this.stopPeriodicHeartRateMeasurement();
        }

        // 🆕 Step 3: Notification'ları disable et (React Native BLE PLX ile)
        try {
          console.log('📵 Heart rate notifications disable ediliyor...');
          // React Native BLE PLX'te monitoring durdurma otomatik olarak notification'ları disable eder
          // Bu işlem monitoring durdurulduğunda otomatik yapılır
          console.log('ℹ️ Notifications otomatik olarak disable edilecek (monitoring durduğunda)');
        } catch (error) {
          console.log('ℹ️ Notification disable hatası (normal olabilir)');
        }

        // 🆕 Step 4: Cihaz bağlantısını kes (GADGETBRIDGE STYLE DISCONNECT)
        console.log('🔌 BLE connection kesiliyor... (Gadgetbridge Protocol)');
        
        // Önce cihazın gerçek bağlantı durumunu kontrol et
        const isConnected = await this.connectedDevice.isConnected();
        console.log(`📊 Cihaz bağlantı durumu: ${isConnected}`);
        
        if (isConnected) {
          console.log('🔌 Aktif bağlantı tespit edildi, Gadgetbridge style disconnect...');
          
          try {
            // Step 1: Gadgetbridge style - Disconnecting BtLEQueue from GATT device
            console.log('🔌 Step 1: Disconnecting from GATT device (Gadgetbridge style)...');
            await this.connectedDevice.cancelConnection();
            console.log('✅ Device.cancelConnection() başarılı');
          } catch (error) {
            console.log('⚠️ Device.cancelConnection() başarısız:', error);
          }
          
          // Step 2: Gadgetbridge timing (3ms sonra close) 
          await new Promise(resolve => setTimeout(resolve, 5));
          
          try {
            // Step 2: BLE Manager seviyesinde zorla disconnect (Gadgetbridge: unregisterApp equivalent)
            console.log('🔌 Step 2: BLE Manager disconnect (unregisterApp equivalent)...');
            await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
            console.log('✅ BleManager.cancelDeviceConnection() başarılı');
          } catch (error) {
            console.log('⚠️ BleManager.cancelDeviceConnection() başarısız:', error);
          }
          
          // Step 3: Gadgetbridge timing (30ms sonra connection state check)
          await new Promise(resolve => setTimeout(resolve, 30));
          
          try {
            const isStillConnected = await this.connectedDevice.isConnected();
            console.log(`🔍 Connection state check: ${isStillConnected ? 'CONNECTED' : 'NOT_CONNECTED'}`);
            
            if (isStillConnected) {
              console.log('🚨 UYARI: Bağlantı hala aktif! Manuel restart gerekebilir.');
            } else {
              console.log('✅ Device connection state: NOT_CONNECTED (Gadgetbridge style başarılı)');
            }
          } catch (statusError) {
            // Connection check hatası = büyük ihtimalle başarıyla kesildi
            console.log('✅ Connection state sorgulanamıyor = Büyük ihtimalle NOT_CONNECTED');
          }
          
        } else {
          console.log('ℹ️ Cihaz zaten bağlı değil');
        }
        
      } catch (error) {
        console.error('❌ Bağlantı kesme hatası:', error);
      }
      
      // 🆕 Step 5: Tüm state'leri temizle (Gadgetbridge: Queue Dispatch Thread terminated equivalent)
      console.log('🔄 Queue Dispatch Thread terminated equivalent...');
      this.connectedDevice = null;
      this.isPaired = false;
      this.isMonitoring = false;
      this.sleepHeartRateMonitoring = false;
      this.currentSleepState = 'AWAKE';
      this.sleepStartTime = null;
      this.sleepHeartRateData = [];
      
      // 🆕 Step 6: Redux state'i güncelle (Gadgetbridge: broadcast receivers to false)
      console.log('🔄 Setting broadcast receivers equivalent to: false');
      store.dispatch(setMiBand3Connection({ connected: false, paired: false }));
      store.dispatch(setMiBand3Monitoring(false));

      console.log('✅ Mi Band 3 service state tamamen temizlendi (Gadgetbridge style complete)');
      
      // 🆕 Step 7: BLE State refresh (Gadgetbridge: GPS service stopping equivalent)
      try {
        console.log('🔄 Stopping location service equivalent for all devices...');
        const bleState = await this.bleManager.state();
        console.log(`📊 BLE durumu: ${bleState}`);
        
        if (bleState === 'PoweredOn') {
          console.log('✅ BLE service ready for next connection');
        } else {
          console.log('⚠️ BLE durumu normal değil (restart gerekebilir):', bleState);
        }
      } catch (stateError) {
        console.log('ℹ️ BLE state kontrolü başarısız (normal disconnect behavior)');
      }
      
      // 🆕 Step 8: Final cleanup (Gadgetbridge timing equivalent)
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('🏁 Disconnect sequence complete - Ready for new connections');
      
    } else {
      console.log('ℹ️ Zaten bağlı cihaz yok');
    }
  }

  // 🆕 PERİYODİK NABIZ ÖLÇÜMÜ SİSTEMİ

  // Periyodik nabız ölçümünü başlat (İYİLEŞTİRİLMİŞ)
  public async startPeriodicHeartRateMeasurement(intervalSeconds: number = 30): Promise<void> {
    if (!this.connectedDevice || !this.isPaired) {
      throw new Error('Mi Band 3 bağlı değil veya eşleşmemiş');
    }

    if (this.isPeriodicHRActive) {
      console.log('⚠️ Periyodik nabız ölçümü zaten aktif');
      return;
    }

    try {
      this.periodicHRInterval = intervalSeconds * 1000; // Saniyeyi milisaniyeye çevir
      this.isPeriodicHRActive = true;

      console.log(`🔄 Periyodik nabız ölçümü başlatılıyor (${intervalSeconds} saniyede bir)...`);

      // Önce kalıcı monitoring kurulumu yap
      await this.setupPeriodicHeartRateMonitoring();

      // İlk ölçümü hemen tetikle
      await this.triggerPeriodicMeasurement();

      // Periyodik timer başlat
      this.periodicHRTimer = setInterval(async () => {
        try {
          if (this.connectedDevice && this.isPaired && this.isPeriodicHRActive && !this.isPeriodicMeasuring) {
            console.log(`⏰ Periyodik nabız ölçümü (${intervalSeconds}s interval)`);
            await this.triggerPeriodicMeasurement();
          } else if (this.isPeriodicMeasuring) {
            console.log('ℹ️ Önceki ölçüm devam ediyor, atlayım...');
          } else {
            console.log('⚠️ Bağlantı kesildi, periyodik ölçüm durduruluyor');
            this.stopPeriodicHeartRateMeasurement();
          }
        } catch (error) {
          console.error('❌ Periyodik nabız ölçümü hatası:', error);
        }
      }, this.periodicHRInterval);

      // Redux state güncelle
      store.dispatch(setMiBand3Monitoring(true));

      console.log(`✅ Periyodik nabız ölçümü aktif! (${intervalSeconds} saniyede bir)`);

    } catch (error) {
      console.error('❌ Periyodik nabız ölçümü başlatma hatası:', error);
      this.isPeriodicHRActive = false;
      throw error;
    }
  }

  // Periyodik nabız ölçümünü durdur (İYİLEŞTİRİLMİŞ)
  public stopPeriodicHeartRateMeasurement(): void {
    if (!this.isPeriodicHRActive) {
      console.log('ℹ️ Periyodik nabız ölçümü zaten pasif');
      return;
    }

    console.log('⏹️ Periyodik nabız ölçümü durduruluyor...');

    // Timer'ı durdur
    if (this.periodicHRTimer) {
      clearInterval(this.periodicHRTimer);
      this.periodicHRTimer = null;
    }

    // Monitoring'i temizle
    if (this.periodicHRMonitoring) {
      try {
        this.periodicHRMonitoring.remove();
        console.log('✅ Periyodik monitoring temizlendi');
      } catch (error) {
        console.log('ℹ️ Monitoring temizleme hatası (normal olabilir):', error);
      }
      this.periodicHRMonitoring = null;
    }

    // State'leri sıfırla
    this.isPeriodicHRActive = false;
    this.isPeriodicMeasuring = false;

    // Redux state güncelle
    store.dispatch(setMiBand3Monitoring(false));

    console.log('✅ Periyodik nabız ölçümü tamamen durduruldu');
  }

  // 🆕 Kalıcı periyodik monitoring kurulumu
  private async setupPeriodicHeartRateMonitoring(): Promise<void> {
    if (!this.connectedDevice || this.periodicHRMonitoring) {
      return; // Zaten kurulmuş
    }

    try {
      console.log('📡 Periyodik HR monitoring kurulumu...');

      // Periyodik ölçüm süresince sleep monitoring'i durdur
      await this.pauseSleepMonitoringForPeriodic();

      // Kalıcı monitoring kur (sadece bir kez)
      this.periodicHRMonitoring = this.connectedDevice.monitorCharacteristicForService(
        this.HR_SERVICE_UUID,
        this.HR_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ Periyodik HR monitoring hatası:', error);
            return;
          }

          if (characteristic?.value && this.isPeriodicMeasuring) {
            const rawData = Buffer.from(characteristic.value, 'base64');
            
            if (rawData.length >= 2) {
              const heartRate = rawData[1];
              console.log(`💓 Periyodik nabız: ${heartRate} BPM`);
              
              if (heartRate > 0) {
                // Ölçüm tamamlandı flag'i
                this.isPeriodicMeasuring = false;
                
                // 1 saniyeden sık kaydı engelle (duplikasyon önleme)
                const now = Date.now();
                if (now - this.lastHeartRateSavedAtMs < 1000) {
                  console.log('ℹ️ Periyodik HR duplikasyon atlandı (<1s)');
                  return;
                }
                this.lastHeartRateSavedAtMs = now;

                // Redux dispatch
                store.dispatch(addMiBand3HeartRate({
                  heartRate,
                  timestamp: new Date().toISOString(),
                  sensorContact: true
                }));
                
                // Persistent storage
                this.saveHeartRateData({
                  heartRate,
                  timestamp: new Date().toISOString()
                });
                
                console.log(`💾 Periyodik nabız kaydedildi: ${heartRate} BPM`);

                // Sleep monitoring'i geri getir (ölçüm başarıyla tamamlandı)
                this.resumeSleepMonitoringIfPaused();
              }
            }
          }
        }
      );

      console.log('✅ Periyodik HR monitoring kuruldu');

    } catch (error) {
      console.error('❌ Periyodik HR monitoring kurulum hatası:', error);
      throw error;
    }
  }

  // 🆕 Periyodik ölçüm tetikleme (sadece komut gönder)
  private async triggerPeriodicMeasurement(): Promise<void> {
    if (!this.connectedDevice || this.isPeriodicMeasuring) {
      return; // Zaten ölçüm yapılıyor
    }

    try {
      console.log('💓 Periyodik ölçüm tetikleniyor...');
      this.isPeriodicMeasuring = true;

      // Sadece nabız ölçümü komutunu gönder
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        this.HR_SERVICE_UUID,
        this.HR_CONTROL_UUID,
        Buffer.from([0x15, 0x02, 0x01]).toString('base64')
      );

      console.log('✅ Periyodik ölçüm komutu gönderildi');

      // 15 saniye timeout (eğer cevap gelmezse)
      setTimeout(() => {
        if (this.isPeriodicMeasuring) {
          console.log('⏰ Periyodik ölçüm timeout (15s)');
          this.isPeriodicMeasuring = false;
          // Sleep monitoring'i geri getir (ölçüm tamamlanmadı ama periyot bitti)
          this.resumeSleepMonitoringIfPaused();
        }
      }, 15000);

    } catch (error) {
      console.error('❌ Periyodik ölçüm tetikleme hatası:', error);
      this.isPeriodicMeasuring = false;
      this.resumeSleepMonitoringIfPaused();
      throw error;
    }
  }

  // Durum bilgileri
  public getConnectionStatus(): { connected: boolean; paired: boolean; monitoring: boolean; periodicHR: boolean } {
    return {
      connected: this.connectedDevice !== null,
      paired: this.isPaired,
      monitoring: this.isMonitoring,
      periodicHR: this.isPeriodicHRActive
    };
  }

  public get isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  public get isDevicePaired(): boolean {
    return this.isPaired;
  }

  public get isHeartRateMonitoring(): boolean {
    return this.isMonitoring;
  }

  // 🆕 KALICI VERİ YÖNETİMİ METODLARI

  // Kalıcı verileri yükle
  private async loadPersistedData(): Promise<void> {
    try {
      console.log('💾 Mi Band 3 kalıcı verileri yükleniyor...');

      // Heart rate verilerini yükle
      const heartRateData = await AsyncStorage.getItem(STORAGE_KEYS.HEART_RATE_DATA);
      if (heartRateData) {
        const parsedData = JSON.parse(heartRateData);
        console.log(`💓 ${parsedData.length} adet kalıcı heart rate verisi yüklendi`);
        
        // Redux store'a yükle
        parsedData.forEach((data: any) => {
          store.dispatch(addMiBand3HeartRate(data));
        });
      }

      // Uyku session verilerini yükle
      const sleepSessions = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_SESSIONS);
      if (sleepSessions) {
        const parsedSessions = JSON.parse(sleepSessions);
        console.log(`😴 ${parsedSessions.length} adet uyku session verisi yüklendi`);
        // TODO: Sleep sessions için Redux store action'ı ekle
      }

      // Son sync zamanını yükle
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (lastSync) {
        console.log(`🔄 Son sync: ${lastSync}`);
      }

    } catch (error) {
      console.error('❌ Kalıcı veri yükleme hatası:', error);
    }
  }

  // Heart rate verisini kalıcı depola
  private async saveHeartRateData(data: {heartRate: number, timestamp: string}): Promise<void> {
    try {
      // Mevcut verileri al
      const existingData = await AsyncStorage.getItem(STORAGE_KEYS.HEART_RATE_DATA);
      let heartRateArray = existingData ? JSON.parse(existingData) : [];
      
      // Yeni veriyi ekle
      heartRateArray.push(data);
      
      // Son 500 ölçümü tut (yaklaşık 1-2 haftalık veri)
      if (heartRateArray.length > 500) {
        heartRateArray = heartRateArray.slice(-500);
      }
      
      // Kaydet
      await AsyncStorage.setItem(STORAGE_KEYS.HEART_RATE_DATA, JSON.stringify(heartRateArray));
      console.log(`💾 Heart rate verisi kaydedildi: ${data.heartRate} BPM`);
      
    } catch (error) {
      console.error('❌ Heart rate veri kaydetme hatası:', error);
    }
  }

  // Uyku session'ını kalıcı depola
  private async saveSleepSession(session: any): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_SESSIONS);
      let sessionsArray = existingData ? JSON.parse(existingData) : [];
      
      sessionsArray.push(session);
      
      // Son 30 uyku session'ını tut (yaklaşık 1 aylık)
      if (sessionsArray.length > 30) {
        sessionsArray = sessionsArray.slice(-30);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(sessionsArray));
      console.log(`💾 Uyku session kaydedildi: ${session.duration} dakika`);
      
    } catch (error) {
      console.error('❌ Uyku session kaydetme hatası:', error);
    }
  }

  // Kalıcı verileri temizle
  public async clearPersistedData(): Promise<void> {
    try {
      console.log('🗑️ Mi Band 3 kalıcı verileri temizleniyor...');
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.HEART_RATE_DATA,
        STORAGE_KEYS.SLEEP_SESSIONS,
        STORAGE_KEYS.DEVICE_INFO,
        STORAGE_KEYS.LAST_SYNC,
      ]);
      
      console.log('✅ Kalıcı veriler temizlendi');
    } catch (error) {
      console.error('❌ Kalıcı veri temizleme hatası:', error);
    }
  }

  // Kalıcı veri istatistikleri
  public async getDataStatistics(): Promise<{heartRateCount: number, sleepSessionCount: number, lastSync: string | null}> {
    try {
      const heartRateData = await AsyncStorage.getItem(STORAGE_KEYS.HEART_RATE_DATA);
      const sleepSessions = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_SESSIONS);
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      
      return {
        heartRateCount: heartRateData ? JSON.parse(heartRateData).length : 0,
        sleepSessionCount: sleepSessions ? JSON.parse(sleepSessions).length : 0,
        lastSync: lastSync,
      };
    } catch (error) {
      console.error('❌ Veri istatistik alma hatası:', error);
      return { heartRateCount: 0, sleepSessionCount: 0, lastSync: null };
    }
  }
}

export default new MiBand3Service();
