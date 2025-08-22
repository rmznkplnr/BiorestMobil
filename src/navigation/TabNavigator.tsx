import React, { useEffect, useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Platform, TouchableOpacity, View, Text, Dimensions, Animated, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getCurrentUser } from 'aws-amplify/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HealthDataScreen from '../screens/HealthDataScreen';
import StoreScreen from '../screens/StoreScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RootStackParamList } from './types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import theme from '../theme';

type TabNavigatorNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();

// Cihaza göre uyumlu boyutlar için
const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isLargeDevice = width >= 812 || height >= 812; // iPhone X ve üzeri

// Tab Button Props tipi
interface TabBarButtonProps {
  focused: boolean;
  iconName: string;
  label: string;
  onPress: () => void;
  iconColor: string;
  labelColor: string;
}

// Faunus Device Button Props tipi
interface FaunusDeviceButtonProps {
  navigation: any;
}

// TabBar düğmesi bileşeni
const TabBarButton = ({ 
  focused, 
  iconName, 
  label, 
  onPress, 
  iconColor, 
  labelColor 
}: TabBarButtonProps) => {
  // Animasyonlar için ref değerleri
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Düğme odaklandığında animasyon
  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: -4,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scaleAnim, translateYAnim]);

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View 
        style={[
          styles.tabIconContainer, 
          { 
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim }
            ]
          }
        ]}
      >
        <Ionicons 
          name={iconName} 
          size={theme.metrics.iconSize.medium} 
          color={iconColor} 
        />
        <Animated.Text 
          style={[
            styles.tabLabel, 
            { 
              color: labelColor,
              opacity: focused ? 1 : 0.7,
              marginTop: focused ? 4 : 3,
              fontSize: focused ? theme.metrics.fontSize.s : theme.metrics.fontSize.xs,
            }
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Faunus Cihaz Butonu
const FaunusDeviceButton = ({ navigation }: FaunusDeviceButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusScaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Focus animasyonu - diğer butonlar gibi
  useEffect(() => {
    // Sürekli focus efekti için
    Animated.parallel([
      Animated.spring(focusScaleAnim, {
        toValue: 1.15, // Biraz daha büyük olsun
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: -6, // Biraz daha yukarı kalksın
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focusScaleAnim, translateYAnim]);

  const handlePress = () => {
    // Basma animasyonu - daha belirgin büyüme
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5, // Önce büyüt
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.15, // Sonra normale dön
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Devices sayfasına git
    navigation.navigate('Devices');
  };

  return (
    <TouchableOpacity
      style={styles.faunusButton}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.faunusImageContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, focusScaleAnim) }, // İki animasyonu birleştir
              { translateY: translateYAnim }
            ]
          }
        ]}
      >
        <Image
          source={require('../assets/ffanus.png')}
          style={styles.faunusImage}
          resizeMode="contain"
        />
        
      </Animated.View>
    </TouchableOpacity>
  );
};

