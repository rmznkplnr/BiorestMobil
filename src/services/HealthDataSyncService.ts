import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { HealthData as LocalHealthData } from '../types/health';
import { format } from 'date-fns';
import { 
  createHealthDataMutation, 
  CreateHealthDataInput, 
  updateHealthDataMutation, 
  UpdateHealthDataInput,
  getHealthDataByDateQuery,
  KaloriEntry,
  AdimEntry,
  UykuEntry,
  NabizEntry,
  OksijenEntry
} from '../types/graphql';

// GraphQL mutations - types dosyasından import ediliyor

// GraphQL queries - Yeni schema'ya göre güncellenmiş
const listHealthDataByUser = /* GraphQL */ `
  query ListHealthDataByUser($username: String!) {
    listHealthData(filter: { 
      username: { eq: $username }
    }) {
      items {
        id
        username
        oksijen {
          zaman
          deger
        }
        nabiz {
          zaman
          deger
        }
        uyku {
          start
          end
          derin
          rem
          hafif
          toplam
        }
        adim {
          zaman
          deger
        }
        kalori {
          zaman
          deger
        }
        createdAt
        updatedAt
      }
    }
  }
`;

const getHealthDataByDate = /* GraphQL */ `
  query GetHealthDataByDate($username: String!) {
    listHealthData(filter: { 
      username: { eq: $username }
    }) {
      items {
        id
        tarih
        username
        oksijen {
          zaman
          deger
        }
        nabiz {
          zaman
          deger
        }
        uyku {
          start
          end
          derin
          rem
          hafif
          toplam
        }
        adim {
          zaman
          deger
        }
        kalori {
          zaman
          deger
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export interface HealthDataRecord {
  id?: string;
  username: string;
  oksijen?: OksijenEntry[];
  nabiz?: NabizEntry[];
  uyku?: UykuEntry[];
  adim?: AdimEntry;      // Single object (AWS schema'ya göre)
  kalori?: KaloriEntry;  // Single object (AWS schema'ya göre)
}

const client = generateClient();

interface HealthDataSyncService {
  syncHealthData: (data: LocalHealthData) => Promise<boolean>;
  syncAllHealthData: (dataArray: LocalHealthData[]) => Promise<{ success: number; failed: number }>;
  syncMiBandHeartRate: (heartRate: number, timestamp: Date) => Promise<boolean>;
}

class HealthDataSyncServiceImpl implements HealthDataSyncService {
  
  // Veri değişikliği kontrol eden yardımcı fonksiyon - Yeni schema için
  private hasDataChanged(existingData: any, newData: any): boolean {
    // Adım kontrolü (artış bazlı)
    const existingAdimArray = existingData.adim || [];
    const lastAdimValue = existingAdimArray.length > 0 ? existingAdimArray[existingAdimArray.length - 1].deger : 0;
    const newAdimValue = (newData.adim || [])[0]?.deger || 0;
    if (newAdimValue > lastAdimValue) {
      console.log(`📊 Adım artışı: ${lastAdimValue} -> ${newAdimValue}`);
      return true;
    }

    // Kalori kontrolü (artış bazlı)
    const existingKaloriArray = existingData.kalori || [];
    const lastKaloriValue = existingKaloriArray.length > 0 ? existingKaloriArray[existingKaloriArray.length - 1].deger : 0;
    const newKaloriValue = (newData.kalori || [])[0]?.deger || 0;
    if (newKaloriValue > lastKaloriValue) {
      console.log(`📊 Kalori artışı: ${lastKaloriValue} -> ${newKaloriValue}`);
      return true;
    }

    // Nabız array kontrolü (son değeri karşılaştır)
    const existingNabiz = existingData.nabiz?.[existingData.nabiz.length - 1]?.deger || 0;
    const newNabiz = newData.nabiz?.[newData.nabiz.length - 1]?.deger || 0;
    if (Math.abs(existingNabiz - newNabiz) > 0.1) {
      console.log(`📊 Nabız değişikliği: ${existingNabiz} -> ${newNabiz}`);
      return true;
    }

    // Oksijen array kontrolü (son değeri karşılaştır)
    const existingOksijen = existingData.oksijen?.[existingData.oksijen.length - 1]?.deger || 0;
    const newOksijen = newData.oksijen?.[newData.oksijen.length - 1]?.deger || 0;
    if (Math.abs(existingOksijen - newOksijen) > 0.1) {
      console.log(`📊 Oksijen değişikliği: ${existingOksijen} -> ${newOksijen}`);
      return true;
    }

    // Uyku kontrolü (toplam süre karşılaştır)
    const existingUyku = existingData.uyku?.[existingData.uyku.length - 1]?.toplam || 0;
    const newUyku = newData.uyku?.[newData.uyku.length - 1]?.toplam || 0;
    if (Math.abs(existingUyku - newUyku) > 0.1) {
      console.log(`📊 Uyku değişikliği: ${existingUyku} -> ${newUyku}`);
      return true;
    }

    return false;
  }

  // Belirli tarih için mevcut veriyi kontrol eden fonksiyon  
  private async getExistingHealthData(username: string, date: Date): Promise<any | null> {
    try {
      // Tarihi YYYY-MM-DD formatına çevir
      const dateString = date.toISOString().split('T')[0]; // "2024-01-15"
      
      const result = await client.graphql({
        query: getHealthDataByDate,
        variables: {
          username: username
        }
      });

      // GraphQL result'ı güvenli şekilde kontrol et
      const graphqlResult = result as any;
      const items = graphqlResult?.data?.listHealthData?.items || [];
      
      // Bugünkü tarihe ait kayıtları filtrele
      const todayRecords = items.filter((item: any) => item.tarih === dateString);
      
      if (todayRecords.length > 1) {
        console.log(`🧹 ${todayRecords.length} adet duplicate kayıt bulundu, temizleniyor...`);
        // En yeni kaydı bırak, diğerlerini sil
        await this.cleanupDuplicateRecords(todayRecords, dateString);
        // En yeni kaydı döndür
        const latestRecord = todayRecords.sort((a: any, b: any) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        return latestRecord;
      } else if (todayRecords.length === 1) {
        return todayRecords[0];
      }
      
      return null;
    } catch (error) {
      console.error('❌ Mevcut veri kontrolü hatası:', error);
      return null;
    }
  }

  // Duplicate kayıtları temizleme fonksiyonu
  private async cleanupDuplicateRecords(records: any[], targetDate: string): Promise<void> {
    try {
      // En yeni kaydı bul (updatedAt'e göre)
      const sortedRecords = records.sort((a: any, b: any) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      const latestRecord = sortedRecords[0];
      const oldRecords = sortedRecords.slice(1); // İlki hariç diğerleri
      
      console.log(`📋 En yeni kayıt korunuyor: ${latestRecord.id}`);
      console.log(`🗑️ ${oldRecords.length} eski kayıt silinecek`);
      
      // Eski kayıtları sil
      for (const oldRecord of oldRecords) {
        try {
          await client.graphql({
            query: `
              mutation DeleteHealthData($input: DeleteHealthDataInput!) {
                deleteHealthData(input: $input) {
                  id
                }
              }
            `,
            variables: {
              input: { id: oldRecord.id }
            }
          });
          console.log(`✅ Eski kayıt silindi: ${oldRecord.id}`);
        } catch (deleteError) {
          console.error(`❌ Kayıt silinirken hata: ${oldRecord.id}`, deleteError);
        }
      }
      
    } catch (error) {
      console.error('❌ Duplicate temizleme hatası:', error);
    }
  }

  // Mevcut verilerle yeni verileri birleştiren fonksiyon
  private mergeHealthData(existingData: any, newData: CreateHealthDataInput): CreateHealthDataInput {
    // Duplicate entry'leri önlemek için yardımcı fonksiyon
    const mergeDuplicateFree = (existing: any[] = [], newEntries: any[] = []) => {
      const merged = [...existing];
      
      for (const newEntry of newEntries) {
        // Aynı zaman ve değerde entry var mı kontrol et
        const isDuplicate = existing.some(existingEntry => 
          existingEntry.zaman === newEntry.zaman && 
          existingEntry.deger === newEntry.deger
        );
        
        if (!isDuplicate) {
          merged.push(newEntry);
        }
      }
      
      // Zamana göre sırala (en eski önce)
      return merged.sort((a, b) => new Date(a.zaman).getTime() - new Date(b.zaman).getTime());
    };

    // Kümülatif veriler için (adım, kalori) - sadece değer artışında kaydet
    const mergeIncremental = (existing: any[] = [], newEntries: any[] = []) => {
      if (newEntries.length === 0) return existing;
      if (existing.length === 0) return newEntries;

      const merged = [...existing];
      
      // Mevcut en son değeri bul (güvenli)
      const lastExisting = existing.length > 0 ? existing[existing.length - 1] : { deger: 0 };
      
      for (const newEntry of newEntries) {
        // Yeni değer, mevcut en son değerden büyükse ekle
        if (newEntry.deger > lastExisting.deger) {
          // Aynı zaman diliminde (aynı saat) güncelleme var mı kontrol et
          const sameHourEntry = merged.find(entry => {
            const existingHour = new Date(entry.zaman).getHours();
            const newHour = new Date(newEntry.zaman).getHours();
            return existingHour === newHour;
          });
          
          if (sameHourEntry) {
            // Aynı saatte daha yüksek değer varsa güncelle
            if (newEntry.deger > sameHourEntry.deger) {
              sameHourEntry.deger = newEntry.deger;
              sameHourEntry.zaman = newEntry.zaman;
              console.log(`🔄 Aynı saat dilimi güncellendi: ${sameHourEntry.deger}`);
            }
          } else {
            // Yeni saat dilimi, ekle
            merged.push(newEntry);
            console.log(`📈 Yeni artış kaydedildi: ${lastExisting.deger} -> ${newEntry.deger}`);
          }
        } else {
          console.log(`📊 Artış yok, kaydetmiyoruz: ${newEntry.deger} (mevcut: ${lastExisting.deger})`);
        }
      }
      
      // Zamana göre sırala
      return merged.sort((a, b) => new Date(a.zaman).getTime() - new Date(b.zaman).getTime());
    };

    // Farklı veri tiplerini farklı stratejilerle birleştir
    // Null/undefined check'leri ekleyerek güvenli merge
    const mergedNabiz = mergeDuplicateFree(
      Array.isArray(existingData.nabiz) ? existingData.nabiz : [], 
      Array.isArray(newData.nabiz) ? newData.nabiz : []
    );
    const mergedOksijen = mergeDuplicateFree(
      Array.isArray(existingData.oksijen) ? existingData.oksijen : [], 
      Array.isArray(newData.oksijen) ? newData.oksijen : []
    );
    const mergedUyku = mergeDuplicateFree(
      Array.isArray(existingData.uyku) ? existingData.uyku : [], 
      Array.isArray(newData.uyku) ? newData.uyku : []
    );
    const mergedKalori = mergeIncremental(
      Array.isArray(existingData.kalori) ? existingData.kalori : [], 
      Array.isArray(newData.kalori) ? newData.kalori : []
    );
    const mergedAdim = mergeIncremental(
      Array.isArray(existingData.adim) ? existingData.adim : [], 
      Array.isArray(newData.adim) ? newData.adim : []
    );

    console.log('🔄 Veri birleştirme sonuçları:');
    console.log(`❤️ Nabız: ${(existingData.nabiz || []).length} + ${(newData.nabiz || []).length} = ${mergedNabiz.length} ölçüm`);
    console.log(`🫁 Oksijen: ${(existingData.oksijen || []).length} + ${(newData.oksijen || []).length} = ${mergedOksijen.length} ölçüm`);
    console.log(`👟 Adım: ${mergedAdim.length} kayıt (artış takibi)`);
    console.log(`🔥 Kalori: ${mergedKalori.length} kayıt (artış takibi)`);

    return {
      tarih: newData.tarih,
      username: newData.username,
      nabiz: mergedNabiz.length > 0 ? mergedNabiz : undefined,
      oksijen: mergedOksijen.length > 0 ? mergedOksijen : undefined,
      uyku: mergedUyku.length > 0 ? mergedUyku : undefined,
      // Array fields - biriktirme sistemi
      kalori: mergedKalori.length > 0 ? mergedKalori : undefined,
      adim: mergedAdim.length > 0 ? mergedAdim : undefined
    };
  }

  // LocalHealthData'yı yeni schema formatına dönüştüren fonksiyon
  private convertToNewSchemaFormat(data: LocalHealthData, username: string, targetDate?: Date): CreateHealthDataInput {
    const currentTime = new Date().toISOString();

    // Oksijen verileri - TÜM ÖLÇÜMLER array format
    const oksijenEntries: OksijenEntry[] = [];
    if (data.oxygen?.values && data.oxygen?.times && data.oxygen.values.length > 0) {
      // Gerçek ölçümlerin hepsini kaydet
      for (let i = 0; i < data.oxygen.values.length; i++) {
        if (data.oxygen.values[i] && data.oxygen.times[i]) {
          oksijenEntries.push({
            zaman: data.oxygen.times[i],
            deger: Math.round(data.oxygen.values[i])
          });
        }
      }
      console.log(`🫁 ${oksijenEntries.length} adet oksijen ölçümü kaydedilecek`);
    } else if (data.oxygen?.average) {
      // Eğer sadece ortalama varsa onu kaydet
      oksijenEntries.push({
        zaman: currentTime,
        deger: Math.round(data.oxygen.average)
      });
      console.log('🫁 Sadece ortalama oksijen değeri kaydedilecek');
    }

    // Nabız verileri - TÜM ÖLÇÜMLER array format
    const nabizEntries: NabizEntry[] = [];
    if (data.heartRate?.values && data.heartRate?.times && data.heartRate.values.length > 0) {
      // Gerçek ölçümlerin hepsini kaydet
      for (let i = 0; i < data.heartRate.values.length; i++) {
        if (data.heartRate.values[i] && data.heartRate.times[i]) {
          nabizEntries.push({
            zaman: data.heartRate.times[i],
            deger: Math.round(data.heartRate.values[i])
          });
        }
      }
      console.log(`❤️ ${nabizEntries.length} adet nabız ölçümü kaydedilecek`);
    } else if (data.heartRate?.average) {
      // Eğer sadece ortalama varsa onu kaydet
      nabizEntries.push({
        zaman: currentTime,
        deger: Math.round(data.heartRate.average)
      });
      console.log('❤️ Sadece ortalama nabız değeri kaydedilecek');
    }

    // Uyku verileri - array format
    const uykuEntries: UykuEntry[] = [];
    if (data.sleep && data.sleep.totalMinutes > 0) {
      const sleepStart = new Date();
      sleepStart.setHours(23, 0, 0, 0); // Varsayılan uyku başlangıcı 23:00
      
      const sleepEnd = new Date(sleepStart);
      sleepEnd.setTime(sleepStart.getTime() + (data.sleep.totalMinutes * 60 * 1000));

      uykuEntries.push({
        start: sleepStart.toISOString(),
        end: sleepEnd.toISOString(),
        derin: data.sleep.deep || 0,
        rem: data.sleep.rem || 0,
        hafif: data.sleep.light || 0,
        toplam: data.sleep.totalMinutes || 0
      });
    }

    // Adım verileri - TÜM ÖLÇÜMLER array format
    const adimEntries: AdimEntry[] = [];
    if (data.steps?.values && data.steps?.times && data.steps.values.length > 0) {
      // Gerçek adım ölçümlerinin hepsini kaydet
      for (let i = 0; i < data.steps.values.length; i++) {
        if (data.steps.values[i] && data.steps.times[i]) {
          adimEntries.push({
            zaman: data.steps.times[i],
            deger: Math.round(data.steps.values[i])
          });
        }
      }
      console.log(`👟 ${adimEntries.length} adet adım ölçümü kaydedilecek`);
    } else if (data.steps?.total) {
      // Eğer sadece toplam varsa onu kaydet
      adimEntries.push({
        zaman: currentTime,
        deger: data.steps.total
      });
      console.log('👟 Sadece toplam adım değeri kaydedilecek');
    }

    // Kalori verileri - TÜM ÖLÇÜMLER array format
    const kaloriEntries: KaloriEntry[] = [];
    if (data.calories?.values && data.calories?.times && data.calories.values.length > 0) {
      // Gerçek kalori ölçümlerinin hepsini kaydet
      for (let i = 0; i < data.calories.values.length; i++) {
        if (data.calories.values[i] && data.calories.times[i]) {
          kaloriEntries.push({
            zaman: data.calories.times[i],
            deger: Math.round(data.calories.values[i])
          });
        }
      }
      console.log(`🔥 ${kaloriEntries.length} adet kalori ölçümü kaydedilecek`);
    } else if (data.calories?.total) {
      // Eğer sadece toplam varsa onu kaydet
      kaloriEntries.push({
        zaman: currentTime,
        deger: Math.round(data.calories.total)
      });
      console.log('🔥 Sadece toplam kalori değeri kaydedilecek');
    }

    // Tarihi doğru formatta ayarla - hedef tarih veya bugün
    const dateToUse = targetDate || new Date();
    const dateString = dateToUse.getFullYear() + '-' + 
                      String(dateToUse.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(dateToUse.getDate()).padStart(2, '0');

    console.log('📅 Kayıt tarihi:', dateString);

    return {
      tarih: dateString,
      username: username,
      oksijen: oksijenEntries.length > 0 ? oksijenEntries : undefined,
      nabiz: nabizEntries.length > 0 ? nabizEntries : undefined,
      uyku: uykuEntries.length > 0 ? uykuEntries : undefined,
      // Schema'da adim ve kalori artık array olarak tanımlı
      adim: adimEntries.length > 0 ? adimEntries : undefined,
      kalori: kaloriEntries.length > 0 ? kaloriEntries : undefined
    };
  }
  
  async syncHealthData(data: LocalHealthData): Promise<boolean> {
    try {
      console.log('🔄 Sağlık verisi senkronize ediliyor:', data);

      // Mevcut kullanıcıyı ve attribute'larını al
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      if (!currentUser || !userAttributes.email) {
        console.error('❌ Kullanıcı giriş yapmamış veya email bilgisi yok, senkronizasyon iptal edildi');
        return false;
      }

      // Bugünün tarihini al
      const today = new Date();

      // Yeni veri objesi oluştur - Yeni Schema formatında (tarih parametresiyle)
      const newHealthData = this.convertToNewSchemaFormat(data, userAttributes.email, today);

      console.log(`🔍 ${userAttributes.email} kullanıcısı için bugünkü veri kontrol ediliyor...`);

      // Mevcut veriyi kontrol et
      const existingData = await this.getExistingHealthData(userAttributes.email, today);

      if (existingData) {
        console.log('📋 Mevcut veri bulundu:', {
          id: existingData.id,
          adim: existingData.adim?.deger,
          nabiz: existingData.nabiz?.[existingData.nabiz.length - 1]?.deger,
          oksijen: existingData.oksijen?.[existingData.oksijen.length - 1]?.deger
        });

        console.log('🔄 Mevcut veriye yeni ölçümler ekleniyor...');

        // Mevcut array'lere yeni verileri ekle (biriktir)
        const mergedData = this.mergeHealthData(existingData, newHealthData);

        // Mevcut veriyi güncelle
        const updateInput: UpdateHealthDataInput = {
          id: existingData.id,
          ...mergedData
        };

        const result = await client.graphql({
          query: updateHealthDataMutation,
          variables: { input: updateInput }
        });

        console.log('✅ Sağlık verisi başarıyla güncellendi:', result);
        return true;

      } else {
        console.log('📝 Yeni veri oluşturuluyor...');

        // Yeni veri oluştur
        const createInput: CreateHealthDataInput = newHealthData;
        
        const result = await client.graphql({
          query: createHealthDataMutation,
          variables: { input: createInput }
        });

        console.log('✅ Sağlık verisi başarıyla oluşturuldu:', result);
        return true;
      }

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

  /**
   * Mi Band 9'dan gelen nabız verisini AWS'e kaydet
   */
  async syncMiBandHeartRate(heartRate: number, timestamp: Date): Promise<boolean> {
    try {
      console.log(`🔷 Mi Band 9 nabız verisi kaydediliyor: ${heartRate} BPM`);

      // Mevcut kullanıcıyı al
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      if (!currentUser || !userAttributes.email) {
        console.error('❌ Kullanıcı giriş yapmamış, Mi Band nabız verisi kaydedilemedi');
        return false;
      }

      // Bugünün tarihini al
      const today = new Date();

      // Nabız verisi oluştur
      const newNabizEntry: NabizEntry = {
        zaman: timestamp.toISOString(),
        deger: Math.round(heartRate)
      };

      console.log(`🔍 ${userAttributes.email} kullanıcısı için bugünkü veri kontrol ediliyor...`);

      // Mevcut veriyi kontrol et
      const existingData = await this.getExistingHealthData(userAttributes.email, today);

      if (existingData) {
        console.log('📋 Mevcut veri bulundu, Mi Band nabız verisi ekleniyor...');

        // Mevcut nabız array'ine yeni veriyi ekle
        const existingNabiz = existingData.nabiz || [];
        const updatedNabiz = [...existingNabiz, newNabizEntry];

        // Veriyi güncelle
        const updateInput: UpdateHealthDataInput = {
          id: existingData.id,
          nabiz: updatedNabiz
        };

        const result = await client.graphql({
          query: updateHealthDataMutation,
          variables: { input: updateInput }
        });

        console.log(`✅ Mi Band 9 nabız verisi başarıyla eklendi: ${heartRate} BPM`);
        return true;

      } else {
        console.log('📝 Yeni günlük veri oluşturuluyor (Mi Band nabız verisi ile)...');

        // Tarihi doğru formatta ayarla
        const dateString = today.getFullYear() + '-' + 
                          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(today.getDate()).padStart(2, '0');

        // Yeni veri oluştur
        const createInput: CreateHealthDataInput = {
          tarih: dateString,
          username: userAttributes.email,
          nabiz: [newNabizEntry]
        };
        
        const result = await client.graphql({
          query: createHealthDataMutation,
          variables: { input: createInput }
        });

        console.log(`✅ Mi Band 9 nabız verisi ile yeni günlük veri oluşturuldu: ${heartRate} BPM`);
        return true;
      }

    } catch (error) {
      console.error('❌ Mi Band 9 nabız verisi kaydetme hatası:', error);
      return false;
    }
  }
}

export const healthDataSyncService = new HealthDataSyncServiceImpl();
export default healthDataSyncService; 