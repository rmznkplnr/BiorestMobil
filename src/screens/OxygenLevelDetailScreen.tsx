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

type OxygenLevelDetailScreenRouteProp = RouteProp<RootStackParamList, 'OxygenLevelDetail'>;
type OxygenLevelDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OxygenLevelDetailScreen = () => {
  const navigation = useNavigation<OxygenLevelDetailScreenNavigationProp>();
  const route = useRoute<OxygenLevelDetailScreenRouteProp>();
  const [loading, setLoading] = useState(true);
  const [oxygenData, setOxygenData] = useState<any>(null);
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
        
        if (healthData && healthData.oxygen) {
          const { oxygen } = healthData;
          
          // Health Connect'ten gelen veriyi düzenle
          let chartData = oxygen.values;
          let chartLabels = oxygen.times.map(time => {
            const date = new Date(time);
            return format(date, 'HH:mm');
          });
          
          // Eğer veriler boşsa dummy data ekle
          if (chartData.length === 0) {
            chartData = [98, 97, 98, 99, 96, 97, 98, 97, 96, 97, 98, 99];
            chartLabels = ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '20:00', '22:00', '00:00'];
          }
          
          setOxygenData({
            average: oxygen.average || 0,
            min: oxygen.min || 0,
            max: oxygen.max || 0,
            chartData,
            chartLabels
          });
        } else {
          // Veri yoksa dummy değerleri göster
          setOxygenData({
            average: 97,
            min: 95,
            max: 99,
            chartData: [98, 97, 98, 99, 96, 97, 98, 97, 96, 97, 98, 99],
            chartLabels: ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '20:00', '22:00', '00:00']
          });
        }
      } catch (error) {
        console.error('Oksijen seviyesi verisi alınırken hata:', error);
        // Hata durumunda dummy değerler
        setOxygenData({
          average: 97,
          min: 95,
          max: 99,
          chartData: [98, 97, 98, 99, 96, 97, 98, 97, 96, 97, 98, 99],
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
          <Text style={styles.headerTitle}>Kan Oksijen Seviyesi</Text>
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
              <Text style={styles.chartTitle}>Günlük Oksijen Seviyesi</Text>
              <LineChart
                data={{
                  labels: oxygenData.chartLabels,
                  datasets: [
                    {
                      data: oxygenData.chartData,
                      color: (opacity = 1) => `rgba(46, 134, 222, ${opacity})`,
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
                    stroke: '#2e86de'
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
                <Text style={styles.statValue}>{oxygenData.average}%</Text>
                <Text style={styles.statLabel}>Ortalama SpO₂</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{oxygenData.min}%</Text>
                <Text style={styles.statLabel}>Minimum SpO₂</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{oxygenData.max}%</Text>
                <Text style={styles.statLabel}>Maksimum SpO₂</Text>
              </View>
              
              <View style={styles.rangeCard}>
                <Text style={styles.rangeTitle}>SpO₂ Aralıkları</Text>
                <View style={styles.rangeRow}>
                  <View style={[styles.rangeDot, {backgroundColor: '#2ecc71'}]} />
                  <Text style={styles.rangeText}>Normal: 95% - 100%</Text>
                </View>
                <View style={styles.rangeRow}>
                  <View style={[styles.rangeDot, {backgroundColor: '#f39c12'}]} />
                  <Text style={styles.rangeText}>Düşük: 90% - 94%</Text>
                </View>
                <View style={styles.rangeRow}>
                  <View style={[styles.rangeDot, {backgroundColor: '#e74c3c'}]} />
                  <Text style={styles.rangeText}>Çok Düşük: &lt; 90%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Kan Oksijen Seviyesi Hakkında</Text>
              <Text style={styles.infoText}>
                Kan oksijen seviyesi (SpO₂), kanınızda taşınan oksijenin yüzdesini gösterir. Sağlıklı bir kişide, genellikle %95 ile %100 arasındadır.
              </Text>
              <Text style={styles.infoText}>
                Düşük oksijen seviyesi (hipoksemi), çeşitli sağlık sorunlarını gösterebilir. %90'ın altındaki değerler tıbbi aciliyet gerektirebilir.
              </Text>
              <Text style={styles.infoText}>
                Oksijen seviyeniz yüksek irtifada, uyku sırasında veya belirli akciğer hastalıklarında düşebilir. Devamlı düşük oksijen seviyeleriniz varsa, doktorunuza danışın.
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
    color: '#2e86de',
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5
  },
  rangeCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    marginBottom: 15
  },
  rangeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10
  },
  rangeText: {
    color: '#ddd',
    fontSize: 14
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

export default OxygenLevelDetailScreen; 