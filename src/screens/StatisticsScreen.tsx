import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

interface SleepMetrics {
  date: string;
  remSleep: number; // dakika
  deepSleep: number; // dakika
  heartRate: number; // BPM
  sleepDuration: number; // dakika
  sleepEfficiency: number; // yüzde
}

// Örnek veriler (son 7 gün)
const sampleData: SleepMetrics[] = [
  { date: '15.03', remSleep: 90, deepSleep: 120, heartRate: 65, sleepDuration: 420, sleepEfficiency: 85 },
  { date: '16.03', remSleep: 85, deepSleep: 115, heartRate: 68, sleepDuration: 410, sleepEfficiency: 82 },
  { date: '17.03', remSleep: 95, deepSleep: 125, heartRate: 62, sleepDuration: 430, sleepEfficiency: 88 },
  { date: '18.03', remSleep: 88, deepSleep: 118, heartRate: 64, sleepDuration: 415, sleepEfficiency: 84 },
  { date: '19.03', remSleep: 92, deepSleep: 122, heartRate: 63, sleepDuration: 425, sleepEfficiency: 86 },
  { date: '20.03', remSleep: 87, deepSleep: 117, heartRate: 66, sleepDuration: 405, sleepEfficiency: 83 },
  { date: '21.03', remSleep: 93, deepSleep: 123, heartRate: 64, sleepDuration: 428, sleepEfficiency: 87 },
];

