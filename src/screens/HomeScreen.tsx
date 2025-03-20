import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { SleepNotification } from '../types/sleep';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sleepRating, setSleepRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'rating' | 'details'>('details');

  // Örnek bildirim verisi (daha sonra veritabanından gelecek)
  const [lastNightData] = useState<SleepNotification>({
    date: new Date().toLocaleDateString('tr-TR'),
    lightLevel: 'Yumuşak Mavi',
    fragrance: 'Lavanta',
    sound: 'Yağmur Sesi',
    duration: '8 saat',
    heartRateData: {
      time: ['23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00'],
      rates: [85, 95, 120, 88, 75, 72, 70],
      events: [
        {
          time: '00:00',
          action: 'Yüksek nabız tespit edildi. Rahatlatıcı mod aktifleştirildi:',
          effect: 'Lavanta kokusu, yumuşak mavi ışık ve yağmur sesi devreye alındı.'
        },
        {
          time: '00:30',
          action: 'Nabız normale dönmeye başladı.',
          effect: 'Rahatlatıcı mod etkisini gösteriyor.'
        },
        {
          time: '01:30',
          action: 'Derin uyku fazına geçiş tespit edildi.',
          effect: 'Ortam ayarları korunuyor.'
        }
      ]
    }
  });

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const navigateToTab = (routeName: keyof TabParamList) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: routeName,
        },
      })
    );
  };

  const handleSleepRating = () => {
    // Burada veritabanına kayıt işlemi yapılacak
    Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!');
    setShowRatingModal(false);
    setSleepRating(0);
    setComment('');
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>BioRest</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
            <Text style={styles.subtitleText}>Sağlıklı uyku için BioRest ile tanışın</Text>
          </View>

          {/* Uyku Bildirimi Kartı */}
          <TouchableOpacity 
            style={styles.notificationCard}
            onPress={() => navigation.navigate('SleepDetails', { sleepData: lastNightData })}
          >
            <LinearGradient
              colors={['#2c3e50', '#3498db']}
              style={styles.notificationGradient}
            >
              <View style={styles.notificationHeader}>
                <Ionicons name="notifications" size={24} color="#fff" />
                <Text style={styles.notificationTitle}>Dün Geceki Uykunuz</Text>
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>Tarih: {lastNightData.date}</Text>
                <Text style={styles.notificationText}>Işık: {lastNightData.lightLevel}</Text>
                <Text style={styles.notificationText}>Koku: {lastNightData.fragrance}</Text>
                <Text style={styles.notificationText}>Ses: {lastNightData.sound}</Text>
                <Text style={styles.notificationText}>Süre: {lastNightData.duration}</Text>
              </View>
              <Text style={styles.notificationFooter}>
                Detayları görüntülemek için tıklayın
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.cardContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigateToTab('DevicesTab')}
            >
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.cardGradient}
              >
                <Ionicons name="hardware-chip" size={32} color="#fff" />
                <Text style={styles.cardTitle}>Cihazlarım</Text>
                <Text style={styles.cardSubtitle}>Cihazlarınızı yönetin</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigateToTab('StatisticsTab')}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.cardGradient}
              >
                <Ionicons name="stats-chart" size={32} color="#fff" />
                <Text style={styles.cardTitle}>İstatistikler</Text>
                <Text style={styles.cardSubtitle}>Uyku verilerinizi görüntüleyin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Değerlendirme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRatingModal}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Uyku Analizi</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
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

            <ScrollView style={styles.modalScroll}>
              {selectedTab === 'details' ? (
                <View style={styles.detailsContainer}>
                  <Text style={styles.chartTitle}>Gece Boyunca Nabız Değişimi</Text>
                  <LineChart
                    data={{
                      labels: lastNightData.heartRateData.time,
                      datasets: [{
                        data: lastNightData.heartRateData.rates
                      }]
                    }}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                  />

                  <View style={styles.eventsContainer}>
                    <Text style={styles.eventsTitle}>Önemli Olaylar</Text>
                    {lastNightData.heartRateData.events.map((event, index) => (
                      <View key={index} style={styles.eventItem}>
                        <View style={styles.eventHeader}>
                          <Ionicons name="time-outline" size={20} color="#4a90e2" />
                          <Text style={styles.eventTime}>{event.time}</Text>
                        </View>
                        <Text style={styles.eventAction}>{event.action}</Text>
                        <Text style={styles.eventEffect}>{event.effect}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Özet Bilgiler</Text>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Ortalama Nabız:</Text>
                      <Text style={styles.summaryValue}>
                        {Math.round(
                          lastNightData.heartRateData.rates.reduce((a, b) => a + b) / 
                          lastNightData.heartRateData.rates.length
                        )} BPM
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>En Yüksek Nabız:</Text>
                      <Text style={styles.summaryValue}>
                        {Math.max(...lastNightData.heartRateData.rates)} BPM
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>En Düşük Nabız:</Text>
                      <Text style={styles.summaryValue}>
                        {Math.min(...lastNightData.heartRateData.rates)} BPM
                      </Text>
                    </View>
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
                    <Text style={styles.buttonText}>Değerlendirmeyi Gönder</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#888',
  },
  notificationCard: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  notificationGradient: {
    padding: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  notificationContent: {
    marginBottom: 15,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationFooter: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (Dimensions.get('window').width - 60) / 2,
    height: 160,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
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
  modalScroll: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
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
  detailsContainer: {
    flex: 1,
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
  eventsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  eventsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
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
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    padding: 20,
  },
  ratingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  commentInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeScreen;