import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HealthDataScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    sleepQuality: 85,
    activityLevel: 65,
    stressLevel: 30,
    sleepDuration: 7.5,
    deepSleepPercentage: 25,
  });

  const [weeklyData] = useState({
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [{
      data: [7.2, 6.8, 7.5, 6.9, 7.3, 8.1, 7.5],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    }],
  });

  useEffect(() => {
    // Simüle edilmiş veri yükleme
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const SleepQualityCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="sleep" size={24} color="#3498db" />
        <Text style={styles.cardTitle}>Uyku Kalitesi</Text>
      </View>
      <View style={styles.sleepStats}>
        <View style={styles.sleepStatItem}>
          <Text style={styles.sleepStatValue}>{healthData.sleepDuration}s</Text>
          <Text style={styles.sleepStatLabel}>Süre</Text>
        </View>
        <View style={styles.sleepStatItem}>
          <Text style={styles.sleepStatValue}>{healthData.deepSleepPercentage}%</Text>
          <Text style={styles.sleepStatLabel}>Derin Uyku</Text>
        </View>
        <View style={styles.sleepStatItem}>
          <Text style={styles.sleepStatValue}>{healthData.sleepQuality}%</Text>
          <Text style={styles.sleepStatLabel}>Kalite</Text>
        </View>
      </View>
    </View>
  );

  const WeeklyChart = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="chart-line" size={24} color="#3498db" />
        <Text style={styles.cardTitle}>Haftalık Uyku Analizi</Text>
      </View>
      <LineChart
        data={weeklyData}
        width={Dimensions.get('window').width - 60}
        height={180}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  const HealthStatsCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="heart-pulse" size={24} color="#3498db" />
        <Text style={styles.cardTitle}>Sağlık Durumu</Text>
      </View>
      <View style={styles.healthStats}>
        <View style={styles.healthStatRow}>
          <View style={styles.healthStatItem}>
            <Icon name="heart" size={32} color="#e74c3c" />
            <Text style={styles.healthStatValue}>{healthData.heartRate}</Text>
            <Text style={styles.healthStatLabel}>Nabız (BPM)</Text>
          </View>
          <View style={styles.healthStatItem}>
            <Icon name="run" size={32} color="#2ecc71" />
            <Text style={styles.healthStatValue}>{healthData.activityLevel}%</Text>
            <Text style={styles.healthStatLabel}>Aktivite</Text>
          </View>
        </View>
        <View style={styles.healthStatRow}>
          <View style={styles.healthStatItem}>
            <Icon name="brain" size={32} color="#9b59b6" />
            <Text style={styles.healthStatValue}>{healthData.stressLevel}%</Text>
            <Text style={styles.healthStatLabel}>Stres</Text>
          </View>
          <View style={styles.healthStatItem}>
            <Icon name="battery-charging" size={32} color="#f1c40f" />
            <Text style={styles.healthStatValue}>85%</Text>
            <Text style={styles.healthStatLabel}>Enerji</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const OptimizeButton = () => (
    <TouchableOpacity style={styles.optimizeButton}>
      <Icon name="auto-fix" size={24} color="white" />
      <Text style={styles.optimizeButtonText}>Ortamı Optimize Et</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Veriler Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <SleepQualityCard />
        <WeeklyChart />
        <HealthStatsCard />
        <OptimizeButton />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  sleepStatItem: {
    alignItems: 'center',
  },
  sleepStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  sleepStatLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  healthStats: {
    marginTop: 10,
  },
  healthStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  healthStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  healthStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  healthStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  optimizeButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  optimizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default HealthDataScreen; 