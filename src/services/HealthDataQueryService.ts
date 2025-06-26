import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { listHealthDataByUserQuery } from '../types/graphql';

const client = generateClient();

interface HealthDataQueryService {
  getUserHealthData: (startDate?: Date, endDate?: Date) => Promise<any[]>;
  getHealthDataByDateRange: (userId: string, startDate: Date, endDate: Date) => Promise<any[]>;
}

class HealthDataQueryServiceImpl implements HealthDataQueryService {
  
  /**
   * Mevcut kullanıcının sağlık verilerini getirir
   */
  async getUserHealthData(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      // Mevcut kullanıcıyı ve attribute'larını al
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      if (!currentUser || !userAttributes.email) {
        console.error('❌ Kullanıcı giriş yapmamış veya email bilgisi yok');
        return [];
      }

      console.log(`📊 ${userAttributes.email} kullanıcısının sağlık verileri getiriliyor...`);

      // Kullanıcıya özel verileri sorgula
      const result = await client.graphql({
        query: listHealthDataByUserQuery,
        variables: { userId: userAttributes.email }
      });

      const healthData = (result as any).data?.listHealthData?.items || [];
      
      // Tarih filtresi uygula (opsiyonel)
      let filteredData = healthData;
      if (startDate && endDate) {
        filteredData = healthData.filter((item: any) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      console.log(`📊 ${filteredData.length} adet veri bulundu`);
      return filteredData;

    } catch (error) {
      console.error('❌ Kullanıcı sağlık verileri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Belirli kullanıcının belirli tarih aralığındaki verilerini getirir
   */
  async getHealthDataByDateRange(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      console.log(`📊 ${userId} kullanıcısının ${startDate.toDateString()} - ${endDate.toDateString()} arası verileri getiriliyor...`);

      const result = await client.graphql({
        query: listHealthDataByUserQuery,
        variables: { userId }
      });

      const healthData = (result as any).data?.listHealthData?.items || [];
      
      // Tarih aralığına göre filtrele
      const filteredData = healthData.filter((item: any) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      });

      console.log(`📊 ${filteredData.length} adet veri bulundu`);
      return filteredData;

    } catch (error) {
      console.error('❌ Tarih aralığı sağlık verileri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Kullanıcının en son sağlık verisini getirir
   */
  async getLatestHealthData(): Promise<any | null> {
    try {
      const allData = await this.getUserHealthData();
      
      if (allData.length === 0) {
        return null;
      }

      // En son tarihe göre sırala
      const sortedData = allData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return sortedData[0];

    } catch (error) {
      console.error('❌ En son sağlık verisi getirme hatası:', error);
      return null;
    }
  }

  /**
   * Kullanıcının istatistiklerini hesaplar
   */
  async getUserStats(days: number = 7): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const data = await this.getUserHealthData(startDate, endDate);

      if (data.length === 0) {
        return {
          totalSteps: 0,
          totalCalories: 0,
          averageHeartRate: 0,
          averageOxygen: 0,
          totalSleep: 0,
          dataCount: 0
        };
      }

      const stats = data.reduce((acc, item) => {
        acc.totalSteps += item.adim || 0;
        acc.totalCalories += item.kalori || 0;
        if (item.nabiz > 0) {
          acc.heartRateCount++;
          acc.totalHeartRate += item.nabiz;
        }
        if (item.oksijen > 0) {
          acc.oxygenCount++;
          acc.totalOxygen += item.oksijen;
        }
        acc.totalSleep += item.topuykusuresi || 0;
        return acc;
      }, {
        totalSteps: 0,
        totalCalories: 0,
        totalHeartRate: 0,
        heartRateCount: 0,
        totalOxygen: 0,
        oxygenCount: 0,
        totalSleep: 0
      });

      return {
        totalSteps: stats.totalSteps,
        totalCalories: stats.totalCalories,
        averageHeartRate: stats.heartRateCount > 0 ? Math.round(stats.totalHeartRate / stats.heartRateCount) : 0,
        averageOxygen: stats.oxygenCount > 0 ? Math.round(stats.totalOxygen / stats.oxygenCount) : 0,
        totalSleep: stats.totalSleep,
        dataCount: data.length,
        period: `${days} gün`
      };

    } catch (error) {
      console.error('❌ Kullanıcı istatistikleri hesaplama hatası:', error);
      return null;
    }
  }
}

export const healthDataQueryService = new HealthDataQueryServiceImpl();
export default healthDataQueryService; 