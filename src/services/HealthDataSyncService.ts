import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { HealthData } from '../types/health';
import { format } from 'date-fns';

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

class HealthDataSyncService {
  // API Key ile client
  private static clientApiKey = generateClient({
    authMode: 'apiKey'
  });
  
  // IAM ile client
  private static clientIAM = generateClient({
    authMode: 'identityPool'
  });

  // User Pool ile client
  private static clientUserPool = generateClient({
    authMode: 'userPool'
  });

  // Farklı authentication mode'ları dene
  private static async tryDifferentAuthModes(query: string, variables: any) {
    const authModes = [
      { client: this.clientUserPool, name: 'User Pool' },
      { client: this.clientApiKey, name: 'API Key' },
      { client: this.clientIAM, name: 'Identity Pool' }
    ];

    for (const { client, name } of authModes) {
      try {
        console.log(`${name} ile deneniyor...`);
        const result = await client.graphql({ query, variables });
        console.log(`${name} ile başarılı!`);
        return result;
      } catch (error) {
        console.log(`${name} başarısız:`, error);
      }
    }

    throw new Error('Tüm authentication mode\'ları başarısız');
  }
  
  /**
   * Kullanıcının sağlık verilerini AWS GraphQL API'ye kaydeder
   */
  static async saveHealthData(healthData: HealthData, date: Date): Promise<boolean> {
    try {
      // Kullanıcı oturum kontrolü
      const user = await getCurrentUser();
      if (!user || !user.username) {
        console.error('Kullanıcı oturum açmamış');
        return false;
      }

      // Auth session kontrol
      const session = await fetchAuthSession();
      if (!session.tokens) {
        console.error('Geçerli oturum bulunamadı');
        return false;
      }

      const userId = user.username;
      const dateStr = date.toISOString();
      
      console.log(`Sağlık verisi kaydediliyor - Kullanıcı: ${userId}, Tarih: ${format(date, 'yyyy-MM-dd')}`);

      // Direkt kaydetme - mevcut veri kontrolü yapmadan
      const healthDataInput = {
        userId,
        date: dateStr,
        heartRate: Math.round(healthData.heartRate?.average || 0),
        bloodOxygen: Number((healthData.oxygen?.average || 0).toFixed(1)),
        steps: healthData.steps?.total || 0,
        caloriesBurned: Number((healthData.calories?.total || 0).toFixed(1)),
        sleepDuration: healthData.sleep?.totalMinutes || 0,
        deepSleepMinutes: healthData.sleep?.deep || 0,
        lightSleepMinutes: healthData.sleep?.light || 0,
        remSleepMinutes: healthData.sleep?.rem || 0,
        awakeMinutes: healthData.sleep?.awake || 0,
      };

      console.log('Yeni veri kaydediliyor...');
      const result = await this.tryDifferentAuthModes(createHealthData, {
        userId,
        date: dateStr,
        heartRate: healthDataInput.heartRate,
        bloodOxygen: healthDataInput.bloodOxygen,
        steps: healthDataInput.steps,
        caloriesBurned: healthDataInput.caloriesBurned,
        sleepDuration: healthDataInput.sleepDuration,
        deepSleepMinutes: healthDataInput.deepSleepMinutes,
        lightSleepMinutes: healthDataInput.lightSleepMinutes,
        remSleepMinutes: healthDataInput.remSleepMinutes,
        awakeMinutes: healthDataInput.awakeMinutes
      });

      console.log('Sağlık verisi başarıyla kaydedildi:', result);
      return true;

    } catch (error) {
      console.error('Sağlık verisi kaydetme hatası:', error);
      return false;
    }
  }

  /**
   * Belirli tarihte kullanıcının sağlık verisini getirir
   */
  private static async getHealthDataByDate(userId: string, date: string): Promise<HealthDataRecord[]> {
    try {
      const result = await this.tryDifferentAuthModes(getHealthDataByDate, {
        userId,
        date: format(new Date(date), 'yyyy-MM-dd')
      });

      return (result as any).data?.listHealthData?.items || [];
    } catch (error) {
      console.error('Sağlık verisi getirme hatası:', error);
      return [];
    }
  }

