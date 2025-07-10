import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import type { SleepMetric } from '../../types/health';
import { Colors } from '../../constants/Colors';
import { sleepDetailStyles as styles } from '../../styles/SleepDetailViewStyles';

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
        colors: [
          () => Colors.sleepDeep,
          () => Colors.sleepLight,
          () => Colors.sleepREM,
          () => Colors.sleepAwake,
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
                const endDate = createSafeDate(sleepData.endTime);
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
      
      {/* Uyku Nabız İstatistikleri */}
      {sleepData.sleepHeartRate && (
        <View style={styles.heartRateContainer}>
          <View style={styles.heartRateHeader}>
            <Ionicons name="heart" size={20} color={Colors.error} />
            <Text style={styles.sectionTitle}>Uyku Sırasında Nabız</Text>
          </View>
          
          <View style={styles.heartRateStats}>
            <View style={styles.heartRateStat}>
              <Text style={styles.heartRateStatLabel}>Ortalama</Text>
              <Text style={[styles.heartRateStatValue, { color: Colors.error }]}>
                {Math.round(sleepData.sleepHeartRate.average)} BPM
              </Text>
            </View>
            
            <View style={styles.heartRateStat}>
              <Text style={styles.heartRateStatLabel}>En Düşük</Text>
              <Text style={styles.heartRateStatValue}>
                {sleepData.sleepHeartRate.min} BPM
              </Text>
            </View>
            
            <View style={styles.heartRateStat}>
              <Text style={styles.heartRateStatLabel}>En Yüksek</Text>
              <Text style={styles.heartRateStatValue}>
                {sleepData.sleepHeartRate.max} BPM
              </Text>
            </View>
          </View>
          
          
        </View>
      )}
      
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