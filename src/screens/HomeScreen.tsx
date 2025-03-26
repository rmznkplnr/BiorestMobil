import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, SleepNotification } from '../navigation/types';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
type TabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sleepRating, setSleepRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'rating' | 'details'>('details');

  // Örnek bildirim verisi (daha sonra veritabanından gelecek)
  const [lastNightData] = useState<SleepNotification>({
    date: '21.03.2024',
    lightLevel: 'Düşük',
    fragrance: 'Lavanta',
    sound: 'Yağmur Sesi',
    duration: '7.5 saat',
    heartRateData: {
      time: ['23:00', '00:00', '01:00'],
      rates: [68, 65, 62],
      events: [
        { time: '23:30', action: 'Koku Değişimi', effect: 'Olumlu' }
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

  const navigateToTab = (routeName: keyof MainTabParamList) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Main',
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

  // Örnek Z-score değeri (0-100 arası)
  const zScore = 85;

  // Z-score'a göre renk belirleme
  const getZScoreColor = (score: number) => {
    if (score >= 80) return '#2ecc71'; // Yeşil
    if (score >= 60) return '#f1c40f'; // Sarı
    return '#e74c3c'; // Kırmızı
  };

  // Z-score'a göre mesaj belirleme
  const getZScoreMessage = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    return 'Geliştirilebilir';
  };

  return (
    <SafeAreaViewContext style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hoş Geldiniz</Text>
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
              Detayları görüntülemek ve değerlendirmek için tıklayın
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Z-Score Göstergesi */}
        <View style={styles.zScoreContainer}>
          <LinearGradient
            colors={['#1a2a6c', '#2948ff', '#0066ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.zScoreGradient}
          >
            <View style={styles.zScoreHeader}>
              <Text style={styles.zScoreTitle}>ZzZ-Skoru</Text>
              <TouchableOpacity>
                <Ionicons name="information-circle-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.zScoreContent}>
              <AnimatedCircularProgress
                size={150}
                width={12}
                fill={zScore}
                tintColor={getZScoreColor(zScore)}
                backgroundColor="rgba(255,255,255,0.2)"
                rotation={0}
                lineCap="round"
              >
                {(fill: number) => (
                  <View style={styles.zScoreTextContainer}>
                    <Text style={styles.zScoreValue}>{Math.round(fill)}</Text>
                    <Text style={styles.zScoreLabel}>Z-Skor</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
              
              <View style={styles.zScoreDetails}>
                <Text style={styles.zScoreMessage}>
                  {getZScoreMessage(zScore)}
                </Text>
                <Text style={styles.zScoreDescription}>
                  Uyku kaliteniz ortalamanın üzerinde. Böyle devam edin!
                </Text>
              </View>
            </View>

            <View style={styles.zScoreStats}>
              <View style={styles.zScoreStat}>
                <Text style={styles.zScoreStatLabel}>REM</Text>
                <Text style={styles.zScoreStatValue}>25%</Text>
              </View>
              <View style={styles.zScoreStat}>
                <Text style={styles.zScoreStatLabel}>Derin Uyku</Text>
                <Text style={styles.zScoreStatValue}>35%</Text>
              </View>
              <View style={styles.zScoreStat}>
                <Text style={styles.zScoreStatLabel}>Hafif Uyku</Text>
                <Text style={styles.zScoreStatValue}>40%</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Günlük Özet */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Günlük Özet</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Ionicons name="moon" size={24} color="#4a90e2" />
              <Text style={styles.summaryValue}>7.5</Text>
              <Text style={styles.summaryLabel}>Uyku Süresi</Text>
              <Text style={styles.summaryUnit}>saat</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="heart" size={24} color="#e74c3c" />
              <Text style={styles.summaryValue}>68</Text>
              <Text style={styles.summaryLabel}>Ort. Nabız</Text>
              <Text style={styles.summaryUnit}>BPM</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="bed" size={24} color="#2ecc71" />
              <Text style={styles.summaryValue}>92%</Text>
              <Text style={styles.summaryLabel}>Verimlilik</Text>
              <Text style={styles.summaryUnit}>oran</Text>
            </View>
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  zScoreContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  zScoreGradient: {
    padding: 20,
  },
  zScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  zScoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  zScoreContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  zScoreTextContainer: {
    alignItems: 'center',
  },
  zScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  zScoreLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  zScoreDetails: {
    alignItems: 'center',
    marginTop: 15,
  },
  zScoreMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  zScoreDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  zScoreStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  zScoreStat: {
    alignItems: 'center',
  },
  zScoreStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  zScoreStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  summarySection: {
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    width: '31%',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  summaryUnit: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
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
  notificationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: 14,
    marginBottom: 5,
  },
  notificationFooter: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default HomeScreen;