  /**
   * Kullanıcının belirli bir tarih aralığındaki sağlık verilerini getirir
   */
  static async getHealthDataHistory(startDate: Date, endDate: Date): Promise<HealthDataRecord[]> {
    try {
      const user = await getCurrentUser();
      if (!user || !user.username) {
        console.error('Kullanıcı oturum açmamış');
        return [];
      }
      
      console.log(`Sağlık verisi geçmişi getiriliyor: ${format(startDate, 'yyyy-MM-dd')} - ${format(endDate, 'yyyy-MM-dd')}`);

      const result = await this.tryDifferentAuthModes(listHealthDataByUser, {
        userId: user.username
      });

      return (result as any).data?.listHealthData?.items || [];

    } catch (error) {
      console.error('Sağlık verisi geçmişi alma hatası:', error);
      return [];
    }
  }

  /**
   * Otomatik senkronizasyon - Health Connect'ten veri aldığında çağrılır
   */
  static async autoSync(healthData: HealthData, date: Date): Promise<void> {
    try {
      console.log('Otomatik senkronizasyon başlatılıyor...');
      
      // Veriyi AWS'e kaydet
      const success = await this.saveHealthData(healthData, date);
      
      if (success) {
        console.log('Otomatik senkronizasyon başarılı');
      } else {
        console.log('Otomatik senkronizasyon başarısız');
        // Retry logic ekleyebilirsiniz
        await this.scheduleRetry(healthData, date);
      }
    } catch (error) {
      console.error('Otomatik senkronizasyon hatası:', error);
    }
  }

  /**
   * Başarısız senkronizasyonları yeniden dene
   */
  private static async scheduleRetry(healthData: HealthData, date: Date): Promise<void> {
    // Retry logic - örneğin 5 dakika sonra tekrar dene
    console.log('Senkronizasyon 5 dakika sonra yeniden denenecek');
    
    setTimeout(async () => {
      await this.autoSync(healthData, date);
    }, 5 * 60 * 1000); // 5 dakika
  }

  /**
   * Manuel senkronizasyon tetikleyici
   */
  static async manualSync(date?: Date): Promise<boolean> {
    try {
      console.log('Manuel senkronizasyon başlatılıyor...');
      
      // Eğer tarih verilmemişse bugünü kullan
      const syncDate = date || new Date();
      
      // Health Connect'ten veriyi al
      const HealthDataService = require('./HealthDataService');
      const healthData = await HealthDataService.fetchHealthDataForDate(syncDate);
      
      if (!healthData) {
        console.log('Senkronize edilecek sağlık verisi bulunamadı');
        return false;
      }

      // İlk önce pure API Key test
      console.log('Pure API Key testi yapılıyor...');
      await this.testPureApiKey(healthData, syncDate);

      // AWS'e kaydet
      return await this.saveHealthData(healthData, syncDate);
      
    } catch (error) {
      console.error('Manuel senkronizasyon hatası:', error);
      return false;
    }
  }

  /**
   * Toplu senkronizasyon - geçmiş verileri senkronize et
   */
  static async bulkSync(startDate: Date, endDate: Date): Promise<number> {
    try {
      console.log('Toplu senkronizasyon başlatılıyor...');
      
      let successCount = 0;
      const current = new Date(startDate);
      
      while (current <= endDate) {
        try {
          const success = await this.manualSync(current);
          if (success) {
            successCount++;
          }
          
          // Bir sonraki güne geç
          current.setDate(current.getDate() + 1);
          
          // API rate limiting için kısa bir bekleme
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`${format(current, 'yyyy-MM-dd')} tarihli veri senkronize edilemedi:`, error);
          current.setDate(current.getDate() + 1);
        }
      }
      
      console.log(`Toplu senkronizasyon tamamlandı: ${successCount} gün başarılı`);
      return successCount;
      
    } catch (error) {
      console.error('Toplu senkronizasyon hatası:', error);
      return 0;
    }
  }

  /**
   * Test amaçlı - sadece API Key ile basit kaydetme
   */
  static async testPureApiKey(healthData: HealthData, date: Date): Promise<boolean> {
    try {
      console.log('=== PURE API KEY TEST ===');
      
      // Tamamen yeni bir client, sadece API Key
      const pureApiClient = generateClient({
        authMode: 'apiKey'
      });

      const testData = {
        userId: 'test-user-api-key',
        date: date.toISOString(),
        heartRate: 75,
        steps: healthData.steps?.total || 0,
      };

      console.log('Pure API Key ile test verisi:', testData);

      const result = await pureApiClient.graphql({
        query: createHealthData,
        variables: testData
      });

      console.log('Pure API Key BAŞARILI!', result);
      return true;

    } catch (error) {
      console.error('Pure API Key BAŞARISIZ:', error);
      return false;
    }
  }
}

export default HealthDataSyncService; 