import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  GestureResponderEvent,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import HealthConnectService from '../services/HealthConnectService';

import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import SleepChart from '../components/SleepChart';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

type HealthDataScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HealthData {
  heartRate: {
    average: number;
    values: number[];
    times: string[];
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    max: number;
    min: number;
  };
  oxygen: {
    average: number;
    values: number[];
    times: string[];
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    max: number;
    min: number;
  };
  sleep: {
    duration: number;
    efficiency: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
    awakeTime: number; // Uyanık geçirilen zaman (dakika olarak)
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    deep: number;
  };
  stress: {
    average: number;
    values: number[];
    times: string[];
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    category: string;
    count?: number;
  };
  steps: {
    count: number;
    goal: number;
    lastUpdated: string;
  };
  distance: {
    value: number;
    unit: string;
    lastUpdated: string;
  };
  calories: {
    value: number;
    goal: number;
    lastUpdated: string;
  };
}

interface ChartProps {
  data: { labels: string[]; datasets: { data: number[]; color?: (opacity?: number) => string; strokeWidth?: number }[] };
  width: number;
  height: number;
  chartConfig: {
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    decimalPlaces?: number;
    color: (opacity?: number) => string;
    labelColor: (opacity?: number) => string;
    style?: any;
    propsForDots?: any;
    propsForBackgroundLines?: any;
  };
  bezier?: boolean;
  style?: any;
  withDots?: boolean;
  withShadow?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withHorizontalLines?: boolean;
  withVerticalLines?: boolean;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  formatYLabel?: (label: string) => string;
  fromZero?: boolean;
  onDataPointClick?: (data: { value: number; dataset: any; getColor: (opacity: number) => string; index: number; x: number; y: number }) => void;
}

interface SelectedPoint {
  value: number;
  time: string;
  x: number;
  y: number;
  chartType: 'heartRate' | 'oxygen' | 'stress';
  index: number;
}

