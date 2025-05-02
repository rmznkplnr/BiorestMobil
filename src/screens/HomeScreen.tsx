import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert, SafeAreaView, StatusBar, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, MainTabParamList, SleepNotification } from '../navigation/types';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import HealthConnectService from '../services/HealthConnectService';
import { styles } from '../styles/HomeScreenStyles';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sleepRating, setSleepRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'rating' | 'details'>('details');
  const [showZzzInfoModal, setShowZzzInfoModal] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [calculatingScore, setCalculatingScore] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Sayfa odaklandığında animasyonları başlat
  useFocusEffect(
    React.useCallback(() => {
      // Paralel animasyonlar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
      
      return () => {
        // Sayfa odağını kaybettiğinde animasyonları sıfırla
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.9);
      };
    }, [])
  );
  
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

  const { width: screenWidth } = Dimensions.get('window');

  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: Platform.select({ ios: 2, android: 1.5 }),
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: Platform.select({ ios: 12, android: 10 }),
    },
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
            style={{ marginHorizontal: 5 }}
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
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Hoş Geldiniz</Text>
        </Animated.View>

        {/* Sağlık Verileri Kartı */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: Animated.multiply(slideAnim, 1.2)}, {scale: scaleAnim}]
          }}
        >
          <TouchableOpacity 
            style={styles.googleFitCard}
            onPress={() => navigation.navigate('HealthData')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#43A047', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.googleFitGradient}
            >
              <View style={{flexWrap:"wrap"}}>
                <View style={styles.googleFitHeader}>
                  <Ionicons name="heart" size={24} color="#fff" />
                  <Text style={styles.googleFitTitle} numberOfLines={2} ellipsizeMode="tail">Sağlık Verilerinizi Bağlayın</Text>
                </View>
                <Text style={styles.googleFitText} numberOfLines={2} ellipsizeMode="tail">
                  Uyku kalitenizi iyileştirmek için sağlık verilerinizi bağlayın
                </Text>
              </View>
              <View style={styles.googleFitButton}>
                <Text style={styles.googleFitButtonText} numberOfLines={1} ellipsizeMode="tail">Sağlık Verilerini Görüntüle</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Uyku Bildirimi Kartı */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: Animated.multiply(slideAnim, 1.5)}]
          }}
        >
          <TouchableOpacity 
            style={styles.notificationCard}
            onPress={() => navigation.navigate('SleepDetails', { sleepData: lastNightData })}
          >
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.notificationGradient}
            >
              <View>
                <View style={styles.notificationHeader}>
                  <Ionicons name="moon" size={28} color="#fff" />
                  <Text style={styles.notificationTitle} numberOfLines={1} ellipsizeMode="tail">Dün Geceki Uykunuz</Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">Tarih: {lastNightData.date}</Text>
                  <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">Işık: {lastNightData.lightLevel}</Text>
                  <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">Koku: {lastNightData.fragrance}</Text>
                  <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">Ses: {lastNightData.sound}</Text>
                  <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">Süre: {lastNightData.duration}</Text>
                </View>
              </View>
              <Text style={styles.notificationFooter} numberOfLines={1} ellipsizeMode="tail">
                Detayları görüntülemek için dokunun
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Z-Score Göstergesi */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: Animated.multiply(slideAnim, 1.8)}]
          }}
        >
          <View style={styles.zScoreContainer}>
            <LinearGradient
              colors={['#283593', '#1a237e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.zScoreGradient}
            >
              <View style={styles.zScoreHeader}>
                <View style={styles.zScoreTitleContainer}>
                <View style={styles.zRow}>
                  <View style={styles.zStack}>
                  <Text style={[styles.zLetter, { fontSize: 48, left: 0 }]}>Z</Text>
                  <Text style={[styles.zLetter, { fontSize: 34, left: 28 }]}>z</Text>
                  <Text style={[styles.zLetter, { fontSize: 22, left: 45 }]}>z</Text>
                </View>
                <Text style={styles.zScoreTitle} numberOfLines={1} ellipsizeMode="tail">Skoru</Text>
                </View>
                </View>
                <TouchableOpacity onPress={() => setShowZzzInfoModal(true)}>
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
                      <Text style={styles.zScoreLabel} numberOfLines={1} ellipsizeMode="tail">Z-Skor</Text>
                    </View>
                  )}
                </AnimatedCircularProgress>
                
                <View style={styles.zScoreDetails}>
                  <Text style={styles.zScoreMessage} numberOfLines={1} ellipsizeMode="tail">
                    {getZScoreMessage(zScore)}
                  </Text>
                  <Text style={styles.zScoreDescription} numberOfLines={2} ellipsizeMode="tail">
                    Uyku kaliteniz ortalamanın üzerinde. Böyle devam edin!
                  </Text>
                </View>
              </View>

              <View style={styles.zScoreStats}>
                <View style={styles.zScoreStat}>
                  <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">REM</Text>
                  <Text style={styles.zScoreStatValue}>25%</Text>
                </View>
                <View style={styles.zScoreStat}>
                  <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">Derin Uyku</Text>
                  <Text style={styles.zScoreStatValue}>35%</Text>
                </View>
                <View style={styles.zScoreStat}>
                  <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">Hafif Uyku</Text>
                  <Text style={styles.zScoreStatValue}>40%</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Günlük Özet */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">Günlük Özet</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Ionicons name="moon" size={24} color="#4a90e2" />
              <Text style={styles.summaryValue}>7.5</Text>
              <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Uyku Süresi</Text>
              <Text style={styles.summaryUnit} numberOfLines={1} ellipsizeMode="tail">saat</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="heart" size={24} color="#e74c3c" />
              <Text style={styles.summaryValue}>68</Text>
              <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Ort. Nabız</Text>
              <Text style={styles.summaryUnit} numberOfLines={1} ellipsizeMode="tail">BPM</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="bed" size={24} color="#2ecc71" />
              <Text style={styles.summaryValue}>92%</Text>
              <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Verimlilik</Text>
              <Text style={styles.summaryUnit} numberOfLines={1} ellipsizeMode="tail">oran</Text>
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
                    height={Platform.OS === 'ios' ? 220 : 200}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withInnerLines={Platform.OS === 'ios'}
                    withOuterLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={true}
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

      {/* ZzZ Skor Bilgi Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showZzzInfoModal}
        onRequestClose={() => setShowZzzInfoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ZzZ-Skoru Nedir?</Text>
              <TouchableOpacity onPress={() => setShowZzzInfoModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.infoSection}>
                <Text style={styles.infoHeader}>Bilimsel Uyku Kalite Puanı</Text>
                <Text style={styles.infoText}>
                  ZzZ-Skoru, uyku kalitenizi 0-100 arasında değerlendiren, çeşitli sağlık verilerini kullanan gelişmiş bir ölçüm sistemidir.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoHeader}>Hesaplama Formülü</Text>
                <Text style={styles.infoText}>
                  ZzZ-Skoru, aşağıdaki faktörlerden oluşan bir algoritma kullanır:
                </Text>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>Uyku Süresi (20p): İdeal 7-8 saat</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>Uyku Verimliliği (15p): %85+ verimlilik</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>Derin Uyku Oranı (15p): İdeal %20-25</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>REM Uyku Oranı (15p): İdeal %20-25</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>Dinlenme Kalp Hızı (10p): İdeal 60 bpm altı</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>Stres Seviyesi (10p): Düşük stres daha iyi</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>Kalp Atış Değişkenliği (5p): Yüksek HRV daha iyi</Text>
                  </View>
                </View>
                <Text style={styles.infoText}>
                  Baz skor 70 puan olup, her faktör kendi ağırlığıyla katkıda bulunur. Formülün bilimsel temelleri güncel uyku ve sağlık araştırmalarına dayanmaktadır.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoHeader}>Skor Yorumlaması</Text>
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreIndicator, { backgroundColor: '#2ecc71' }]} />
                  <Text style={styles.scoreText}>80-100: Mükemmel uyku kalitesi</Text>
                </View>
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreIndicator, { backgroundColor: '#f1c40f' }]} />
                  <Text style={styles.scoreText}>60-79: İyi uyku kalitesi</Text>
                </View>
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreIndicator, { backgroundColor: '#e74c3c' }]} />
                  <Text style={styles.scoreText}>0-59: Geliştirilebilir uyku kalitesi</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowZzzInfoModal(false)}
              >
                <Text style={styles.closeButtonText}>Anladım</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaViewContext>
  );
};

export default HomeScreen;