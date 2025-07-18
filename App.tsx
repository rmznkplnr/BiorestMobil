import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from './src/navigation/types';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
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
import MiBand9Screen from './src/screens/MiBand9Screen';

// Amplify Gen2 konfigürasyonu
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import awsconfig from './src/aws-exports';

// Amplify yapılandırması
Amplify.configure(awsconfig);
console.log('App.tsx: Amplify Gen2 yapılandırması tamamlandı');

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
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
      }
    };

    // Auth state değişikliklerini dinle
    const authListener = Hub.listen('auth', (data) => {
      const { payload } = data;
      console.log('Auth event:', payload.event);
      
      if (payload.event === 'signedIn') {
        console.log('Kullanıcı giriş yaptı');
        setIsAuthenticated(true);
      } else if (payload.event === 'signedOut') {
        console.log('Kullanıcı çıkış yaptı');
        setIsAuthenticated(false);
      }
    });

    checkAuthStatus();

    // Cleanup
    return () => {
      authListener();
    };
  }, []);

  if (!isAuthReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Uygulama yükleniyor...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DeviceProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Auth"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Auth" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ConfirmAccount" component={ConfirmAccountScreen} />
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
              <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
              <Stack.Screen name="MiBand9" component={MiBand9Screen} />
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