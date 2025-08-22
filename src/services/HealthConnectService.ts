import { NativeModules, Platform } from 'react-native';
import { Alert, Linking } from 'react-native';
import HealthConnect, { Permission } from 'react-native-health-connect';
import { mapHealthConnectData } from '../types/health';
import type { HealthData as HealthDataType, SleepMetric, SleepStage } from '../types/health';
import { format } from 'date-fns';



// HealthConnectImpl değişkenini tanımla
let HealthConnectImpl: any;

// HealthConnect modülü yönetimi
try {
  // Önce react-native-health-connect'i dene
  if (HealthConnect) {
    console.log('✅ react-native-health-connect modülü bulundu, kullanılıyor');
    HealthConnectImpl = HealthConnect;
  } 
  // Alternatif olarak NativeModules.HealthConnect'i dene
  else if (NativeModules?.HealthConnect) {
    console.log('✅ NativeModules.HealthConnect bulundu, doğrudan kullanılıyor');
    HealthConnectImpl = NativeModules.HealthConnect;
  }  else {
    console.log('⚠️ Uyarı: Health Connect modülü bulunamadı, sahte implementasyon kullanılıyor.');
    HealthConnectImpl = {
      readRecords: async () => null,
      getGrantedPermissions: async () => [],
      requestPermission: async () => true,
      openHealthConnectSettings: async () => {},
      initialize: async () => {}
    };
  }
} catch (error) {
  console.log('Health Connect modül erişim hatası, sahte implementasyon kullanılıyor:', error);
  HealthConnectImpl = {
    readRecords: async () => null,
    getGrantedPermissions: async () => [],
    requestPermission: async () => true,
    openHealthConnectSettings: async () => {},
    initialize: async () => {}
  };
}

interface HealthRecord {
  count?: number;
  steps?: number;
  value?: number;
  energy?: number;
  calories?: number;
  rate?: number;
  startTime?: string;  // Ekleyin
  endTime?: string;    // Ekleyin
  stages?: Array<{     // Ekleyin
    stage?: number | string;
    startTime?: string;
    endTime?: string;
  }>;
  samples?: Array<{
    beatsPerMinute?: number;
    percentage?: number;
    time?: string;
    value?: {
      stage?: number | string;
    };
    metadata?: {
      startTime?: string;
      endTime?: string;
    };
  }>;
  time?: string;
  percentage?: number;
  metadata?: {
    startTime?: string;
    endTime?: string;
  };
}

class HealthConnectService {
  static isInitialized: boolean = false;
  static permissionsGranted: boolean = false;
  static grantedPermissionList: string[] = [];

  // Daha az log yazacak şekilde değişken
  static DEBUG_LOGS = false;
  static permissionRequested = false; // İzinlerin sadece bir kez istenmesi için kontrol değişkeni

  static log(message: string, ...args: any[]) {
    if (this.DEBUG_LOGS) {
      console.log(message, ...args);
    }
  }

