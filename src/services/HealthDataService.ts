import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import HealthConnectService from './HealthConnectService';
import HealthKitService from './HealthKitService';
import { HealthData, mapHealthConnectData, mapHealthKitData } from '../types/health';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Platform } from 'react-native';
import awsconfig from '../aws-exports'; 
/**
 * Verilen tarih için sağlık verilerini getirir
 * @param date Sağlık verilerinin getirileceği tarih
 * @returns Sağlık verileri
 */
export const fetchHealthDataForDate = async (date: Date): Promise<HealthData | null> => {
  try {
    const isAuthValid = await checkAuthAndConfig();
    if (!isAuthValid) {
      return getDefaultHealthData();
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log(`${formattedDate} tarihi için sağlık verileri çekiliyor`);

    // Yerel saat dilimine göre gün başlangıcı ve bitişi oluştur
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);

    console.log('Sağlık verileri tarih aralığı:', 
               `${startTime.toLocaleString()} - ${endTime.toLocaleString()}`);

    const startTimeStr = startTime.toISOString();
    const endTimeStr = endTime.toISOString();

    let healthData: HealthData | null = null;

    if (Platform.OS === 'android') {
      console.log('Android için Health Connect verisi isteniyor');
      const healthConnectData = await HealthConnectService.getHealthData(startTimeStr, endTimeStr);
      
      if (healthConnectData) {
        console.log('Health Connect verisi alındı:', JSON.stringify({
          steps: healthConnectData.steps?.total || 0,
          calories: healthConnectData.calories?.total || 0,
          heartRate: healthConnectData.heartRate?.average || 0,
          oxygen: healthConnectData.oxygen?.average || 0,
          sleep: healthConnectData.sleep?.totalMinutes || 0
        }));
        
        healthData = healthConnectData;
      } else {
        console.log('Health Connect verisi null döndü');

      }
    } else if (Platform.OS === 'ios') {
      console.log('iOS için HealthKit verisi isteniyor');
      const healthKitData = await HealthKitService.getHealthData(startTime, endTime);
      
      if (healthKitData) {
        console.log('HealthKit verisi alındı');
        healthData = mapHealthKitData(healthKitData);
      } else {
        console.log('HealthKit verisi null döndü');
      }
    } else {
      console.warn('Desteklenmeyen platform:', Platform.OS);
    }

    if (!healthData) {
      console.warn(`${formattedDate} için veri bulunamadı, varsayılan değer döndürülüyor`);
      return getDefaultHealthData();
    }

    console.log('İşlenmiş sağlık verileri:', JSON.stringify({
      steps: healthData.steps?.total || 0,
      calories: healthData.calories?.total || 0,
      heartRate: healthData.heartRate?.average || 0,
      oxygen: healthData.oxygen?.average || 0,
      sleep: healthData.sleep?.totalMinutes || 0
    }));

    return healthData;
  } catch (error) {
    console.error('Sağlık verisi çekilirken hata oluştu:', error);
    return getDefaultHealthData();
  }
};

/**
 * Verilen tarih aralığı için sağlık verilerini getirir
 * @param startDate Başlangıç tarihi
 * @param endDate Bitiş tarihi
 * @returns Sağlık verileri
 */
export const fetchHealthDataForRange = async (startDate: Date, endDate: Date): Promise<HealthData | null> => {
  try {
    const isAuthValid = await checkAuthAndConfig();
    if (!isAuthValid) {
      return getDefaultHealthData();
    }

    console.log(`${format(startDate, 'yyyy-MM-dd')} - ${format(endDate, 'yyyy-MM-dd')} aralığı için sağlık verileri çekiliyor`);

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    let healthData: HealthData | null = null;

    if (Platform.OS === 'android') {
      console.log('Android için aralık Health Connect verisi isteniyor');
      const healthConnectData = await HealthConnectService.getHealthData(startDateStr, endDateStr);
      
      if (healthConnectData) {
        console.log('Health Connect aralık verisi alındı:', JSON.stringify({
          steps: healthConnectData.steps?.total || 0,
          calories: healthConnectData.calories?.total || 0,
          heartRate: healthConnectData.heartRate?.average || 0,
          oxygen: healthConnectData.oxygen?.average || 0,
          sleep: healthConnectData.sleep?.totalMinutes || 0
        }));
        
        healthData = mapHealthConnectData(healthConnectData);
      } else {
        console.log('Health Connect aralık verisi null döndü');
      }
    } else if (Platform.OS === 'ios') {
      console.log('iOS için HealthKit aralık verisi isteniyor');
      const healthKitData = await HealthKitService.getHealthData(startDate, endDate);
      
      if (healthKitData) {
        console.log('HealthKit aralık verisi alındı');
        healthData = mapHealthKitData(healthKitData);
      } else {
        console.log('HealthKit aralık verisi null döndü');
      }
    } else {
      console.warn('Desteklenmeyen platform:', Platform.OS);
    }

    if (!healthData) {
      console.warn(`Belirtilen aralık için veri bulunamadı, varsayılan değer döndürülüyor`);
      return getDefaultHealthData();
    }

    console.log('İşlenmiş aralık sağlık verileri:', JSON.stringify({
      steps: healthData.steps?.total || 0,
      calories: healthData.calories?.total || 0,
      heartRate: healthData.heartRate?.average || 0,
      oxygen: healthData.oxygen?.average || 0,
      sleep: healthData.sleep?.totalMinutes || 0
    }));

    return healthData;
  } catch (error) {
    console.error('Sağlık verisi çekilirken hata oluştu:', error);
    return getDefaultHealthData();
  }
};

// Günlük verileri çeker
export const fetchDailyHealthData = async (date: Date): Promise<HealthData | null> => {
  return fetchHealthDataForDate(date);
};

// Haftalık verileri çeker
export const fetchWeeklyHealthData = async (date: Date): Promise<HealthData | null> => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıç
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Pazar bitiş
  return fetchHealthDataForRange(weekStart, weekEnd);
};

// Aylık verileri çeker
export const fetchMonthlyHealthData = async (date: Date): Promise<HealthData | null> => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  return fetchHealthDataForRange(monthStart, monthEnd);
};

// Eğer veri yoksa dönecek varsayılan değerleri hazırlar
const getDefaultHealthData = (): HealthData => {
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

// Kullanıcı auth ve config kontrolü
const checkAuthAndConfig = async () => {
  try {
    // Amplify.configure void bir değer döndürür, kontrol etmeye gerek yok
    Amplify.configure(awsconfig);
    
    try {
      await getCurrentUser();
      return true;
    } catch {
      console.warn('Kullanıcı giriş yapmamış');
      return false;
    }
  } catch (error) {
    console.error('Auth kontrolü sırasında hata:', error);
    return false;
  }
};

// AWS config ve auth kontrolü
export const checkConfigAndAuth = async (): Promise<boolean> => {
  try {
    try {
      const user = await getCurrentUser();
      console.log('Kimlik doğrulandı:', user.username);
      return true;
    } catch (error) {
      console.warn('Kimlik doğrulama hatası:', error);
      return false;
    }
  } catch (error) {
    console.warn('Kimlik doğrulama hatası:', error);
    return false;
  }
};

const HealthDataService = {
  fetchHealthDataForDate,
  fetchHealthDataForRange,
  checkConfigAndAuth,
};

export default HealthDataService;
