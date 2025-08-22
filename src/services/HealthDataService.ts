import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import HealthConnectService from './HealthConnectService';
import HealthKitService from './HealthKitService';
import { HealthData } from '../types/health';
import { Platform } from 'react-native';

/**
 * Uyku verisi için basit tarih belirleme fonksiyonu
 * Uyandığı saat hangi tarihse uyku verisi o tarihe kaydedilir
 */
const getSleepDataWithProperDate = async (targetDate: Date) => {
  if (Platform.OS !== 'android') return null;

  // 1 gün önceki akşam 18:00'dan hedef günün öğlen 14:00'ına kadar ara
  const sleepSearchStart = new Date(targetDate);
  sleepSearchStart.setDate(sleepSearchStart.getDate() - 1);
  sleepSearchStart.setHours(18, 0, 0, 0); // Önceki gün akşam 18:00

  const sleepSearchEnd = new Date(targetDate);
  sleepSearchEnd.setHours(14, 0, 0, 0); // Hedef gün öğlen 14:00

  console.log('🛌 Uyku verisi aralığı:', 
             `${sleepSearchStart.toLocaleString()} - ${sleepSearchEnd.toLocaleString()}`);

  const sleepData = await HealthConnectService.getSleepData(
    sleepSearchStart.toISOString(), 
    sleepSearchEnd.toISOString()
  );

  if (sleepData && sleepData.endTime) {
    const sleepEndTime = new Date(sleepData.endTime);
    const sleepEndDateStr = format(sleepEndTime, 'yyyy-MM-dd');
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    console.log(`🛌 Uyandığı tarih: ${sleepEndDateStr}, hedef tarih: ${targetDateStr}`);
    
    // Uyandığı tarih ile hedef tarih aynı ise bu uyku verisi kullanılır
    if (sleepEndDateStr === targetDateStr) {
      console.log('✅ Uyandığı tarih hedef tarihle eşleşiyor, uyku verisi kabul edildi');
      return sleepData;
    } else {
      console.log('❌ Uyandığı tarih hedef tarihle eşleşmiyor, uyku verisi reddedildi');
      return null;
    }
  }

  console.log('🛌 Uyku verisi bulunamadı');
  return null;
};

// Eğer veri yoksa dönecek varsayılan değerleri hazırlar
export const getDefaultHealthData = (): HealthData => {
  const defaultMetric = {
    values: [0],
    times: [new Date().toISOString()],
    lastUpdated: new Date().toISOString(),
    status: 'good' as const,
  };

  return {
    heartRate: { ...defaultMetric, average: 0, max: 0, min: 0 },
    oxygen: { ...defaultMetric, average: 0, max: 0, min: 0 },
    sleep: {
      ...defaultMetric,
      duration: 0,
      efficiency: 0,
      deep: 0,
      light: 0,
      rem: 0,
      awake: 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      stages: [],
      totalMinutes: 0,
    },
    steps: { ...defaultMetric, total: 0},
    calories: { ...defaultMetric, total: 0},
  };
};

/**
 * HealthKit raw data'sını HealthData tipine dönüştürür
 */
const mapHealthKitToHealthData = (rawData: any): HealthData => {
  const now = new Date().toISOString();
  
  // ActiveCalories ve BasalCalories'i birleştir
  const totalCalories = (rawData.activeCalories || []).reduce((sum: number, item: any) => sum + (item.value || 0), 0) +
                       (rawData.basalCalories || []).reduce((sum: number, item: any) => sum + (item.value || 0), 0);

  // Steps toplamını hesapla
  const totalSteps = (rawData.steps || []).reduce((sum: number, item: any) => sum + (item.value || 0), 0);

  // HeartRate ortalamasını hesapla
  const heartRateValues = (rawData.heartRate || []).map((item: any) => item.value || 0);
  const avgHeartRate = heartRateValues.length > 0 ? 
    heartRateValues.reduce((sum: number, val: number) => sum + val, 0) / heartRateValues.length : 0;

  // Oxygen ortalamasını hesapla
  const oxygenValues = (rawData.oxygen || []).map((item: any) => item.value || 0);
  const avgOxygen = oxygenValues.length > 0 ? 
    oxygenValues.reduce((sum: number, val: number) => sum + val, 0) / oxygenValues.length : 0;

  return {
    heartRate: {
      values: heartRateValues,
      times: (rawData.heartRate || []).map((item: any) => item.startDate || now),
      average: avgHeartRate,
      max: heartRateValues.length > 0 ? Math.max(...heartRateValues) : 0,
      min: heartRateValues.length > 0 ? Math.min(...heartRateValues) : 0,
      lastUpdated: now,
      status: 'good' as const,
    },
    oxygen: {
      values: oxygenValues,
      times: (rawData.oxygen || []).map((item: any) => item.startDate || now),
      average: avgOxygen,
      max: oxygenValues.length > 0 ? Math.max(...oxygenValues) : 0,
      min: oxygenValues.length > 0 ? Math.min(...oxygenValues) : 0,
      lastUpdated: now,
      status: 'good' as const,
    },
    steps: {
      total: totalSteps,
      values: [totalSteps],
      times: [now],
      lastUpdated: now,
      status: 'good' as const,
    },
    calories: {
      total: totalCalories,
      values: [totalCalories],
      times: [now],
      lastUpdated: now,
      status: 'good' as const,
    },
    sleep: {
      duration: 0, // HealthKit sleep parsing karmaşık olduğu için şimdilik 0
      efficiency: 0,
      deep: 0,
      light: 0,
      rem: 0,
      awake: 0,
      startTime: now,
      endTime: now,
      stages: [],
      totalMinutes: 0,
      values: [0],
      times: [now],
      lastUpdated: now,
      status: 'good' as const,
    },
  };
};

