/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Ekranları içe aktarıyoruz
import HomeScreen from './src/screens/HomeScreen';
import HealthDataScreen from './src/screens/HealthDataScreen';
import DeviceSettingsScreen from './src/screens/DeviceSettingsScreen';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'BioRest'}}
        />
        <Stack.Screen
          name="HealthData"
          component={HealthDataScreen}
          options={{title: 'Sağlık Verileri'}}
        />
        <Stack.Screen
          name="DeviceSettings"
          component={DeviceSettingsScreen}
          options={{title: 'Cihaz Ayarları'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
