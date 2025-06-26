import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import * as HealthDataService from '../services/HealthDataService';
import { format } from 'date-fns';

type HeartRateDetailScreenRouteProp = RouteProp<RootStackParamList, 'HeartRateDetail'>;
type HeartRateDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HeartRateDetailScreen = () => {
  const navigation = useNavigation<HeartRateDetailScreenNavigationProp>();
  const route = useRoute<HeartRateDetailScreenRouteProp>();
  const [loading, setLoading] = useState(true);
  const [heartRateData, setHeartRateData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Seçili tarih için sağlık verilerini çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Eğer route.params'den tarih gelirse onu kullan
        const dateToUse = route.params?.date ? new Date(route.params.date) : selectedDate;
        
        // Sağlık verilerini çek
        const healthData = await HealthDataService.fetchHealthDataForDate(dateToUse);
        
        if (healthData && healthData.heartRate) {
          const { heartRate } = healthData;
          
          // Health Connect'ten gelen veriyi düzenle
          let chartData = heartRate.values;
          let chartLabels = heartRate.times.map(time => {
            const date = new Date(time);
            return format(date, 'HH:mm');
          });
          
          // Eğer veriler boşsa dummy data ekle
          if (chartData.length === 0) {
            chartData = [65, 69, 72, 78, 75, 71, 68, 82, 76, 71, 67, 72];
            chartLabels = ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '20:00', '22:00', '00:00'];
          }
          
          setHeartRateData({
            average: Math.floor(heartRate.average || 0),
            min: heartRate.min || 0,
            max: heartRate.max || 0,
            chartData,
            chartLabels
          });
        } else {
          // Veri yoksa dummy değerleri göster
          setHeartRateData({
            average: 72,
            min: 58,
            max: 98,
            chartData: [65, 69, 72, 78, 75, 71, 68, 82, 76, 71, 67, 72],
            chartLabels: ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '20:00', '22:00', '00:00']
          });
        }
      } catch (error) {
        console.error('Kalp atış hızı verisi alınırken hata:', error);
        // Hata durumunda dummy değerler
        setHeartRateData({
          average: 72,
          min: 58,
          max: 98,
          chartData: [65, 69, 72, 78, 75, 71, 68, 82, 76, 71, 67, 72],
          chartLabels: ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '20:00', '22:00', '00:00']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, route.params?.date]);

  const screenWidth = Dimensions.get('window').width - 40;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kalp Atış Hızı</Text>
          <View style={{width: 28}} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Günlük Kalp Atış Hızı</Text>
              <LineChart
                data={{
                  labels: heartRateData.chartLabels,
                  datasets: [
                    {
                      data: heartRateData.chartData,
                      color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                      strokeWidth: 2
                    }
                  ]
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundColor: '#1e1e1e',
                  backgroundGradientFrom: '#1e1e1e',
                  backgroundGradientTo: '#1e1e1e',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#e74c3c'
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{heartRateData.average}</Text>
                <Text style={styles.statLabel}>Ortalama BPM</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{heartRateData.min}</Text>
                <Text style={styles.statLabel}>Minimum BPM</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{heartRateData.max}</Text>
                <Text style={styles.statLabel}>Maksimum BPM</Text>
              </View>
              

            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Kalp Atış Hızı Hakkında</Text>
              <Text style={styles.infoText}>
                Kalp atış hızı, kalbinizin bir dakika içinde attığı sayıdır. Normal istirahat kalp atış hızı yetişkinlerde dakikada 60-100 atımdır. İyi antrenmanlı atletlerde bu değer 40'a kadar düşebilir.
              </Text>
              <Text style={styles.infoText}>
                Düşük kalp atış hızı, genellikle kalp sağlığının ve fiziksel uygunluğun bir göstergesidir. Kalp atış hızınız egzersiz sırasında artar ve dinlenme sırasında düşer.
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
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  backButton: {
    padding: 5
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20
  },
  chartContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  statCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center'
  },
  statValue: {
    color: '#e74c3c',
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    marginBottom: 30
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  infoText: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10
  }
});

export default HeartRateDetailScreen; 