const StatisticsScreen = () => {
  const [selectedMetric, setSelectedMetric] = useState<keyof Omit<SleepMetrics, 'date'>>('sleepEfficiency');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Z-Score hesaplama fonksiyonu
  const calculateZScore = (metrics: SleepMetrics[]): number[] => {
    // Her metrik için ağırlıklar
    const weights = {
      remSleep: 0.25,      // REM uykusu %25
      deepSleep: 0.25,     // Derin uyku %25
      heartRate: 0.15,     // Nabız %15
      sleepDuration: 0.15, // Uyku süresi %15
      sleepEfficiency: 0.20 // Uyku verimliliği %20
    };

    return metrics.map(metric => {
      // Her metrik için Z-score hesaplama
      const remZ = ((metric.remSleep - 90) / 10) * weights.remSleep;
      const deepZ = ((metric.deepSleep - 120) / 15) * weights.deepSleep;
      const heartZ = ((70 - metric.heartRate) / 5) * weights.heartRate; // Düşük nabız daha iyi
      const durationZ = ((metric.sleepDuration - 420) / 30) * weights.sleepDuration;
      const efficiencyZ = ((metric.sleepEfficiency - 85) / 5) * weights.sleepEfficiency;

      // Toplam Z-score
      return remZ + deepZ + heartZ + durationZ + efficiencyZ;
    });
  };

  const zScores = calculateZScore(sampleData);
  const maxZScore = Math.max(...zScores);
  const minZScore = Math.min(...zScores);

  // Metrik başlıkları
  const metricTitles: Record<keyof Omit<SleepMetrics, 'date'>, string> = {
    remSleep: 'REM Uykusu',
    deepSleep: 'Derin Uyku',
    heartRate: 'Ortalama Nabız',
    sleepDuration: 'Uyku Süresi',
    sleepEfficiency: 'Uyku Verimliliği'
  };

  // Metrik birimleri
  const metricUnits: Record<keyof Omit<SleepMetrics, 'date'>, string> = {
    remSleep: 'dk',
    deepSleep: 'dk',
    heartRate: 'BPM',
    sleepDuration: 'dk',
    sleepEfficiency: '%'
  };

  const chartConfig = {
    backgroundGradient: {
      colors: ['#1a1a1a', '#1a1a1a'],
      positions: [0, 1],
    },
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4a90e2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#333',
    },
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
    // Burada seçilen tarihe göre verileri güncelleme işlemi yapılacak
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>İstatistikler</Text>
          <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
            <Ionicons name="calendar" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>7.8</Text>
            <Text style={styles.summaryLabel}>Ortalama Uyku Süresi</Text>
            <Text style={styles.summaryUnit}>saat</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>88%</Text>
            <Text style={styles.summaryLabel}>Ortalama Kalite</Text>
            <Text style={styles.summaryUnit}>gece</Text>
          </View>
        </View>

        {/* Z-Score Grafiği */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Uyku Kalite Skoru (Z-Score)</Text>
          <LineChart
            data={{
              labels: sampleData.map(d => d.date),
              datasets: [{
                data: zScores
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <View style={styles.zScoreInfo}>
            <Text style={styles.zScoreText}>
              En Yüksek Skor: {maxZScore.toFixed(2)}
            </Text>
            <Text style={styles.zScoreText}>
              En Düşük Skor: {minZScore.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Metrik Seçimi */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.metricsScroll}
        >
          {Object.entries(metricTitles).map(([key, title]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.metricButton,
                selectedMetric === key && styles.selectedMetricButton
              ]}
              onPress={() => setSelectedMetric(key as keyof Omit<SleepMetrics, 'date'>)}
            >
              <Text style={[
                styles.metricButtonText,
                selectedMetric === key && styles.selectedMetricButtonText
              ]}>
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Seçili Metrik Grafiği */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {metricTitles[selectedMetric]} Değişimi
          </Text>
          <LineChart
            data={{
              labels: sampleData.map(d => d.date),
              datasets: [{
                data: sampleData.map(d => d[selectedMetric])
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <View style={styles.metricStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ortalama</Text>
              <Text style={styles.statValue}>
                {(sampleData.reduce((acc, curr) => acc + curr[selectedMetric], 0) / sampleData.length).toFixed(1)}
                {' '}{metricUnits[selectedMetric]}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Yüksek</Text>
              <Text style={styles.statValue}>
                {Math.max(...sampleData.map(d => d[selectedMetric]))}
                {' '}{metricUnits[selectedMetric]}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Düşük</Text>
              <Text style={styles.statValue}>
                {Math.min(...sampleData.map(d => d[selectedMetric]))}
                {' '}{metricUnits[selectedMetric]}
              </Text>
            </View>
          </View>
        </View>

        {/* Haftalık Uyku Süresi */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Haftalık Uyku Süresi</Text>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: sampleData.map(d => d.date),
                datasets: [{
                  data: sampleData.map(d => d.sleepDuration / 60),
                  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                  strokeWidth: 2
                }]
              }}
              width={Dimensions.get('window').width - 70}
              height={180}
              chartConfig={{
                ...chartConfig,
                backgroundGradientFrom: '#1a1a1a',
                backgroundGradientTo: '#1a1a1a',
                fillShadowGradientFrom: '#4a90e2',
                fillShadowGradientTo: 'rgba(74, 144, 226, 0.1)',
              }}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              segments={4}
            />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <Text style={styles.legendValue}>
                  {Math.max(...sampleData.map(d => d.sleepDuration / 60)).toFixed(1)}
                </Text>
                <Text style={styles.legendLabel}>En Uzun (saat)</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendValue}>
                  {(sampleData.reduce((acc, curr) => acc + curr.sleepDuration, 0) / sampleData.length / 60).toFixed(1)}
                </Text>
                <Text style={styles.legendLabel}>Ortalama (saat)</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendValue}>
                  {Math.min(...sampleData.map(d => d.sleepDuration / 60)).toFixed(1)}
                </Text>
                <Text style={styles.legendLabel}>En Kısa (saat)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Takvim Modalı */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={(day) => handleDateSelect(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#4a90e2' }
              }}
              theme={{
                backgroundColor: '#1a1a1a',
                calendarBackground: '#1a1a1a',
                textSectionTitleColor: '#fff',
                selectedDayBackgroundColor: '#4a90e2',
                selectedDayTextColor: '#fff',
                todayTextColor: '#4a90e2',
                dayTextColor: '#fff',
                textDisabledColor: '#444',
                monthTextColor: '#fff',
                arrowColor: '#4a90e2',
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    width: '45%',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  summaryUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  zScoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  zScoreText: {
    color: '#fff',
    fontSize: 14,
  },
  metricsScroll: {
    marginBottom: 20,
  },
  metricButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedMetricButton: {
    backgroundColor: '#4a90e2',
  },
  metricButtonText: {
    color: '#888',
    fontSize: 14,
  },
  selectedMetricButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  metricStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  detailsList: {
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#888',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 15,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legendLabel: {
    color: '#888',
    fontSize: 12,
  },
  calendarButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StatisticsScreen; 