// Özel TabBar bileşeni
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  
  // Sayfa geçişinde animasyonları tetiklemek için timer kullanın
  const [renderTimer, setRenderTimer] = useState(0);
  
  useEffect(() => {
    // Sayfa değişimlerinde animasyonların tetiklenmesini sağla
    const timer = setTimeout(() => {
      setRenderTimer(prev => prev + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [state.index]);

  return (
    <View style={[
      styles.customTabBar, 
      { 
        bottom: 0,
        paddingBottom: insets.bottom,
      }
    ]}>
      <View style={styles.tabBarBackground} />
      <View style={styles.tabButtonsRow}>
        {/* İlk tab: Home */}
        <TabBarButton
          key="home"
          focused={state.index === 0}
          iconName={state.index === 0 ? 'home' : 'home-outline'}
          label="Ana Sayfa"
          iconColor={state.index === 0 ? theme.colors.primary.light : theme.colors.text.tertiary}
          labelColor={state.index === 0 ? theme.colors.primary.light : theme.colors.text.tertiary}
          onPress={() => navigation.navigate('Home')}
        />
        
        {/* İkinci tab: Health */}
        <TabBarButton
          key="health"
          focused={state.index === 1}
          iconName={state.index === 1 ? 'heart' : 'heart-outline'}
          label="Sağlık"
          iconColor={state.index === 1 ? '#dc2626' : 'rgba(239, 68, 68, 0.7)'}
          labelColor={state.index === 1 ? '#dc2626' : 'rgba(239, 68, 68, 0.7)'}
          onPress={() => navigation.navigate('HealthData')}
        />
        
        {/* Üçüncü tab: Faunus Cihaz Resmi (ortada) */}
        <FaunusDeviceButton navigation={navigation} />
        
        {/* Dördüncü tab: Store */}
        <TabBarButton
          key="store"
          focused={state.index === 2}
          iconName={state.index === 2 ? 'cart' : 'cart-outline'}
          label="Mağaza"
          iconColor={state.index === 2 ? '#059669' : 'rgba(55, 168, 18, 0.7)'}
          labelColor={state.index === 2 ? '#059669' : 'rgba(55, 168, 18, 0.7)'}
          onPress={() => navigation.navigate('Store')}
        />
        
        {/* Beşinci tab: Profile */}
        <TabBarButton
          key="profile"
          focused={state.index === 3}
          iconName={state.index === 3 ? 'person' : 'person-outline'}
          label="Profil"
          iconColor={state.index === 3 ? theme.colors.primary.light : theme.colors.text.tertiary}
          labelColor={state.index === 3 ? theme.colors.primary.light : theme.colors.text.tertiary}
          onPress={() => navigation.navigate('Profile')}
        />
             </View>
    </View>
  );
};

// Ana TabNavigator bileşeni (DevicesScreen'i hala dahil ediyoruz çünkü Faunus button'u oraya yönlendiriyor)
const TabNavigator = () => {
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Kimlik doğrulama durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        // Kullanıcı giriş yapmış mı kontrol et
        const user = await getCurrentUser();
        console.log('TabNavigator: Kullanıcı giriş yapmış', user.username);
      } catch (error) {
        // Eğer kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
        console.log('TabNavigator: Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }]
        });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Her 10 dakikada bir kimlik kontrolü yap
    const authCheckInterval = setInterval(checkAuth, 10 * 60 * 1000);
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, [navigation]);

  // Sekme aktif olduğunda kimlik kontrolü yap
  useFocusEffect(
    React.useCallback(() => {
      const checkAuthOnFocus = async () => {
        try {
          await getCurrentUser();
          console.log('TabNavigator Focus: Kullanıcı giriş yapmış');
        } catch (error) {
          console.log('TabNavigator Focus: Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }]
          });
        }
      };

      checkAuthOnFocus();
      
      return () => {
        // Temizlik kodu
      };
    }, [navigation])
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="HealthData" component={HealthDataScreen} options={{ title: 'Sağlık' }} />
      <Tab.Screen name="Store" component={StoreScreen} options={{ title: 'Mağaza' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      {/* Hidden tab - sadece Faunus button'undan erişilebilir */}
      <Tab.Screen 
        name="Devices" 
        component={DevicesScreen} 
        options={{ 
          title: 'Cihazlar',
          tabBarStyle: { display: 'none' } // Tab bar'da görünmez
        }} 
      />
    </Tab.Navigator>
  );
};

// Stil tanımları
const styles = StyleSheet.create({
  customTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: theme.metrics.tabBarHeight,
    ...theme.shadow('medium'),
    zIndex: 8,
  },
  tabBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Platform.OS === 'android' ? 20 : 0,
    marginHorizontal: Platform.OS === 'android' ? 8 : 0,
  },
  tabButtonsRow: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    zIndex: 2, // Faunus butonundan daha yüksek öncelik
  },
  tabIconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeTabIconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabLabel: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  storeTabLabel: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  faunusButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80, // Sabit genişlik - sadece resim alanı
    height: 60, // Sabit yükseklik - sadece resim alanı 
    zIndex: 1, // Diğer butonlarla çakışma olmasın
    marginTop: 8, // Üstten boşluk
  },
  faunusImageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80, // Tam resim alanı
    height: 60, // Tam resim alanı
    overflow: 'hidden', // Taşan kısmı kes
  },
  faunusImage: {
    width: 200, // Container ile aynı genişlik
    height: 150, // Container ile aynı yükseklik
    resizeMode: 'contain', // Resmin oranını koru
    // tintColor kaldırıldı - orijinal renkleri kullanacak
  },

});

export default TabNavigator; 