import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'react-native-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as HealthDataService from '../services/HealthDataService';
import { format } from 'date-fns';
import { heartRateDetailStyles as styles } from '../styles/HeartRateDetailScreenStyles';

type HeartRateDetailScreenRouteProp = RouteProp<RootStackParamList, 'HeartRateDetail'>;
type HeartRateDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HeartRateDetailScreen = () => {
  const navigation = useNavigation<HeartRateDetailScreenNavigationProp>();
  const route = useRoute<HeartRateDetailScreenRouteProp>();
  const [loading, setLoading] = useState(true);
  const [heartRateData, setHeartRateData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<'bar' | 'line' | 'gauge' | 'simple'>('line');
  
  // Seçili tarih için sağlık verilerini çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🛌 UYKU MODU KONTROLÜ: Eğer uyku nabız verisi gelirse direkt kullan
        if (route.params?.sleepMode && route.params?.sleepHeartRate) {
          console.log('🛌 Uyku nabız modu aktif, doğrudan veri kullanılıyor');
          
          const sleepHeartRate = route.params.sleepHeartRate;
          
          // Uyku nabız verilerini formatla - DAHA AZ VERİ
          const allChartData = sleepHeartRate.values || [];
          const allChartTimes = sleepHeartRate.times || [];
          
          // Uyku için her 10. veriyi al (çok fazla veri var)
          const sampledData: number[] = [];
          const sampledTimes: string[] = [];
          
          for (let i = 0; i < allChartData.length; i += 10) {
            sampledData.push(allChartData[i]);
            if (allChartTimes[i]) {
              sampledTimes.push(allChartTimes[i]);
            }
          }
          
          // Maksimum 20 nokta ile sınırla
          const chartData = sampledData.slice(0, 20);
          const chartTimes = sampledTimes.slice(0, 20);
          
          // Zaman etiketlerini minimal tut (sadece birkaç tane)
          const timeLabels = chartTimes.length > 4 
            ? ['', '', '', '', ''] // Boş etiketler
            : chartTimes.map(() => ''); // Tüm etiketler boş
          
          console.log(`🛌 Uyku nabız örneklendi: ${allChartData.length} → ${chartData.length} nokta`);
          
          setHeartRateData({
            average: Math.floor(sleepHeartRate.average || 0),
            min: sleepHeartRate.min || 0,
            max: sleepHeartRate.max || 0,
            chartData,
            timeLabels,
            originalData: allChartData,
            totalReadings: allChartData.length,
            hasRealData: chartData.length > 0,
            sleepMode: true,
            sleepStartTime: route.params.sleepStartTime,
            sleepEndTime: route.params.sleepEndTime
          });
          
          setLoading(false);
          return;
        }
        
        // Normal mod: Eğer route.params'den tarih gelirse onu kullan
        const dateToUse = route.params?.date ? new Date(route.params.date) : selectedDate;
        
        console.log('Nabız verisi çekiliyor, tarih:', dateToUse.toLocaleDateString());
        
        // Sağlık verilerini çek
        const healthData = await HealthDataService.fetchHealthDataForDate(dateToUse);
        
        console.log('Alınan sağlık verisi:', healthData);
        
        if (healthData && healthData.heartRate) {
          const { heartRate } = healthData;
          
          console.log('Nabız verisi detayları:', {
            valuesCount: heartRate.values?.length || 0,
            timesCount: heartRate.times?.length || 0,
            average: heartRate.average,
            min: heartRate.min,
            max: heartRate.max
          });
          
          // Gerçek Health Connect verilerini kullan
          let chartData = heartRate.values || [];
          let chartTimes = heartRate.times || [];
          
          // Gerçek veri varsa kullan, yoksa bilgilendirici mesaj
          if (chartData.length === 0) {
            console.log('Nabız verisi bulunamadı, boş grafik gösteriliyor');
            chartData = [];
            chartTimes = [];
          } else {
            console.log('Gerçek nabız verisi kullanılıyor:', chartData.length, 'ölçüm');
            // Son 5 veriyi göster - daha temiz görünüm için
            if (chartData.length > 5) {
              chartData = chartData.slice(-5); // Son 5 veri
              chartTimes = chartTimes.slice(-5); // Son 5 zaman
              console.log('Son 5 ölçüm gösteriliyor:', chartData);
            }
          }
          
          // Chart kit için zaman etiketleri
          const timeLabels = chartTimes.map(time => format(new Date(time), 'HH:mm'));
          
          setHeartRateData({
            average: Math.floor(heartRate.average || 0),
            min: heartRate.min || 0,
            max: heartRate.max || 0,
            chartData,
            timeLabels,
            originalData: heartRate.values || [],
            totalReadings: (heartRate.values || []).length,
            hasRealData: chartData.length > 0
          });
        } else {
          console.log('Nabız verisi null veya undefined');
          // Gerçek veri yoksa boş veri göster
          setHeartRateData({
            average: 0,
            min: 0,
            max: 0,
            chartData: [],
            timeLabels: [],
            originalData: [],
            totalReadings: 0,
            hasRealData: false
          });
        }
      } catch (error) {
        console.error('Kalp atış hızı verisi alınırken hata:', error);
        // Hata durumunda boş veri
        setHeartRateData({
          average: 0,
          min: 0,
          max: 0,
          chartData: [],
          timeLabels: [],
          originalData: [],
          totalReadings: 0,
          hasRealData: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, route.params?.date]);

  // Kalp atış hızı kategorisini belirle
  const getHeartRateCategory = (bpm: number) => {
    if (bpm < 60) return { category: 'Düşük', color: '#3498db', icon: 'trending-down' };
    if (bpm >= 60 && bpm <= 100) return { category: 'Normal', color: '#2ecc71', icon: 'checkmark-circle' };
    if (bpm > 100) return { category: 'Yüksek', color: '#e74c3c', icon: 'trending-up' };
    return { category: 'Normal', color: '#2ecc71', icon: 'checkmark-circle' };
  };

  const screenWidth = Dimensions.get('window').width - 60; // chartSection (40px) + chartContainer (20px) padding
  const currentCategory = heartRateData ? getHeartRateCategory(heartRateData.average) : null;

  // Grafik konfigürasyonu
  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2d2d2d',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#e74c3c'
    },
    propsForLabels: {
      fontSize: 12
    }
  };

  const renderChart = () => {
    if (!heartRateData) return null;

    // Gerçek veri yoksa bilgilendirici mesaj göster
    if (!heartRateData.hasRealData || heartRateData.chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="heart-outline" size={48} color="rgba(231, 76, 60, 0.3)" />
          <Text style={styles.noDataTitle}>Nabız Verisi Bulunamadı</Text>
          <Text style={styles.noDataText}>
            Bu tarih için kalp atış hızı ölçümü bulunmuyor.{'\n'}
            Akıllı saatinizden ölçüm yapın veya farklı bir tarih seçin.
          </Text>
        </View>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <View>
            <LineChart
               data={{
                labels: heartRateData.timeLabels.map(() => ''), // Zaman etiketlerini kaldır
                 datasets: [{
                  data: heartRateData.chartData,
                  color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                  strokeWidth: 3
                 }]
               }}
               width={screenWidth}
               height={250}
               chartConfig={{
                 ...chartConfig,
                propsForDots: {
                  r: '8', // Daha büyük noktalar
                  strokeWidth: '3',
                  stroke: '#e74c3c',
                  fill: '#e74c3c'
                },
                propsForLabels: {
                  fontSize: 0 // Alt etiketleri gizle
                }
               }}
               style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false} // Alt zaman etiketlerini kaldır
              withVerticalLabels={true} // Sol nabız değerlerini göster
              bezier={false} // Düz çizgiler
              yAxisSuffix=" BPM"
               fromZero={false}
             />
            <View style={styles.chartLegend}>
              <Text style={styles.legendText}>
                {heartRateData.sleepMode 
                  ? `${heartRateData.totalReadings} ölçümden ${heartRateData.chartData.length} nokta örneklemesi`
                  : 'Son 5 ölçüm gösteriliyor'
                }
              </Text>
            </View>
          </View>
        );

      case 'gauge':
        const gaugeProgress = heartRateData.average / 120; // 120 BPM max
        return (
          <View style={styles.gaugeContainer}>
            <AnimatedCircularProgress
              size={200}
              width={15}
              fill={gaugeProgress * 100}
              tintColor={currentCategory?.color || '#e74c3c'}
              backgroundColor="rgba(255,255,255,0.1)"
              rotation={0}
              lineCap="round"
            >
              {() => (
                <View style={styles.gaugeCenter}>
                  <Text style={styles.gaugeValue}>{heartRateData.average}</Text>
                  <Text style={styles.gaugeUnit}>BPM</Text>
                  <Text style={[styles.gaugeCategory, { color: currentCategory?.color }]}>
                    {currentCategory?.category}
                  </Text>
                </View>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.gaugeDescription}>
              Son ölçüm ortalaması gösteriliyor
            </Text>
          </View>
        );

      case 'simple':
        return (
          <View style={styles.simpleChart}>
            <Text style={styles.simpleTitle}>Nabız Dağılımı</Text>
            
            {/* Basit çubuklu gösterim */}
            <View style={styles.simpleValues}>
              <View style={styles.simpleValueItem}>
                <Text style={styles.simpleLabel}>En Düşük</Text>
                <View style={styles.simpleBar}>
                  <View 
                    style={[
                      styles.simpleBarFill, 
                      { 
                        width: `${(heartRateData.min / 120) * 100}%`,
                        backgroundColor: '#3498db'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.simpleValue}>{heartRateData.min} BPM</Text>
              </View>

              <View style={styles.simpleValueItem}>
                <Text style={styles.simpleLabel}>Ortalama</Text>
                <View style={styles.simpleBar}>
                  <View 
                    style={[
                      styles.simpleBarFill, 
                      { 
                        width: `${(heartRateData.average / 120) * 100}%`,
                        backgroundColor: currentCategory?.color || '#2ecc71'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.simpleValue}>{heartRateData.average} BPM</Text>
              </View>

              <View style={styles.simpleValueItem}>
                <Text style={styles.simpleLabel}>En Yüksek</Text>
                <View style={styles.simpleBar}>
                  <View 
                    style={[
                      styles.simpleBarFill, 
                      { 
                        width: `${(heartRateData.max / 120) * 100}%`,
                        backgroundColor: '#e67e22'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.simpleValue}>{heartRateData.max} BPM</Text>
              </View>
            </View>

            <View style={styles.simpleInfo}>
              <Text style={styles.simpleInfoText}>
                {heartRateData.sleepMode 
                  ? `Toplam ${heartRateData.totalReadings} ölçümden ${heartRateData.chartData.length} nokta örneklemesi`
                  : `Toplam ${heartRateData.totalReadings} ölçümden son 5'i gösteriliyor`
                }
              </Text>
            </View>
          </View>
        );

      default: // line
        return (
          <View>
            <LineChart
              data={{
                labels: heartRateData.timeLabels,
                datasets: [{
                  data: heartRateData.chartData,
                  color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                  strokeWidth: 0 // Çizgileri kaldır, sadece noktalar kalsın
                }]
              }}
              width={screenWidth}
              height={250}
              chartConfig={{
                ...chartConfig,
                // Uyku modu için özel ayarlar
                propsForDots: heartRateData.sleepMode ? {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#e74c3c',
                  fill: '#e74c3c'
                } : chartConfig.propsForDots,
                propsForLabels: {
                  fontSize: heartRateData.sleepMode ? 0 : 12 // Uyku modunda etiket yok
                }
              }}
              bezier={!heartRateData.sleepMode} // Uyku modunda düz çizgi
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={!heartRateData.sleepMode} // Uyku modunda iç çizgi yok
              withOuterLines={false}
              withHorizontalLabels={!heartRateData.sleepMode} // Uyku modunda alt etiket yok
              withVerticalLabels={true}
            />
            <View style={styles.chartLegend}>
              <Text style={styles.legendText}>
                {heartRateData.sleepMode 
                  ? `${heartRateData.totalReadings} ölçümden ${heartRateData.chartData.length} nokta örneklemesi`
                  : 'Son 5 ölçüm trendi'
                }
              </Text>
            </View>
          </View>
        );
    }
  };

  const getChartTypeName = () => {
    switch (chartType) {
      case 'bar': return 'Çubuk Grafik';
      case 'gauge': return 'Gösterge';
      case 'simple': return 'Basit Görünüm';
      case 'line': return 'Çizgi Grafik';
      default: return 'Grafik';
    }
  };

  const getChartTypeIcon = () => {
    switch (chartType) {
      case 'bar': return 'bar-chart';
      case 'gauge': return 'speedometer';
      case 'simple': return 'list';
      case 'line': return 'trending-up';
      default: return 'stats-chart';
    }
  };

  const cycleChartType = () => {
    const types: Array<'bar' | 'line' | 'gauge' | 'simple'> = ['bar', 'simple', 'gauge', 'line'];
    const currentIndex = types.indexOf(chartType);
    const nextIndex = (currentIndex + 1) % types.length;
    setChartType(types[nextIndex]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#000', '#1a1a1a']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {heartRateData?.sleepMode ? 'Uyku Nabız Detayları' : 'Kalp Atış Hızı'}
          </Text>
          <TouchableOpacity 
            style={styles.chartTypeButton}
            onPress={cycleChartType}
          >
            <Ionicons 
              name={getChartTypeIcon()} 
              size={24} 
              color="#e74c3c" 
            />
          </TouchableOpacity>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            
            {/* Özet Kartlar */}
            <View style={styles.summaryContainer}>
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.primaryCard}
              >
                <View style={styles.primaryCardContent}>
                  <Ionicons name="heart" size={32} color="#fff" />
                  <Text style={styles.primaryValue}>
                    {heartRateData.hasRealData ? heartRateData.average : '--'}
                  </Text>
                  <Text style={styles.primaryUnit}>BPM</Text>
                  <Text style={styles.primaryLabel}>
                    {heartRateData.hasRealData ? 'Ortalama' : 'Veri Yok'}
                  </Text>
                </View>
                {currentCategory && heartRateData.hasRealData && (
                  <View style={styles.categoryBadge}>
                    <Ionicons name={currentCategory.icon} size={16} color="#fff" />
                    <Text style={styles.categoryText}>{currentCategory.category}</Text>
                  </View>
                )}
                {!heartRateData.hasRealData && (
                  <View style={styles.categoryBadge}>
                    <Ionicons name="information-circle" size={16} color="#fff" />
                    <Text style={styles.categoryText}>Ölçüm Gerekli</Text>
                  </View>
                )}
              </LinearGradient>

              <View style={styles.secondaryCards}>
                <View style={styles.statCard}>
                  <Ionicons name="arrow-down" size={20} color="#3498db" />
                  <Text style={styles.statValue}>
                    {heartRateData.hasRealData ? heartRateData.min : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Minimum</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="arrow-up" size={20} color="#e67e22" />
                  <Text style={styles.statValue}>
                    {heartRateData.hasRealData ? heartRateData.max : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Maksimum</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="pulse" size={20} color="#9b59b6" />
                  <Text style={styles.statValue}>{heartRateData.totalReadings}</Text>
                  <Text style={styles.statLabel}>Ölçüm</Text>
                </View>
              </View>
            </View>

            {/* Modern Grafik */}
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>
                  {heartRateData?.sleepMode ? 'Uyku Sırasında Nabız' : 'Günlük Değişim'}
                </Text>
                <View style={styles.chartTypeIndicator}>
                  <Text style={styles.chartTypeText}>{getChartTypeName()}</Text>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <LinearGradient
                  colors={['#1a1a1a', '#2d2d2d']}
                  style={styles.chartBackground}
                >
                  {renderChart()}
                </LinearGradient>
              </View>

              {heartRateData.hasRealData && (
                <View style={styles.chartTips}>
                  {heartRateData.sleepMode ? (
                    // Uyku nabzı için aralıklar
                    <>
                      <View style={styles.tipItem}>
                        <View style={[styles.tipDot, { backgroundColor: '#2ecc71' }]} />
                        <Text style={styles.tipText}>İdeal Uyku: 40-80 BPM</Text>
                      </View>
                      <View style={styles.tipItem}>
                        <View style={[styles.tipDot, { backgroundColor: '#f39c12' }]} />
                        <Text style={styles.tipText}>Yüksek: 80+ BPM</Text>
                      </View>
                      <View style={styles.tipItem}>
                        <View style={[styles.tipDot, { backgroundColor: '#3498db' }]} />
                        <Text style={styles.tipText}>Çok Düşük: &lt;40 BPM</Text>
                      </View>
                    </>
                  ) : (
                    // Normal nabız için aralıklar
                    <>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipDot, { backgroundColor: '#2ecc71' }]} />
                    <Text style={styles.tipText}>Normal: 60-100 BPM</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipDot, { backgroundColor: '#3498db' }]} />
                    <Text style={styles.tipText}>Düşük: &lt;60 BPM</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.tipText}>Yüksek: &gt;100 BPM</Text>
                  </View>
                    </>
                  )}
                </View>
              )}
            </View>

           

            {/* Bilgi Kartı */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color="#3498db" />
                <Text style={styles.infoTitle}>
                  {heartRateData?.sleepMode ? 'Uyku Nabız İpuçları' : 'Kalp Sağlığı İpuçları'}
                </Text>
              </View>
              <Text style={styles.infoText}>
                {heartRateData?.sleepMode ? (
                  // Uyku nabzı ipuçları
                  '• Normal uyku nabzı 40-80 BPM arasında olmalıdır\n' +
                  '• Derin uyku sırasında nabız daha da düşer\n' +
                  '• Uyku kalitesi nabız stabilitesini etkiler\n' +
                  '• Alkol ve kafein uyku nabzını artırabilir\n' +
                  (heartRateData.sleepStartTime && heartRateData.sleepEndTime ? 
                    `• Uyku süresi: ${format(new Date(heartRateData.sleepStartTime), 'HH:mm')} - ${format(new Date(heartRateData.sleepEndTime), 'HH:mm')}` 
                    : '')
                ) : (
                  // Normal nabız ipuçları
                  '• Düzenli egzersiz kalp atış hızınızı iyileştirir\n' +
                  '• Yeterli uyku kalp sağlığı için önemlidir\n' +
                  '• Stres kalp atış hızını artırabilir\n' +
                  '• Kafein ve nikotin geçici olarak nabzı hızlandırır'
                )}
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HeartRateDetailScreen; 