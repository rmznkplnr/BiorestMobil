// HealthDataService Wrapper - Redux ile uyumlu basit interface
import HealthConnectService from './HealthConnectService';
import HealthKitService from './HealthKitService';
import { HealthData } from '../types/health';
import { Platform } from 'react-native';

// Temel sağlık verisi fetch fonksiyonları
export const fetchHealthDataForDate = async (date: Date): Promise<HealthData | null> => {
  try {
    console.log('fetchHealthDataForDate called for:', date);
    
    // Şimdilik basit bir yanıt döndür - gerçek implementasyon sonra eklenecek
    return {
      heartRate: {
        values: [72, 75, 68],
        times: [new Date().toISOString()],
        average: 72,
        min: 68,
        max: 75,
        lastUpdated: new Date().toISOString(),
        status: 'good'
      },
      oxygen: {
        values: [98, 97, 99],
        times: [new Date().toISOString()],
        average: 98,
        min: 97,
        max: 99,
        lastUpdated: new Date().toISOString(),
        status: 'good'
      },
      steps: {
        values: [5000],
        times: [new Date().toISOString()],
        total: 5000,
        lastUpdated: new Date().toISOString(),
        status: 'good'
      },
      calories: {
        values: [1800],
        times: [new Date().toISOString()],
        total: 1800,
        lastUpdated: new Date().toISOString(),
        status: 'good'
      },
      sleep: {
        values: [480],
        times: [new Date().toISOString()],
        duration: 480,
        efficiency: 85,
        deep: 120,
        light: 240,
        rem: 120,
        awake: 0,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        stages: [],
        totalMinutes: 480,
        sleepScore: 85,
        lastUpdated: new Date().toISOString(),
        status: 'good'
      }
    };
  } catch (error) {
    console.error('fetchHealthDataForDate error:', error);
    return null;
  }
};

export const fetchHealthDataForRange = async (startDate: Date, endDate: Date): Promise<HealthData | null> => {
  try {
    console.log('fetchHealthDataForRange called for:', startDate, 'to', endDate);
    // Şimdilik tek günlük veriyi döndür
    return await fetchHealthDataForDate(startDate);
  } catch (error) {
    console.error('fetchHealthDataForRange error:', error);
    return null;
  }
};

export const checkConfigAndAuth = async (): Promise<boolean> => {
  try {
    console.log('checkConfigAndAuth called');
    // Şimdilik her zaman true döndür
    return true;
  } catch (error) {
    console.error('checkConfigAndAuth error:', error);
    return false;
  }
}; 