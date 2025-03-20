import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SleepNotification } from '../navigation/types';

type SleepDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SleepDetailsScreen = () => {
  const navigation = useNavigation<SleepDetailsScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'details' | 'rating'>('details');
  const [sleepRating, setSleepRating] = useState(0);
  const [comment, setComment] = useState('');

  // Örnek veri
  const sleepData: SleepNotification = {
    date: '21.03.2024',
    lightLevel: 'Düşük',
    fragrance: 'Lavanta',
    sound: 'Yağmur Sesi',
    duration: '7.5 saat',
    heartRateData: {
      time: ['23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00'],
      rates: [75, 85, 95, 88, 78, 72, 68],
      events: [
        {
          time: '00:00',
          action: 'Yüksek nabız tespit edildi',
          effect: 'Ortama ferahlatıcı lavanta kokusu verildi, ışık seviyesi düşürüldü'
        },
        {
          time: '00:30',
          action: 'Nabız düşmeye başladı',
          effect: 'Mevcut ayarlar korundu'
        },
        {
          time: '01:30',
          action: 'Derin uyku fazına geçiş',
          effect: 'Ses seviyesi kademeli olarak azaltıldı'
        }
      ]
    }
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

  const handleSleepRating = () => {
    // Burada veritabanına kayıt işlemi yapılacak
    Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!');
    navigation.goBack();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setSleepRating(i)}>
          <Ionicons
            name={i <= sleepRating ? 'star' : 'star-outline'}
            size={40}
            color="#FFD700"
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Uyku Analizi</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'details' && styles.activeTab]}
            onPress={() => setSelectedTab('details')}
          >
            <Text style={[styles.tabText, selectedTab === 'details' && styles.activeTabText]}>
              Detaylar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'rating' && styles.activeTab]}
            onPress={() => setSelectedTab('rating')}
          >
            <Text style={[styles.tabText, selectedTab === 'rating' && styles.activeTabText]}>
              Değerlendirme
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {selectedTab === 'details' ? (
            <View style={styles.detailsContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Uyku Özeti</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tarih:</Text>
                  <Text style={styles.infoValue}>{sleepData.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Süre:</Text>
                  <Text style={styles.infoValue}>{sleepData.duration}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ortam Işığı:</Text>
                  <Text style={styles.infoValue}>{sleepData.lightLevel}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ortam Sesi:</Text>
                  <Text style={styles.infoValue}>{sleepData.sound}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Aroma:</Text>
                  <Text style={styles.infoValue}>{sleepData.fragrance}</Text>
                </View>
              </View>

              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>Gece Boyunca Nabız Değişimi</Text>
                <LineChart
                  data={{
                    labels: sleepData.heartRateData.time,
                    datasets: [{
                      data: sleepData.heartRateData.rates
                    }]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>

              <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>Faunus Müdahaleleri</Text>
                {sleepData.heartRateData.events.map((event, index) => (
                  <View key={index} style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <Ionicons name="time-outline" size={20} color="#4a90e2" />
                      <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                    <Text style={styles.eventAction}>{event.action}</Text>
                    <Text style={styles.eventEffect}>{event.effect}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>Uykunuzu Değerlendirin</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorumunuzu yazın (isteğe bağlı)"
                placeholderTextColor="#666"
                multiline
                value={comment}
                onChangeText={setComment}
              />
              <TouchableOpacity
                style={[styles.submitButton, !sleepRating && styles.disabledButton]}
                onPress={handleSleepRating}
                disabled={!sleepRating}
              >
                <Text style={styles.submitButtonText}>Değerlendirmeyi Gönder</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chartSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 15,
  },
  eventsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  eventAction: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  eventEffect: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  ratingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  star: {
    marginHorizontal: 5,
  },
  commentInput: {
    width: '100%',
    height: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SleepDetailsScreen; 