  // Yardımcı fonksiyonlar
  static parseHealthConnectResponse<T>(response: any): T[] {
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && response.records) {
      return response.records;
    }
    return [];
  }

  static getEmptyData(type: string): any {
    switch (type) {
      case 'steps':
        return 0;
      case 'heartRate':
        return {
          values: [],
          times: [],
          average: 0,
          max: 0,
          min: 0
        };
      case 'oxygen':
        return {
          values: [],
          times: [],
          average: 0
        };
      case 'calories':
        return 0;
      case 'sleep':
        return {
          status: 'unknown',
          values: [],
          times: [],
          lastUpdated: new Date().toISOString(),
          duration: 0,
          efficiency: 0,
          deep: 0,
          light: 0,
          rem: 0,
          awake: 0,
          startTime: '',
          endTime: '',
          totalMinutes: 0,
          stages: []
        };
      default:
        return null;
    }
  }

  static async readHealthConnectRecords(recordType: string, startDate: string, endDate: string) {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return null;
        }
      }

      if (!HealthConnectImpl?.readRecords) {
        return null;
      }
      
      try {
        // En basit şekilde sorgu yap, aşırı log kaydetme
        try {
          const response = await HealthConnectImpl.readRecords(recordType, {
            timeRangeFilter: {
              operator: 'between',
              startTime: this.formatDateStringForHealthConnect(startDate),
              endTime: this.formatDateStringForHealthConnect(endDate)
            }
          });
          
          return response;
        } catch (error) {
          // Sessizce başarısızlık - kullanıcı deneyimini bozmamak için
          return null;
        }
      } catch (readError) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * MANUEL NABIZ ÖLÇÜMLERİ AL (Kalp Atış Hızı Kartı için)
   * Sadece manuel ölçümleri döndürür, uyku sırasındaki otomatik ölçümler hariç
   */
  static async getHeartRateData(startDateStr: string, endDateStr: string, excludeSleep: boolean = true): Promise<{
    values: number[];
    times: string[];
    average: number;
    max: number;
    min: number;
  }> {
      if (Platform.OS !== 'android') {
      console.log('Health Connect sadece Android platformunda desteklenir');
      return this.getEmptyData('heartRate');
    }
    
    try {
      console.log('💓 Manuel nabız ölçümleri alınıyor (uyku hariç)...');
      
      const heartRateResponse = await this.readHealthConnectRecords('HeartRate', startDateStr, endDateStr);
      if (!heartRateResponse) {
        return this.getEmptyData('heartRate');
      }

      const heartRateRecords = this.parseHealthConnectResponse<HealthRecord>(heartRateResponse);
      
      const allValues: number[] = [];
      const allTimes: string[] = [];
      
      // Tüm nabız verilerini topla
      heartRateRecords.forEach((record) => {
        if (record.samples && Array.isArray(record.samples)) {
          record.samples.forEach((sample) => {
            if (sample.beatsPerMinute && sample.time) {
              allValues.push(sample.beatsPerMinute);
              allTimes.push(sample.time);
            }
          });
        }
      });

      console.log(`💓 Toplam nabız ölçümü: ${allValues.length}`);

      // Eğer uyku verilerini hariç tutmak isteniyorsa, uyku saatleri dışındaki verileri al
      if (excludeSleep) {
        // Gece saatleri (22:00 - 08:00) arasındaki verileri hariç tut
        const manualValues: number[] = [];
        const manualTimes: string[] = [];

        for (let i = 0; i < allValues.length; i++) {
          const measurementTime = new Date(allTimes[i]);
          const hour = measurementTime.getHours();
          
          // Sadece gündüz saatleri (08:00-22:00) arasındaki ölçümleri al
          if (hour >= 8 && hour < 22) {
            manualValues.push(allValues[i]);
            manualTimes.push(allTimes[i]);
          }
        }

        console.log(`💓 Manuel nabız ölçümü (gündüz): ${manualValues.length} (toplam: ${allValues.length})`);
      
      return {
          values: manualValues,
          times: manualTimes,
          average: manualValues.length > 0 ? manualValues.reduce((a, b) => a + b, 0) / manualValues.length : 0,
          max: manualValues.length > 0 ? Math.max(...manualValues) : 0,
          min: manualValues.length > 0 ? Math.min(...manualValues) : 0
        };
      }

      // Uyku hariç tutulmazsa tüm verileri döndür
      return {
        values: allValues,
        times: allTimes,
        average: allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0,
        max: allValues.length > 0 ? Math.max(...allValues) : 0,
        min: allValues.length > 0 ? Math.min(...allValues) : 0
      };
    } catch (error) {
      console.error('Nabız verisi alınırken hata:', error);
      return this.getEmptyData('heartRate');
    }
  }

  static async getOxygenData(startDateStr: string, endDateStr: string): Promise<{
    values: number[];
    times: string[];
    average: number;
  }> {
      if (Platform.OS !== 'android') {
      console.log('Health Connect sadece Android platformunda desteklenir');
      return this.getEmptyData('oxygen');
    }
    
    try {
      const oxygenResponse = await this.readHealthConnectRecords('OxygenSaturation', startDateStr, endDateStr);
      if (!oxygenResponse) {
        return this.getEmptyData('oxygen');
      }

      const oxygenRecords = this.parseHealthConnectResponse<HealthRecord>(oxygenResponse);
      
      const values: number[] = [];
      const times: string[] = [];
      
      oxygenRecords.forEach((record) => {
        if (record.percentage !== undefined && record.time) {
          values.push(record.percentage);
          times.push(record.time);
        } else if (record.samples && Array.isArray(record.samples)) {
          record.samples.forEach((sample) => {
            if (sample.percentage !== undefined && sample.time) {
              values.push(sample.percentage);
              times.push(sample.time);
            }
          });
        }
      });
      
      return {
        values,
        times,
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      };
    } catch (error) {
      console.error('Oksijen verisi alınırken hata:', error);
      return this.getEmptyData('oxygen');
    }
  }

  /**
   * UYKU SIRASINDA NABIZ VERİSİ AL (Mi Fitness'tan) - GELİŞTİRİLMİŞ VERSİYON
   * Bu fonksiyon uyku zamanı aralığında olan nabız verilerini filtreler
   * Mi Fitness'tan daha fazla veri almak için çeşitli yöntemler dener
   */
  static async getSleepHeartRateData(startDateStr: string, endDateStr: string, sleepStartTime?: string, sleepEndTime?: string): Promise<{
    values: number[];
    times: string[];
    average: number;
    min: number;
    max: number;
    sleepHeartRateAverage: number;
  }> {
    if (Platform.OS !== 'android') {
      console.log('Health Connect sadece Android platformunda desteklenir');
      return this.getEmptyData('heartRate');
    }
    
    try {
      console.log('🛌 Uyku sırasındaki nabız verileri alınıyor...');
      console.log(`🛌 Uyku zamanı aralığı: ${sleepStartTime} - ${sleepEndTime}`);
      
      // YÖNTEM 1: Uyku odaklı, sınırlı veri kaynağı arama
      let searchStart = startDateStr;
      let searchEnd = endDateStr;
      
      // Eğer uyku zamanları belirtilmişse, sadece o aralığı + buffer kullan
      if (sleepStartTime && sleepEndTime) {
        const sleepStart = new Date(sleepStartTime);
        const sleepEnd = new Date(sleepEndTime);
        // 2 saat buffer (uyku öncesi/sonrası)
        const bufferStart = new Date(sleepStart.getTime() - 2 * 60 * 60 * 1000);
        const bufferEnd = new Date(sleepEnd.getTime() + 2 * 60 * 60 * 1000);
        searchStart = bufferStart.toISOString();
        searchEnd = bufferEnd.toISOString();
        console.log(`🎯 Uyku odaklı arama: ${searchStart} - ${searchEnd}`);
      } else {
        // Uyku zamanı belirtilmemişse ana tarih aralığını kullan
        console.log(`📅 Genel tarih aralığı: ${searchStart} - ${searchEnd}`);
      }
      
      // Sadece en önemli nabız veri tiplerini kullan
      const heartRateTypes = [
        'HeartRate',              // Standart nabız (EN ÖNEMLİ)
        'RestingHeartRate',       // Dinlenme nabzı 
        'SleepSession'            // Uyku oturumu nabzı
      ];
      
      const allHeartRateData: { values: number[], times: string[], source: string }[] = [];
      
      // Sadece belirlenen tarih aralığında veri tiplerini dene
      for (const type of heartRateTypes) {
        try {
          console.log(`📊 ${type} veri tipi deneniyor...`);
          const response = await this.readHealthConnectRecords(type, searchStart, searchEnd);
          
          if (response) {
            const records = this.parseHealthConnectResponse<HealthRecord>(response);
            console.log(`✅ ${type} verisi bulundu: ${records.length} kayıt`);
            
            const extractedData = this.extractHeartRateFromAnyRecord(records, type);
            if (extractedData.values.length > 0) {
              allHeartRateData.push({
                values: extractedData.values,
                times: extractedData.times,
                source: type
              });
              console.log(`🎯 ${type}'dan ${extractedData.values.length} nabız değeri çıkarıldı`);
            }
          }
        } catch (error) {
          console.log(`❌ ${type} veri tipi hatası:`, error);
        }
      }
      
      // Tüm nabız verilerini birleştir
      const allValues: number[] = [];
      const allTimes: string[] = [];
      const sourceSummary: string[] = [];
      
      allHeartRateData.forEach(data => {
        allValues.push(...data.values);
        allTimes.push(...data.times);
        sourceSummary.push(`${data.source}: ${data.values.length} ölçüm`);
      });
      
      console.log(`📈 Toplam nabız verisi özeti:
      • Toplam kaynak sayısı: ${allHeartRateData.length}
      • Toplam ölçüm sayısı: ${allValues.length}
      • Kaynaklar: ${sourceSummary.join(', ')}`);
      
      if (allValues.length === 0) {
        console.log('❌ Hiçbir kaynaktan nabız verisi bulunamadı');
        return this.getEmptyData('heartRate');
      }
      
      // Uyku zamanı filtreleme - Sadece uyku saatleri arasındaki veriler
      let sleepValues: number[] = [];
      let sleepTimes: string[] = [];
      
              if (sleepStartTime && sleepEndTime) {
                const sleepStart = new Date(sleepStartTime);
                const sleepEnd = new Date(sleepEndTime);
                
        console.log(`🔍 Uyku zaman filtreleme: ${sleepStart.toISOString()} - ${sleepEnd.toISOString()}`);
        console.log(`🕐 Uyku süresi: ${Math.round((sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60))} dakika`);
        
        allValues.forEach((value, index) => {
          const sampleTime = new Date(allTimes[index]);
          // Tam uyku zamanı aralığında olan veriler
                if (sampleTime >= sleepStart && sampleTime <= sleepEnd) {
            sleepValues.push(value);
            sleepTimes.push(allTimes[index]);
        }
      });
        
        console.log(`🛌 Uyku zamanı filtreleme sonrası: ${sleepValues.length} ölçüm (toplam veriden: ${allValues.length})`);
      }
      
      // Uyku verisi varsa onu kullan, yoksa tüm verileri kullan
      let targetValues = sleepValues.length > 0 ? sleepValues : allValues;
      let targetTimes = sleepTimes.length > 0 ? sleepTimes : allTimes;
      
      // Aykırı değer temizleme
      if (targetValues.length > 0) {
        const filteredResult = this.filterHeartRateOutliers(targetValues, targetTimes);
        targetValues = filteredResult.values;
        targetTimes = filteredResult.times;
            }
      
      // Örnekleme yapmıyoruz - Health Connect'teki tüm ölçümler gelsin
      console.log(`📊 Toplam ölçüm sayısı: ${targetValues.length} (örnekleme yapılmadı)`);
      
      
      const sleepHeartRateAverage = targetValues.length > 0 ? 
        Math.round(targetValues.reduce((a, b) => a + b, 0) / targetValues.length) : 0;
      
      // Beklenen ölçüm sayısını hesapla
      const sleepDurationMinutes = sleepStartTime && sleepEndTime ? 
        (new Date(sleepEndTime).getTime() - new Date(sleepStartTime).getTime()) / (1000 * 60) : 0;
      const expectedMeasurements = sleepDurationMinutes > 0 ? Math.floor(sleepDurationMinutes / 3) : 0;
      const coveragePercentage = expectedMeasurements > 0 ? (targetValues.length / expectedMeasurements * 100).toFixed(1) : '0';
      
      console.log(`🛌 FINAL Uyku nabız analizi:
      • Toplam kaynaktan nabız: ${allValues.length}
      • Uyku sırasında nabız: ${targetValues.length}
      • Uyku süresi: ${Math.round(sleepDurationMinutes)} dakika
      • Beklenen ölçüm: ~${expectedMeasurements} (3 dk aralık)
      • Kapsama oranı: ${coveragePercentage}%
      • Ortalama nabız: ${sleepHeartRateAverage} BPM
      • Nabız aralığı: ${targetValues.length > 0 ? Math.min(...targetValues) + ' - ' + Math.max(...targetValues) : 'N/A'} BPM`);
      
      if (targetValues.length < expectedMeasurements * 0.1) {
        console.log(`⚠️ Uyku nabız ölçüm sayısı çok düşük (${targetValues.length}/${expectedMeasurements})`);
        console.log(`💡 Mi Fitness'ta 'Sürekli nabız ölçümü' ve 'Uyku nabız ölçümü' aktif mi kontrol edin`);
      }
      
      return {
        values: targetValues,
        times: targetTimes,
        average: targetValues.length > 0 ? targetValues.reduce((a, b) => a + b, 0) / targetValues.length : 0,
        max: targetValues.length > 0 ? Math.max(...targetValues) : 0,
        min: targetValues.length > 0 ? Math.min(...targetValues) : 0,
        sleepHeartRateAverage
      };
      
    } catch (error) {
      console.error('🛌 Uyku nabız verisi alınırken hata:', error);
      return this.getEmptyData('heartRate');
    }
  }



  static async getStepsData(startDateStr: string, endDateStr: string): Promise<number> {
    if (Platform.OS !== 'android') {
      console.log('Health Connect sadece Android platformunda desteklenir');
      return 0;
    }

    try {
      // Health Connect'ten adım verilerini al
      console.log('Adım verileri alınmaya çalışılıyor...');
      
      // Önce standart "Steps" kaydını dene
      let stepsResponse = await this.readHealthConnectRecords('Steps', startDateStr, endDateStr);
      
      // Eğer veri gelmezse alternatif kayıt adlarını dene
      if (!stepsResponse) {
        console.log('Standard Steps kaydı bulunamadı, alternatif isimler deneniyor...');
        stepsResponse = await this.readHealthConnectRecords('StepCount', startDateStr, endDateStr);
      }
      
      // Son çare olarak DailySteps'i deneyelim
      if (!stepsResponse) {
        console.log('StepCount kaydı bulunamadı, DailySteps deneniyor...');
        stepsResponse = await this.readHealthConnectRecords('DailySteps', startDateStr, endDateStr);
      }
      
      if (!stepsResponse) {
        console.log('Adım verisi bulunamadı, sıfır döndürülüyor');
        return 0;
      }

      console.log('Adım verisi yanıtı alındı');
      const stepsRecords = this.parseHealthConnectResponse<HealthRecord>(stepsResponse);
      console.log('Adım kayıt sayısı:', stepsRecords.length);
      
      let totalSteps = 0;
      
      stepsRecords.forEach((record) => {
        if (record.count !== undefined) {
          totalSteps += record.count;
        } else if (record.steps !== undefined) {
          totalSteps += record.steps;
        } else if (record.value !== undefined) {
          totalSteps += record.value;
        }
      });
      
      console.log('Toplam adım sayısı:', totalSteps);
      return totalSteps;
    } catch (error) {
      console.error('Adım verisi alınırken hata:', error);
      return 0;
    }
  }

 /**
   * Belirtilen tarih aralığındaki kalori verilerini getirir
   */
 static async getCaloriesData(startDateStr: string, endDateStr: string): Promise<number> {
  try {
    console.log('[HealthConnectService] Kalori verisi alınıyor:', startDateStr, endDateStr);
    
    // Tarih formatını düzelt
    const safeStartDate = this.formatDateStringForHealthConnect(startDateStr);
    const safeEndDate = this.formatDateStringForHealthConnect(endDateStr);
    
    // Servis kontrolü
    if (!HealthConnectImpl || typeof HealthConnectImpl.readRecords !== 'function') {
      console.log('⚠️ readRecords fonksiyonu bulunamadı, varsayılan kalori verisi döndürülüyor');
      return 0; // Varsayılan kalori verisi
    }
    
    try {
      const [activeCaloriesData] = await Promise.all([
        HealthConnectImpl.readRecords('ActiveCaloriesBurned', {
          timeRangeFilter: {
            operator: 'between',
            startTime: safeStartDate,
            endTime: safeEndDate
          }
        }),

      ]);

      console.log('[HealthConnectService] Kalori veri yanıtı:', { 
        activeCalories: activeCaloriesData, 
     
      });

      // API yanıtlarını kontrol et
      let activeRecords = [];
      
      
      if (Array.isArray(activeCaloriesData)) {
        activeRecords = activeCaloriesData;
      } else if (activeCaloriesData && typeof activeCaloriesData === 'object' && activeCaloriesData.records) {
        activeRecords = activeCaloriesData.records;
      }
      
      

      let totalActiveCalories = 0;


      // Aktif kalorileri hesapla
      for (const record of activeRecords) {
        if (record && typeof record.energy === 'object') {
          // Energy bir nesne olabilir ve inCalories gibi alanları içerebilir
          if (record.energy.inCalories !== undefined) {
            totalActiveCalories += record.energy.inCalories;
          } else if (record.energy.inKilocalories !== undefined) {
            totalActiveCalories += record.energy.inKilocalories;
          } else if (record.energy.inKilojoules !== undefined) {
            // Kilojoule'ü kaloriye çevir (yaklaşık olarak)
            totalActiveCalories += record.energy.inKilojoules * 0.239;
          }
        } else if (record && typeof record.energy === 'number') {
          totalActiveCalories += record.energy;
        }
      }

      const totalCalories = Math.round(totalActiveCalories/1000 );
      console.log('[HealthConnectService] Toplam kaloriler:', { 
        active: totalActiveCalories, 
        total: totalCalories 
      });
      
      // Hiç veri yoksa varsayılan değer döndür
      if (totalCalories === 0) {
        return 0; 
      }
      
      return totalCalories;
    } catch (error) {
      console.error('Kalori verisi alınırken hata:', error);
      return 0; // Hata durumunda varsayılan 1500 kalori
    }
  } catch (generalError) {
    console.error('Kalori verisi alınırken genel hata:', generalError);
    return 0; // Genel hata durumunda varsayılan 1500 kalori
  }
}

  static formatDateStringForHealthConnect(dateStr: string): string {
    const parseDate = (dateStr: string): Date => {
      let date: Date;
      try {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn('Geçersiz tarih formatı, bugünü kullanıyorum:', dateStr);
          date = new Date(); // Geçersiz tarih olduğunda bugünü kullan
        }
      } catch (e) {
        console.warn('Tarih ayrıştırılamadı, bugünü kullanıyorum:', dateStr);
        date = new Date(); // Tarih ayrıştırılamadıysa bugünü kullan
      }
      return date;
    };
  
    const formatDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    };
  
    try {
      console.log('İşlenmeden önce tarih:', dateStr);
      const date = parseDate(dateStr);
      const formattedDate = formatDate(date);
      console.log('Düzeltilen tarih:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Tarih formatı düzeltme hatası:', error);
      const now = new Date();
      const fallbackDate = formatDate(now); // Hata durumunda bugünün tarihini kullan
      console.log('Hata nedeniyle kullanılan tarih:', fallbackDate);
      return fallbackDate;
    }
  }
  
  
  
  

  static async getHealthData(startDateStr: string, endDateStr: string): Promise<HealthDataType | null> {
    try {
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        console.log(`Health Connect başlatma sonucu: ${initResult}`);
      }

      console.log(`HealthConnectService.getHealthData çağrıldı: ${startDateStr} - ${endDateStr}`);
      
      // Paralel olarak tüm veri çeşitlerini çek
      console.log("Veri türleri için Health Connect sorguları yapılıyor");
      const [stepsData, heartRateData, sleepData, caloriesData, oxygenData] = await Promise.all([
        this.getStepsData(startDateStr, endDateStr),
        this.getHeartRateData(startDateStr, endDateStr),
        this.getSleepData(startDateStr, endDateStr),
        this.getCaloriesData(startDateStr, endDateStr),
        this.getOxygenData(startDateStr, endDateStr)
      ]);

      console.log("Health Connect sorguları tamamlandı, sonuçlar:");
      console.log("- Adımlar:", stepsData);
      console.log("- Kalori:", caloriesData);
      console.log("- Nabız:", heartRateData?.average || 0);
      console.log("- Oksijen:", oxygenData?.average || 0);
      console.log("- Uyku:", sleepData?.totalMinutes || 0);
      console.log("- Uyku Nabız:", sleepData?.sleepHeartRate ? `${sleepData.sleepHeartRate.values.length} ölçüm, ort. ${Math.round(sleepData.sleepHeartRate.average)} BPM` : 'yok');

      const now = new Date().toISOString();
      
      // Sonuçları doğru formatta hazırla ve döndür
      const result = {
        heartRate: {
          values: heartRateData.values || [],
          times: heartRateData.times || [],
          average: heartRateData.average || 0,
          max: heartRateData.max || 0,
          min: heartRateData.min || 0,
          lastUpdated: now,
          status: 'good' as const
        },
        steps: { 
          total: stepsData || 0,
          values: [stepsData || 0],
          times: [now],
          lastUpdated: now,
          status: 'good' as const,
        },
        sleep: sleepData || {
          duration: 0,
          efficiency: 0,
          deep: 0,
          light: 0,
          rem: 0,
          awake: 0,
          startTime: now,
          endTime: now,
          totalMinutes: 0,
          stages: [],
          values: [0],
          times: [now],
          lastUpdated: now,
          status: 'good' as const,
          sleepHeartRate: undefined
        },
        calories: { 
          total: caloriesData || 0,
          values: [caloriesData || 0],
          times: [now],
          lastUpdated: now,
          status: 'good' as const,
        },
        oxygen: {
          values: oxygenData.values || [],
          times: oxygenData.times || [],
          average: oxygenData.average || 0,
          max: oxygenData.average || 0,
          min: oxygenData.average || 0,
          lastUpdated: now,
          status: 'good' as const
        }
      };

      console.log("Health Connect veri paketi hazırlandı");
      console.log('Health Connect verileri başarıyla çekildi');
      
      return result;
    } catch (error) {
      console.error('Health Connect verileri alınırken hata oluştu:', error);
      
      // Hata durumunda boş veri döndür
      return this.getEmptyHealthData();
    }
  }
  
  // Boş sağlık verisi oluşturan yardımcı fonksiyon
  private static getEmptyHealthData(): HealthDataType {
    const now = new Date().toISOString();
    return {
      heartRate: {
        values: [],
        times: [],
        average: 0,
        max: 0,
        min: 0,
        lastUpdated: now,
        status: 'good' as const
      },
      steps: { 
        total: 0,
        values: [0],
        times: [now],
        lastUpdated: now,
        status: 'good' as const,
      },
      sleep: {
        duration: 0,
        efficiency: 0,
        deep: 0,
        light: 0,
        rem: 0,
        awake: 0,
        startTime: now,
        endTime: now,
        totalMinutes: 0,
        stages: [],
        values: [0],
        times: [now],
        lastUpdated: now,
        status: 'good' as const,
        sleepHeartRate: undefined
      },
      calories: {
        total: 0,
        values: [0],
        times: [now],
        lastUpdated: now,
        status: 'good' as const,
      },
      oxygen: {
        values: [],
        times: [],
        average: 0,
        max: 0,
        min: 0,
        lastUpdated: now,
        status: 'good' as const
      }
    };
  }

  static async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      this.log('Health Connect sadece Android platformunda desteklenir');
      return false;
    }
  
    try {
      // Eğer zaten başlatılmışsa tekrar başlatmaya gerek yok
      if (this.isInitialized === true) {
        this.log('Health Connect zaten başlatılmış');
        return true;
      }
  
      // Önce yüklü olup olmadığını kontrol et
      const installed = await this.isInstalled();
      if (!installed) {
        console.log('Health Connect yüklü değil');
        return false;
      }
  
      // Kotlin tarafı sadece providerPackageName bekliyor
      if (HealthConnectImpl.initialize) {
        await HealthConnectImpl.initialize('com.google.android.apps.healthdata');
      }
  
      // Tüm izin kontrollerini sadece bir kez yap
      if (!this.permissionsGranted && !this.permissionRequested) {
        this.permissionRequested = true;
        try {
          console.log('Health Connect izinleri kontrol ediliyor...');
          if (HealthConnectImpl.getGrantedPermissions) {
            const grantedPermissions = await HealthConnectImpl.getGrantedPermissions();
            if (Array.isArray(grantedPermissions) && grantedPermissions.length > 0) {
              this.grantedPermissionList = grantedPermissions;
              this.permissionsGranted = true;
              console.log('İzinler zaten verilmiş, tekrar istemeye gerek yok');
            } else {
              console.log('Health Connect izinleri eksik, bir kez izin isteniyor...');
              await this.requestPermissions();
            }
          }
        } catch (permError) {
          console.log('İzin kontrolü hatası, kullanıcı deneyimini bozmamak için devam ediliyor:', permError);
          this.permissionsGranted = true;
        }
      }
  
      console.log('Health Connect başlatıldı');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Health Connect başlatma hatası:', error);
      return false;
    }
  }
  

  static async checkPermissionsAlreadyGranted(): Promise<boolean> {
    try {
      if (this.permissionsGranted) {
        return true;
      }
  
      if (HealthConnectImpl.getGrantedPermissions) {
        const grantedPermissions = await HealthConnectImpl.getGrantedPermissions();
  
        const requiredPermissions = [
          'ActiveCaloriesBurnedRecord',
          'StepCountRecord',
          'HeartRateRecord',
          'OxygenSaturationRecord',
          'SleepSessionRecord',
          'SleepStageRecord',
          'BasalMetabolicRateRecord',
          'TotalCaloriesBurnedRecord',
          'CaloriesBurnedRecord',
        ];
  
        const allGranted = requiredPermissions.every(p => grantedPermissions.includes(p));
  
        this.grantedPermissionList = grantedPermissions;
        this.permissionsGranted = allGranted;
  
        return allGranted;
      }
    } catch (error) {
      console.warn('İzin kontrolü hatası:', error);
      // Bu noktada false dönmek daha güvenlidir
    }
  
    return false;
  }
  
  
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        console.warn('Health Connect yalnızca Android platformunda desteklenir.');
        return false;
      }
  
      const isInstalled = await this.isInstalled();
      if (!isInstalled) {
        console.warn('Health Connect uygulaması yüklü değil.');
        return false;
      }
  
      const permissions = [
        'ActiveCaloriesBurnedRecord',
        'StepCountRecord',
        'HeartRateRecord',
        'OxygenSaturationRecord',
        'SleepSessionRecord',
        'SleepStageRecord',
        'BasalMetabolicRateRecord',
        'TotalCaloriesBurnedRecord',
        'CaloriesBurnedRecord',
        'Energy',
        'EnergyBurned',
        'KCalories',
        'ExerciseCalories'
      ];
  
      // İzin isteme işlemi
      const granted = await HealthConnectImpl.requestPermissions({
        permissions,
        accessType: 'read',
      });
  
      // Tüm izinlerin verilip verilmediğini kontrol et
      const allGranted = permissions.every(p => granted.grantedPermissions.includes(p));
  
      // İzin durumu güncelleniyor
      this.permissionsGranted = allGranted;
      this.permissionRequested = true;
  
      console.log('İzinler verildi mi?', allGranted);
      return allGranted;
    } catch (error) {
      console.error('Health Connect izin isteme hatası:', error);
      return false;
    }
  }
  
  

  static async openHealthConnectApp(): Promise<void> {
    try {
      if (!HealthConnectImpl?.openHealthConnectSettings) {
        console.log('openHealthConnectSettings fonksiyonu bulunamadı');
        return;
      }

      await HealthConnectImpl.openHealthConnectSettings();
    } catch (error) {
      console.error('Health Connect ayarları açma hatası:', error);
    }
  }
  static async getSleepData(startDateStr: string, endDateStr: string): Promise<SleepMetric | null> {
    if (Platform.OS !== 'android') {
      console.log('Health Connect sadece Android platformunda desteklenir');
      return this.getEmptyData('sleep');
    }
  
    try {
      console.log('Uyku verileri alınmaya çalışılıyor...');
      
      // Tarih aralığını doğru şekilde parçala
      const startTime = new Date(startDateStr);
      const endTime = new Date(endDateStr);
      
      // Aynı gün içinde olduğundan emin olma kontrolü
      const startDay = startTime.toISOString().split('T')[0];
      const endDay = endTime.toISOString().split('T')[0];
      
      console.log(`Uyku sorgusu tarih aralığı: ${startDay} - ${endDay}`);
      
      // Farklı uyku kayıt türlerini dene
      const sleepTypes = ['SleepSession', 'Sleep', 'SleepStage', 'SleepSegment'];
      let sleepResponse = null;
      
      // Uyku türlerini dene
      for (const type of sleepTypes) {
        console.log(`${type} türü deneniyor...`);
        const response = await this.readHealthConnectRecords(type, startDateStr, endDateStr);
        if (response) {
          console.log(`${type} verisi bulundu`);
          sleepResponse = response;
          break;
        }
      }
      
      if (!sleepResponse) {
        console.log('Uyku verisi bulunamadı, boş veri döndürülüyor');
        return this.getEmptyData('sleep');
      }
  
      console.log('Uyku verisi yanıtı alındı');
      const sleepRecords = this.parseHealthConnectResponse<HealthRecord>(sleepResponse);
      console.log('Uyku kayıt sayısı:', sleepRecords.length);
      
      // Sadece sorgu tarih aralığındaki uyku oturumlarını filtrele
      const initialFilteredRecords = sleepRecords.filter(session => {
        // startTime ve endTime kontrolü
        if (!session.startTime || !session.endTime) return false;
        
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        
        // Tarih aralığı içinde olup olmadığını kontrol et
        const isInRange = sessionStart >= startTime && sessionEnd <= endTime;
        
        // Uzun uyku oturumlarını filtrele (24 saatten uzun olanları dışla)
        const durationHours = (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60 * 60);
        const isReasonableDuration = durationHours <= 14; // Maksimum 14 saat uyku kabul edilebilir
        
        console.log(`Uyku oturumu: ${session.startTime} - ${session.endTime}, süre: ${durationHours.toFixed(2)} saat, aralıkta mı: ${isInRange}, makul süre mi: ${isReasonableDuration}`);
        
        return isInRange && isReasonableDuration;
      });
      
      console.log(`İlk filtreleme sonrası uyku oturumu sayısı: ${initialFilteredRecords.length}`);
      
      // 🛌 YENİ: Aynı saate başlayan uyku oturumlarını ve kısa uyanmaları dışla
      let filteredSleepRecords: HealthRecord[] = [];
      
      if (initialFilteredRecords.length > 1) {
        console.log('Birden fazla uyku oturumu bulundu, akıllı filtreleme yapılıyor...');
        
        // Önce aynı başlangıç saatine sahip oturumları grupla
        const sessionGroups = new Map<string, HealthRecord[]>();
        
        initialFilteredRecords.forEach(session => {
          if (session.startTime) {
            // Başlangıç saatini dakika hassasiyetinde grupla
            const startKey = new Date(session.startTime).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
            
            if (!sessionGroups.has(startKey)) {
              sessionGroups.set(startKey, []);
            }
            sessionGroups.get(startKey)!.push(session);
          }
        });
        
        console.log(`${sessionGroups.size} farklı başlangıç zamanı grubu bulundu`);
        
        // Her gruptan en uzun oturumu al
        const selectedSessions: HealthRecord[] = [];
        
        sessionGroups.forEach((sessions, startKey) => {
          if (sessions.length > 1) {
            console.log(`${startKey} zamanında ${sessions.length} adet uyku oturumu var, en uzunu seçiliyor`);
            
            // Bu grup içinde en uzun oturumu bul
            const longestInGroup = sessions.reduce((longest, current) => {
              if (!current.startTime || !current.endTime) return longest;
              if (!longest.startTime || !longest.endTime) return current;
              
              const currentDuration = new Date(current.endTime).getTime() - new Date(current.startTime).getTime();
              const longestDuration = new Date(longest.endTime).getTime() - new Date(longest.startTime).getTime();
              
              return currentDuration > longestDuration ? current : longest;
            });
            
            const durationHours = (new Date(longestInGroup.endTime!).getTime() - new Date(longestInGroup.startTime!).getTime()) / (1000 * 60 * 60);
            console.log(`Grup ${startKey} için en uzun oturum seçildi: ${durationHours.toFixed(2)} saat`);
            
            selectedSessions.push(longestInGroup);
          } else {
            // Tek oturum varsa direkt ekle
            selectedSessions.push(sessions[0]);
          }
        });
        
        // Şimdi seçilen oturumlardan 2+ saat olanları filtrele
        const longSessions = selectedSessions.filter(session => {
          if (!session.startTime || !session.endTime) return false;
          const sessionStart = new Date(session.startTime);
          const sessionEnd = new Date(session.endTime);
          const durationHours = (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60 * 60);
          return durationHours >= 2.0; // En az 2 saat olan oturumlar
        });
        
        if (longSessions.length > 0) {
          console.log(`${longSessions.length} adet 2+ saat uyku oturumu final listeye alındı`);
          filteredSleepRecords = longSessions;
        } else {
          // Hiç uzun oturum yoksa en uzun olanı al
          const longestOverall = selectedSessions.reduce((longest, current) => {
            if (!current.startTime || !current.endTime) return longest;
            if (!longest.startTime || !longest.endTime) return current;
            
            const currentDuration = new Date(current.endTime).getTime() - new Date(current.startTime).getTime();
            const longestDuration = new Date(longest.endTime).getTime() - new Date(longest.startTime).getTime();
            
            return currentDuration > longestDuration ? current : longest;
          });
          
          console.log('Hiç 2+ saat oturum yok, en uzun oturum alındı');
          filteredSleepRecords = [longestOverall];
        }
      } else {
        // Tek oturum varsa direkt kullan
        filteredSleepRecords = initialFilteredRecords;
        console.log('Tek uyku oturumu bulundu, direkt kullanılıyor');
      }
      
      console.log(`Final filtreleme sonrası kalan uyku oturumu sayısı: ${filteredSleepRecords.length}`);
      
      // Düzeltilmiş uyku hesaplaması
      let totalSleepMinutes = 0;
      let totalDeepMinutes = 0;
      let totalLightMinutes = 0;
      let totalRemMinutes = 0;
      let totalAwakeMinutes = 0;
      let stages: { stage: string; startTime: string; endTime: string; durationMinutes: number }[] = [];
      
      // Başlangıç ve bitiş zamanlarını belirleme
      let earliestStart = '';
      let latestEnd = '';
  
      console.log(`🔍 Uyku zamanlarını belirleme - ${filteredSleepRecords.length} oturum işlenecek`);
  
      filteredSleepRecords.forEach((session, index) => {
        console.log(`📋 Uyku oturumu ${index + 1}:`, {
          startTime: session.startTime,
          endTime: session.endTime,
          hasStartTime: !!session.startTime,
          hasEndTime: !!session.endTime
        });
        
        const startTime = session.startTime;
        const endTime = session.endTime;
        
        if (startTime && endTime) {
          // İlk oturum veya daha erken bir başlangıç ise
          if (!earliestStart || startTime < earliestStart) {
            earliestStart = startTime;
          }
          
          // İlk oturum veya daha geç bir bitiş ise
          if (!latestEnd || endTime > latestEnd) {
            latestEnd = endTime;
          }
          
          // Oturum süresini hesapla (dakika cinsinden)
          const startDate = new Date(startTime);
          const endDate = new Date(endTime);
          const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
          
          // Mantıklı bir süre mi kontrol et (24 saatten az)
          if (durationMinutes > 0 && durationMinutes < 24 * 60) {
            totalSleepMinutes += durationMinutes;
          } else {
            console.log(`Geçersiz uyku süresi (${durationMinutes} dakika), atlanıyor`);
            return; // Bu oturumu atla
          }
  
          // Eğer doğrudan stages alanı varsa
          if (session.stages && Array.isArray(session.stages)) {
            console.log('Uyku aşamaları bulundu, aşama sayısı:', session.stages.length);
            
            session.stages.forEach((stage: any) => {
              if (stage.stage !== undefined && stage.startTime && stage.endTime) {
                const mappedStage = this.mapSleepStage(stage.stage);
                
                const stageStartDate = new Date(stage.startTime);
                const stageEndDate = new Date(stage.endTime);
                
                // Stage'in oturum aralığı içinde olup olmadığını kontrol et
                const sessionStartDate = new Date(startTime);
                const sessionEndDate = new Date(endTime);
                
                if (stageStartDate >= sessionStartDate && stageEndDate <= sessionEndDate) {
                  const stageDurationMinutes = (stageEndDate.getTime() - stageStartDate.getTime()) / (1000 * 60);
                  
                  // Geçerli süre kontrolü
                  if (stageDurationMinutes <= 0 || stageDurationMinutes > 24 * 60) {
                    console.log(`Geçersiz aşama süresi: ${stageDurationMinutes} dakika, atlanıyor`);
                    return;
                  }
                  
                  console.log(`Uyku aşaması: ${stage.stage} -> ${mappedStage}, süresi: ${stageDurationMinutes} dakika`);
                  
                  // Aşamaya göre süreleri topla - DİREKT TOPLAMA
                  switch (mappedStage) {
                    case 'deep':
                      totalDeepMinutes += stageDurationMinutes;
                      break;
                    case 'rem':
                      totalRemMinutes += stageDurationMinutes;
                      break;
                    case 'awake':
                      totalAwakeMinutes += stageDurationMinutes;
                      break;
                    case 'light':
                      totalLightMinutes += stageDurationMinutes;
                      break;
                  }
                  
                  // Aşama bilgisini ekle
                  stages.push({
                    stage: mappedStage,
                    startTime: stage.startTime,
                    endTime: stage.endTime,
                    durationMinutes: stageDurationMinutes
                  });
                }
              }
            });
          } else {
            // Eğer aşama bilgisi yoksa tüm uyku light olarak say
            totalLightMinutes += durationMinutes;
          }
        }
      });
      
      // Eğer aşama toplamları toplam uykudan fazlaysa düzelt
      const totalStageMinutes = totalDeepMinutes + totalLightMinutes + totalRemMinutes + totalAwakeMinutes;
      
      console.log(`Aşama toplamları: Deep=${totalDeepMinutes}, Light=${totalLightMinutes}, REM=${totalRemMinutes}, Awake=${totalAwakeMinutes}, Toplam Aşama=${totalStageMinutes}, Toplam Uyku=${totalSleepMinutes}`);
      
      // Eğer aşamalar toplamı toplam uykudan farklıysa light uyku düzelt
      if (totalStageMinutes !== totalSleepMinutes && totalStageMinutes > 0) {
        const difference = totalSleepMinutes - (totalDeepMinutes + totalRemMinutes + totalAwakeMinutes);
        totalLightMinutes = Math.max(0, difference);
        console.log(`Light uyku düzeltildi: ${totalLightMinutes} dakika`);
      }
      
      // Tüm değerlerin pozitif olmasını sağla
      totalDeepMinutes = Math.max(0, totalDeepMinutes);
      totalLightMinutes = Math.max(0, totalLightMinutes);
      totalRemMinutes = Math.max(0, totalRemMinutes);
      totalAwakeMinutes = Math.max(0, totalAwakeMinutes);
      
      // Toplam uyku süresi makul bir aralıkta mı kontrol et (2-14 saat)
      if (totalSleepMinutes > 14 * 60) {
        console.log(`Çok uzun uyku süresi tespit edildi: ${totalSleepMinutes} dakika, makul sınıra çekildi`);
        totalSleepMinutes = 14 * 60; // Maksimum 14 saat
      }
  
      console.log(`Uyku metrikleri: Toplam=${totalSleepMinutes}, Derin=${totalDeepMinutes}, Hafif=${totalLightMinutes}, REM=${totalRemMinutes}, Uyanık=${totalAwakeMinutes}`);
      console.log(`🕐 Final uyku zamanları: earliestStart=${earliestStart}, latestEnd=${latestEnd}`);
      
      // Zaman noktası oluştur
      const now = new Date().toISOString();

      // Uyku zamanlarını belirle - önce actual data, sonra tahmin
      let sleepStart = earliestStart;
      let sleepEnd = latestEnd;

      // Uyku sırasındaki nabız verilerini al
      let sleepHeartRateData = null;
      
      if (!sleepStart || !sleepEnd) {
        console.log('⚠️ Uyku zamanları eksik, tahmini gece saatleri kullanılacak');
        
        // Sorgu tarihinden tahmini gece saatleri oluştur
        const queryDate = new Date(startDateStr);
        const estimatedSleepStart = new Date(queryDate);
        estimatedSleepStart.setHours(22, 0, 0, 0); // Akşam 22:00
        
        const estimatedSleepEnd = new Date(queryDate);
        estimatedSleepEnd.setDate(estimatedSleepEnd.getDate() + 1);
        estimatedSleepEnd.setHours(7, 0, 0, 0); // Sabah 07:00
        
        sleepStart = estimatedSleepStart.toISOString();
        sleepEnd = estimatedSleepEnd.toISOString();
        
        console.log(`🔮 Tahmini uyku zamanları: ${sleepStart} - ${sleepEnd}`);
      }
      
      console.log('🛌 Uyku sırasındaki nabız verileri alınıyor...');
      try {
        // Uyku için daha geniş tarih aralığı kullan (önceki gün ve sonraki gün dahil)
        const sleepStartDate = new Date(sleepStart);
        const sleepEndDate = new Date(sleepEnd);
        
        // 1 gün öncesinden 1 gün sonrasına kadar genişlet
        const extendedStartDate = new Date(sleepStartDate.getTime() - 24 * 60 * 60 * 1000);
        const extendedEndDate = new Date(sleepEndDate.getTime() + 24 * 60 * 60 * 1000);
        
        sleepHeartRateData = await this.getSleepHeartRateData(
          extendedStartDate.toISOString(), 
          extendedEndDate.toISOString(), 
          sleepStart, 
          sleepEnd
        );
          
          if (sleepHeartRateData && sleepHeartRateData.values.length > 0) {
            console.log(`✅ Uyku nabız verisi eklendi: ${sleepHeartRateData.values.length} ölçüm, ortalama ${Math.round(sleepHeartRateData.average)} BPM`);
          } else {
            console.log('⚠️ Uyku sırasında nabız verisi bulunamadı');
          }
        } catch (error) {
          console.error('❌ Uyku nabız verisi alınırken hata:', error);
        }
  
      // Verileri döndür
      const sleepMetric: SleepMetric = {
        status: totalSleepMinutes > 360 ? 'good' : totalSleepMinutes > 300 ? 'warning' : 'bad',
        values: [totalSleepMinutes],
        times: [now],
        lastUpdated: now,
        duration: totalSleepMinutes,
        efficiency: totalSleepMinutes > 0 ? (totalSleepMinutes - totalAwakeMinutes) / totalSleepMinutes * 100 : 0,
        deep: totalDeepMinutes,
        light: totalLightMinutes,
        rem: totalRemMinutes,
        awake: totalAwakeMinutes,
        startTime: sleepStart || earliestStart,
        endTime: sleepEnd || latestEnd,
        totalMinutes: totalSleepMinutes,
        stages: stages.map(s => ({
          stage: s.stage as 'deep' | 'light' | 'rem' | 'awake',
          startTime: s.startTime,
          endTime: s.endTime
        })),
        // Uyku sırasındaki nabız verilerini ekle
        sleepHeartRate: sleepHeartRateData && sleepHeartRateData.values.length > 0 ? {
          values: sleepHeartRateData.values,
          times: sleepHeartRateData.times,
          average: sleepHeartRateData.average,
          max: sleepHeartRateData.max,
          min: sleepHeartRateData.min
        } : undefined
      };
      
      return sleepMetric;
    } catch (error) {
      console.error('Uyku verisi alınırken hata:', error);
      return this.getEmptyData('sleep');
    }
  }
  
  

  private static mapSleepStage(stageValue: number | string): string {
    // Xiaomi uyku aşamaları için özel eşleme
    if (stageValue === 4 || stageValue === 'LIGHT' || stageValue === '4') return 'light';
    if (stageValue === 7 || stageValue === 'AWAKE' || stageValue === '7') return 'awake';
    if (stageValue === 5 || stageValue === 'DEEP' || stageValue === '5') return 'deep';
    if (stageValue === 6 || stageValue === 'REM' || stageValue === '6') return 'rem';
    
    // Farklı cihazlar için diğer yaygın formatlar
  if (typeof stageValue === 'string') {
    const stageLower = stageValue.toLowerCase();
    if (stageLower.includes('deep')) return 'deep';
    if (stageLower.includes('light')) return 'light';
    if (stageLower.includes('rem')) return 'rem';
    if (stageLower.includes('awake') || stageLower.includes('wake')) return 'awake';
  }
    
    console.warn('Bilinmeyen uyku aşaması:', stageValue);
    return 'light'; // Bilinmeyeni hafif uykuya varsayılan olarak eşle
  }

  /**
   * Herhangi bir kayıt tipinden nabız verisi çıkarmaya çalış
   */
  private static extractHeartRateFromAnyRecord(records: HealthRecord[], recordType: string): { values: number[], times: string[] } {
    const values: number[] = [];
    const times: string[] = [];
    
    records.forEach(record => {
      // Standart samples yapısı
      if (record.samples && Array.isArray(record.samples)) {
        record.samples.forEach(sample => {
          if (sample.beatsPerMinute && sample.time) {
            values.push(sample.beatsPerMinute);
            times.push(sample.time);
          }
        });
      }
      
      // Doğrudan record üzerinde nabız alanları
      const recordAny = record as any;
      
      // Farklı alan isimlerini dene
      const heartRateFields = ['heartRate', 'beatsPerMinute', 'avgHeartRate', 'averageHeartRate', 'bpm'];
      const timeFields = ['time', 'timestamp', 'startTime', 'recordTime'];
      
      for (const hrField of heartRateFields) {
        for (const timeField of timeFields) {
          if (recordAny[hrField] && recordAny[timeField]) {
            const heartRateValue = Number(recordAny[hrField]);
            if (heartRateValue > 0 && heartRateValue < 300) { // Mantıklı nabız aralığı
              values.push(heartRateValue);
              times.push(recordAny[timeField]);
            }
          }
        }
      }
      
      // Nested object araması (Mi Fitness özel yapıları için)
      if (recordAny.heartRateData || recordAny.biometricData || recordAny.vitalSigns) {
        const nestedData = recordAny.heartRateData || recordAny.biometricData || recordAny.vitalSigns;
        if (nestedData.samples || nestedData.values) {
          const nestedSamples = nestedData.samples || nestedData.values;
          if (Array.isArray(nestedSamples)) {
            nestedSamples.forEach((sample: any) => {
              if (sample.heartRate || sample.bpm || sample.beatsPerMinute) {
                const hr = sample.heartRate || sample.bpm || sample.beatsPerMinute;
                const time = sample.time || sample.timestamp || record.startTime;
                if (hr > 0 && hr < 300 && time) {
                  values.push(Number(hr));
                  times.push(time);
                }
              }
            });
          }
        }
      }
    });
    
    return { values, times };
  }
  
  /**
   * Nabız aykırı değer temizleme
   */
  private static filterHeartRateOutliers(values: number[], times: string[]): { values: number[], times: string[] } {
    const filteredValues: number[] = [];
    const filteredTimes: string[] = [];
    
    values.forEach((value, index) => {
      // Uyku nabzı için makul aralık: 30-120 BPM (daha geniş aralık)
      if (value >= 30 && value <= 120) {
        filteredValues.push(value);
        if (times[index]) {
          filteredTimes.push(times[index]);
        }
      }
    });
    
    console.log(`🧹 Nabız filtreleme: ${values.length} → ${filteredValues.length} (${values.length - filteredValues.length} aykırı değer temizlendi)`);
    
    return { values: filteredValues, times: filteredTimes };
  }

  static async isInstalled(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }
      
      // NativeModules.HealthConnect kontrolü
      if (NativeModules?.HealthConnect) {
        return true;
      }
      
      // HealthConnectModule kontrolü
      if (HealthConnect) {
        return true;
      }
      
      // Package Manager ile Health Connect paketini kontrol et
      try {
        const canOpenHealthConnectApp = await Linking.canOpenURL('package:com.google.android.apps.healthdata');
        if (canOpenHealthConnectApp) {
          return true;
        }
      } catch (e) {
        console.log('Package kontrolü hatası:', e);
      }
      
      return false;
      } catch (error) {
      console.error('Health Connect yükleme kontrolü hatası:', error);
      return false;
    }
  }
}

export default HealthConnectService; 