const HealthDataScreen = () => {
  const navigation = useNavigation<HealthDataScreenNavigationProp>();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] = useState(false);
  const [isHealthConnectInstalled, setIsHealthConnectInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [selectedWeekDay, setSelectedWeekDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  
  // Animasyon değerleri
  const heartRateOpacity = useRef(new Animated.Value(0)).current;
  const oxygenOpacity = useRef(new Animated.Value(0)).current;
  const sleepOpacity = useRef(new Animated.Value(0)).current;
  const stressOpacity = useRef(new Animated.Value(0)).current;
  const stepsOpacity = useRef(new Animated.Value(0)).current;
  const caloriesOpacity = useRef(new Animated.Value(0)).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  // Yeni animasyon değerleri
  const tabTranslateX = useRef(new Animated.Value(0)).current;
  const tabWidth = Dimensions.get('window').width / 3 - 20;

  const screenWidth = Dimensions.get('window').width;

  // Throttling ve debounce için değişkenler ekleyelim
  const [isDataFetching, setIsDataFetching] = useState(false);
  const dataFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const debouncedFetchHealthData = useCallback(() => {
    // İstek zaten yollanmışsa, yeni istek göndermeyi engelle
    if (isDataFetching) {
      console.log('Veri çekme işlemi zaten devam ediyor, yeni istek engellendi');
      return;
    }

    // Son istek zamanını kontrol et (500ms içinde tekrar istek gönderilmesin)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 500) {
      // Eğer önceki timeout varsa temizle
      if (dataFetchTimeoutRef.current) {
        clearTimeout(dataFetchTimeoutRef.current);
      }
      
      // Yeni bir timeout başlat
      console.log('Çok fazla istek engellendi, 500ms sonra tekrar deneyecek');
      dataFetchTimeoutRef.current = setTimeout(() => {
        debouncedFetchHealthData();
      }, 500);
      return;
    }

    // Veri çekme işlemini başlat
    setIsDataFetching(true);
    lastFetchTimeRef.current = now;
    
    fetchHealthData()
      .finally(() => {
        setIsDataFetching(false);
      });
  }, [isDataFetching]);

  const showHealthConnectPermissionModal = () => {
    setIsPermissionModalVisible(true);
  };

  const hideHealthConnectPermissionModal = () => {
    setIsPermissionModalVisible(false);
  };

  useEffect(() => {
    checkHealthConnectAvailability();
    // İzinleri kontrol et
    checkHealthConnectPermissions();
  }, []);

  useEffect(() => {
    if (isHealthConnectAvailable) {
      fetchHealthData();
    }
  }, [timeRange, isHealthConnectAvailable, selectedWeekDay, selectedMonth]);

  useEffect(() => {
    if (healthData) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartRateOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(oxygenOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sleepOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(stressOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(stepsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(caloriesOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [healthData, fadeAnim, heartRateOpacity, oxygenOpacity, sleepOpacity, stressOpacity, stepsOpacity, caloriesOpacity]);

  // Sekmelerdeki animasyon için
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeRange === 'day') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    }
    
    console.log(`Yenileme - Veri aralığı: ${startDate.toISOString()} - ${endDate.toISOString()}`);
    
    setLoading(true);
    
    HealthConnectService.getHealthData(
      startDate.toISOString(),
      endDate.toISOString()
    )
    .then(rawData => {
      if (rawData) {
        console.log('Health Connect\'ten veriler yenilendi:', Object.keys(rawData || {}));
        const processedData = processHealthConnectData(rawData);
        setHealthData(processedData);
      }
    })
    .catch(error => {
      console.error('Yenileme sırasında hata:', error);
    })
    .finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  }, [timeRange]);

  const checkHealthConnectAvailability = async () => {
    if (Platform.OS !== 'android') {
      setIsHealthConnectAvailable(false);
      setIsHealthConnectInstalled(false);
      return;
    }

    try {
      console.log('Health Connect yüklü mü kontrolü başlatılıyor...');
      
      let attempts = 0;
      let installed = false;
      
      while (attempts < 2 && !installed) {
        attempts++;
        console.log(`Health Connect kontrol denemesi: ${attempts}`);
        
        try {
          installed = await HealthConnectService.isInstalled();
          console.log(`Deneme ${attempts} sonucu:`, installed);
        } catch (innerError) {
          console.error(`Deneme ${attempts} hatası:`, innerError);
        }
        
        if (!installed && attempts === 1) {
          console.log('İlk deneme başarısız, 500ms bekleyip tekrar deneniyor...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log('Health Connect yüklü durumu:', installed);
      
      setIsHealthConnectInstalled(installed);
      
      if (!installed) {
        console.log('Health Connect yüklü değil, yükleme ekranı gösteriliyor');
        setIsHealthConnectAvailable(false);
        Alert.alert(
          'Health Connect Gerekli',
          'Sağlık verilerinizi görüntülemek için Health Connect uygulamasını yüklemeniz gerekiyor.',
          [
            { 
              text: 'Vazgeç', 
              style: 'cancel' 
            },
            { 
              text: 'Yükle', 
              onPress: () => openHealthConnectPlayStore() 
            }
          ]
        );
        return;
      }
      
      console.log('Health Connect yüklü, servisi başlatmaya çalışılıyor...');
      const isAvailable = await HealthConnectService.initialize();
      console.log('Health Connect başlatma sonucu:', isAvailable);
      
      setIsHealthConnectAvailable(isAvailable);
      
      if (!isAvailable) {
        console.log('Health Connect servisi başlatılamadı, izinler isteniyor...');
        connectToHealthConnect();
      } else {
        console.log('Health Connect başarıyla başlatıldı, verileri getirmeye hazır');
      }
    } catch (error) {
      console.error('Health Connect kontrolü sırasında hata:', error);
      setIsHealthConnectAvailable(false);
    }
  };

  const openHealthConnectPlayStore = () => {
    HealthConnectService.openHealthConnectInstallation();
  };

  const openHealthConnectApp = () => {
    console.log('Health Connect uygulaması açılıyor...');
    handleHealthConnectAccess();
  };

  const fetchHealthData = async () => {
    try {
      console.log(`${timeRange} için sağlık verileri alınıyor...`);
      
      if (!isHealthConnectAvailable) {
        console.log('Health Connect bağlantısı yok. İzinleri kontrol et.');
        setLoading(false);
        return;
      }
      
      const endDate = new Date();
      let startDate = new Date();
      
      if (timeRange === 'day') {
        startDate.setHours(startDate.getHours() - 24);
      } else if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setDate(startDate.getDate() - 30);
      }
      
      console.log(`Veri aralığı: ${startDate.toISOString()} - ${endDate.toISOString()}`);
      
      // Veri çekme işlemini try-catch bloğu içinde yap
      let rawData = null;
      try {
        rawData = await HealthConnectService.getHealthData(
          startDate.toISOString(),
          endDate.toISOString()
        );
      } catch (sleepError) {
        console.error('Uyku verileri alınırken hata:', sleepError);
      }
        
      if (rawData) {
        console.log('Health Connect\'ten veriler alındı:', Object.keys(rawData || {}));
        const processedData = processHealthConnectData(rawData);
        setHealthData(processedData);
      } else {
        console.error('Health Connect\'ten veri alınamadı');
      }
    } catch (error) {
      console.error('Sağlık verileri alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string, format: 'day' | 'week' | 'month'): string => {
    try {
      const date = new Date(time);
      if (format === 'day') {
        return date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
      } else if (format === 'week') {
        return date.toLocaleDateString('tr-TR', {weekday: 'short'});
      } else {
        return date.toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit'});
      }
    } catch (error) {
      return time;
    }
  };

  const processHealthConnectData = (rawData: any): HealthData => {
    console.log('İşlenecek ham veri:', rawData);
    
    const result: HealthData = {
      heartRate: {
        average: 0,
        values: [],
        times: [],
        lastUpdated: new Date().toISOString(),
        status: 'good',
        max: 0,
        min: 0
      },
      oxygen: {
        average: 0,
        values: [],
        times: [],
        lastUpdated: new Date().toISOString(),
        status: 'good',
        max: 0,
        min: 0
      },
      sleep: {
        duration: 0,
        efficiency: 0,
        deepSleep: 0,
        lightSleep: 0,
        remSleep: 0,
        awakeTime: 0, // Yeni uyanık zaman alanı
        lastUpdated: new Date().toISOString(),
        status: 'good',
        deep: 0
      },
      stress: {
        average: 0,
        values: [],
        times: [],
        lastUpdated: new Date().toISOString(),
        status: 'good',
        category: 'Normal',
        count: 0
      },
      steps: {
        count: 0,
        goal: 10000,
        lastUpdated: new Date().toISOString()
      },
      distance: {
        value: 0,
        unit: 'm',
        lastUpdated: new Date().toISOString()
      },
      calories: {
        value: 0,
        goal: 2000,
        lastUpdated: new Date().toISOString()
      }
    };
    
    if (rawData.heartRate && 
        rawData.heartRate.values && 
        rawData.heartRate.values.length > 0) {
      
      result.heartRate.values = [...rawData.heartRate.values];
      result.heartRate.times = [...rawData.heartRate.times];
      
      if (rawData.heartRate.average !== undefined) {
        result.heartRate.average = rawData.heartRate.average;
      } else if (result.heartRate.values.length > 0) {
        result.heartRate.average = result.heartRate.values.reduce((a, b) => a + b, 0) / result.heartRate.values.length;
      }
      
      if (rawData.heartRate.max !== undefined) {
        result.heartRate.max = rawData.heartRate.max;
      } else if (result.heartRate.values.length > 0) {
        result.heartRate.max = Math.max(...result.heartRate.values);
      }
      
      if (rawData.heartRate.min !== undefined) {
        result.heartRate.min = rawData.heartRate.min;
      } else if (result.heartRate.values.length > 0) {
        result.heartRate.min = Math.min(...result.heartRate.values);
      }
      
      if (rawData.heartRate.lastUpdated) {
        result.heartRate.lastUpdated = rawData.heartRate.lastUpdated;
      } else if (result.heartRate.times.length > 0) {
        result.heartRate.lastUpdated = result.heartRate.times[result.heartRate.times.length - 1];
      }
      
      if (!rawData.heartRate.status) {
        if (result.heartRate.average > 100) {
          result.heartRate.status = 'warning';
        } else if (result.heartRate.average > 120) {
          result.heartRate.status = 'bad';
        } else {
          result.heartRate.status = 'good';
        }
      } else {
        result.heartRate.status = rawData.heartRate.status;
      }
    }
    
    if (rawData.oxygen && 
        rawData.oxygen.values && 
        rawData.oxygen.values.length > 0) {
      
      result.oxygen.values = [...rawData.oxygen.values];
      result.oxygen.times = [...rawData.oxygen.times];
      
      if (rawData.oxygen.average !== undefined) {
        result.oxygen.average = rawData.oxygen.average;
      } else if (result.oxygen.values.length > 0) {
        result.oxygen.average = result.oxygen.values.reduce((a, b) => a + b, 0) / result.oxygen.values.length;
      }
      
      if (result.oxygen.values.length > 0) {
        result.oxygen.max = Math.max(...result.oxygen.values);
        result.oxygen.min = Math.min(...result.oxygen.values);
      }
      
      if (rawData.oxygen.lastUpdated) {
        result.oxygen.lastUpdated = rawData.oxygen.lastUpdated;
      } else if (result.oxygen.times.length > 0) {
        result.oxygen.lastUpdated = result.oxygen.times[result.oxygen.times.length - 1];
      }
      
      if (!rawData.oxygen.status) {
        if (result.oxygen.average < 95) {
          result.oxygen.status = 'warning';
        } else if (result.oxygen.average < 90) {
          result.oxygen.status = 'bad';
        } else {
          result.oxygen.status = 'good';
        }
      } else {
        result.oxygen.status = rawData.oxygen.status || 'good';
      }
    }

    // Uyku verisi işleme kısmını try-catch bloğu içine alalım
    try {
      if (rawData.sleep && rawData.sleep.duration) {
        result.sleep.duration = rawData.sleep.duration || 0;
        result.sleep.efficiency = rawData.sleep.efficiency || 0;
        
        result.sleep.deep = rawData.sleep.deep || 0;
        result.sleep.lightSleep = rawData.sleep.light || 0;
        result.sleep.remSleep = rawData.sleep.rem || 0;
        result.sleep.awakeTime = rawData.sleep.awake || 0; // Uyanık zaman verisini al
        
        result.sleep.deep = rawData.sleep.deep || 0;
        
        if (rawData.sleep.lastUpdated) {
          result.sleep.lastUpdated = rawData.sleep.lastUpdated;
        } else if (rawData.sleep.endTime) {
          result.sleep.lastUpdated = rawData.sleep.endTime;
        }
        
        if (!rawData.sleep.status) {
          if (rawData.sleep.efficiency < 70) {
            result.sleep.status = 'bad';
          } else if (rawData.sleep.efficiency < 85) {
            result.sleep.status = 'warning';
          } else {
            result.sleep.status = 'good';
          }
        } else {
          result.sleep.status = rawData.sleep.status || 'good';
        }
      }
    } catch (error) {
      // Hata loglanır ama kullanıcıya gösterilmez
      console.error('Uyku verileri işlenirken hata:', error);
      
      // Uyku verilerini varsayılan değerlere ayarla
      result.sleep = {
        duration: 0,
        efficiency: 0,
        deepSleep: 0,
        lightSleep: 0,
        remSleep: 0,
        awakeTime: 0,
        lastUpdated: new Date().toISOString(),
        status: 'good',
        deep: 0
      };
    }

    if (rawData.stress && 
        rawData.stress.values && 
        rawData.stress.values.length > 0) {
      
      result.stress.values = [...rawData.stress.values];
      result.stress.times = [...rawData.stress.times];
      
      if (rawData.stress.average !== undefined) {
        result.stress.average = rawData.stress.average;
      } else if (result.stress.values.length > 0) {
        result.stress.average = result.stress.values.reduce((a, b) => a + b, 0) / result.stress.values.length;
      }
      
      result.stress.count = result.stress.values.length;
      
      if (rawData.stress.category) {
        result.stress.category = rawData.stress.category;
      } else {
        const avgStress = result.stress.average;
        if (avgStress < 30) {
          result.stress.category = 'Düşük';
        } else if (avgStress < 60) {
          result.stress.category = 'Normal';
        } else if (avgStress < 80) {
          result.stress.category = 'Yüksek';
        } else {
          result.stress.category = 'Çok Yüksek';
        }
      }
      
      if (!rawData.stress.status) {
        if (result.stress.average > 70) {
          result.stress.status = 'bad';
        } else if (result.stress.average > 50) {
          result.stress.status = 'warning';
        } else {
          result.stress.status = 'good';
        }
      } else {
        result.stress.status = rawData.stress.status;
      }

      if (rawData.stress.lastUpdated) {
        result.stress.lastUpdated = rawData.stress.lastUpdated;
      } else if (result.stress.times.length > 0) {
        result.stress.lastUpdated = result.stress.times[result.stress.times.length - 1];
      }
    }

    if (rawData.steps !== undefined) {
      result.steps.count = rawData.steps;
    }
    
    if (rawData.distance !== undefined) {
      result.distance.value = rawData.distance;
    }
    
    if (rawData.calories !== undefined) {
      result.calories.value = rawData.calories;
    }

    console.log('İşlenmiş veriler:', 
                'Nabız:', result.heartRate.values.length, 
                'Oksijen:', result.oxygen.values.length,
                'Uyku:', result.sleep.duration);
                
    if (result.heartRate.values.length === 0 && result.oxygen.values.length === 0) {
      console.warn('Health Connect\'ten veri alınamadı veya yeterli veri bulunamadı');
    }

    return result;
  };

  /**
   * Health Connect izinlerini kontrol eder ve eksik izinleri kullanıcıya bildirir
   */
  const checkHealthConnectPermissions = async () => {
    try {
      console.log('Health Connect izinleri kontrol ediliyor...');
      
      // Health Connect yüklü değilse izin kontrolü yapma
      const installed = await HealthConnectService.isInstalled();
      if (!installed) {
        console.log('Health Connect yüklü olmadığı için izin kontrolü yapılmıyor');
        return;
      }
      
      // Önce HealthConnectService'in izin kontrolünü çalıştır
      const permissionsAlreadyGranted = await HealthConnectService.checkPermissionsAlreadyGranted();
      
      // İzinler zaten verilmişse, tekrar izin isteme
      if (permissionsAlreadyGranted) {
        console.log('Health Connect izinleri zaten verilmiş, veri almaya devam ediliyor');
        return;
      }
      
      // Tüm verilen izinleri al
      const permissions = await HealthConnectService.getPermissions() as any[];
      console.log('Health Connect İzinleri:', permissions);
      
      // Uyku ve stres verileri için gerekli izinleri kontrol et
      const requiredPermissions = [
        'SleepSession',
        'SleepStage',
        'HeartRate',
        'HeartRateVariability' // Stres hesaplaması için
      ];
      
      // Permissions dizisi boş değilse, bazı izinler verilmiş demektir
      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        // Verilen izinleri işleyip, hangi izinlerin eksik olduğunu kontrol et
        const permissionStrings = permissions.map(p => 
          typeof p === 'string' ? p : 
          (typeof p === 'object' && p !== null && 'recordType' in p ? p.recordType as string : '')
        );
        
        console.log('İşlenmiş izin listesi:', permissionStrings);
        
        // Eksik izinleri belirle - permissionStrings içinde bulunmayanlar
        const missingPermissions = requiredPermissions.filter(perm => {
          return !permissionStrings.some(p => p.toLowerCase().includes(perm.toLowerCase()));
        });
        
        if (missingPermissions.length === 0) {
          console.log('Tüm gerekli izinler mevcut, izin isteme adımı atlanıyor');
          return;
        }
        
        console.log('Bazı izinler mevcut, eksik izinler:', missingPermissions);
        
        // Sadece eksik izinler varsa spesifik bildirimler göster
        if (missingPermissions.includes('SleepSession') || missingPermissions.includes('SleepStage')) {
          Alert.alert(
            "Uyku Verileri İzni Eksik",
            "Uyku verilerini görüntüleyebilmek için Health Connect uygulamasında gerekli izinleri vermeniz gerekiyor.",
            [
              { text: "Daha Sonra", style: "cancel" },
              { text: "İzinleri Ayarla", onPress: () => handleHealthConnectAccess() }
            ]
          );
          return;
        }
        
        if (missingPermissions.includes('HeartRate') || missingPermissions.includes('HeartRateVariability')) {
          Alert.alert(
            "Kalp Verileri İzni Eksik",
            "Kalp atış hızı ve stres verilerini görüntüleyebilmek için Health Connect uygulamasında gerekli izinleri vermeniz gerekiyor.",
            [
              { text: "Daha Sonra", style: "cancel" },
              { text: "İzinleri Ayarla", onPress: () => handleHealthConnectAccess() }
            ]
          );
          return;
        }
        
        return;
      }
      
      // Hiç izin verilmemiş durumunda
      if (!permissions || permissions.length === 0) {
        console.log('Hiç izin verilmemiş, tüm izinleri isteyeceğiz');
        
        // Tek bir genel izin uyarısı göster
        Alert.alert(
          "Health Connect İzinleri Eksik",
          "Sağlık verilerinizi görüntülemek için Health Connect uygulamasında gerekli izinleri vermeniz gerekiyor.",
          [
            { text: "Daha Sonra", style: "cancel" },
            { text: "İzinleri Ayarla", onPress: () => handleHealthConnectAccess() }
          ]
        );
      }
    } catch (error) {
      console.error('İzin kontrolü sırasında hata:', error);
    }
  };

  /**
   * Health Connect servisine bağlanır ve verileri almaya başlar
   */
  const connectToHealthConnect = async () => {
    setLoading(true);
    try {
      console.log('Health Connect servisine bağlanmaya çalışılıyor...');
      const isAvailable = await HealthConnectService.initialize();
      console.log('Health Connect bağlantı sonucu:', isAvailable);
      
      setIsHealthConnectAvailable(isAvailable);
      
      // Uygulamanın yüklü olup olmadığını kontrol et
      const installed = await HealthConnectService.isInstalled();
      setIsHealthConnectInstalled(installed);
      
      if (!installed) {
        // Health Connect yüklü değilse yükleme ekranını göster
        Alert.alert(
          'Health Connect Yüklü Değil',
          'Sağlık verilerinizi görüntülemek için Health Connect uygulamasını yüklemeniz gerekiyor.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Yükle', onPress: () => HealthConnectService.openHealthConnectInstallation() }
          ]
        );
        return;
      }
      
      // Test bağlantısı
      await HealthConnectService.testConnection();
      
      if (isAvailable) {
        console.log('Health Connect bağlantısı başarılı, veri almayı deneyeceğim');
        // İzinleri kontrol et
        checkHealthConnectPermissions();
        // Verileri al
        fetchHealthData();
      } else {
        // Health Connect yüklü ama bağlantı kurulamıyorsa izin sayfasına yönlendir
        Alert.alert(
          'Health Connect Bağlantı Sorunu',
          'Uygulamanın Health Connect servisine bağlanabilmesi için gerekli izinleri vermeniz gerekiyor.',
          [
            { text: 'Şimdi Değil', style: 'cancel' },
            { text: 'İzinleri Ayarla', onPress: () => handleHealthConnectAccess() }
          ]
        );
      }
    } catch (error) {
      console.error('Health Connect bağlantı hatası:', error);
      Alert.alert('Bağlantı Hatası', 'Health Connect bağlantısı sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const runHealthConnectTest = () => {
    HealthConnectService.testConnection();
  };

  const withChartInteraction = (ChartComponent: React.ComponentType<any>, type: 'heartRate' | 'oxygen' | 'stress') => {
    return (props: any) => {
      const handleDataPointClick = (data: { value: number; dataset: any; getColor: (opacity: number) => string; index: number; x: number; y: number }) => {
        let time = '';
        if (props.data && props.data.labels && props.data.labels[data.index]) {
          time = props.data.labels[data.index];
        }
        
        setSelectedPoint({ 
          value: data.value, 
          time, 
          x: data.x, 
          y: data.y, 
          chartType: type, 
          index: data.index 
        });
      };
      
      return (
        <View style={{ position: 'relative' }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            decelerationRate="normal"
            snapToAlignment="center"
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            alwaysBounceHorizontal={true}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ChartComponent
              {...props}
              onDataPointClick={handleDataPointClick}
              getDotColor={(dataPoint: any, dataPointIndex: number) => 
                selectedPoint && 
                   selectedPoint.index === dataPointIndex ? 
                   '7' : '5'
              }
            />
          </ScrollView>
          {selectedPoint && selectedPoint.chartType === type && (
            <TouchableOpacity 
              style={[styles.tooltipContainer, { left: selectedPoint.x - 50, top: selectedPoint.y - 70 }]}
              onPress={() => setSelectedPoint(null)}
              activeOpacity={0.8}
            >
              <View style={[styles.tooltipContent, { borderColor: 
                type === 'heartRate' ? 'rgba(255, 99, 132, 0.8)' : 
                type === 'oxygen' ? 'rgba(76, 175, 229, 0.8)' : 
                'rgba(245, 158, 11, 0.8)' 
              }]}>
                <Text style={styles.tooltipValue}>
                  {selectedPoint.value.toFixed(type === 'oxygen' ? 1 : 0)} 
                  {type === 'heartRate' ? 'bpm' : type === 'oxygen' ? '%' : ''}
                </Text>
                <Text style={styles.tooltipTime}>{selectedPoint.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    };
  };

  const InteractiveHeartRateChart = withChartInteraction(LineChart, 'heartRate');
  const InteractiveOxygenChart = withChartInteraction(LineChart, 'oxygen');
  const InteractiveStressChart = withChartInteraction(LineChart, 'stress');

  const renderHeartRateChart = () => {
    if (!healthData || !healthData.heartRate || !healthData.heartRate.values || healthData.heartRate.values.length === 0) {
      return (
        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.chartWrapper, styles.permissionRequired]}
            onPress={() => handleHealthConnectAccess()}
            activeOpacity={0.6}
          >
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>Kalp Atış Hızı</Text>
              <Ionicons name="lock-open-outline" size={18} color="#4a90e2" />
            </View>
            <Text style={styles.noDataText}>Health Connect izni gerekiyor</Text>
            <Text style={styles.tapForPermissionText}>İzinleri ayarlamak için dokunun</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const values = healthData.heartRate.values || [];
    const times = healthData.heartRate.times || [];

    let displayValues = [];
    let displayTimes = [];
    
    if (timeRange === 'week' && selectedWeekDay !== null && values.length > 0) {
      const filteredData = values.filter((_, index) => {
        if (index < 0 || index >= times.length) return false;
        try {
          const date = new Date(times[index]);
          return date.getDay() === selectedWeekDay;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      const filteredTimes = times.filter((time) => {
        try {
          const date = new Date(time);
          return date.getDay() === selectedWeekDay;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      displayValues = filteredData;
      displayTimes = filteredTimes;

      if (displayValues.length === 0) {
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Kalp Atış Hızı</Text>
            <Text style={styles.noDataText}>Seçilen gün için veri bulunamadı</Text>
          </View>
        );
      }
    } else if (timeRange === 'month' && selectedMonth !== null && values.length > 0) {
      const filteredData = values.filter((_, index) => {
        if (index < 0 || index >= times.length) return false;
        try {
          const date = new Date(times[index]);
          return date.getMonth() === selectedMonth;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      const filteredTimes = times.filter((time) => {
        try {
          const date = new Date(time);
          return date.getMonth() === selectedMonth;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      displayValues = filteredData;
      displayTimes = filteredTimes;

      if (displayValues.length === 0) {
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Kalp Atış Hızı</Text>
            <Text style={styles.noDataText}>Seçilen ay için veri bulunamadı</Text>
          </View>
        );
      }
    } else {
      const max = Math.min(values.length, 5);
      displayValues = values.slice(-max);
      displayTimes = times.slice(-max);
    }

    if (displayValues.length === 0 || displayTimes.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.chartTitle}>Kalp Atış Hızı</Text>
          <Text style={styles.noDataText}>Grafik için yeterli veri bulunamadı</Text>
        </View>
      );
    }

    const chartData = {
      labels: displayTimes.map(time => {
        try {
          const date = new Date(time);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          console.error('Saat formatı hatası:', error);
          return '';
        }
      }),
      datasets: [
        {
          data: displayValues,
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const chartConfig = {
      backgroundGradientFrom: '#1e2124',
      backgroundGradientTo: '#1e2124',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffa726'
      },
      propsForBackgroundLines: {
        stroke: '#3a3f44',
        strokeWidth: 1
      },
      propsForLabels: {
        fontSize: 11,
        fontWeight: 'bold'
      }
    };

    const lastHeartRate = values.length > 0 ? values[values.length - 1] : 0;
    const lastHeartRateTime = times.length > 0 ? formatTime(times[times.length - 1], 'day') : '';
    
    const maxHeartRate = values.length > 0 ? Math.max(...values) : 0;
    const minHeartRate = values.length > 0 ? Math.min(...values) : 0;
    const averageHeartRate = healthData.heartRate.average ? 
      healthData.heartRate.average.toFixed(0) : "0";

    return (
      <Animated.View style={[styles.chartContainer, styles.heartRateChartContainer, { opacity: heartRateOpacity }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Kalp Atış Hızı</Text>
            <Text style={styles.lastMeasurement}>Son: {lastHeartRate} bpm ({lastHeartRateTime})</Text>
          </View>
          <View style={styles.chartStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ort.</Text>
              <Text style={styles.statValue}>{averageHeartRate} bpm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Maks.</Text>
              <Text style={styles.statValue}>{maxHeartRate} bpm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min.</Text>
              <Text style={styles.statValue}>{minHeartRate} bpm</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.heartRateChartGraph}>
          <InteractiveHeartRateChart
            data={chartData}
            width={Math.max(Dimensions.get('window').width - 40, displayTimes.length * 50)}
            height={220}
            chartConfig={chartConfig}
            bezier
            withDots={true}
            withShadow
            withVerticalLines
            withHorizontalLines
            fromZero={false}
            yAxisLabel=""
            yAxisSuffix=" bpm"
            yLabelsOffset={10}
            segments={5}
            formatYLabel={(value: string) => {
              try {
                return Math.round(Number(value)).toString();
              } catch (error) {
                console.error('Y ekseni değeri formatlanırken hata:', error);
                return "0";
              }
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </Animated.View>
    );
  };

  const renderOxygenChart = () => {
    if (!healthData || !healthData.oxygen || !healthData.oxygen.values || healthData.oxygen.values.length === 0) {
      return (
        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.chartWrapper, styles.permissionRequired]}
            onPress={() => handleHealthConnectAccess()}
            activeOpacity={0.6}
          >
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>Oksijen Satürasyonu</Text>
              <Ionicons name="lock-open-outline" size={18} color="#4a90e2" />
            </View>
            <Text style={styles.noDataText}>Health Connect izni gerekiyor</Text>
            <Text style={styles.tapForPermissionText}>İzinleri ayarlamak için dokunun</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const values = healthData.oxygen.values || [];
    const times = healthData.oxygen.times || [];
    
    let displayValues = [];
    let displayTimes = [];
    
    if (timeRange === 'week' && selectedWeekDay !== null && values.length > 0) {
      const filteredData = values.filter((_, index) => {
        if (index < 0 || index >= times.length) return false;
        try {
          const date = new Date(times[index]);
          return date.getDay() === selectedWeekDay;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      const filteredTimes = times.filter((time) => {
        try {
          const date = new Date(time);
          return date.getDay() === selectedWeekDay;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      displayValues = filteredData;
      displayTimes = filteredTimes;

      if (displayValues.length === 0) {
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Oksijen Satürasyonu</Text>
            <Text style={styles.noDataText}>Seçilen gün için veri bulunamadı</Text>
          </View>
        );
      }
    } else if (timeRange === 'month' && selectedMonth !== null && values.length > 0) {
      const filteredData = values.filter((_, index) => {
        if (index < 0 || index >= times.length) return false;
        try {
          const date = new Date(times[index]);
          return date.getMonth() === selectedMonth;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      const filteredTimes = times.filter((time) => {
        try {
          const date = new Date(time);
          return date.getMonth() === selectedMonth;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      displayValues = filteredData;
      displayTimes = filteredTimes;

      if (displayValues.length === 0) {
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Oksijen Satürasyonu</Text>
            <Text style={styles.noDataText}>Seçilen ay için veri bulunamadı</Text>
          </View>
        );
      }
    } else {
      const maxPoints = Math.min(values.length, 5);
      displayValues = values.slice(-maxPoints);
      displayTimes = times.slice(-maxPoints);
    }

    if (displayValues.length === 0 || displayTimes.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.chartTitle}>Oksijen Satürasyonu</Text>
          <Text style={styles.noDataText}>Grafik için yeterli veri bulunamadı</Text>
        </View>
      );
    }

    const chartData = {
      labels: displayTimes.map(time => {
        try {
          const date = new Date(time);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          console.error('Saat formatı hatası:', error);
          return '';
        }
      }),
      datasets: [
        {
          data: displayValues,
          color: (opacity = 1) => `rgba(76, 175, 229, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const chartConfig = {
      backgroundGradientFrom: '#1e2124',
      backgroundGradientTo: '#1e2124',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#41b3a3'
      },
      propsForBackgroundLines: {
        stroke: '#3a3f44',
        strokeWidth: 1
      },
      propsForLabels: {
        fontSize: 11,
        fontWeight: 'bold'
      }
    };

    const lastOxygen = values.length > 0 ? values[values.length - 1] : 0;
    const lastOxygenTime = times.length > 0 ? formatTime(times[times.length - 1], 'day') : '';
    
    const maxOxygen = values.length > 0 ? Math.max(...values) : 0;
    const minOxygen = values.length > 0 ? Math.min(...values) : 0;
    const averageOxygen = healthData.oxygen.average ? 
      healthData.oxygen.average.toFixed(1) : "0.0";

    return (
      <Animated.View style={[styles.chartContainer, styles.oxygenChartContainer, { opacity: oxygenOpacity }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Oksijen Saturasyonu</Text>
            <Text style={styles.lastMeasurement}>Son: %{lastOxygen.toFixed(1)} ({lastOxygenTime})</Text>
          </View>
          <View style={styles.chartStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ort.</Text>
              <Text style={styles.statValue}>%{averageOxygen}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Maks.</Text>
              <Text style={styles.statValue}>%{maxOxygen.toFixed(1)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min.</Text>
              <Text style={styles.statValue}>%{minOxygen.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.oxygenChartGraph}>
          <InteractiveOxygenChart
            data={chartData}
            width={Math.max(Dimensions.get('window').width - 40, displayTimes.length * 50)}
            height={220}
            chartConfig={chartConfig}
            bezier
            withDots={true}
            withShadow
            withVerticalLines
            withHorizontalLines
            fromZero={false}
            yAxisLabel=""
            yAxisSuffix="%"
            yLabelsOffset={10}
            segments={5}
            formatYLabel={(value: string) => {
              try {
                return Number(value).toFixed(1);
              } catch (error) {
                console.error('Y ekseni değeri formatlanırken hata:', error);
                return "0.0";
              }
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </Animated.View>
    );
  };

  const SleepInfo = ({ time, label, percentage, color }: { time: string; label: string; percentage: number; color: string }) => {
    return (
      <TouchableOpacity 
        style={styles.sleepInfoItem}
        onPress={() => Alert.alert(
          label, 
          `${label} uyku süreniz: ${time}\nToplam uykunuzun %${percentage.toFixed(1)}'ini oluşturuyor.`
        )}
      >
        <View style={[styles.sleepColorIndicator, { backgroundColor: color }]} />
        <View style={styles.sleepInfoContent}>
          <Text style={styles.sleepLabel}>{label}</Text>
          <Text style={styles.sleepValue}>{time}</Text>
        </View>
        <Text style={styles.sleepPercentage}>%{percentage.toFixed(1)}</Text>
      </TouchableOpacity>
    );
  };

  const renderSleepData = () => {
    if (!healthData || !healthData.sleep || !healthData.sleep.duration) {
      return (
        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.chartWrapper, styles.permissionRequired]}
            onPress={() => handleHealthConnectAccess()}
            activeOpacity={0.6}
          >
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>Uyku Analizi</Text>
              <Ionicons name="lock-open-outline" size={18} color="#4a90e2" />
            </View>
            <Text style={styles.noDataText}>Health Connect izni gerekiyor</Text>
            <Text style={styles.tapForPermissionText}>İzinleri ayarlamak için dokunun</Text>
          </TouchableOpacity>
        </View>
      );
    }

    try {
      const totalSleepMinutes = healthData.sleep.duration;
      if (totalSleepMinutes <= 0) {
        // Uyku süresi geçersizse veri yokmuş gibi göster
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Uyku Analizi</Text>
            <Text style={styles.noDataText}>Veri bulunamadı</Text>
          </View>
        );
      }
      
      const hours = Math.floor(totalSleepMinutes / 60);
      const minutes = Math.round(totalSleepMinutes % 60);

      const deepSleepMinutes = healthData.sleep.deepSleep || 0;
      const lightSleepMinutes = healthData.sleep.lightSleep || 0;
      const remSleepMinutes = healthData.sleep.remSleep || 0;
      const awakeMinutes = healthData.sleep.awakeTime || 0;

      // Toplam uyku süresi + uyanık süresi
      const totalRecordedTime = Math.max(1, totalSleepMinutes + awakeMinutes); // 0'a bölme hatası olmaması için

      // Yüzdeleri hesapla - 0'a bölme hatası olmaması için kontrol ekledik
      const deepSleepPercentage = totalSleepMinutes > 0 ? (deepSleepMinutes / totalSleepMinutes) * 100 : 0;
      const lightSleepPercentage = totalSleepMinutes > 0 ? (lightSleepMinutes / totalSleepMinutes) * 100 : 0;
      const remSleepPercentage = totalSleepMinutes > 0 ? (remSleepMinutes / totalSleepMinutes) * 100 : 0;
      // Uyanık kalma süresi için, toplam uyku süresine göre değil, toplam kayıt süresine göre yüzdesi
      const awakePercentage = (awakeMinutes / totalRecordedTime) * 100;

      const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return `${h}s ${m}d`;
      };

      return (
        <Animated.View style={[styles.chartContainer, styles.sleepChartContainer, { opacity: sleepOpacity }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Uyku Analizi</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => Alert.alert(
                'Uyku Fazları Hakkında',
                'Derin Uyku: Vücudunuzun yenilendiği, hücre onarımının gerçekleştiği evre.\n\nHafif Uyku: Uykunun en büyük bölümünü kapsayan, kolay uyandırılabilir evre.\n\nREM Uykusu: Rüyaların görüldüğü, beyin aktivitesinin yüksek olduğu evre.\n\nUyanma: Uyku sırasında kısa süreli uyanmalar.'
              )}
            >
              <Ionicons name="information-circle-outline" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sleepSummary}>
            <View style={styles.sleepMetric}>
              <Text style={styles.sleepMetricValue}>{`${hours}s ${minutes}d`}</Text>
              <Text style={styles.sleepMetricLabel}>Toplam Uyku</Text>
            </View>
            <View style={styles.sleepMetric}>
              <Text style={styles.sleepMetricValue}>{`${healthData.sleep.efficiency}%`}</Text>
              <Text style={styles.sleepMetricLabel}>Uyku Kalitesi</Text>
            </View>
          </View>
          
          <View style={styles.sleepInfoContainer}>
            <SleepInfo 
              time={formatTime(deepSleepMinutes)} 
              label="Derin Uyku" 
              percentage={deepSleepPercentage} 
              color="#8E44AD" 
            />
            <SleepInfo 
              time={formatTime(lightSleepMinutes)} 
              label="Hafif Uyku" 
              percentage={lightSleepPercentage} 
              color="#3498DB" 
            />
            <SleepInfo 
              time={formatTime(remSleepMinutes)} 
              label="REM Uykusu" 
              percentage={remSleepPercentage} 
              color="#2ECC71" 
            />
            {awakeMinutes > 0 && (
              <SleepInfo 
                time={formatTime(awakeMinutes)} 
                label="Uyanma" 
                percentage={awakePercentage} 
                color="#E74C3C" 
              />
            )}
          </View>
          
          <View style={styles.sleepChartGraph}>
            <View style={{height: 150, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <View style={{height: `${deepSleepPercentage}%`, width: awakeMinutes > 0 ? '22%' : '30%', backgroundColor: '#8E44AD', borderRadius: 8}} />
              <View style={{height: `${lightSleepPercentage}%`, width: awakeMinutes > 0 ? '22%' : '30%', backgroundColor: '#3498DB', borderRadius: 8}} />
              <View style={{height: `${remSleepPercentage}%`, width: awakeMinutes > 0 ? '22%' : '30%', backgroundColor: '#2ECC71', borderRadius: 8}} />
              {awakeMinutes > 0 && (
                <View style={{height: `${awakePercentage}%`, width: '22%', backgroundColor: '#E74C3C', borderRadius: 8}} />
              )}
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}>
              <Text style={{color: '#8E44AD', fontSize: 12, width: awakeMinutes > 0 ? '22%' : '30%', textAlign: 'center'}}>Derin</Text>
              <Text style={{color: '#3498DB', fontSize: 12, width: awakeMinutes > 0 ? '22%' : '30%', textAlign: 'center'}}>Hafif</Text>
              <Text style={{color: '#2ECC71', fontSize: 12, width: awakeMinutes > 0 ? '22%' : '30%', textAlign: 'center'}}>REM</Text>
              {awakeMinutes > 0 && (
                <Text style={{color: '#E74C3C', fontSize: 12, width: '22%', textAlign: 'center'}}>Uyanık</Text>
              )}
            </View>
          </View>
        </Animated.View>
      );
    } catch (error) {
      console.error('Uyku verisi gösterilirken hata:', error);
      // Hata durumunda veri yokmuş gibi göster
      return (
        <View style={styles.card}>
          <Text style={styles.chartTitle}>Uyku Analizi</Text>
          <Text style={styles.noDataText}>Veri gösterilemiyor</Text>
        </View>
      );
    }
  };

  const renderStressChart = () => {
    if (!healthData || !healthData.stress || !healthData.stress.values || healthData.stress.values.length === 0) {
      return (
        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.chartWrapper, styles.permissionRequired]}
            onPress={() => handleHealthConnectAccess()}
            activeOpacity={0.6}
          >
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>Stres Seviyesi</Text>
              <Ionicons name="lock-open-outline" size={18} color="#4a90e2" />
            </View>
            <Text style={styles.noDataText}>Health Connect izni gerekiyor</Text>
            <Text style={styles.tapForPermissionText}>İzinleri ayarlamak için dokunun</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const values = healthData.stress.values || [];
    const times = healthData.stress.times || [];
    
    let displayValues = [];
    let displayTimes = [];
    
    if (timeRange === 'week' && selectedWeekDay !== null && values.length > 0) {
      const filteredData = values.filter((_, index) => {
        if (index < 0 || index >= times.length) return false;
        try {
          const date = new Date(times[index]);
          return date.getDay() === selectedWeekDay;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      const filteredTimes = times.filter((time) => {
        try {
          const date = new Date(time);
          return date.getDay() === selectedWeekDay;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      displayValues = filteredData;
      displayTimes = filteredTimes;

      if (displayValues.length === 0) {
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Stres Seviyesi</Text>
            <Text style={styles.noDataText}>Seçilen gün için veri bulunamadı</Text>
          </View>
        );
      }
    } else if (timeRange === 'month' && selectedMonth !== null && values.length > 0) {
      const filteredData = values.filter((_, index) => {
        if (index < 0 || index >= times.length) return false;
        try {
          const date = new Date(times[index]);
          return date.getMonth() === selectedMonth;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      const filteredTimes = times.filter((time) => {
        try {
          const date = new Date(time);
          return date.getMonth() === selectedMonth;
        } catch (error) {
          console.error('Tarih dönüştürme hatası:', error);
          return false;
        }
      });
      
      displayValues = filteredData;
      displayTimes = filteredTimes;

      if (displayValues.length === 0) {
        return (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>Stres Seviyesi</Text>
            <Text style={styles.noDataText}>Seçilen ay için veri bulunamadı</Text>
          </View>
        );
      }
    } else {
      const maxPoints = Math.min(values.length, 5);
      displayValues = values.slice(-maxPoints);
      displayTimes = times.slice(-maxPoints);
    }

    if (displayValues.length === 0 || displayTimes.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.chartTitle}>Stres Seviyesi</Text>
          <Text style={styles.noDataText}>Grafik için yeterli veri bulunamadı</Text>
        </View>
      );
    }
    
    const chartData = {
      labels: displayTimes.map(time => {
        try {
          const date = new Date(time);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          console.error('Saat formatı hatası:', error);
          return '';
        }
      }),
      datasets: [
        {
          data: displayValues,
          color: (opacity = 1) => `rgba(255, 145, 77, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
    
    const chartConfig = {
      backgroundGradientFrom: '#1e2124',
      backgroundGradientTo: '#1e2124',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 145, 77, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#e67e22'
      },
      propsForBackgroundLines: {
        stroke: '#3a3f44',
        strokeWidth: 1
      },
      propsForLabels: {
        fontSize: 11,
        fontWeight: 'bold'
      }
    };
    
    const lastStress = values.length > 0 ? values[values.length - 1] : 0;
    const lastStressTime = times.length > 0 ? formatTime(times[times.length - 1], 'day') : '';
    
    const maxStressValue = values.length > 0 ? Math.max(...values) : 0;
    const minStressValue = values.length > 0 ? Math.min(...values) : 0;
    const averageStressValue = healthData.stress.average ? 
      healthData.stress.average.toFixed(0) : "0";
    
    return (
      <Animated.View style={[styles.chartContainer, styles.stressChartContainer, { opacity: stressOpacity }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Stres Seviyesi</Text>
            <Text style={styles.lastMeasurement}>Son: {lastStress} ({lastStressTime})</Text>
          </View>
          <View style={styles.chartStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ort.</Text>
              <Text style={styles.statValue}>{averageStressValue}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Maks.</Text>
              <Text style={styles.statValue}>{maxStressValue}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min.</Text>
              <Text style={styles.statValue}>{minStressValue}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.stressChartGraph}>
          <InteractiveStressChart
            data={chartData}
            width={Math.max(Dimensions.get('window').width - 40, displayTimes.length * 50)}
            height={220}
            chartConfig={chartConfig}
            bezier
            withDots={true}
            withShadow
            withVerticalLines
            withHorizontalLines
            fromZero={false}
            yAxisLabel=""
            yAxisSuffix=""
            yLabelsOffset={10}
            segments={5}
            formatYLabel={(value: string) => {
              try {
                return Math.round(Number(value)).toString();
              } catch (error) {
                console.error('Y ekseni değeri formatlanırken hata:', error);
                return "0";
              }
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </Animated.View>
    );
  };

  const renderStepsData = () => {
    if (!healthData?.steps) return null;

    const stepsGoal = healthData.steps.goal || 10000;
    const stepsCount = isNaN(healthData.steps.count) ? 0 : healthData.steps.count;
    const percentage = Math.min((stepsCount / stepsGoal) * 100, 100);
    
    // NaN ve undefined durumları için kontrol
    const formattedSteps = isNaN(stepsCount) ? "0" : stepsCount.toLocaleString();
    
    // Mesafe verisi için kontrol
    const distanceValue = healthData.distance?.value || 0;
    const distance = isNaN(distanceValue) ? "0" : (distanceValue / 1000).toFixed(2);

    return (
      <Animated.View style={[styles.stepsContainer, styles.topCard, { opacity: stepsOpacity }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Adımlar</Text>
        </View>
        <View style={styles.stepsContent}>
          <AnimatedCircularProgress
            size={100}
            width={8}
            fill={isNaN(percentage) ? 0 : percentage}
            tintColor="#4CAF50"
            backgroundColor="#333"
          >
            {() => (
              <View style={styles.progressTextContainer}>
                <Text style={styles.stepsValue}>{formattedSteps}</Text>
                <Text style={styles.stepsLabel}>adım</Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <View style={styles.stepsSummary}>
            <View style={styles.stepsSummaryItem}>
              <Text style={styles.summaryLabel}>Mesafe</Text>
              <Text style={styles.summaryValue}>{distance} km</Text>
            </View>
            <View style={styles.stepsSummaryItem}>
              <Text style={styles.summaryLabel}>Hedef</Text>
              <Text style={styles.summaryValue}>{stepsGoal.toLocaleString()} adım</Text>
            </View>
            <View style={styles.stepsSummaryItem}>
              <Text style={styles.summaryLabel}>İlerleme</Text>
              <Text style={styles.summaryValue}>{isNaN(percentage) ? "0" : percentage.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCaloriesData = () => {
    if (!healthData?.calories) return null;

    const caloriesGoal = healthData.calories.goal || 2000;
    const caloriesValue = isNaN(healthData.calories.value) ? 0 : healthData.calories.value;
    const percentage = Math.min((caloriesValue / caloriesGoal) * 100, 100);
    
    // NaN ve undefined durumları için kontrol
    const formattedCalories = isNaN(caloriesValue) ? "0" : caloriesValue.toLocaleString();

    return (
      <Animated.View style={[styles.stepsContainer, styles.bottomCard, { opacity: caloriesOpacity }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Kalori</Text>
        </View>
        <View style={styles.stepsContent}>
          <AnimatedCircularProgress
            size={100}
            width={8}
            fill={isNaN(percentage) ? 0 : percentage}
            tintColor="#FF9800"
            backgroundColor="#333"
          >
            {() => (
              <View style={styles.progressTextContainer}>
                <Text style={styles.stepsValue}>{formattedCalories}</Text>
                <Text style={styles.stepsLabel}>kcal</Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <View style={styles.stepsSummary}>
            <View style={styles.stepsSummaryItem}>
              <Text style={styles.summaryLabel}>Tüketilen</Text>
              <Text style={styles.summaryValue}>{formattedCalories} kcal</Text>
            </View>
            <View style={styles.stepsSummaryItem}>
              <Text style={styles.summaryLabel}>Günlük Hedef</Text>
              <Text style={styles.summaryValue}>{caloriesGoal.toLocaleString()} kcal</Text>
            </View>
            <View style={styles.stepsSummaryItem}>
              <Text style={styles.summaryLabel}>İlerleme</Text>
              <Text style={styles.summaryValue}>{isNaN(percentage) ? "0" : percentage.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const changeTimeRange = useCallback((newRange: 'day' | 'week' | 'month') => {
    if (newRange === timeRange) return;
    
    // Önce yükleniyor durumunu etkinleştir
    setLoading(true);
    setTimeRange(newRange);
    setSelectedPoint(null);
    
    // Önceki verileri temizle
    setHealthData(prevData => {
      if (!prevData) return prevData;
      
      return {
        ...prevData,
        heartRate: { ...prevData.heartRate, values: [], times: [] },
        oxygen: { ...prevData.oxygen, values: [], times: [] },
        stress: { ...prevData.stress, values: [], times: [] }
      };
    });
    
    // Zaman aralığına göre seçimleri ayarla
    if (newRange === 'week') {
      setSelectedWeekDay(new Date().getDay());
      setSelectedMonth(null);
    } else if (newRange === 'month') {
      setSelectedMonth(new Date().getMonth());
      setSelectedWeekDay(null);
    } else {
      setSelectedWeekDay(null);
      setSelectedMonth(null);
    }
    
    // Veri çekme işlemini geciktir (UI güncellemeleri için zaman tanı)
    setTimeout(() => {
      debouncedFetchHealthData();
    }, 100);
  }, [timeRange, debouncedFetchHealthData]);

  // Mevcut selectWeekDay fonksiyonunu debounce ile değiştirelim
  const selectWeekDay = useCallback((dayIndex: number) => {
    setSelectedWeekDay(dayIndex);
    debouncedFetchHealthData();
  }, [debouncedFetchHealthData]);

  // Mevcut selectMonth fonksiyonunu debounce ile değiştirelim
  const selectMonth = useCallback((monthIndex: number) => {
    setSelectedMonth(monthIndex);
    debouncedFetchHealthData();
  }, [debouncedFetchHealthData]);

  const renderWeekDayButtons = () => {
    if (timeRange !== 'week') return null;
    
    const days = ['Pzr', 'Pzt', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cmt'];
    const today = new Date().getDay();
    
    return (
      <View style={styles.weekDayButtonsContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.weekDayButton,
              selectedWeekDay === index && styles.selectedWeekDayButton,
              today === index && styles.todayButton
            ]}
            onPress={() => selectWeekDay(index)}
          >
            <LinearGradient
              colors={selectedWeekDay === index 
                ? ['#4a90e2', '#3498db'] 
                : ['#2c2c2c', '#252525']}
              style={[
                styles.weekDayButtonGradient,
                today === index && {borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'}
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Text 
                style={[
                  styles.weekDayButtonText,
                  selectedWeekDay === index && styles.selectedWeekDayButtonText
                ]}
              >
                {day}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMonthButtons = () => {
    if (timeRange !== 'month') return null;
    
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonth = new Date().getMonth();
    
    return (
      <View style={styles.monthButtonsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthButtonsScrollContainer}
          snapToInterval={72} // Aya göre snap etsin
          decelerationRate="fast"
        >
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={styles.monthButton}
              onPress={() => selectMonth(index)}
            >
              <LinearGradient
                colors={selectedMonth === index 
                  ? ['#4a90e2', '#3498db'] 
                  : ['#2c2c2c', '#252525']}
                style={[
                  styles.monthButtonGradient,
                  currentMonth === index && {borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'}
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Text 
                  style={[
                    styles.monthButtonText,
                    selectedMonth === index && styles.selectedMonthButtonText
                  ]}
                >
                  {month}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleScreenTouch = (_event: GestureResponderEvent) => {
    if (selectedPoint) {
      setSelectedPoint(null);
    }
  };

  const renderPointDetails = () => {
    if (!selectedPoint) return null;
    
    const { value, time, chartType } = selectedPoint as {
      value: number;
      time: string;
      chartType: 'heartRate' | 'oxygen' | 'stress';
    };
    
    let title = '';
    let valueText = '';
    
    switch (chartType) {
      case 'heartRate':
        title = 'Kalp Atış Hızı';
        valueText = `${value} bpm`;
        break;
      case 'oxygen':
        title = 'Oksijen Seviyesi';
        valueText = `%${value}`;
        break;
      case 'stress':
        title = 'Stres Seviyesi';
        valueText = `${value}`;
        break;
    }
    
    // ... existing code ...
  };

  // ScrollView'da kaydırma kontrolünü kolaylaştırma
  const handleContentTouch = (event: GestureResponderEvent) => {
    // Sadece tooltip varsa kapat, diğer durumlarda dokunma olayını geçir
    if (selectedPoint) {
      setSelectedPoint(null);
    }
  };

  /**
   * Health Connect servisine bağlanmak için gereken koşulları kontrol eder
   * ve uygun yönlendirmeyi yapar (Health Connect yüklü değilse indirme sayfasına,
   * yüklü ise Health Connect'in izin sayfasına yönlendirir)
   */
  const handleHealthConnectAccess = async () => {
    console.log('Health Connect erişimi kontrol ediliyor...');
    const installed = await HealthConnectService.isInstalled();
    
    // Health Connect yüklü değilse Play Store'a yönlendir
    if (!installed) {
      console.log('Health Connect yüklü değil, Google Play Store açılıyor...');
      Alert.alert(
        'Health Connect Yüklü Değil',
        'Sağlık verilerinizi görüntülemek için Health Connect uygulamasını kurmanız gerekiyor.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { 
            text: 'Yükle', 
            onPress: () => {
              HealthConnectService.openHealthConnectInstallation();
            }
          }
        ]
      );
      return;
    }
    
    // Önce modal göster, ayrıntılı talimatlarla
    showHealthConnectPermissionModal();
  };

  // Memory leak önleme için useEffect içinde temizleme işlemleri ekleyelim
  useEffect(() => {
    return () => {
      // Component unmount olduğunda timeout'ları temizle
      if (dataFetchTimeoutRef.current) {
        clearTimeout(dataFetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaViewContext style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contentContainer, {paddingBottom: Platform.OS === 'ios' ? 30 : 110}]} // Tab bar için ek boşluk
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sağlık Verileri</Text>
            <TouchableOpacity onPress={fetchHealthData}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {isHealthConnectInstalled === false && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>Health Connect yüklü değil</Text>
              <TouchableOpacity
                style={styles.installButton}
                onPress={() => HealthConnectService.openHealthConnectInstallation()}
              >
                <Text style={styles.installButtonText}>Yükle</Text>
              </TouchableOpacity>
            </View>
          )}

          {isHealthConnectInstalled === true && isHealthConnectAvailable === false && (
            <View style={[styles.warningContainer, {backgroundColor: '#e2a500'}]}>
              <Text style={styles.warningText}>Health Connect izinleri eksik</Text>
              <TouchableOpacity
                style={styles.installButton}
                onPress={() => handleHealthConnectAccess()}
              >
                <Text style={styles.installButtonText}>İzinleri Ayarla</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Health Connect izinleri için açıklayıcı modal */}
          <Modal
            transparent={true}
            visible={isPermissionModalVisible}
            animationType="fade"
            onRequestClose={hideHealthConnectPermissionModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Health Connect İzinleri</Text>
                  <TouchableOpacity onPress={hideHealthConnectPermissionModal}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.androidInfoBanner}>
                  <Ionicons name="information-circle-outline" size={20} color="#fff" />
                  <Text style={styles.androidInfoText}>
                    Android 15'te Health Connect artık sistem ayarlarının bir parçasıdır.
                  </Text>
                </View>
                
                <ScrollView style={styles.modalScrollView}>
                  <Text style={styles.modalSubtitle}>Sağlık verilerinizi görüntülemek için aşağıdaki adımları takip edin:</Text>
                  
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Health Connect'i Açın</Text>
                      <Text style={styles.stepDescription}>
                        "İzinleri Aç" butonuna tıkladığınızda Android'in Health Connect ayarları açılacaktır. Android 15'te bu, doğrudan Ayarlar uygulamasına yönlendirir.
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Biorest'i Bulun</Text>
                      <Text style={styles.stepDescription}>
                        Açılan sayfada "Biorest" (veya "BiorestMobil") uygulamasını listeden bulun ve üzerine tıklayın. Android 15'te, Uygulamalar listesinde bulabilirsiniz.
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>İzinleri Etkinleştirin</Text>
                      <Text style={styles.stepDescription}>
                        Aşağıdakilerin hepsini AÇIK konumuna getirin:
                      </Text>
                      <View style={styles.permissionList}>
                        <Text style={styles.permissionItem}>• Kalp atış hızı (Nabız verisi için)</Text>
                        <Text style={styles.permissionItem}>• Kalp atış hızı değişkenliği (HRV) (Stres verisi için)</Text>
                        <Text style={styles.permissionItem}>• Uyku oturumları (Uyku süresi için)</Text>
                        <Text style={styles.permissionItem}>• Uyku aşamaları (Derin/hafif uyku analizleri için)</Text>
                        <Text style={styles.permissionItem}>• Oksijen satürasyonu (Kan oksijen seviyesi için)</Text>
                      </View>
                      <Text style={styles.stepNote}>
                        Not: Android 15'te bu izinler "Veri ve erişim" başlığı altında olabilir. Tüm veri türlerine "Okuma" izni verdiğinizden emin olun.
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Kaydedin ve Geri Dönün</Text>
                      <Text style={styles.stepDescription}>
                        İzinleri verdikten sonra "Kaydet", "Tamam" veya "İzin ver" butonuna tıklayın ve Biorest uygulamasına geri dönün. Uygulama yeniden açıldığında sağlık verilerinizi görüntüleyebileceksiniz.
                      </Text>
                      <Text style={styles.stepNote}>
                        Not: Veri senkronizasyonu için biraz zaman gerekebilir. İzinleri verdikten sonra verileriniz birkaç dakika içinde görünecektir.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={hideHealthConnectPermissionModal}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => {
                      hideHealthConnectPermissionModal();
                      HealthConnectService.openHealthConnectApp();
                    }}
                  >
                    <Text style={styles.actionButtonText}>İzinleri Aç</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.timeRangeSelector}>
            <TouchableOpacity
              style={[
                styles.timeRangeOption,
                timeRange === 'day' && styles.selectedTimeRange
              ]}
              onPress={() => changeTimeRange('day')}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === 'day' && styles.selectedTimeRangeText
              ]}>Gün</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeRangeOption,
                timeRange === 'week' && styles.selectedTimeRange
              ]}
              onPress={() => changeTimeRange('week')}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === 'week' && styles.selectedTimeRangeText
              ]}>Hafta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeRangeOption,
                timeRange === 'month' && styles.selectedTimeRange
              ]}
              onPress={() => changeTimeRange('month')}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === 'month' && styles.selectedTimeRangeText
              ]}>Ay</Text>
            </TouchableOpacity>
          </View>

          {timeRange === 'week' && renderWeekDayButtons()}
          {timeRange === 'month' && renderMonthButtons()}

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchHealthData().finally(() => setRefreshing(false));
                }}
                colors={["#4a90e2"]}
                tintColor="#4a90e2"
                progressBackgroundColor="#1a1a1a"
              />
            }
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {renderHeartRateChart()}
              {renderOxygenChart()}
              {renderSleepData()}
              {renderStressChart()}
            </Animated.View>
          </ScrollView>
          
          <View style={styles.cardsContainer}>
            {renderStepsData()}
            {renderCaloriesData()}
          </View>
        </ScrollView>
      </View>
    </SafeAreaViewContext>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  timeRangeOption: {
    width: 80,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeRange: {
    backgroundColor: '#4a90e2',
  },
  selectedTimeRangeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  connectButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    marginVertical: 10,
  },
  noDataText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    padding: 15,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartStats: {
    flexDirection: 'row',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 15,
  },
  chartGraph: {
    marginVertical: 10,
    borderRadius: 8,
    paddingRight: 10,
  },
  heartRateChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff6384',
    borderWidth: 1,
  },
  oxygenChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#4169e1',
    borderWidth: 1,
  },
  sleepChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#9c64a6',
    borderWidth: 1,
  },
  stressChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff914d',
    borderWidth: 1,
  },
  heartRateChartGraph: {
    backgroundColor: 'rgba(255, 87, 87, 0.05)',
  },
  oxygenChartGraph: {
    backgroundColor: 'rgba(76, 175, 229, 0.05)',
  },
  sleepChartGraph: {
    backgroundColor: 'rgba(167, 139, 250, 0.05)',
  },
  stressChartGraph: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  statItem: {
    marginLeft: 15,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sleepContainer: {
    marginTop: 10,
  },
  sleepHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sleepTitle: {
    color: '#888',
    fontSize: 14,
  },
  sleepDuration: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  sleepEfficiency: {
    color: '#4a90e2',
    fontSize: 16,
  },
  sleepPhases: {
    marginTop: 10,
  },
  sleepPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepPhaseColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  sleepPhaseName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  sleepPhaseTime: {
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
  },
  sleepPhasePercentage: {
    color: '#888',
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  activityItem: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activityLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#ffa726',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  warningText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  installButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  installButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoUnit: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  dataUnit: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chartWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#888',
  },
  tooltipContainer: {
    position: 'absolute',
    zIndex: 9999,
    alignItems: 'center',
  },
  tooltipContent: {
    backgroundColor: '#1e1e1e',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  tooltipValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tooltipTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ translateY: -1 }],
  },
  sleepInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  sleepInfoContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  sleepLabel: {
    fontSize: 14,
    color: '#fff',
  },
  sleepValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  sleepPercentage: {
    fontSize: 12,
    color: '#aaa',
  },
  infoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepSummary: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepMetric: {
    alignItems: 'center',
  },
  sleepMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sleepMetricLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  sleepInfoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  lastMeasurement: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  weekDayButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  weekDayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  weekDayButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedWeekDayButton: {
    transform: [{scale: 1.05}],
  },
  todayButton: {
    borderWidth: 0,
  },
  weekDayButtonText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedWeekDayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  
  // Ay butonları için stiller
  monthButtonsContainer: {
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  monthButtonsScrollContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthButton: {
    width: 60,
    height: 40,
    marginHorizontal: 6,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  monthButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedMonthButton: {
    transform: [{scale: 1.05}],
  },
  currentMonthButton: {
    borderWidth: 0,
  },
  monthButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMonthButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tapForPermissionText: {
    color: '#4a90e2',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionRequired: {
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumberContainer: {
    width: 20,
    marginRight: 10,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  permissionList: {
    marginBottom: 10,
  },
  permissionItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeRangeText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  stepNote: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  androidInfoBanner: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  androidInfoText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  stepsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12, // Kartlar arası sabit boşluk
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    height: 180, // Kartların aynı yükseklikte olmasını sağlayacak
  },
  stepsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',  // Yazı rengi beyaz
  },
  stepsLabel: {
    fontSize: 14,
    color: '#AAAAAA',  // Yazı rengi açık gri
  },
  stepsSummary: {
    flex: 1,
    marginLeft: 16,
  },
  stepsSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#AAAAAA',  // Yazı rengi açık gri
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',  // Yazı rengi beyaz
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  topCard: {
    marginBottom: 12,
  },
  bottomCard: {
    marginTop: 12,
  },
});

export default HealthDataScreen; 
