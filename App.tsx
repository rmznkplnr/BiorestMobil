import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/navigation/types';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TabNavigator from './src/navigation/TabNavigator';
import DeviceManagementScreen from './src/screens/DeviceManagementScreen';
import DeviceDetailScreen from './src/screens/DeviceDetailScreen';
import ConfirmAccountScreen from './src/screens/ConfirmAccountScreen';
import HealthDataScreen from './src/screens/HealthDataScreen';
import SleepDetailsScreen from './src/screens/SleepDetailsScreen';
import { DeviceProvider } from './src/context/DeviceContext';
import { Alert, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import awsconfig from './src/aws-exports';
import { Auth, API, Hub, Amplify } from 'aws-amplify';

// Amplify yapılandırması
console.log('App.tsx: Amplify yapılandırması başlıyor');
Amplify.configure(awsconfig);
console.log('App.tsx: Amplify yapılandırması tamamlandı - Auth modu: AMAZON_COGNITO_USER_POOLS');

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Auth durumu kontrol et
    const checkAuthStatus = async () => {
      try {
        await Auth.currentAuthenticatedUser();
        console.log('Kullanıcı giriş yapmış');
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Kullanıcı giriş yapmamış');
        setIsAuthenticated(false);
      } finally {
        setIsAuthReady(true);
      }
    };

    // Auth hatalarını dinle
    const authListener = Hub.listen('auth', (data) => {
      const { payload } = data;
      console.log('Auth event:', payload.event);
      
      if (payload.event === 'signIn') {
        console.log('Kullanıcı giriş yaptı');
        setIsAuthenticated(true);
      } else if (payload.event === 'signOut') {
        console.log('Kullanıcı çıkış yaptı');
        setIsAuthenticated(false);
      } else if (payload.event === 'signIn_failure') {
        console.log('Giriş başarısız oldu:', payload);
        
        // Basit hata mesajı
        setAuthError('Bağlantı hatası: Giriş yapılamadı');
      }
    });

    checkAuthStatus();

    // Temizlik
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

  if (authError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
        <Text style={styles.errorText}>{authError}</Text>
        <Text style={styles.errorHelp}>Lütfen internet bağlantınızı kontrol edin ve uygulamayı yeniden başlatın.</Text>
      </View>
    );
  }

  return (
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
            <Stack.Screen name="HealthData" component={HealthDataScreen} />
            <Stack.Screen name="SleepDetails" component={SleepDetailsScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DeviceProvider>
    </SafeAreaProvider>
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