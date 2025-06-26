import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { HealthData as LocalHealthData } from '../types/health';
import { format } from 'date-fns';
import { createHealthDataMutation, CreateHealthDataInput } from '../types/graphql';

// GraphQL mutations - Basitleştirilmiş versiyonlar
const createHealthData = /* GraphQL */ `
  mutation CreateHealthData(
    $userId: String!
    $date: AWSDateTime!
    $heartRate: Int
    $bloodOxygen: Float
    $steps: Int
    $caloriesBurned: Float
    $sleepDuration: Int
    $deepSleepMinutes: Int
    $lightSleepMinutes: Int
    $remSleepMinutes: Int
    $awakeMinutes: Int
  ) {
    createHealthData(input: {
      userId: $userId
      date: $date
      heartRate: $heartRate
      bloodOxygen: $bloodOxygen
      steps: $steps
      caloriesBurned: $caloriesBurned
      sleepDuration: $sleepDuration
      deepSleepMinutes: $deepSleepMinutes
      lightSleepMinutes: $lightSleepMinutes
      remSleepMinutes: $remSleepMinutes
      awakeMinutes: $awakeMinutes
    }) {
      id
      userId
      date
      heartRate
      bloodOxygen
      steps
      caloriesBurned
      sleepDuration
    }
  }
`;

const updateHealthData = /* GraphQL */ `
  mutation UpdateHealthData($input: UpdateHealthDataInput!) {
    updateHealthData(input: $input) {
      id
      userId
      date
      heartRate
      bloodOxygen
      steps
      caloriesBurned
      sleepDuration
      deepSleepMinutes
      lightSleepMinutes
      remSleepMinutes
      awakeMinutes
    }
  }
`;

// GraphQL queries
const listHealthDataByUser = /* GraphQL */ `
  query ListHealthDataByUser($userId: String!) {
    listHealthData(filter: { 
      userId: { eq: $userId }
    }) {
      items {
        id
        userId
        date
        heartRate
        bloodOxygen
        steps
        caloriesBurned
        sleepDuration
        deepSleepMinutes
        lightSleepMinutes
        remSleepMinutes
        awakeMinutes
      }
    }
  }
`;

const getHealthDataByDate = /* GraphQL */ `
  query GetHealthDataByDate($userId: String!, $date: String!) {
    listHealthData(filter: { 
      userId: { eq: $userId }
      date: { eq: $date }
    }) {
      items {
        id
        userId
        date
        heartRate
        bloodOxygen
        steps
        caloriesBurned
        sleepDuration
        deepSleepMinutes
        lightSleepMinutes
        remSleepMinutes
        awakeMinutes
      }
    }
  }
`;

export interface HealthDataRecord {
  id?: string;
  userId: string;
  date: string; // ISO DateTime string
  heartRate?: number;
  bloodOxygen?: number;
  steps?: number;
  caloriesBurned?: number;
  sleepDuration?: number;
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  remSleepMinutes?: number;
  awakeMinutes?: number;
}

const client = generateClient();

interface HealthDataSyncService {
  syncHealthData: (data: LocalHealthData) => Promise<boolean>;
  syncAllHealthData: (dataArray: LocalHealthData[]) => Promise<{ success: number; failed: number }>;
}

class HealthDataSyncServiceImpl implements HealthDataSyncService {
  
  async syncHealthData(data: LocalHealthData): Promise<boolean> {
    try {
      console.log('Sağlık verisi senkronize ediliyor:', data);

      // Mevcut kullanıcıyı ve attribute'larını al
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      if (!currentUser || !userAttributes.email) {
        console.error('❌ Kullanıcı giriş yapmamış veya email bilgisi yok, senkronizasyon iptal edildi');
        return false;
      }

      // GraphQL için veri dönüştürme - email ile birlikte
      const input: CreateHealthDataInput = {
        userId: userAttributes.email, // Email adresini userId olarak kullan
        nabiz: Math.round(data.heartRate?.average || 0),
        oksijen: Math.round(data.oxygen?.average || 0),
        topuykusuresi: data.sleep?.totalMinutes || 0,
        rem: data.sleep?.rem || 0,
        derin: data.sleep?.deep || 0,
        hafif: data.sleep?.light || 0,
        adim: data.steps?.total || 0,
        kalori: Math.round(data.calories?.total || 0),
      };

      console.log(`📤 Kullanıcı ${userAttributes.email} için veri kaydediliyor:`, {
        adim: input.adim,
        kalori: input.kalori,
        nabiz: input.nabiz,
        oksijen: input.oksijen
      });

      // GraphQL mutation çağrısı
      const result = await client.graphql({
        query: createHealthDataMutation,
        variables: { input }
      });

      console.log('✅ Sağlık verisi başarıyla kaydedildi:', result);
      return true;

    } catch (error) {
      console.error('❌ Sağlık verisi senkronizasyon hatası:', error);
      return false;
    }
  }

  async syncAllHealthData(dataArray: LocalHealthData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    console.log(`${dataArray.length} adet sağlık verisi senkronize ediliyor...`);

    for (const data of dataArray) {
      const isSuccess = await this.syncHealthData(data);
      if (isSuccess) {
        success++;
      } else {
        failed++;
      }
      
      // API rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Senkronizasyon tamamlandı: ${success} başarılı, ${failed} başarısız`);
    return { success, failed };
  }
}

export const healthDataSyncService = new HealthDataSyncServiceImpl();
export default healthDataSyncService; 