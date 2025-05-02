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
import { SafeAreaView } from 'react-native-safe-area-context';
import Auth  from 'aws-amplify';
import styles from '../styles/HealthDataScreenStyles';
import { HealthData } from '../types/health';
import HealthDataService from '../services/HealthDataService';

// Görünüm bileşenlerini içe aktar
import DailyHealthView from '../components/health/DailyHealthView';
import WeeklyHealthView from '../components/health/WeeklyHealthView';
import MonthlyHealthView from '../components/health/MonthlyHealthView';
import SleepDetailView from '../components/health/SleepDetailView';

type HealthDataScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Zaman aralığı tipi
type TimeRange = 'day' | 'week' | 'month';

// View tipi
type ViewType = 'overview' | 'sleep';

const HealthDataScreen = () => {
  const navigation = useNavigation<HealthDataScreenNavigationProp>();
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] = useState(false);
  const [isHealthConnectInstalled, setIsHealthConnectInstalled] = useState<boolean | null>(null);
  const [isHealthKitAvailable, setIsHealthKitAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [viewType, setViewType] = useState<ViewType>('overview');
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Zaman sekmesi animasyonu
  const tabTranslateX = useRef(new Animated.Value(0)).current;
  const tabWidth = Dimensions.get('window').width / 3 - 20;
  
  // Görünüm tipi animasyonu
  const viewTabTranslateX = useRef(new Animated.Value(0)).current;
  const viewTabWidth = Dimensions.get('window').width / 4 - 20;

  // Tab değişimi için referans
  const lastTabChangeTime = useRef<number>(0);
  const tabChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Görünüm değişimi için referans
  const lastViewChangeTime = useRef<number>(0);
  const viewChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const checkConfig = async () => {
      // AWS yapılandırmasını ve auth durumunu kontrol et
      await HealthDataService.checkConfigAndAuth();
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
      // Temizlik işlemleri
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
      if (viewChangeTimeoutRef.current) {
        clearTimeout(viewChangeTimeoutRef.current);
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
  
  // Görünüm değişiminde animasyon
  useEffect(() => {
    let position = 0;
    if (viewType === 'sleep') position = 1;
    
    Animated.spring(viewTabTranslateX, {
      toValue: position * viewTabWidth,
      friction: 8,
      tension: 80,
      useNativeDriver: true
    }).start();
  }, [viewType, viewTabTranslateX, viewTabWidth]);

  const showHealthConnectPermissionModal = () => {
    setIsPermissionModalVisible(true);
  };

  const hideHealthConnectPermissionModal = () => {
    setIsPermissionModalVisible(false);
  };

  const checkHealthConnectAvailability = async () => {
    if (Platform.OS !== 'android') {
      setIsHealthConnectAvailable(false);
      setIsHealthConnectInstalled(false);
      return;
    }

    try {
      console.log('Health Connect yüklü mü kontrolü başlatılıyor...');
      
      const installed = await HealthConnectService.isInstalled();
      console.log('Health Connect yüklü durumu:', installed);
      
      setIsHealthConnectInstalled(installed);
      
      if (!installed) {
        console.log('Health Connect yüklü değil, yükleme ekranı gösteriliyor');
        setIsHealthConnectAvailable(false);
        Alert.alert(
          'Health Connect Gerekli',
          'Sağlık verilerinizi görüntülemek için Health Connect uygulamasını yüklemeniz gerekiyor.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Yükle', onPress: () => openHealthConnectPlayStore() }
          ]
        );
        return;
      }
      
      console.log('Health Connect yüklü, servisi başlatmaya çalışılıyor...');
      const isAvailable = await HealthConnectService.initialize();
      console.log('Health Connect başlatma sonucu:', isAvailable);
      
      if (isAvailable) {
        setIsHealthConnectAvailable(true);
        // İzinleri kontrol et
        const hasPermissions = await HealthConnectService.checkPermissionsAlreadyGranted();
        if (!hasPermissions) {
          console.log('Health Connect izinleri eksik, izin isteniyor...');
          await connectToHealthConnect();
        }
      } else {
        console.log('Health Connect servisi başlatılamadı');
        setIsHealthConnectAvailable(false);
      }
    } catch (error) {
      console.error('Health Connect kontrolü sırasında hata:', error);
      setIsHealthConnectAvailable(false);
    }
  };

  const openHealthConnectPlayStore = async () => {
    try {
      const url = 'market://details?id=com.google.android.apps.healthdata';
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata');
      }
    } catch (error) {
      console.error('Health Connect Play Store açma hatası:', error);
      Alert.alert('Hata', 'Health Connect Play Store sayfası açılamadı.');
    }
  };

  const handleHealthConnectAccess = async () => {
    if (Platform.OS === 'android') {
      if (isHealthConnectInstalled) {
        try {
          const isAvailable = await HealthConnectService.initialize();
          setIsHealthConnectAvailable(isAvailable);
          
          if (isAvailable) {
            // İzinler kontrolü
            const hasPermissions = await HealthConnectService.checkPermissionsAlreadyGranted();
            if (!hasPermissions) {
              showHealthConnectPermissionModal();
            }
          } else {
            console.log('Health Connect servisi başlatılamadı, izinler isteniyor...');
            showHealthConnectPermissionModal();
          }
        } catch (error) {
          console.error('Health Connect erişimi sırasında hata:', error);
        }
      } else {
        Alert.alert(
          'Health Connect Gerekli',
          'Sağlık verilerinizi görüntülemek için Health Connect uygulamasını yüklemeniz gerekiyor.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Yükle', onPress: () => openHealthConnectPlayStore() }
          ]
        );
      }
    } else if (Platform.OS === 'ios') {
      // iOS için HealthKit'i başlat
      initializeHealthKit();
    }
  };

  const connectToHealthConnect = async () => {
    if (Platform.OS !== 'android') return;
    
    try {
      console.log('Health Connect izinleri isteniyor...');
      const granted = await HealthConnectService.requestPermissions();
      console.log('Health Connect izinleri verildi mi:', granted);
      
      if (granted) {
        console.log('Health Connect izinleri verildi, servisi kullanmaya başlayabiliriz');
        setIsHealthConnectAvailable(true);
      } else {
        console.log('Health Connect izinleri reddedildi');
        setIsHealthConnectAvailable(false);
        Alert.alert(
          'İzinler Gerekli',
          'Sağlık verilerinizi görüntülemek için gerekli izinleri vermeniz gerekiyor.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { 
              text: 'İzinleri Yönet', 
              onPress: () => HealthConnectService.openHealthConnectApp() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Health Connect bağlantısı sırasında hata:', error);
      setIsHealthConnectAvailable(false);
      Alert.alert(
        'Bağlantı Hatası',
        'Health Connect servisine bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } finally {
      hideHealthConnectPermissionModal();
    }
  };

  const initializeHealthKit = async () => {
    try {
      console.log('HealthKit kullanılabilirliği kontrol ediliyor...');
      const isAvailable = await HealthKitService.initialize();
      
      if (!isAvailable) {
        console.log('HealthKit bu cihazda kullanılamıyor');
        setIsHealthKitAvailable(false);
        Alert.alert(
          'HealthKit Kullanılamıyor',
          'Sağlık verilerinizi görüntülemek için HealthKit gereklidir, ancak bu cihazda kullanılamıyor.',
          [{ text: 'Tamam', style: 'default' }]
        );
        return;
      }
      
      console.log('HealthKit başlatılıyor...');
      const initialized = await HealthKitService.initialize();
      
      if (initialized) {
        console.log('HealthKit başarıyla başlatıldı');
        setIsHealthKitAvailable(true);
      } else {
        console.log('HealthKit başlatılamadı veya izinler reddedildi');
        setIsHealthKitAvailable(false);
        Alert.alert(
          'HealthKit İzinleri',
          'Sağlık verilerinize erişebilmek için Sağlık uygulamasında izin vermeniz gerekiyor.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { 
              text: 'Ayarlar', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('x-apple-health://'); // Sağlık uygulamasını aç
                }
              } 
            }
          ]
        );
      }
    } catch (error) {
      console.error('HealthKit başlatma hatası:', error);
      setIsHealthKitAvailable(false);
    }
  };

  // Zaman aralığı değişimini debounce ile yönet
  const changeTimeRange = (newRange: TimeRange) => {
    if (newRange === timeRange) return; // Aynı sekmeye tıklandıysa işlem yapma
    
    const now = Date.now();
    
    // Son sekme değişiminden bu yana 300ms geçti mi kontrol et
    if (now - lastTabChangeTime.current < 300) {
      console.log('Çok hızlı sekme değişimi engellendi');
      
      // Önceki zamanlayıcıyı temizle
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
      
      // Yeni bir zamanlayıcı başlat
      tabChangeTimeoutRef.current = setTimeout(() => {
        setTimeRange(newRange);
        lastTabChangeTime.current = Date.now();
      }, 300);
      
      return;
    }
    
    // Normal sekme değişimi
    setTimeRange(newRange);
    lastTabChangeTime.current = now;
  };
  
  // Görünüm tipini değiştir
  const changeViewType = (newViewType: ViewType) => {
    if (newViewType === viewType) return; // Aynı sekmeye tıklandıysa işlem yapma
    
    const now = Date.now();
    
    // Son görünüm değişiminden bu yana 300ms geçti mi kontrol et
    if (now - lastViewChangeTime.current < 300) {
      console.log('Çok hızlı görünüm değişimi engellendi');
      
      // Önceki zamanlayıcıyı temizle
      if (viewChangeTimeoutRef.current) {
        clearTimeout(viewChangeTimeoutRef.current);
      }
      
      // Yeni bir zamanlayıcı başlat
      viewChangeTimeoutRef.current = setTimeout(() => {
        setViewType(newViewType);
        lastViewChangeTime.current = Date.now();
      }, 300);
      
      return;
    }
    
    // Normal görünüm değişimi
    setViewType(newViewType);
    lastViewChangeTime.current = now;
  };

  // Sağlık verilerini yükleme işlemi tamamlandığında çağrılacak callback
  const handleDataLoaded = useCallback((data: HealthData) => {
    setHealthData(data);
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Sağlık Verilerim</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Görünüm tipi seçici */}
        <Animated.View style={[
          styles.viewTypeTabs,
          {
            opacity: fadeAnim,
            transform: [{translateY: Animated.multiply(slideAnim, 1.05)}]
          }
        ]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
            {[
              { type: 'overview', icon: 'grid-outline', label: 'Genel' },
              { type: 'sleep', icon: 'moon-outline', label: 'Uyku' }
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.viewTypeOption,
                  viewType === item.type && styles.selectedViewType
                ]}
                onPress={() => changeViewType(item.type as ViewType)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={18} 
                  color={viewType === item.type ? '#4a90e2' : '#aaa'} 
                />
                <Text style={[
                  styles.viewTypeText,
                  {color: viewType === item.type ? '#fff' : '#aaa'}
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Kaydırıcı çubuk animasyonu */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                height: 3,
                width: viewTabWidth,
                backgroundColor: '#4a90e2',
                borderRadius: 3,
                transform: [{ translateX: viewTabTranslateX }]
              }
            ]}
          />
        </Animated.View>

        {/* Zaman aralığı seçici - Sadece genel bakış görünümünde göster */}
        {viewType === 'overview' && (
          <Animated.View style={[
            styles.timeRangeSelector,
            {
              opacity: fadeAnim,
              transform: [{translateY: Animated.multiply(slideAnim, 1.1)}]
            }
          ]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%'}}>
              {['day', 'week', 'month'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeOption,
                    timeRange === range && styles.selectedTimeRange
                  ]}
                  onPress={() => changeTimeRange(range as TimeRange)}
                >
                  <Text style={[
                    {color: timeRange === range ? '#fff' : '#aaa', fontSize: 14},
                    timeRange === range && styles.selectedTimeRangeText
                  ]}>
                    {range === 'day' ? 'Gün' : range === 'week' ? 'Hafta' : 'Ay'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Kaydırıcı çubuk animasyonu */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 0,
                  height: 3,
                  width: tabWidth,
                  backgroundColor: '#4a90e2',
                  borderRadius: 3,
                  transform: [{ translateX: tabTranslateX }]
                }
              ]}
            />
          </Animated.View>
        )}

        {/* Seçilen görünüm tipi ve zaman aralığına göre içerik */}
        <View style={styles.content}>
          {/* Genel Bakış Görünümü */}
          {viewType === 'overview' && (
            <>
              {timeRange === 'day' && (
                <DailyHealthView 
                  isActive={timeRange === 'day' && viewType === 'overview'}
                  onDataLoaded={handleDataLoaded}
                />
              )}
              
              {timeRange === 'week' && (
                <WeeklyHealthView 
                  isActive={timeRange === 'week' && viewType === 'overview'}
                  onDataLoaded={handleDataLoaded}
                />
              )}
              
              {timeRange === 'month' && (
                <MonthlyHealthView 
                  onError={(error) => console.error('Aylık görünüm hatası:', error)}
                />
              )}
            </>
          )}
          
          {/* Uyku Görünümü */}
          {viewType === 'sleep' && (
            <SleepDetailView 
              sleepData={healthData?.sleep} 
              loading={loading}
            />
          )}
        </View>
      </View>

      {/* Health Connect izin modal'ı */}
      <Modal
        visible={isPermissionModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Health Connect İzinleri</Text>
            <Text style={styles.modalText}>
              Sağlık verilerinizi görüntülemek için Health Connect uygulamasında izin vermeniz gerekiyor.
            </Text>
            <Text style={styles.modalSteps}>
              1. "İzinlere Git" butonuna dokunun{'\n'}
              2. Health Connect uygulamasında "İzin Ver" seçeneğini seçin{'\n'}
              3. İzinleri vererek uygulamaya dönün
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={hideHealthConnectPermissionModal}
              >
                <Text style={styles.modalButtonText}>Daha Sonra</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]} 
                onPress={() => {
                  hideHealthConnectPermissionModal();
                  HealthConnectService.requestPermissions();
                }}
              >
                <Text style={styles.modalButtonText}>İzinlere Git</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HealthDataScreen;
