import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
  Modal,
  Linking,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import HealthConnectService from '../services/HealthConnectService';
import HealthKitService from '../services/HealthKitService';
import healthDataQueryService from '../services/HealthDataQueryService';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/HealthDataScreenStyles';
import { HealthData } from '../types/health';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setTimeRange, 
  syncHealthData, 
  fetchDailyHealthData,
  fetchWeeklyHealthData,
  fetchMonthlyHealthData 
} from '../store/slices/healthSlice';
import { setPermissionModalVisible } from '../store/slices/uiSlice';

// Görünüm bileşenlerini içe aktar
import DailyHealthView from '../components/health/DailyHealthView';
import WeeklyHealthView from '../components/health/WeeklyHealthView';
import MonthlyHealthView from '../components/health/MonthlyHealthView';

type HealthDataScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HealthDataScreen = () => {
  const navigation = useNavigation<HealthDataScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { 
    timeRange, 
    dailyData, 
    weeklyData, 
    monthlyData, 
    dailyLoading, 
    weeklyLoading, 
    monthlyLoading,
    isSyncing,
    lastSync 
  } = useAppSelector((state) => state.health);
  
  const { isPermissionModalVisible } = useAppSelector((state) => state.ui);
  
  // Local state
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] = useState(false);
  const [isHealthConnectInstalled, setIsHealthConnectInstalled] = useState<boolean | null>(null);
  const [isHealthKitAvailable, setIsHealthKitAvailable] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Zaman sekmesi animasyonu
  const tabTranslateX = useRef(new Animated.Value(0)).current;
  const tabWidth = Dimensions.get('window').width / 3 - 20;

  // Tab değişimi için referans
  const lastTabChangeTime = useRef<number>(0);
  const tabChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const checkConfig = async () => {
      console.log('AWS config kontrolü yapılıyor...');
    };
    
    checkConfig();
    
    // Sağlık servisleri kontrolü
    if (Platform.OS === 'android') {
      checkHealthConnectAvailability();
    } else if (Platform.OS === 'ios') {
      initializeHealthKit();
    }
    
    // Animasyonları başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
    };
  }, []);

  // Sekme değişiminde animasyon
  useEffect(() => {
    let position = 0;
    if (timeRange === 'week') position = 1;
    else if (timeRange === 'month') position = 2;
    
    Animated.spring(tabTranslateX, {
      toValue: position * tabWidth,
      friction: 8,
      tension: 80,
      useNativeDriver: true
    }).start();
  }, [timeRange, tabTranslateX, tabWidth]);

  // Zaman aralığı değiştiğinde veri çek
  useEffect(() => {
    const fetchData = async () => {
      const currentDate = new Date();
      
      try {
        if (timeRange === 'day') {
          console.log('📅 Günlük veri çekiliyor...');
          await dispatch(fetchDailyHealthData(currentDate)).unwrap();
        } else if (timeRange === 'week') {
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - 7);
          const weekEnd = currentDate;
          
          console.log('📅 Haftalık veri çekiliyor...');
          await dispatch(fetchWeeklyHealthData({ startDate: weekStart, endDate: weekEnd })).unwrap();
        } else if (timeRange === 'month') {
          const monthStart = new Date(currentDate);
          monthStart.setDate(currentDate.getDate() - 30);
          const monthEnd = currentDate;
          
          console.log('📅 Aylık veri çekiliyor...');
          await dispatch(fetchMonthlyHealthData({ startDate: monthStart, endDate: monthEnd })).unwrap();
        }
      } catch (error) {
        console.error('❌ Veri çekme hatası:', error);
      }
    };

    fetchData();
  }, [timeRange, dispatch]);

  const showHealthConnectPermissionModal = () => {
    dispatch(setPermissionModalVisible(true));
  };

  const hideHealthConnectPermissionModal = () => {
    dispatch(setPermissionModalVisible(false));
  };

  const checkHealthConnectAvailability = async () => {
     try {
       // Basit kontrol - gerçek implementasyon sonra eklenecek
       console.log('Health Connect kontrolü yapılıyor...');
        setIsHealthConnectAvailable(true);
       setIsHealthConnectInstalled(true);
    } catch (error) {
       console.error('Health Connect kontrol hatası:', error);
    }
  };

  const initializeHealthKit = async () => {
    try {
       // Basit kontrol - gerçek implementasyon sonra eklenecek
       console.log('HealthKit kontrolü yapılıyor...');
        setIsHealthKitAvailable(true);
    } catch (error) {
      console.error('HealthKit başlatma hatası:', error);
    }
  };

  // Zaman aralığı değişimini debounce ile yönet
  const changeTimeRange = (newRange: 'day' | 'week' | 'month') => {
    if (newRange === timeRange) return;
    
    const now = Date.now();
    
    if (now - lastTabChangeTime.current < 300) {
      console.log('Çok hızlı sekme değişimi engellendi');
      
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
      
      tabChangeTimeoutRef.current = setTimeout(() => {
        dispatch(setTimeRange(newRange));
        lastTabChangeTime.current = Date.now();
      }, 300);
      
      return;
    }
    
    dispatch(setTimeRange(newRange));
    lastTabChangeTime.current = now;
  };

  // Sağlık verilerini yükleme işlemi tamamlandığında çağrılacak callback
  const handleDataLoaded = useCallback((data: HealthData) => {
    console.log('Data loaded:', data);
  }, []);

  /**
   * Manuel AWS senkronizasyonu - Redux ile
   */
  const handleManualSync = async () => {
    if (isSyncing) return; // Zaten senkronizasyon yapılıyorsa çık
    
    try {
      console.log('🔄 Manuel AWS senkronizasyonu başlatılıyor...');
      
      // Mevcut sağlık verisini al (bugün için)
      let currentData: HealthData | null;
      
      if (timeRange === 'day') {
        currentData = dailyData;
      } else if (timeRange === 'week') {
        currentData = weeklyData;
      } else {
        currentData = monthlyData;
      }
      
      if (!currentData || (!currentData.heartRate.values.length && !currentData.steps.total)) {
        Alert.alert(
          'Veri Yok',
          'Senkronize edilecek sağlık verisi bulunamadı. Önce sağlık verilerini alın.',
          [{ text: 'Tamam' }]
        );
        return;
      }
      
      console.log('📊 Senkronize edilecek veri:', {
        heartRate: currentData.heartRate.average,
        steps: currentData.steps.total,
        calories: currentData.calories.total,
        oxygen: currentData.oxygen.average,
        sleepDuration: currentData.sleep.duration
      });
      
      // Redux action ile senkronize et
      const resultAction = await dispatch(syncHealthData(currentData));
      
      if (syncHealthData.fulfilled.match(resultAction)) {
        Alert.alert(
          '✅ Senkronizasyon Başarılı',
          'Sağlık verileriniz AWS\'e başarıyla kaydedildi.',
          [{ text: 'Tamam' }]
        );
        console.log('✅ AWS senkronizasyonu başarılı:', resultAction.payload);
      } else {
        const errorMessage = resultAction.payload as string;
        Alert.alert(
          '❌ Senkronizasyon Başarısız',
          `Hata: ${errorMessage}`,
          [{ text: 'Tamam' }]
        );
        console.error('❌ AWS senkronizasyon hatası:', errorMessage);
      }
      
    } catch (error) {
      console.error('❌ Manuel senkronizasyon hatası:', error);
      Alert.alert(
        '❌ Hata',
        'Senkronizasyon sırasında beklenmeyen bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
    }
  };

  /**
   * Kullanıcının AWS'deki verilerini görüntüle
   */
  const handleViewUserData = async () => {
    try {
      console.log('📊 AWS verileri getiriliyor...');
      
      // HealthDataQueryService ile kullanıcının verilerini al
      const userHealthData = await healthDataQueryService.getUserHealthData();
      
      if (userHealthData && userHealthData.length > 0) {
        console.log('📊 AWS\'den alınan veri sayısı:', userHealthData.length);
        
        // En son kaydı göster
        const latestRecord = userHealthData[0];
        const recordDate = latestRecord.tarih || 'Bilinmiyor';
        const heartRateCount = latestRecord.nabiz?.length || 0;
        const stepsCount = latestRecord.adim?.length || 0;
        const sleepCount = latestRecord.uyku?.length || 0;
      
      Alert.alert(
          '📊 AWS Verileriniz',
          `Toplam kayıt: ${userHealthData.length}\n\nEn son kayıt (${recordDate}):\n• Nabız ölçümü: ${heartRateCount}\n• Adım kayıtları: ${stepsCount}\n• Uyku kayıtları: ${sleepCount}`,
          [
          { 
              text: 'Detaylı Log',
              onPress: () => {
                console.log('📋 AWS kullanıcı verileri:', userHealthData);
              }
            },
            { text: 'Tamam' }
          ]
                    );
                  } else {
                    Alert.alert(
          '📊 AWS Verileriniz',
          'Henüz AWS\'e senkronize edilmiş veri bulunamadı.\n\nSenkronizasyon yapmak için sağ üstteki sync butonunu kullanın.',
          [{ text: 'Tamam' }]
      );
      }
      
    } catch (error) {
      console.error('❌ AWS veri görüntüleme hatası:', error);
      Alert.alert(
        '❌ Hata', 
        'AWS verileriniz getirilemedi. Bağlantınızı kontrol edip tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sağlık Verileri</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* AWS Senkronizasyon Butonu */}
            <TouchableOpacity 
              style={[styles.settingsButton, { marginRight: 8 }]} 
              onPress={handleManualSync}
              disabled={isSyncing}
            >
              <Ionicons 
                name={isSyncing ? "sync" : "cloud-upload"} 
                size={20} 
                color={isSyncing ? "#ffa500" : "#4a90e2"} 
              />
            </TouchableOpacity>
            
            {/* Kullanıcı Verilerini Görüntüle Butonu */}
            <TouchableOpacity 
              style={[styles.settingsButton, { marginRight: 8 }]} 
              onPress={handleViewUserData}
            >
              <Ionicons 
                name="analytics" 
                size={20} 
                color="#4a90e2" 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Zaman aralığı seçici */}
        <View style={styles.timeRangeSelector}>
          <TouchableOpacity 
            style={[
              styles.timeRangeOption, 
              timeRange === 'day' && { backgroundColor: '#4a90e2' }
            ]}
            onPress={() => changeTimeRange('day')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'day' && { color: '#fff' }]}>
              Günlük
            </Text>
          </TouchableOpacity>
          
              <TouchableOpacity
                style={[
                  styles.timeRangeOption,
              timeRange === 'week' && { backgroundColor: '#4a90e2' }
                ]}
            onPress={() => changeTimeRange('week')}
              >
            <Text style={[styles.timeRangeText, timeRange === 'week' && { color: '#fff' }]}>
              Haftalık
                </Text>
              </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.timeRangeOption, 
              timeRange === 'month' && { backgroundColor: '#4a90e2' }
            ]}
            onPress={() => changeTimeRange('month')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'month' && { color: '#fff' }]}>
              Aylık
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {timeRange === 'day' && (
            <DailyHealthView 
              isActive={timeRange === 'day'}
              onDataLoaded={handleDataLoaded}
            />
          )}
          
          {timeRange === 'week' && (
            <WeeklyHealthView 
              isActive={timeRange === 'week'}
              onDataLoaded={handleDataLoaded}
            />
          )}
          
          {timeRange === 'month' && (
            <MonthlyHealthView 
              onError={(error) => console.error('Aylık görünüm hatası:', error)}
            />
          )}
        </View>
      </Animated.View>

      {/* Health Connect izin modal'ı */}
      <Modal
        visible={isPermissionModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Health Connect Gerekli</Text>
            <Text style={styles.modalText}>
              Sağlık verilerinizi okuyabilmek için Health Connect uygulamasının yüklü olması gerekiyor.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  hideHealthConnectPermissionModal();
                  Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata');
                }}
              >
                <Text style={styles.modalButtonText}>Health Connect'i Yükle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4a90e2' }]}
                onPress={hideHealthConnectPermissionModal}
              >
                <Text style={[styles.modalButtonText, { color: '#4a90e2' }]}>
                  Daha Sonra
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HealthDataScreen;