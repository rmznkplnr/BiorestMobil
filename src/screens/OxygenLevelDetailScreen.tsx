import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

type OxygenLevelDetailScreenRouteProp = RouteProp<RootStackParamList, 'OxygenLevelDetail'>;
type OxygenLevelDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OxygenLevelDetailScreen = () => {
  const navigation = useNavigation<OxygenLevelDetailScreenNavigationProp>();
  const route = useRoute<OxygenLevelDetailScreenRouteProp>();
  const [loading, setLoading] = useState(true);
  const [oxygenData, setOxygenData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<'bar' | 'line' | 'gauge' | 'simple'>('bar');
  
  // Seçili tarih için sağlık verilerini çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Eğer route.params'den tarih gelirse onu kullan
        const dateToUse = route.params?.date ? new Date(route.params.date) : selectedDate;
        
        console.log('🫁 Oksijen verisi çekiliyor, tarih:', dateToUse.toLocaleDateString());
        
        // Sağlık verilerini çek
        const healthData = await HealthDataService.fetchHealthDataForDate(dateToUse);
        
        console.log('🫁 Alınan sağlık verisi:', healthData);
        
        if (healthData && healthData.oxygen) {
          const { oxygen } = healthData;
          
          console.log('🫁 Oksijen verisi detayları:', {
            valuesCount: oxygen.values?.length || 0,
            timesCount: oxygen.times?.length || 0,
            average: oxygen.average,
            min: oxygen.min,
            max: oxygen.max
          });
          
          // Gerçek Health Connect verilerini kullan
          let chartData = oxygen.values || [];
          let chartTimes = oxygen.times || [];
          
          // Gerçek veri varsa kullan, yoksa bilgilendirici mesaj
          if (chartData.length === 0) {
            console.log('⚠️ Oksijen verisi bulunamadı, boş grafik gösteriliyor');
            chartData = [];
            chartTimes = [];
          } else {
            console.log('✅ Gerçek oksijen verisi kullanılıyor:', chartData.length, 'ölçüm');
            // Son 5 veriyi göster - daha temiz görünüm için
            if (chartData.length > 5) {
              chartData = chartData.slice(-5); // Son 5 veri
              chartTimes = chartTimes.slice(-5); // Son 5 zaman
              console.log('📊 Son 5 ölçüm gösteriliyor:', chartData);
            }
          }
          
          // Chart kit için zaman etiketleri
          const timeLabels = chartTimes.map(time => format(new Date(time), 'HH:mm'));
          
          setOxygenData({
            average: Math.floor(oxygen.average || 0),
            min: oxygen.min || 0,
            max: oxygen.max || 0,
            chartData,
            timeLabels,
            originalData: oxygen.values || [],
            totalReadings: (oxygen.values || []).length,
            hasRealData: chartData.length > 0
          });
        } else {
          console.log('❌ Oksijen verisi null veya undefined');
          // Gerçek veri yoksa boş veri göster
          setOxygenData({
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
        console.error('❌ Oksijen saturasyonu verisi alınırken hata:', error);
        // Hata durumunda boş veri
        setOxygenData({
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

  // Oksijen seviyesi kategorisini belirle
  const getOxygenCategory = (percentage: number) => {
    if (percentage >= 95) return { category: 'Normal', color: '#2ecc71', icon: 'checkmark-circle' };
    if (percentage >= 90 && percentage < 95) return { category: 'Düşük', color: '#f39c12', icon: 'warning' };
    if (percentage < 90) return { category: 'Çok Düşük', color: '#e74c3c', icon: 'alert-circle' };
    return { category: 'Normal', color: '#2ecc71', icon: 'checkmark-circle' };
  };

  const screenWidth = Dimensions.get('window').width - 40;
  const currentCategory = oxygenData ? getOxygenCategory(oxygenData.average) : null;

  // Grafik konfigürasyonu
  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2d2d2d',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 134, 222, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2e86de'
    },
    propsForLabels: {
      fontSize: 12
    }
  };

  const renderChart = () => {
    if (!oxygenData) return null;

    // Gerçek veri yoksa bilgilendirici mesaj göster
    if (!oxygenData.hasRealData || oxygenData.chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="water-outline" size={48} color="rgba(46, 134, 222, 0.3)" />
          <Text style={styles.noDataTitle}>Oksijen Verisi Bulunamadı</Text>
          <Text style={styles.noDataText}>
            Bu tarih için oksijen saturasyonu ölçümü bulunmuyor.{'\n'}
            Akıllı saatinizden ölçüm yapın veya farklı bir tarih seçin.
          </Text>
        </View>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <View>
            <BarChart
              data={{
                labels: oxygenData.timeLabels,
                datasets: [{
                  data: oxygenData.chartData
                }]
              }}
              width={screenWidth}
              height={250}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                ...chartConfig,
                fillShadowGradient: '#2e86de',
                fillShadowGradientOpacity: 0.8,
              }}
              style={styles.chart}
              fromZero={false}
              showValuesOnTopOfBars={true}
            />
            <View style={styles.chartLegend}>
              <Text style={styles.legendText}>Son 5 ölçüm gösteriliyor</Text>
            </View>
          </View>
        );

      case 'gauge':
        const gaugeProgress = oxygenData.average / 100; // 100% max
        return (
          <View style={styles.gaugeContainer}>
            <AnimatedCircularProgress
              size={200}
              width={15}
              fill={gaugeProgress * 100}
              tintColor={currentCategory?.color || '#2e86de'}
              backgroundColor="rgba(255,255,255,0.1)"
              rotation={0}
              lineCap="round"
            >
              {() => (
                <View style={styles.gaugeCenter}>
                  <Text style={styles.gaugeValue}>{oxygenData.average}</Text>
                  <Text style={styles.gaugeUnit}>%</Text>
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
            <Text style={styles.simpleTitle}>Oksijen Dağılımı</Text>
            
            {/* Basit çubuklu gösterim */}
            <View style={styles.simpleValues}>
              <View style={styles.simpleValueItem}>
                <Text style={styles.simpleLabel}>En Düşük</Text>
                <View style={styles.simpleBar}>
                  <View 
                    style={[
                      styles.simpleBarFill, 
                      { 
                        width: `${oxygenData.min}%`,
                        backgroundColor: '#e67e22'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.simpleValue}>{oxygenData.min}%</Text>
              </View>

              <View style={styles.simpleValueItem}>
                <Text style={styles.simpleLabel}>Ortalama</Text>
                <View style={styles.simpleBar}>
                  <View 
                    style={[
                      styles.simpleBarFill, 
                      { 
                        width: `${oxygenData.average}%`,
                        backgroundColor: currentCategory?.color || '#2ecc71'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.simpleValue}>{oxygenData.average}%</Text>
              </View>

              <View style={styles.simpleValueItem}>
                <Text style={styles.simpleLabel}>En Yüksek</Text>
                <View style={styles.simpleBar}>
                  <View 
                    style={[
                      styles.simpleBarFill, 
                      { 
                        width: `${oxygenData.max}%`,
                        backgroundColor: '#2ecc71'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.simpleValue}>{oxygenData.max}%</Text>
              </View>
            </View>

            <View style={styles.simpleInfo}>
              <Text style={styles.simpleInfoText}>
                Toplam {oxygenData.totalReadings} ölçümden son 5'i gösteriliyor
              </Text>
            </View>
          </View>
        );

      default: // line
        return (
          <View>
            <LineChart
              data={{
                labels: oxygenData.timeLabels,
                datasets: [{
                  data: oxygenData.chartData,
                  color: (opacity = 1) => `rgba(46, 134, 222, ${opacity})`,
                  strokeWidth: 3
                }]
              }}
              width={screenWidth}
              height={250}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={false}
            />
            <View style={styles.chartLegend}>
              <Text style={styles.legendText}>Son 5 ölçüm trendi</Text>
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
          <Text style={styles.headerTitle}>Oksijen Saturasyonu</Text>
          <TouchableOpacity 
            style={styles.chartTypeButton}
            onPress={cycleChartType}
          >
            <Ionicons 
              name={getChartTypeIcon()} 
              size={24} 
              color="#2e86de" 
            />
          </TouchableOpacity>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2e86de" />
            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            
            {/* Özet Kartlar */}
            <View style={styles.summaryContainer}>
              <LinearGradient
                colors={['#2e86de', '#2171b5']}
                style={styles.primaryCard}
              >
                <View style={styles.primaryCardContent}>
                  <Ionicons name="water" size={32} color="#fff" />
                  <Text style={styles.primaryValue}>
                    {oxygenData.hasRealData ? oxygenData.average : '--'}
                  </Text>
                  <Text style={styles.primaryUnit}>%</Text>
                  <Text style={styles.primaryLabel}>
                    {oxygenData.hasRealData ? 'Ortalama' : 'Veri Yok'}
                  </Text>
                </View>
                {currentCategory && oxygenData.hasRealData && (
                  <View style={styles.categoryBadge}>
                    <Ionicons name={currentCategory.icon} size={16} color="#fff" />
                    <Text style={styles.categoryText}>{currentCategory.category}</Text>
                  </View>
                )}
                {!oxygenData.hasRealData && (
                  <View style={styles.categoryBadge}>
                    <Ionicons name="information-circle" size={16} color="#fff" />
                    <Text style={styles.categoryText}>Ölçüm Gerekli</Text>
                  </View>
                )}
              </LinearGradient>

              <View style={styles.secondaryCards}>
                <View style={styles.statCard}>
                  <Ionicons name="arrow-down" size={20} color="#e67e22" />
                  <Text style={styles.statValue}>
                    {oxygenData.hasRealData ? oxygenData.min : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Minimum</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="arrow-up" size={20} color="#2ecc71" />
                  <Text style={styles.statValue}>
                    {oxygenData.hasRealData ? oxygenData.max : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Maksimum</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Ionicons name="pulse" size={20} color="#9b59b6" />
                  <Text style={styles.statValue}>{oxygenData.totalReadings}</Text>
                  <Text style={styles.statLabel}>Ölçüm</Text>
                </View>
              </View>
            </View>

            {/* Modern Grafik */}
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Günlük Değişim</Text>
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

              {oxygenData.hasRealData && (
                <View style={styles.chartTips}>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipDot, { backgroundColor: '#2ecc71' }]} />
                    <Text style={styles.tipText}>Normal: ≥95%</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipDot, { backgroundColor: '#f39c12' }]} />
                    <Text style={styles.tipText}>Düşük: 90-94%</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <View style={[styles.tipDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.tipText}>Çok Düşük: &lt;90%</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Sağlık Aralıkları */}
            <View style={styles.rangesSection}>
              <Text style={styles.sectionTitle}>Oksijen Saturasyonu Aralıkları</Text>
              <View style={styles.rangesList}>
                <View style={styles.rangeItem}>
                  <View style={[styles.rangeDot, { backgroundColor: '#2ecc71' }]} />
                  <Text style={styles.rangeText}>Normal: ≥ 95%</Text>
                  <Text style={styles.rangeDescription}>Sağlıklı aralık</Text>
                </View>
                <View style={styles.rangeItem}>
                  <View style={[styles.rangeDot, { backgroundColor: '#f39c12' }]} />
                  <Text style={styles.rangeText}>Hafif Düşük: 90-94%</Text>
                  <Text style={styles.rangeDescription}>Dikkat gereken aralık</Text>
                </View>
                <View style={styles.rangeItem}>
                  <View style={[styles.rangeDot, { backgroundColor: '#e74c3c' }]} />
                  <Text style={styles.rangeText}>Düşük: &lt; 90%</Text>
                  <Text style={styles.rangeDescription}>Tıbbi müdahale gerekli</Text>
                </View>
              </View>
            </View>

            {/* Bilgi Kartı */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color="#2e86de" />
                <Text style={styles.infoTitle}>Oksijen Sağlığı İpuçları</Text>
              </View>
              <Text style={styles.infoText}>
                • Derin nefes egzersizleri oksijen seviyesini artırır{'\n'}
                • Düzenli fiziksel aktivite akciğer kapasitesini geliştirir{'\n'}
                • Sigara oksijen taşıma kapasitesini azaltır{'\n'}
                • Yüksek rakımda oksijen seviyesi doğal olarak düşer
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  chartTypeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 134, 222, 0.2)'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000'
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10
  },
  primaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    position: 'relative'
  },
  primaryCardContent: {
    alignItems: 'center'
  },
  primaryValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10
  },
  primaryUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -5
  },
  primaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5
  },
  secondaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  chartTypeIndicator: {
    backgroundColor: 'rgba(46, 134, 222, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  chartTypeText: {
    color: '#2e86de',
    fontSize: 12,
    fontWeight: '600'
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  chartBackground: {
    borderRadius: 20
  },
  chart: {
    borderRadius: 16
  },
     chartLegend: {
     alignItems: 'center',
     marginTop: 10
   },
   legendText: {
     color: 'rgba(255,255,255,0.8)',
     fontSize: 14
   },
     chartTips: {
     padding: 20,
     backgroundColor: '#1a1a1a',
     borderRadius: 15,
     marginTop: 20
   },
   tipItem: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 10
   },
   tipDot: {
     width: 12,
     height: 12,
     borderRadius: 6,
     marginRight: 10
   },
   tipText: {
     color: '#fff',
     fontSize: 14,
     fontWeight: '500'
   },
  rangesSection: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15
  },
  rangesList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  rangeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  },
  rangeDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8
  },
  noDataText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginHorizontal: 20
  },
  gaugeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gaugeCenter: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff'
  },
  gaugeUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -5
  },
  gaugeCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5
  },
  gaugeDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10
  },
  simpleChart: {
    flex: 1,
    padding: 20
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
     simpleValues: {
     flexDirection: 'column',
     marginBottom: 20
   },
   simpleValueItem: {
     marginBottom: 15
   },
     simpleBar: {
     width: '100%',
     height: 8,
     backgroundColor: 'rgba(255,255,255,0.2)',
     borderRadius: 4,
     marginVertical: 5
   },
     simpleBarFill: {
     height: '100%',
     borderRadius: 4
   },
   simpleLabel: {
     color: 'rgba(255,255,255,0.8)',
     fontSize: 14,
     marginBottom: 5
   },
   simpleValue: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold'
   },
  simpleInfo: {
    alignItems: 'center'
  },
     simpleInfoText: {
     color: 'rgba(255,255,255,0.8)',
     fontSize: 14
   }
});

export default OxygenLevelDetailScreen; 