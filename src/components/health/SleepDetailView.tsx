import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import type { SleepMetric } from '../../types/health';
import { Colors } from '../../constants/Colors';

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
  
  // Güvenli bir şekilde tarih nesnesi oluşturur
  const createSafeDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    
    try {
      // ISO formatındaki tarihler için parseISO kullan
      if (dateString.includes('T') && dateString.includes('Z')) {
        return parseISO(dateString);
      }
      
      // Farklı formatlar için normal Date constructor'ı kullan
      const date = new Date(dateString);
      
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
  
  if (!sleepData) {
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
    labels: ["Derin", "Hafif", "REM", "Uyanık"],
    datasets: [
      {
        data: [
          sleepData.deep || 0,
          sleepData.light || 0, 
          sleepData.rem || 0, 
          sleepData.awake || 0
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
      <View style={styles.header}>
        <Ionicons name="moon" size={24} color={Colors.sleep} />
        <Text style={styles.headerTitle}>Uyku Analizi</Text>
      </View>
      
      {/* Uyku Süresi ve Kalitesi */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Toplam Süre</Text>
          <Text style={[
            styles.summaryValue, 
            {color: isSleepDurationGood(sleepData.duration) ? Colors.success : Colors.error}
          ]}>
            {formatDuration(sleepData.duration)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Uyku Kalitesi</Text>
          <Text style={[
            styles.summaryValue, 
            {color: getEfficiencyColor(sleepData.efficiency)}
          ]}>
            %{sleepData.efficiency?.toFixed(0) || 0}
            <Text style={styles.summaryDescription}>
              {' '}({getEfficiencyDescription(sleepData.efficiency)})
            </Text>
          </Text>
        </View>
      </View>
      
      {/* Uyku Saatleri */}
      {(sleepData.startTime && sleepData.endTime) && (
        <View style={styles.timingContainer}>
          <View style={styles.timingItem}>
            <Ionicons name="bed-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.timingLabel}>Uyku Başlangıcı</Text>
            <Text style={styles.timingValue}>
              {(() => {
                const startDate = createSafeDate(sleepData.startTime);
                return startDate ? format(startDate, 'HH:mm', { locale: tr }) : 'Bilinmiyor';
              })()}
            </Text>
          </View>
          
          <View style={styles.timingDivider} />
          
          <View style={styles.timingItem}>
            <Ionicons name="sunny-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.timingLabel}>Uyanma</Text>
            <Text style={styles.timingValue}>
              {(() => {
                const endDate = createSafeDate(sleepData.endTime);
                return endDate ? format(endDate, 'HH:mm', { locale: tr }) : 'Bilinmiyor';
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
          <Text style={styles.stageValue}>{formatDuration(sleepData.deep)}</Text>
          <Text style={styles.stagePercent}>
            {sleepData.duration > 0 ? ((sleepData.deep / sleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
        
        <View style={styles.stageRow}>
          <View style={[styles.stageIndicator, { backgroundColor: Colors.sleepLight }]} />
          <Text style={styles.stageLabel}>Hafif Uyku</Text>
          <Text style={styles.stageValue}>{formatDuration(sleepData.light)}</Text>
          <Text style={styles.stagePercent}>
            {sleepData.duration > 0 ? ((sleepData.light / sleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
        
        <View style={styles.stageRow}>
          <View style={[styles.stageIndicator, { backgroundColor: Colors.sleepREM }]} />
          <Text style={styles.stageLabel}>REM Uykusu</Text>
          <Text style={styles.stageValue}>{formatDuration(sleepData.rem)}</Text>
          <Text style={styles.stagePercent}>
            {sleepData.duration > 0 ? ((sleepData.rem / sleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
        
        <View style={styles.stageRow}>
          <View style={[styles.stageIndicator, { backgroundColor: Colors.sleepAwake }]} />
          <Text style={styles.stageLabel}>Uyanık</Text>
          <Text style={styles.stageValue}>{formatDuration(sleepData.awake)}</Text>
          <Text style={styles.stagePercent}>
            {sleepData.duration > 0 ? ((sleepData.awake / sleepData.duration) * 100).toFixed(0) : 0}%
          </Text>
        </View>
      </View>
      
      {/* İpuçları */}
      {sleepData.status && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            <Ionicons name="information-circle" size={18} color={Colors.info} /> Uyku İpuçları
          </Text>
          <View style={styles.tipsContent}>
            {sleepData.status === 'good' && (
              <Text style={styles.tipText}>
                Uykun oldukça iyi görünüyor! Düzenli uyku alışkanlıklarını sürdürerek sağlığını korumaya devam et.
              </Text>
            )}
            
            {sleepData.status === 'warning' && (
              <Text style={styles.tipText}>
                Uyku kaliteniz orta düzeyde. Daha iyi bir uyku için yatmadan 1 saat önce elektronik cihazları bırakmayı ve yatak odanızın sıcaklığını kontrol etmeyi deneyin.
              </Text>
            )}
            
            {sleepData.status === 'bad' && (
              <Text style={styles.tipText}>
                Uyku kaliteniz düşük görünüyor. Uyku saatlerinizde tutarlılık, yatak öncesi rahatlatıcı bir rutin oluşturma ve uyku ortamınızı iyileştirme faydalı olabilir.
              </Text>
            )}
          </View>
        </View>
      )}
      
      {sleepData.lastUpdated && (
        <Text style={styles.lastUpdated}>
          Son güncelleme: {(() => {
            const updateDate = createSafeDate(sleepData.lastUpdated);
            return updateDate ? format(updateDate, 'd MMMM HH:mm', { locale: tr }) : 'Bilinmiyor';
          })()}
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: Colors.text,
    marginTop: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDescription: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 10,
  },
  timingContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  timingItem: {
    flex: 1,
    alignItems: 'center',
  },
  timingLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginVertical: 5,
  },
  timingValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timingDivider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 10,
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chart: {
    marginTop: 8,
    borderRadius: 16,
  },
  stagesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  stageLabel: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
  },
  stageValue: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginRight: 10,
  },
  stagePercent: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  tipsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipsContent: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  lastUpdated: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default SleepDetailView; 