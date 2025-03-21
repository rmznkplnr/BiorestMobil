import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const zScoreData = {
    labels: sampleData.map(d => d.date),
    datasets: [{
      data: sampleData.map(d => d.sleepEfficiency)
    }]
  };

  const sleepDurationData = {
    labels: sampleData.map(d => d.date),
    datasets: [{
      data: sampleData.map(d => d.sleepDuration / 60)
    }]
  };

  return (
    <SafeAreaViewContext style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>İstatistikler</Text>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Z-Score Grafiği */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Uyku Kalite Skoru (Z-Score)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={zScoreData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Yüksek</Text>
              <Text style={styles.statValue}>8.2</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ortalama</Text>
              <Text style={styles.statValue}>7.3</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Düşük</Text>
              <Text style={styles.statValue}>6.5</Text>
            </View>
          </View>
        </View>

        {/* Metrikler */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Uyku Metrikleri</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.metricsScroll}
          >
            <View style={styles.metricCard}>
              <Ionicons name="moon" size={24} color="#4a90e2" />
              <Text style={styles.metricValue}>7.5</Text>
              <Text style={styles.metricLabel}>Ortalama Süre (saat)</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="heart" size={24} color="#e74c3c" />
              <Text style={styles.metricValue}>68</Text>
              <Text style={styles.metricLabel}>Ort. Nabız (bpm)</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="bed" size={24} color="#2ecc71" />
              <Text style={styles.metricValue}>92%</Text>
              <Text style={styles.metricLabel}>Uyku Kalitesi</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="time" size={24} color="#f1c40f" />
              <Text style={styles.metricValue}>23:30</Text>
              <Text style={styles.metricLabel}>Ort. Yatış Saati</Text>
            </View>
          </ScrollView>
        </View>

        {/* Haftalık Uyku Süresi Grafiği */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Haftalık Uyku Süresi</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={sleepDurationData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Takvim Modalı */}
        {showCalendar && (
          <View style={styles.calendarModal}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Tarih Seçin</Text>
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
        )}
      </ScrollView>
    </SafeAreaViewContext>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.select({ ios: 90, android: 70 }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarButton: {
    padding: 8,
  },
  chartSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  chart: {
    borderRadius: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricsSection: {
    marginBottom: 30,
  },
  metricsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    width: 120,
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  metricLabel: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  calendarModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StatisticsScreen; 