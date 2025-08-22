import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Buffer'ı global hale getir
global.Buffer = Buffer;

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store, persistor } from './src/store';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import DeviceManagementScreen from './src/screens/DeviceManagementScreen';
import DeviceDetailScreen from './src/screens/DeviceDetailScreen';
import ConfirmAccountScreen from './src/screens/ConfirmAccountScreen';
import HealthDataScreen from './src/screens/HealthDataScreen';
import SleepDetailsScreen from './src/screens/SleepDetailsScreen';
import HeartRateDetailScreen from './src/screens/HeartRateDetailScreen';
import OxygenLevelDetailScreen from './src/screens/OxygenLevelDetailScreen';
import { DeviceProvider } from './src/context/DeviceContext';
import { Alert, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MiBand3Screen from './src/screens/MiBand3Screen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { RootStackParamList } from './src/navigation/types';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Amplify Gen2 konfigürasyonu
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import awsconfig from './src/aws-exports';

// Amplify yapılandırması
Amplify.configure(awsconfig);
console.log('App.tsx: Amplify Gen2 yapılandırması tamamlandı');

const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading component for PersistGate
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4a90e2" />
    <Text style={styles.loadingText}>Redux yükleniyor...</Text>
  </View>
);

const App = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    // İlk başta onboarding durumunu kontrol et
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      
      console.log('🔍 App.tsx - Onboarding durumu:', onboardingCompleted);
      
      if (onboardingCompleted === 'true') {
        setIsOnboardingCompleted(true);
        // Onboarding tamamlanmışsa auth durumunu kontrol et
        checkAuthStatus();
      } else {
        setIsOnboardingCompleted(false);
        setIsCheckingOnboarding(false);
      }
    } catch (error) {
      console.error('❌ Onboarding kontrol hatası:', error);
      setIsOnboardingCompleted(false);
      setIsCheckingOnboarding(false);
    }
  };

  useEffect(() => {
    // Auth durumu kontrol et (sadece onboarding tamamlanmışsa)
    if (isOnboardingCompleted) {
      checkAuthStatus();
    }
  }, [isOnboardingCompleted]);

  // Auth durumu kontrol et
  const checkAuthStatus = async () => {
    try {
      await getCurrentUser();
      console.log('Kullanıcı giriş yapmış');
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Kullanıcı giriş yapmamış');
      setIsAuthenticated(false);
    } finally {
      setIsAuthReady(true);
      setIsCheckingOnboarding(false);
    }
  };

  // Loading state kontrolü
  if (isCheckingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Uygulama başlatılıyor...</Text>
      </View>
    );
  }

  // Onboarding tamamlanmamışsa onboarding göster
  if (!isOnboardingCompleted) {
    console.log('📱 Onboarding gösterilecek');
  } else if (!isAuthReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Kullanıcı durumu kontrol ediliyor...</Text>
      </View>
    );
  }

  // Initial route'u belirle
  const getInitialRouteName = () => {
    if (!isOnboardingCompleted) {
      return 'Onboarding';
    }
    return 'Auth';
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DeviceProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={getInitialRouteName()}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Auth" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ConfirmAccount" component={ConfirmAccountScreen} />
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
              <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
              <Stack.Screen name="MiBand3" component={MiBand3Screen} />
              <Stack.Screen name="HealthData" component={HealthDataScreen} />
              <Stack.Screen name="HeartRateDetail" component={HeartRateDetailScreen} />
              <Stack.Screen name="OxygenLevelDetail" component={OxygenLevelDetailScreen} />
              <Stack.Screen name="SleepDetailsScreen" component={SleepDetailsScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </DeviceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorHelp: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;