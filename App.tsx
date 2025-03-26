import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { DeviceProvider } from './src/context/DeviceContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DeviceProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </DeviceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App; 