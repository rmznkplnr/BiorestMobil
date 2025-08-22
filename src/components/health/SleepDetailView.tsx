import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SleepMetric } from '../../types/health';
import { Colors } from '../../constants/Colors';
import { sleepDetailStyles as styles } from '../../styles/SleepDetailViewStyles';
import { RootStackParamList } from '../../navigation/types';
import HealthConnectService from '../../services/HealthConnectService';

interface SleepDetailViewProps {
  sleepData?: SleepMetric;
  loading?: boolean;
  date?: Date;
}

const SleepDetailView: React.FC<SleepDetailViewProps> = ({ 
  sleepData, 
  loading = false,
  date = new Date()
}) => {
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // ✅ YENİ: Health Connect sleep heart rate state'leri
  const [healthConnectHeartRate, setHealthConnectHeartRate] = useState<any>(null);
  const [loadingHealthConnect, setLoadingHealthConnect] = useState(false);
  const [enhancedSleepData, setEnhancedSleepData] = useState<SleepMetric | undefined>(sleepData);

  // ✅ YENİ: Health Connect'ten uyku nabız verilerini al
  useEffect(() => {
    const fetchHealthConnectSleepHeartRate = async () => {
      // Eğer zaten uyku nabız verisi varsa, ek veri almaya gerek yok
      if (sleepData?.sleepHeartRate && sleepData.sleepHeartRate.values && sleepData.sleepHeartRate.values.length > 0) {
        console.log('🛌💓 Uyku nabız verisi zaten mevcut, Health Connect atlanıyor');
        setEnhancedSleepData(sleepData);
        return;
      }

      // Uyku verisi yoksa Health Connect'ten veri alamayız
      if (!sleepData || !sleepData.startTime || !sleepData.endTime) {
        console.log('🛌💓 Uyku verisi eksik, Health Connect verisi alınamıyor');
        setEnhancedSleepData(sleepData);
        return;
      }

      try {
        console.log('🛌💓 Health Connect\'ten uyku nabız verisi alınıyor...');
        setLoadingHealthConnect(true);

        const selectedDate = date || new Date();
        const sleepHeartRateData = await HealthConnectService.getSleepHeartRateData(
          selectedDate.toISOString(),
          selectedDate.toISOString(),
          sleepData.startTime,
          sleepData.endTime
        );

        if (sleepHeartRateData.values && sleepHeartRateData.values.length > 0) {
          console.log('🛌💓 Health Connect\'ten uyku nabız verisi bulundu:', {
            ölçümSayısı: sleepHeartRateData.values.length,
            ortalama: Math.round(sleepHeartRateData.average),
            minimum: sleepHeartRateData.min,
            maksimum: sleepHeartRateData.max
          });

          // Uyku verilerini enhance et
          const enhancedData = {
            ...sleepData,
            sleepHeartRate: {
              average: sleepHeartRateData.average,
              min: sleepHeartRateData.min,
              max: sleepHeartRateData.max,
              values: sleepHeartRateData.values,
              times: sleepHeartRateData.times,
              sleepHeartRateAverage: sleepHeartRateData.sleepHeartRateAverage
            }
          };

          setEnhancedSleepData(enhancedData);
          setHealthConnectHeartRate(sleepHeartRateData);
          
          console.log('✅ Uyku verisi Health Connect nabız verisi ile güçlendirildi');
        } else {
          console.log('🛌💓 Health Connect\'te uyku nabız verisi bulunamadı');
          setEnhancedSleepData(sleepData);
        }
      } catch (error) {
        console.error('🛌💓 Health Connect uyku nabız verisi alma hatası:', error);
        setEnhancedSleepData(sleepData);
      } finally {
        setLoadingHealthConnect(false);
      }
    };

    fetchHealthConnectSleepHeartRate();
  }, [sleepData, date]);

  // Güvenli bir şekilde tarih nesnesi oluşturur
  const createSafeDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    
    try {
      console.log('🕐 Tarih dönüştürülüyor:', dateString);
      
      let date: Date;
      
      // ISO formatındaki tarihler için parseISO kullan
      if (dateString.includes('T')) {
        date = parseISO(dateString);
        console.log('🕐 ISO tarih ayrıştırıldı:', date.toISOString(), 'Lokal saat:', date.toLocaleString('tr-TR'));
      } else {
      // Farklı formatlar için normal Date constructor'ı kullan
        date = new Date(dateString);
        console.log('🕐 Normal tarih ayrıştırıldı:', date.toISOString(), 'Lokal saat:', date.toLocaleString('tr-TR'));
      }
      
      // Geçerli bir tarih mi kontrol et
      if (isNaN(date.getTime())) {
        console.warn('Geçersiz tarih:', dateString);
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('Tarih ayrıştırma hatası:', error, dateString);
      return null;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.sleep} />
        <Text style={styles.loadingText}>Uyku verileri yükleniyor...</Text>
      </View>
    );
  }
  
  // ✅ YENİ: Enhanced sleep data kullan
  const currentSleepData = enhancedSleepData || sleepData;
  
  if (!currentSleepData) {
    return (
      <View style={styles.noDataContainer}>
        <Ionicons name="moon-outline" size={50} color={Colors.textSecondary} />
        <Text style={styles.noDataText}>
          {format(date, 'd MMMM yyyy', { locale: tr })} için uyku verisi bulunamadı
        </Text>
      </View>
    );
  }
  
  // Dakikaları saat:dakika formatına dönüştür
  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes <= 0) return "0s 0dk";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}s ${mins}dk`;
  };
  
  // Uyku aşamaları için grafik verileri
  const sleepChartData = {
    labels: ["Derin", "Hafif", "REM"],
    datasets: [
      {
        data: [
          currentSleepData.deep || 0,
          currentSleepData.light || 0, 
          currentSleepData.rem || 0
        ],
        colors: [
          () => Colors.sleepDeep,
          () => Colors.sleepLight,
          () => Colors.sleepREM,
        ],
      }
    ]
  };
  
  // Grafik yapılandırması
  const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    color: (opacity = 1) => `rgba(52, 73, 94, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForLabels: {
      fontSize: 10,
    }
  };
  
  // Uyku kalitesi rengini belirle
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return Colors.success;
    if (efficiency >= 60) return Colors.warning;
    return Colors.error;
  };
  
  // Uyku kalitesi açıklaması
  const getEfficiencyDescription = (efficiency: number) => {
    if (efficiency >= 80) return 'Mükemmel';
    if (efficiency >= 70) return 'İyi';
    if (efficiency >= 60) return 'Orta';
    return 'Zayıf';
  };
  
  // Uyku süresi yeterli mi?
  const isSleepDurationGood = (duration: number) => {
    const hours = duration / 60;
    if (hours >= 7 && hours <= 9) return true;
    return false;
  };
  
  return (
    <ScrollView style={styles.container}>

      
      {/* Uyku Süresi ve Kalitesi */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Toplam Süre</Text>
          <Text style={[
            styles.summaryValue, 
            {color: isSleepDurationGood(currentSleepData.duration) ? Colors.success : Colors.error}
          ]}>
            {formatDuration(currentSleepData.duration)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Uyku Kalitesi</Text>
          <Text style={[
            styles.summaryValue, 
            {color: getEfficiencyColor(currentSleepData.efficiency)}
          ]}>
            %{currentSleepData.efficiency?.toFixed(0) || 0}
            <Text style={styles.summaryDescription}>
              {' '}({getEfficiencyDescription(currentSleepData.efficiency)})
            </Text>
          </Text>
        </View>
      </View>
      
      {/* Uyku Saatleri */}
      {(currentSleepData.startTime && currentSleepData.endTime) && (
        <View style={styles.timingContainer}>
          <View style={styles.timingItem}>
            <Ionicons name="bed-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.timingLabel}>Uyku Başlangıcı</Text>
            <Text style={styles.timingValue}>
              {(() => {
                const startDate = createSafeDate(currentSleepData.startTime);
                if (!startDate) return 'Bilinmiyor';
                
                // Türkiye saatine göre formatla
                const timeString = startDate.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                });
                console.log('🕐 Uyku başlangıç formatlandı:', timeString);
                return timeString;
              })()}
            </Text>
          </View>
          
          <View style={styles.timingDivider} />
          
          <View style={styles.timingItem}>
            <Ionicons name="sunny-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.timingLabel}>Uyanma</Text>
            <Text style={styles.timingValue}>
              {(() => {
                const endDate = createSafeDate(currentSleepData.endTime);
                if (!endDate) return 'Bilinmiyor';
                
                // Türkiye saatine göre formatla
                const timeString = endDate.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                });
                console.log('🕐 Uyanma saati formatlandı:', timeString);
                return timeString;
              })()}
            </Text>
          </View>
        </View>
      )}
      
      {/* Uyku Aşamaları Grafiği */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Uyku Aşamaları</Text>
        <BarChart
          data={sleepChartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars={true}
          fromZero={true}
          withCustomBarColorFromData={true}
          flatColor={true}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix="dk"
        />
      </View>
      
      {/* Uyku Aşamaları Detayları */}
      <View style={styles.stagesContainer}>
        <View style={styles.stageRow}>
          <View style={[styles.stageIndicator, { backgroundColor: Colors.sleepDeep }]} />
          <Text style={styles.stageLabel}>Derin Uyku</Text>
          <Text style={styles.stageValue}>{formatDuration(currentSleepData.deep)}</Text>
          <Text style={styles.stagePercent}>
            {currentSleepData.duration > 0 ? ((currentSleepData.deep / currentSleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
        
        <View style={styles.stageRow}>
          <View style={[styles.stageIndicator, { backgroundColor: Colors.sleepLight }]} />
          <Text style={styles.stageLabel}>Hafif Uyku</Text>
          <Text style={styles.stageValue}>{formatDuration(currentSleepData.light)}</Text>
          <Text style={styles.stagePercent}>
            {currentSleepData.duration > 0 ? ((currentSleepData.light / currentSleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
        
        <View style={styles.stageRow}>
          <View style={[styles.stageIndicator, { backgroundColor: Colors.sleepREM }]} />
          <Text style={styles.stageLabel}>REM Uykusu</Text>
          <Text style={styles.stageValue}>{formatDuration(currentSleepData.rem)}</Text>
          <Text style={styles.stagePercent}>
            {currentSleepData.duration > 0 ? ((currentSleepData.rem / currentSleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
      </View>
      
      {/* ✅ GELİŞTİRİLMİŞ: Uyku Nabız İstatistikleri - Health Connect Entegrasyonu */}
      {(currentSleepData.sleepHeartRate || loadingHealthConnect) && (
        <View style={styles.heartRateContainer}>
          {loadingHealthConnect ? (
            <View style={styles.loadingHealthConnectContainer}>
              <ActivityIndicator size="small" color={Colors.error} />
              <Text style={styles.loadingHealthConnectText}>
                Health Connect'ten uyku nabız verisi alınıyor...
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.heartRateClickable}
              onPress={() => {
                navigation.navigate('HeartRateDetail', {
                  date: currentSleepData.startTime || new Date().toISOString(),
                  sleepHeartRate: currentSleepData.sleepHeartRate,
                  sleepMode: true,
                  sleepStartTime: currentSleepData.startTime,
                  sleepEndTime: currentSleepData.endTime
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.heartRateHeader}>
                <Ionicons name="heart" size={20} color={Colors.error} />
                <Text style={styles.sectionTitle}>Uyku Sırasında Nabız</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
                
                {/* Health Connect Badge */}
                {healthConnectHeartRate && (
                  <View style={styles.healthConnectBadge}>
                    <Text style={styles.healthConnectBadgeText}>HC</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.heartRateStats}>
                <View style={styles.heartRateStat}>
                  <Text style={styles.heartRateStatLabel}>Ortalama</Text>
                  <Text style={[styles.heartRateStatValue, { color: Colors.error }]}>
                    {Math.round(currentSleepData.sleepHeartRate?.average || 0)} BPM
                  </Text>
                </View>
                
                <View style={styles.heartRateStat}>
                  <Text style={styles.heartRateStatLabel}>En Düşük</Text>
                  <Text style={styles.heartRateStatValue}>
                    {currentSleepData.sleepHeartRate?.min || 0} BPM
                  </Text>
                </View>
                
                <View style={styles.heartRateStat}>
                  <Text style={styles.heartRateStatLabel}>En Yüksek</Text>
                  <Text style={styles.heartRateStatValue}>
                    {currentSleepData.sleepHeartRate?.max || 0} BPM
                  </Text>
                </View>
              </View>
              
              <View style={styles.heartRateInfo}>
                <Text style={styles.heartRateInfoText}>
                  Uyku sırasında nabız hızınız {currentSleepData.sleepHeartRate?.values?.length || 0} kez ölçüldü.
                  {healthConnectHeartRate && ' (Health Connect verisi)'}
                  {' '}Detayları görüntülemek için dokunun.
                </Text>
              </View>
              
              {/* ✅ YENİ: Health Connect Data Source Info */}
              {healthConnectHeartRate && (
                <View style={styles.dataSourceInfo}>
                  <Ionicons name="fitness" size={16} color={Colors.success} />
                  <Text style={styles.dataSourceText}>
                    Veriler Health Connect'ten otomatik olarak alındı
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ✅ YENİ: Uyku nabız verisi yoksa Health Connect önerisi */}
      {!currentSleepData.sleepHeartRate && !loadingHealthConnect && currentSleepData.startTime && currentSleepData.endTime && (
        <View style={styles.noHeartRateContainer}>
          <View style={styles.noHeartRateHeader}>
            <Ionicons name="heart-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.noHeartRateTitle}>Uyku Nabız Verisi Bulunamadı</Text>
          </View>
          <Text style={styles.noHeartRateText}>
            Bu uyku seansı için nabız verisi mevcut değil. Mi Band cihazınızın uyku sırasında 
            nabız izleme özelliğini aktifleştirdiğinizden emin olun.
          </Text>
          <View style={styles.noHeartRateTip}>
            <Ionicons name="information-circle" size={16} color={Colors.info} />
            <Text style={styles.noHeartRateTipText}>
              Gelecek uyku seansları için daha iyi nabız verisi almak üzere Mi Band ayarlarınızı kontrol edin.
            </Text>
          </View>
        </View>
      )}
      
      {/* İpuçları - Z-Skoru bazlı */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            <Ionicons name="information-circle" size={18} color={Colors.info} /> Uyku İpuçları
          </Text>
          <View style={styles.tipsContent}>
          {currentSleepData.efficiency >= 80 && (
            <Text style={styles.tipText}>
              🎉 Mükemmel uyku kalitesi! Z-skoru {currentSleepData.efficiency}/100. Düzenli uyku alışkanlıklarını sürdürerek sağlığını korumaya devam et. Uyku saatlerindeki tutarlılık ve kaliteli beslenme ile bu başarını sürdürebilirsin.
            </Text>
          )}
          
          {currentSleepData.efficiency >= 60 && currentSleepData.efficiency < 80 && (
            <Text style={styles.tipText}>
              ⚠️ İyi uyku kalitesi ama geliştirilebilir. Z-skoru {currentSleepData.efficiency}/100. Daha iyi bir uyku için yatmadan 1 saat önce elektronik cihazları bırakmayı, yatak odanızın sıcaklığını 18-20°C'de tutmayı ve düzenli egzersiz yapmayı deneyin.
            </Text>
          )}
          
          {currentSleepData.efficiency >= 40 && currentSleepData.efficiency < 60 && (
              <Text style={styles.tipText}>
              🔴 Uyku kaliteniz orta-zayıf seviyede. Z-skoru {currentSleepData.efficiency}/100. Uyku saatlerinizde tutarlılık sağlayın, yatak öncesi rahatlatıcı bir rutin oluşturun, kafein alımını öğleden sonra kesmeyi deneyin ve uyku ortamınızı iyileştirin.
              </Text>
            )}
            
          {currentSleepData.efficiency < 40 && (
              <Text style={styles.tipText}>
              🚨 Uyku kaliteniz düşük. Z-skoru {currentSleepData.efficiency}/100. Acilen uyku hijyeninizi gözden geçirin: Her gün aynı saatte yatıp kalkın, elektronik cihazları yatak odasından çıkarın, alkol ve kafein tüketimini azaltın. Sorun devam ederse bir doktora danışın.
              </Text>
            )}
            
          {/* Ek uyku süresi ipuçları */}
          {currentSleepData.duration > 0 && (
              <Text style={styles.tipText}>
                             {(() => {
                 const hours = Math.floor(currentSleepData.duration / 60);
                 const minutes = currentSleepData.duration % 60;
                 const durationText = `${hours}s ${minutes}dk`;
                 
                 if (hours < 6) {
                   return `💤 Uyku süreniz ${durationText}. İdeal uyku süresi 7-9 saat arasıdır. Daha erken yatmaya odaklanın.`;
                 } else if (hours > 9) {
                   return `😴 Uyku süreniz ${durationText}. Çok uzun uyku da yorgunluğa neden olabilir. Uyku kalitesini artırmaya odaklanın.`;
                 } else if (hours >= 7 && hours <= 9) {
                   return `✅ Uyku süreniz ${durationText} - ideal aralıkta! Uyku kalitesini korumaya devam edin.`;
                 } else {
                   return `⏰ Uyku süreniz ${durationText}. 7-9 saat aralığına çıkmaya çalışın.`;
                 }
               })()}
              </Text>
            )}
          </View>
        </View>
      
      {currentSleepData.lastUpdated && (
        <Text style={styles.lastUpdated}>
          Son güncelleme: {(() => {
            const updateDate = createSafeDate(currentSleepData.lastUpdated);
            if (!updateDate) return 'Bilinmiyor';
            
            // Türkiye saatine göre formatla
            const dateString = updateDate.toLocaleDateString('tr-TR', { 
              day: 'numeric', 
              month: 'long' 
            });
            const timeString = updateDate.toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
            return `${dateString} ${timeString}`;
          })()}
        </Text>
      )}
    </ScrollView>
  );
};

export default SleepDetailView; 