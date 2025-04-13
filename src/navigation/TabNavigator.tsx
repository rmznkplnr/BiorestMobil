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

type TabNavigatorNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();

// Screen height'ı alalım (uzun ekranlar için)
const { height, width } = Dimensions.get('window');
// Farklı ekranlar ve cihazlar için boyut ayarlamaları yapılsın
const isTablet = width > 600;
const isLargeDevice = height > 800;

// Özel Tab Bar Butonu Bileşeni
const TabBarButton = ({ 
  focused, 
  iconName, 
  label, 
  iconColor, 
  labelColor, 
  onPress 
}: { 
  focused: boolean; 
  iconName: string; 
  label: string; 
  iconColor: string; 
  labelColor: string; 
  onPress: () => void;
}) => {
  // Animasyon değerleri
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (focused) {
      // Odaklanıldığında animasyon
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: -5,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Odaktan çıkıldığında animasyon
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        })
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
        <Ionicons name={iconName} size={isTablet ? 26 : 22} color={iconColor} />
        <Animated.Text 
          style={[
            styles.tabLabel, 
            { 
              color: labelColor,
              opacity: focused ? 1 : 0.7,
              marginTop: focused ? 4 : 3,
              fontSize: focused ? (isTablet ? 14 : 12) : (isTablet ? 12 : 10),
            }
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Özel Tab Bar Bileşeni
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  
  // Android için sabit bir minimum güvenli değer belirleyelim (emülatörler için)
  const safeAndroidBottom = Platform.OS === 'android' 
    ? Math.max(10, insets.bottom)  // En az 10px, insets doğru değilse bile
    : 0;
  
  return (
    <View style={[
      styles.customTabBar, 
      { 
        // Emülatör ve gerçek cihazlar için güvenli değer kullan
        bottom: safeAndroidBottom,
        height: Platform.OS === 'ios' 
          ? (isLargeDevice ? 85 : 75) 
          : (isTablet ? 70 : 60),
      }
    ]}>
      <View style={styles.tabBarBackground} />
      <View style={[
        styles.tabButtonsRow,
        {
          paddingBottom: Platform.OS === 'ios' 
            ? (isLargeDevice ? 30 : 20) 
            : Math.max(10, insets.bottom / 2), // Emülatör için daha güvenli değer
        }
      ]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          
          // İkon ve renk bilgilerini belirle
          let iconName = 'help-circle';
          let iconColor = focused ? '#4a90e2' : 'rgba(255, 255, 255, 0.7)';
          let labelColor = iconColor;
          let label = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            label = 'Ana Sayfa';
          } else if (route.name === 'Devices') {
            iconName = focused ? 'bluetooth' : 'bluetooth-outline';
            label = 'Cihazlar';
          } else if (route.name === 'Health') {
            iconName = focused ? 'heart' : 'heart-outline';
            iconColor = focused ? '#ff3b30' : 'rgba(255, 59, 48, 0.7)';
            labelColor = iconColor;
            label = 'Sağlık';
          } else if (route.name === 'Store') {
            iconName = focused ? 'cart' : 'cart-outline';
            iconColor = focused ? '#4cd964' : 'rgba(76, 217, 100, 0.7)';
            labelColor = iconColor;
            label = 'Mağaza';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            label = 'Profil';
          }
          
          // Tab butonun tıklama işlevi
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

          return (
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
        console.log('TabNavigator: Kullanıcı giriş yapmış', user.userId);
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
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Devices" component={DevicesScreen} />
      <Tab.Screen name="Health" component={HealthDataScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  customTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' 
      ? (isLargeDevice ? 85 : 75) 
      : (isTablet ? 70 : 60),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
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
  tabLabel: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default TabNavigator; 