/**
 * Verilen tarih için sağlık verilerini getirir
 */
export const fetchHealthDataForDate = async (date: Date): Promise<HealthData> => {
  try {
    console.log('📅 Tarih için sağlık verisi getiriliyor:', format(date, 'yyyy-MM-dd'));

    const startTime = startOfDay(date);
    const endTime = endOfDay(date);

    if (Platform.OS === 'android') {
      // Android - Health Connect kullan
      console.log('🤖 Android Health Connect verisi alınıyor...');
      
      const healthData = await HealthConnectService.getHealthData(
        startTime.toISOString(), 
        endTime.toISOString()
      );

      if (healthData) {
        console.log('✅ Android sağlık verisi başarıyla alındı:', {
          heartRate: healthData.heartRate?.average || 0,
          oxygen: healthData.oxygen?.average || 0,
          steps: healthData.steps?.total || 0,
          calories: healthData.calories?.total || 0,
          sleepDuration: healthData.sleep?.duration || 0,
        });
        return healthData;
      } else {
        console.log('⚠️ Android Health Connect boş veri döndü, varsayılan veriler kullanılıyor');
        return getDefaultHealthData();
      }

    } else if (Platform.OS === 'ios') {
      // iOS - HealthKit kullan
      console.log('🍎 iOS HealthKit verisi alınıyor...');
      
      const rawHealthData = await HealthKitService.getHealthData(startTime, endTime);

      if (rawHealthData) {
        // HealthKit raw data'sını HealthData tipine dönüştür
        const mappedHealthData = mapHealthKitToHealthData(rawHealthData);
        console.log('✅ iOS sağlık verisi başarıyla alındı ve dönüştürüldü');
        return mappedHealthData;
      } else {
        console.log('⚠️ iOS HealthKit boş veri döndü, varsayılan veriler kullanılıyor');
        return getDefaultHealthData();
      }
    } else {
      console.log('⚠️ Desteklenmeyen platform, varsayılan veriler kullanılıyor');
      return getDefaultHealthData();
    }

  } catch (error) {
    console.error('❌ Sağlık verisi getirme hatası:', error);
    return getDefaultHealthData();
  }
};

/**
 * Verilen tarih aralığı için sağlık verilerini getirir
 */
export const fetchHealthDataForRange = async (startDate: Date, endDate: Date): Promise<HealthData> => {
  try {
    console.log('📅 Tarih aralığı için sağlık verisi getiriliyor:', 
      `${format(startDate, 'yyyy-MM-dd')} - ${format(endDate, 'yyyy-MM-dd')}`);

    const startTime = startOfDay(startDate);
    const endTime = endOfDay(endDate);

    if (Platform.OS === 'android') {
      // Android - Health Connect kullan
      console.log('🤖 Android Health Connect aralık verisi alınıyor...');
      
      const healthData = await HealthConnectService.getHealthData(
        startTime.toISOString(), 
        endTime.toISOString()
      );

      if (healthData) {
        console.log('✅ Android aralık sağlık verisi başarıyla alındı:', {
          heartRate: healthData.heartRate?.average || 0,
          oxygen: healthData.oxygen?.average || 0,
          steps: healthData.steps?.total || 0,
          calories: healthData.calories?.total || 0,
          sleepDuration: healthData.sleep?.duration || 0,
        });
        return healthData;
      } else {
        console.log('⚠️ Android Health Connect aralık için boş veri döndü');
        return getDefaultHealthData();
      }

    } else if (Platform.OS === 'ios') {
      // iOS - HealthKit kullan
      console.log('🍎 iOS HealthKit aralık verisi alınıyor...');
      
      const rawHealthData = await HealthKitService.getHealthData(startTime, endTime);

      if (rawHealthData) {
        // HealthKit raw data'sını HealthData tipine dönüştür
        const mappedHealthData = mapHealthKitToHealthData(rawHealthData);
        console.log('✅ iOS aralık sağlık verisi başarıyla alındı ve dönüştürüldü');
        return mappedHealthData;
      } else {
        console.log('⚠️ iOS HealthKit aralık için boş veri döndü');
        return getDefaultHealthData();
      }
    } else {
      console.log('⚠️ Desteklenmeyen platform, varsayılan veriler kullanılıyor');
      return getDefaultHealthData();
    }

  } catch (error) {
    console.error('❌ Aralık sağlık verisi getirme hatası:', error);
    return getDefaultHealthData();
  }
};

// Günlük verileri çeker
export const fetchDailyHealthData = async (date: Date): Promise<HealthData> => {
  return fetchHealthDataForDate(date);
};

// Haftalık verileri çeker
export const fetchWeeklyHealthData = async (date: Date): Promise<HealthData> => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıç
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Pazar bitiş
  return fetchHealthDataForRange(weekStart, weekEnd);
};

// Aylık verileri çeker
export const fetchMonthlyHealthData = async (date: Date): Promise<HealthData> => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  return fetchHealthDataForRange(monthStart, monthEnd);
};

// AWS config ve auth kontrolü
export const checkConfigAndAuth = async (): Promise<boolean> => {
  try {
    // Geçici olarak true döndür - tam AWS implementasyonu sonra eklenecek
      return true;
  } catch (error) {
    console.warn('Kimlik doğrulama hatası:', error);
    return false;
  }
};

const HealthDataService = {
  fetchHealthDataForDate,
  fetchHealthDataForRange,
  fetchDailyHealthData,
  fetchWeeklyHealthData,
  fetchMonthlyHealthData,
  checkConfigAndAuth,
  getDefaultHealthData,
};

export default HealthDataService;
