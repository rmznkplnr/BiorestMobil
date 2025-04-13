import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface SleepChartProps {
  sleepData: {
    efficiency: number;
    duration: number;
    deep: number;
    light: number;
    rem: number;
    awake: number;
    startTime: string;
    endTime: string;
  };
  date?: string;
  onInfoPress?: () => void;
  activeTab?: 'daily' | 'weekly' | 'monthly'; // Aktif sekme
  weeklyData?: { total: number, average: number }; // Haftalık veri
  monthlyData?: { total: number, average: number }; // Aylık veri
}

const SleepChart: React.FC<SleepChartProps> = ({ 
  sleepData, 
  date = 'Bugün',
  onInfoPress,
  activeTab = 'daily',
  weeklyData = { total: 0, average: 0 },
  monthlyData = { total: 0, average: 0 }
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40; // 20px soldan, 20px sağdan iç boşluk
  const chartHeight = 100; // Grafik yüksekliği

  // Uyku başlangıç ve bitiş zamanlarını Date nesnelerine çevir
  const startTime = new Date(sleepData.startTime);
  const endTime = new Date(sleepData.endTime);

  // Toplam uyku süresi (milisaniye)
  const totalSleepDuration = endTime.getTime() - startTime.getTime();
  
  // Uyku süresi olmadığında
  if (totalSleepDuration <= 0 || sleepData.duration <= 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          <TouchableOpacity onPress={onInfoPress}>
            <Text style={styles.infoIcon}>•••</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Uyku verisi bulunamadı</Text>
        </View>
      </View>
    );
  }

  // Uyku saatlerini formatla
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  // Başlık oluştur - "6 Nisan 2025"
  const formatHeaderDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    };
    return date.toLocaleDateString('tr-TR', options);
  };
  
  // Saat aralığı oluştur - "08:00 - 18:00"
  const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;

  // Saat ve dakika bilgilerini döndür
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours} sa ${mins > 0 ? mins + ' dk' : ''}`;
  };

  // Uyku evrelerinin zaman dağılımını oluştur
  const calculateSleepPhases = () => {
    // Toplam uyku süresi (dakika)
    const totalMinutes = sleepData.duration;
    if (totalMinutes <= 0) return [];
    
    // Evrelerin başlangıç zamanını hesapla
    const totalDuration = endTime.getTime() - startTime.getTime();
    const msPerMinute = totalDuration / totalMinutes;
    
    const deepStart = startTime.getTime();
    const deepEnd = deepStart + (sleepData.deep * msPerMinute);
    
    const lightStart = deepEnd;
    const lightEnd = lightStart + (sleepData.light * msPerMinute);
    
    const remStart = lightEnd;
    const remEnd = remStart + (sleepData.rem * msPerMinute);
    
    // Uyanmaları evreler arasına dağıt (basit bir yaklaşım olarak)
    const awakeMinutes = sleepData.awake;
    const awakeTimePerPhase = awakeMinutes / 3; // 3 evre arasına dağıt
    
    return [
      {
        type: 'deep',
        start: new Date(deepStart),
        end: new Date(deepEnd),
        color: '#4a5cf2',
        label: 'Derin',
        duration: sleepData.deep
      },
      {
        type: 'light',
        start: new Date(lightStart),
        end: new Date(lightEnd),
        color: '#84adff',
        label: 'Hafif',
        duration: sleepData.light
      },
      {
        type: 'rem',
        start: new Date(remStart),
        end: new Date(remEnd),
        color: '#c7dbff',
        label: 'REM',
        duration: sleepData.rem
      },
      {
        type: 'awake',
        duration: sleepData.awake,
        color: '#ff8950',
        label: 'Uyanma'
      }
    ];
  };

  // Uyku grafiğini oluştur
  const renderSleepChart = () => {
    const sleepPhases = calculateSleepPhases();
    
    return (
      <View style={styles.chartWrapper}>
        {/* Uyku grafiği */}
        <View style={styles.sleepGraph}>
          {/* Derin uyku */}
          <View style={[styles.sleepBar, {backgroundColor: '#4a5cf2', flex: sleepData.deep / sleepData.duration}]}>
            <Text style={styles.phaseTimeLabel}>{formatTime(new Date(sleepData.startTime))}</Text>
          </View>
          
          {/* Hafif uyku */}
          <View style={[styles.sleepBar, {backgroundColor: '#84adff', flex: sleepData.light / sleepData.duration}]}>
            <Text style={styles.phaseTimeLabel}>
              {formatTime(new Date(new Date(sleepData.startTime).getTime() + (sleepData.deep * 60000)))}
            </Text>
          </View>
          
          {/* REM */}
          <View style={[styles.sleepBar, {backgroundColor: '#c7dbff', flex: sleepData.rem / sleepData.duration}]}>
            <Text style={styles.phaseTimeLabel}>
              {formatTime(new Date(new Date(sleepData.startTime).getTime() + ((sleepData.deep + sleepData.light) * 60000)))}
            </Text>
          </View>
          
          {/* Uyanma bölgesi (görsel olarak temsil edilecek uyanma anları) */}
          <View style={[styles.sleepBar, {backgroundColor: '#ff8950', flex: sleepData.awake / (sleepData.duration * 10)}]}>
            <Text style={styles.phaseTimeLabel}>{formatTime(new Date(sleepData.endTime))}</Text>
          </View>
        </View>
        
        {/* Alt zaman etiketi */}
        <View style={styles.timeFooter}>
          <Text style={styles.timeFooterText}>{formatTime(startTime)}</Text>
          <Text style={styles.timeFooterText}>{formatTime(endTime)}</Text>
        </View>
      </View>
    );
  };

  // Toplam uyku süresini göster
  const renderTotalSleepTime = () => {
    switch (activeTab) {
      case 'weekly':
        return (
          <View style={styles.totalSleepContainer}>
            <Text style={styles.totalSleepValue}>{formatDuration(weeklyData.total)}</Text>
            <Text style={styles.totalSleepLabel}>Haftalık toplam uyku</Text>
            <Text style={styles.averageSleepText}>Ortalama: {formatDuration(weeklyData.average)} / gün</Text>
          </View>
        );
      case 'monthly':
        return (
          <View style={styles.totalSleepContainer}>
            <Text style={styles.totalSleepValue}>{formatDuration(monthlyData.total)}</Text>
            <Text style={styles.totalSleepLabel}>Aylık toplam uyku</Text>
            <Text style={styles.averageSleepText}>Ortalama: {formatDuration(monthlyData.average)} / gün</Text>
          </View>
        );
      default: // daily
        return (
          <View style={styles.totalSleepContainer}>
            <Text style={styles.totalSleepValue}>{formatDuration(sleepData.duration)}</Text>
            <Text style={styles.totalSleepLabel}>Toplam uyku süresi</Text>
            <Text style={styles.averageSleepText}>Verimlilik: %{sleepData.efficiency}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Başlık bölümü */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatHeaderDate(new Date())}</Text>
        <TouchableOpacity onPress={onInfoPress}>
          <Text style={styles.infoIcon}>•••</Text>
        </TouchableOpacity>
      </View>
      
      {/* Toplam uyku süresi */}
      {renderTotalSleepTime()}
      
      {/* Saat aralığını göster */}
      <Text style={styles.timeRange}>{timeRange}</Text>
      
      {/* Uyku grafiği */}
      {renderSleepChart()}

      {/* Uyku evreleri başlığı */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Uyku evreleri</Text>
        <TouchableOpacity onPress={onInfoPress}>
          <Text style={styles.infoLinkText}>Daha fazla bilgi edinin</Text>
        </TouchableOpacity>
      </View>

      {/* Uyku evreleri listesi */}
      <View style={styles.sleepStagesContainer}>
        <View style={styles.sleepStage}>
          <View style={[styles.sleepStageColor, { backgroundColor: '#4a5cf2' }]} />
          <Text style={styles.sleepStageName}>Derin</Text>
          <Text style={styles.sleepStageTime}>{formatDuration(sleepData.deep)}</Text>
        </View>

        <View style={styles.sleepStage}>
          <View style={[styles.sleepStageColor, { backgroundColor: '#84adff' }]} />
          <Text style={styles.sleepStageName}>Hafif</Text>
          <Text style={styles.sleepStageTime}>{formatDuration(sleepData.light)}</Text>
        </View>

        <View style={styles.sleepStage}>
          <View style={[styles.sleepStageColor, { backgroundColor: '#c7dbff' }]} />
          <Text style={styles.sleepStageName}>REM</Text>
          <Text style={styles.sleepStageTime}>{formatDuration(sleepData.rem)}</Text>
        </View>

        <View style={styles.sleepStage}>
          <View style={[styles.sleepStageColor, { backgroundColor: '#ff8950' }]} />
          <Text style={styles.sleepStageName}>Uyanmalar</Text>
          <Text style={styles.sleepStageTime}>{Math.round(sleepData.awake / 10)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoIcon: {
    color: '#888',
    fontSize: 16,
  },
  infoButton: {
    color: '#888',
    fontSize: 16,
    width: 20,
    height: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 10,
  },
  totalSleepContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  totalSleepValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalSleepLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  averageSleepText: {
    color: '#4a90e2',
    fontSize: 12,
    marginTop: 8,
  },
  timeRange: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartWrapper: {
    marginBottom: 20,
  },
  sleepGraph: {
    flexDirection: 'row',
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  sleepBar: {
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  phaseTimeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 2,
    borderRadius: 3,
  },
  timeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  timeFooterText: {
    color: '#888',
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoLinkText: {
    color: '#4a90e2',
    fontSize: 12,
  },
  sleepStagesContainer: {
    marginTop: 16,
  },
  sleepStage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepStageColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8,
  },
  sleepStageName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  sleepStageTime: {
    color: '#888',
    fontSize: 14,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#888',
    fontSize: 16,
  },
});

export default SleepChart; 