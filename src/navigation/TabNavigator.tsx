import React, { useEffect, useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Platform, TouchableOpacity, View, Text, Dimensions, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getCurrentUser } from 'aws-amplify/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HealthDataScreen from '../screens/HealthDataScreen';
import StoreScreen from '../screens/StoreScreen';
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
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          
          const label = options.tabBarLabel || options.title || route.name;
          const focused = state.index === index;
          
          // İkon renklerini ve etiketleri belirleyin
          const iconColor = focused ? theme.colors.primary.light : theme.colors.text.tertiary;
          const labelColor = focused ? theme.colors.primary.light : theme.colors.text.tertiary;
          
          // Mağaza butonu için özel stil
          const isStoreButton = route.name === 'Store';

          // sağlık butonu için özel still
          const isHealthButton = route.name === 'HealthData';

          
          // Her sekme için doğru ikonu belirleyin
          let iconName = '';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Devices') {
            iconName = focused ? 'bluetooth' : 'bluetooth-outline';
          } else if (route.name === 'HealthData') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Store') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          // Sekmye dokunulduğunda gerçekleşecek işlev
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return isStoreButton ? (
            <TabBarButton
              key={route.key}
              focused={focused}
              iconName={iconName}
              label={label}
              iconColor={focused ? '#059669' : 'rgba(55, 168, 18, 0.7)'}
              labelColor={focused ? '#059669' : 'rgba(55, 168, 18, 0.7)'}
              onPress={onPress}
            />
          ) : isHealthButton ? (
            <TabBarButton
              key={route.key}
              focused={focused}
              iconName={iconName}
              label={label}
              iconColor={focused ? '#dc2626' : 'rgba(239, 68, 68, 0.7)'} 
              labelColor={focused ? '#dc2626' : 'rgba(239, 68, 68, 0.7)'}
              onPress={onPress}
            />
          ) : (
            <TabBarButton
              key={route.key}
              focused={focused}
              iconName={iconName}
              label={label}
              iconColor={iconColor}
              labelColor={labelColor}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

// Ana TabNavigator bileşeni
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
      <Tab.Screen name="Devices" component={DevicesScreen} />
      <Tab.Screen name="HealthData" component={HealthDataScreen} options={{ title: 'Sağlık' }} />
      <Tab.Screen name="Store" component={StoreScreen} options={{ title: 'Mağaza' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
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
});

export default TabNavigator; 