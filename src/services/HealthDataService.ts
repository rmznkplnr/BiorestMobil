import { createHealthData } from '../graphql/mutations';
import awsconfig from '../aws-exports';
import { Auth, API, graphqlOperation } from 'aws-amplify';

export default class HealthDataService {
  // AppSync ve Cognito yapılandırmasını kontrol etmek için yardımcı fonksiyon
  public static async checkConfigAndAuth() {
    try {
      console.log('=== AWS Amplify Yapılandırma Kontrolü ===');
      
      // API yapılandırmasını kontrol et
      console.log('AppSync Endpoint:', awsconfig.aws_appsync_graphqlEndpoint || 'TANIMLANMAMIŞ!');
      console.log('AppSync Auth Type:', awsconfig.aws_appsync_authenticationType || 'TANIMLANMAMIŞ!');
      
      // Cognito yapılandırmasını kontrol et
      console.log('Cognito User Pool ID:', awsconfig.aws_user_pools_id || 'TANIMLANMAMIŞ!');
      console.log('Cognito Client ID:', awsconfig.aws_user_pools_web_client_id || 'TANIMLANMAMIŞ!');
      
      // Oturum durumunu kontrol et
      try {
        const session = await Auth.currentSession();
        if (session) {
          const idToken = session.getIdToken();
          console.log('Oturum durumu: AÇIK (token var)');
          if (idToken && idToken.payload) {
            console.log('Kullanıcı:', idToken.payload.email || idToken.payload.username || idToken.payload.sub);
            
            // Token süresini kontrol et
            const expiration = idToken.payload.exp || 0;
            const now = Math.floor(Date.now() / 1000);
            const remaining = expiration - now;
            
            if (remaining > 0) {
              console.log(`Token geçerlilik: ${Math.floor(remaining / 60)} dakika kaldı`);
            } else {
              console.log('Token SÜRESİ DOLMUŞ!');
            }
          }
        } else {
          console.log('Oturum durumu: KAPALI (token yok)');
        }
      } catch (authError: any) {
        console.log('Oturum kontrolü hatası:', authError.message);
      }
      
      console.log('=== Kontrol Tamamlandı ===');
    } catch (error: any) {
      console.error('Yapılandırma kontrolü sırasında hata:', error.message);
    }
  }

  // API isteği yapmadan önce Auth durumunu kontrol eden yardımcı metod
  private static async checkAuthBeforeApiCall() {
    const isAuthenticated = await this.isAuthReady();
    if (!isAuthenticated) {
      throw new Error('Kullanıcı kimlik doğrulaması yapılmadı. Lütfen giriş yapın.');
    }
    return true;
  }

  // Kimlik doğrulama durumunu kontrol et
  public static async isAuthReady() {
    try {
      // Session token kontrolü - daha güvenilir
      const session = await Auth.currentSession();
      
      // Session kontrolü
      if (!session) {
        console.log('Aktif oturum yok - session bulunamadı');
        return false;
      }
      
      // Token süresi dolmuş mu kontrol et
      const idToken = session.getIdToken();
      if (idToken) {
        const expiration = idToken.payload?.exp || 0;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiration < now) {
          console.log('Token süresi dolmuş');
          return false;
        }
        
        // Ek kontrol - currentAuthenticatedUser ile doğrula
        try {
          const currentUser = await Auth.currentAuthenticatedUser();
          if (currentUser && currentUser.username) {
            console.log('Geçerli kullanıcı doğrulandı:', currentUser.username);
            return true;
          }
        } catch (userError) {
          console.log('currentAuthenticatedUser hatası:', userError);
          return false;
        }
        
        console.log('Geçerli oturum bulundu');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Oturum kontrol hatası:', error);
      return false;
    }
  }

  static async syncHealthData(data: {
    heartRate: number | null;
    oxygen: number | null;
    sleep: number | null;
    steps: number | null;
    calories: number | null;
  }, retryCount = 0) {
    try {
      // ÖNEMLİ: API çağrısından önce kimlik doğrulama kontrolü yap
      console.log('Kimlik doğrulama kontrolü yapılıyor...');
      await this.checkAuthBeforeApiCall();
      console.log('Kimlik doğrulama başarılı, API çağrısı yapılabilir');
      
      // Kullanıcı kimliğini güvenli şekilde al
      let userId;
      try {
        const user = await Auth.currentAuthenticatedUser();
        userId = user.username;
      } catch (userError: any) {
        console.error('Kullanıcı bilgisi alınamadı:', userError.message);
        
        // Session token'dan kimlik bilgisini al (alternatif yöntem)
        const session = await Auth.currentSession();
        if (session && session.getIdToken().payload.sub) {
          userId = session.getIdToken().payload.sub;
          console.log('Token içinden kullanıcı ID alındı:', userId);
        } else {
          throw new Error('Kullanıcı kimliği alınamadı');
        }
      }
      
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }
      
      // Şu anki zaman
      const timestamp = new Date().toISOString();
      
      // GraphQL için veri yapısını oluştur
      const healthData = {
        userId: userId,
        timestamp: timestamp,
        heartRate: data.heartRate ? {
          average: data.heartRate,
          values: [],
          times: [],
          lastUpdated: timestamp,
          status: "good"
        } : null,
        oxygen: data.oxygen ? {
          average: data.oxygen,
          values: [],
          times: [],
          lastUpdated: timestamp,
          status: "good" 
        } : null,
        sleep: data.sleep ? {
          deepSleep: data.sleep,
          duration: 0,
          efficiency: 0,
          lastUpdated: timestamp
        } : null,
        steps: data.steps ? {
          count: data.steps,
          goal: 10000,
          lastUpdated: timestamp
        } : null,
        calories: data.calories ? {
          value: data.calories,
          goal: 2000,
          lastUpdated: timestamp
        } : null
      };
      
      console.log('Sağlık verisi senkronizasyonu başlatılıyor');
      
      // GraphQL API çağrısını yapma
      try {
        // Gen 1 Amplify API çağrısı - graphqlOperation ile
        const result = await API.graphql(
          graphqlOperation(createHealthData, { input: healthData })
        ) as any;
        
        console.log('Sağlık verisi başarıyla kaydedildi:', result.data.createHealthData.id);
        return result.data.createHealthData;
      } catch (apiError: any) {
        console.error('GraphQL sorgusu gönderilirken hata:', apiError);
        console.error('GQL Hata mesajı:', apiError.message);
        console.error('GQL Hata tipi:', apiError.name);
        
        // Eğer hata alındıysa ve henüz retry limitini aşmadıysak, bir gecikme ile tekrar deneyelim
        if (retryCount < 3) {
          const nextRetry = retryCount + 1;
          const delay = 1000 * nextRetry; // Her denemede artan gecikme
          
          console.log(`API hatası oluştu, ${delay}ms sonra ${nextRetry}. deneme yapılacak...`);
          
          return new Promise(resolve => {
            setTimeout(() => {
              console.log(`${nextRetry}. deneme başlatılıyor...`);
              resolve(this.syncHealthData(data, nextRetry));
            }, delay);
          });
        }
        
        throw apiError;
      }
    } catch (error: any) {
      console.error('Sağlık verilerini kaydederken hata:', error);
      console.error('Hata mesajı:', error.message);
      console.error('Hata tipi:', error.name);
      throw error;
    }
  }
} 