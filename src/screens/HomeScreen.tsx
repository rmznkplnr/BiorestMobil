import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, StatusBar, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import HealthConnectService from '../services/HealthConnectService';
import HealthDataQueryService from '../services/HealthDataQueryService';
import { styles } from '../styles/HomeScreenStyles';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setShowZzzInfoModal, setCalculatingScore } from '../store/slices/uiSlice';
import { fetchDailyHealthData } from '../store/slices/healthSlice';


type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { showZzzInfoModal, calculatingScore } = useAppSelector((state) => state.ui);
  const { dailyData: healthData } = useAppSelector((state) => state.health);
  
  // Local state
  const [realZScore, setRealZScore] = useState<number>(85);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Health Connect'ten bugünün verilerini al ve Z-skoru hesapla
  useEffect(() => {
    const fetchTodayHealthData = async () => {
      try {
        setLoading(true);
        console.log('📊 Bugünün Health Connect verileri getiriliyor...');
        
        // Redux'tan bugünün verilerini çek
            const today = new Date();
        await dispatch(fetchDailyHealthData(today));
        
        console.log('✅ Health Connect verileri Redux\'a yüklendi');
      } catch (error) {
        console.error('❌ Health Connect verileri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayHealthData();
  }, [dispatch]);

  // Redux'taki sağlık verilerini izle ve Z-skoru hesapla
  useEffect(() => {
    if (healthData && healthData.sleep) {
      console.log('🛌 Redux\'taki uyku verisi ile Z-skor hesaplanıyor...');
      
      // Redux verilerini Z-skor hesaplama formatına dönüştür
      const sleepDataForCalculation = {
        toplam: healthData.sleep.duration || 0,
        derin: healthData.sleep.deep || 0,
        rem: healthData.sleep.rem || 0,
        hafif: healthData.sleep.light || 0
      };
      
      // Z skoru hesapla
      const calculatedZScore = calculateZScore(sleepDataForCalculation);
      setRealZScore(calculatedZScore);
      
      console.log('✅ Z-skor güncellendi:', {
        toplam: sleepDataForCalculation.toplam,
        derin: sleepDataForCalculation.derin,
        rem: sleepDataForCalculation.rem,
        hafif: sleepDataForCalculation.hafif,
        zScore: calculatedZScore
      });
    }
  }, [healthData]);

  

  // Z skoru hesaplama fonksiyonu (GERÇEKÇİ ALGORİTMA)
  const calculateZScore = (sleepData: any): number => {
    if (!sleepData || !sleepData.toplam) return 0;
    
    const { toplam, derin, rem, hafif } = sleepData;
    const totalMinutes = toplam;
    const totalHours = totalMinutes / 60;
    
    let score = 0; // Baz skor düşürüldü
    
    // 📊 Uyku süresi (50 puan) - EN ÖNEMLİ FAKTÖR!
    if (totalHours >= 7 && totalHours <= 8.5) {
      score += 50; // Mükemmel süre
    } else if (totalHours >= 6.5 && totalHours < 7) {
      score += 40; // İyi süre
    } else if (totalHours >= 6 && totalHours < 6.5) {
      score += 30; // Orta süre  
    } else if (totalHours >= 5 && totalHours < 6) {
      score += 20; // Kısa süre
    } else if (totalHours >= 4 && totalHours < 5) {
      score += 10; // Çok kısa
    } else if (totalHours >= 8.5 && totalHours <= 9.5) {
      score += 35; // Biraz uzun ama kabul edilebilir
    } else {
      score += 5; // Çok kısa veya çok uzun
    }
    
    // 🧠 Derin uyku oranı (25 puan) - Kalite için önemli
    const deepPercent = (derin / totalMinutes) * 100;
    if (deepPercent >= 18 && deepPercent <= 25) {
      score += 25; // İdeal derin uyku
    } else if (deepPercent >= 15 && deepPercent < 18) {
      score += 20; // İyi derin uyku
    } else if (deepPercent >= 12 && deepPercent < 15) {
      score += 15; // Orta derin uyku
    } else if (deepPercent >= 8 && deepPercent < 12) {
      score += 10; // Az derin uyku
    } else if (deepPercent >= 5 && deepPercent < 8) {
      score += 5; // Çok az derin uyku
    }
    
    // 🌙 REM uyku oranı (25 puan) - Mental dinlenme
    const remPercent = (rem / totalMinutes) * 100;
    if (remPercent >= 18 && remPercent <= 25) {
      score += 25; // İdeal REM
    } else if (remPercent >= 15 && remPercent < 18) {
      score += 20; // İyi REM
    } else if (remPercent >= 12 && remPercent < 15) {
      score += 15; // Orta REM
    } else if (remPercent >= 8 && remPercent < 12) {
      score += 10; // Az REM
    } else if (remPercent >= 5 && remPercent < 8) {
      score += 5; // Çok az REM
    }
    
    // ⚖️ Kısa uyku cezası - 6 saatten az ise ekstra ceza
    if (totalHours < 6) {
      const penaltyMultiplier = Math.max(0.4, (totalHours / 6)); // 6 saatten az olduğunda ceza
      score = Math.round(score * penaltyMultiplier);
      console.log(`⚠️ Kısa uyku cezası: ${totalHours.toFixed(1)} saat için %${((1-penaltyMultiplier)*100).toFixed(0)} ceza`);
    }
    
    console.log(`📊 Uyku Skoru Detayı:
    • Süre: ${totalHours.toFixed(1)}s (${totalHours >= 7 && totalHours <= 8.5 ? '50p' : totalHours >= 5 ? '20p' : '5p'})
    • Derin: %${deepPercent.toFixed(1)} (${deepPercent >= 18 ? '25p' : deepPercent >= 12 ? '15p' : '5p'})
    • REM: %${remPercent.toFixed(1)} (${remPercent >= 18 ? '25p' : remPercent >= 12 ? '15p' : '5p'})
    • Toplam: ${score}/100`);
    
    return Math.min(100, Math.max(0, score));
  };

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

  // Gerçek Z-score değeri kullan
  const zScore = realZScore;

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
    return 'Kötü';
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



        {/* Z-Score Göstergesi - TIKLANABİLİR */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: Animated.multiply(slideAnim, 1.8)}]
          }}
        >
          <TouchableOpacity 
            style={styles.zScoreContainer}
            onPress={() => {
              if (healthData?.sleep) {
                // Health Connect verilerini SleepMetric formatına dönüştür
                const sleepMetric = {
                  status: 'good' as const,
                  values: [healthData.sleep.duration || 0],
                  times: [new Date().toISOString()],
                  lastUpdated: healthData.sleep.lastUpdated || new Date().toISOString(),
                  duration: healthData.sleep.duration || 0,
                  efficiency: healthData.sleep.efficiency || realZScore,
                  deep: healthData.sleep.deep || 0,
                  light: healthData.sleep.light || 0,
                  rem: healthData.sleep.rem || 0,
                  awake: healthData.sleep.awake || 0,
                  startTime: healthData.sleep.startTime || new Date().toISOString(),
                  endTime: healthData.sleep.endTime || new Date().toISOString(),
                  totalMinutes: healthData.sleep.duration || 0,
                  stages: healthData.sleep.stages || [],
                  // Uyku nabız verisini ekle
                  sleepHeartRate: healthData.sleep.sleepHeartRate
                };
                navigation.navigate('SleepDetailsScreen', { sleepData: sleepMetric });
              }
            }}
            activeOpacity={0.9}
          >
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
                <TouchableOpacity onPress={() => dispatch(setShowZzzInfoModal(true))}>
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
                  <Text style={styles.zScoreDescription} numberOfLines={3} ellipsizeMode="tail">
                    {healthData?.sleep?.duration 
                      ? `Son uykunuz: ${Math.floor(healthData.sleep.duration / 60)}s ${healthData.sleep.duration % 60}dk. ${getZScoreMessage(zScore)} kalitede! Detaylı analiz için dokunun.`
                      : 'Uyku veriniz henüz yüklenemedi. Biraz bekleyip tekrar deneyin.'
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.zScoreStats}>
                <View style={styles.zScoreStat}>
                  <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">REM</Text>
                  <Text style={styles.zScoreStatValue}>
                    {healthData?.sleep?.duration && healthData.sleep.duration > 0 
                      ? `${Math.round((healthData.sleep.rem / healthData.sleep.duration) * 100)}%`
                      : '-%'
                    }
                  </Text>
                </View>
                <View style={styles.zScoreStat}>
                  <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">Derin Uyku</Text>
                  <Text style={styles.zScoreStatValue}>
                    {healthData?.sleep?.duration && healthData.sleep.duration > 0 
                      ? `${Math.round((healthData.sleep.deep / healthData.sleep.duration) * 100)}%`
                      : '-%'
                    }
                  </Text>
                </View>
                <View style={styles.zScoreStat}>
                  <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">Hafif Uyku</Text>
                  <Text style={styles.zScoreStatValue}>
                    {healthData?.sleep?.duration && healthData.sleep.duration > 0 
                      ? `${Math.round((healthData.sleep.light / healthData.sleep.duration) * 100)}%`
                      : '-%'
                    }
                  </Text>
                </View>
              </View>

                            {/* Uyku Nabız İstatistikleri ve Grafik - YENİ BÖLÜM */}
              {healthData?.sleep?.sleepHeartRate && (
                <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12 }}>
                  {/* Nabız İstatistikleri */}
                  <View style={styles.zScoreStats}>
                    <View style={styles.zScoreStat}>
                      <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">Uyku Nabız</Text>
                      <Text style={[styles.zScoreStatValue, { color: '#ff6b6b' }]}>
                        {Math.round(healthData.sleep.sleepHeartRate.average)} BPM
                      </Text>
                    </View>
                    <View style={styles.zScoreStat}>
                      <Text style={styles.zScoreStatLabel} numberOfLines={1} ellipsizeMode="tail">Min/Max</Text>
                      <Text style={[styles.zScoreStatValue, { fontSize: 12 }]}>
                        {healthData.sleep.sleepHeartRate.min}-{healthData.sleep.sleepHeartRate.max}
                      </Text>
                    </View>
                  </View>


                </View>
              )}
              
              {/* Tıklama İpucu */}
              <View style={{ paddingHorizontal: 16, paddingBottom: 12, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                  <Ionicons name="analytics-outline" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 6 }}>
                    Detaylı uyku analizi için dokunun
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Günlük Özet */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">Günlük Özet</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Ionicons name="moon" size={24} color="#4a90e2" />
              <Text style={styles.summaryValue}>
                {healthData?.sleep?.duration && healthData.sleep.duration > 0 
                  ? `${Math.floor(healthData.sleep.duration / 60)}s ${healthData.sleep.duration % 60}dk`
                  : '--'
                }
              </Text>
              <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Uyku Süresi</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="heart" size={24} color="#e74c3c" />
              <Text style={styles.summaryValue}>
                {healthData?.heartRate?.average ? Math.round(healthData.heartRate.average) : '--'}
              </Text>
              <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Manuel Nabız</Text>
              <Text style={styles.summaryUnit} numberOfLines={1} ellipsizeMode="tail">BPM</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="water" size={24} color="#2e86de" />
              <Text style={styles.summaryValue}>
                {healthData?.oxygen?.average ? `${Math.round(healthData.oxygen.average)}%` : '--%'}
              </Text>
              <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Kan Oksijeni</Text>
              <Text style={styles.summaryUnit} numberOfLines={1} ellipsizeMode="tail">SpO2</Text>
            </View>
          </View>
        </View>

      
      </ScrollView>



      {/* ZzZ Skor Bilgi Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showZzzInfoModal}
        onRequestClose={() => dispatch(setShowZzzInfoModal(false))}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ZzZ-Skoru Nedir?</Text>
              <TouchableOpacity onPress={() => dispatch(setShowZzzInfoModal(false))}>
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
                  <Text style={styles.scoreText}>0-59: Kötü uyku kalitesi</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => dispatch(setShowZzzInfoModal(false))}
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