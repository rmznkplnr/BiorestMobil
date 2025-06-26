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
// AWS Amplify kaldırıldı - Gen2 için yeniden yapılandırılacak

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  // Auth sistemi geçici olarak devre dışı - Gen2 ile yeniden yapılandırılacak

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
              <Stack.Screen name="HealthData" component={HealthDataScreen} />
              <Stack.Screen name="HeartRateDetail" component={HeartRateDetailScreen} />
              <Stack.Screen name="OxygenLevelDetail" component={OxygenLevelDetailScreen} />
              <Stack.Screen name="SleepDetails" component={SleepDetailsScreen} />
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