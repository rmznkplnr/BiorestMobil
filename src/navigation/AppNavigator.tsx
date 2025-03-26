import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, StyleSheet, Platform } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import DevicesScreen from '../screens/DevicesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SleepDetailsScreen from '../screens/SleepDetailsScreen';
import StoreScreen from '../screens/StoreScreen';
import DeviceManagementScreen from '../screens/DeviceManagementScreen';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
const AuthNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 0,
          paddingTop: 10,
          height: Platform.select({ ios: 80, android: 70 }),
          paddingBottom: Platform.select({ ios: 25, android: 20 }),
          position: 'absolute',
          elevation: 8,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        },
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'DevicesTab':
              iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
              break;
            case 'StatisticsTab':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'StoreTab':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={route.name === 'StoreTab' ? (focused ? '#09f760' : '#07b52c') : color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label;

          switch (route.name) {
            case 'HomeTab':
              label = 'Ana Sayfa';
              break;
            case 'DevicesTab':
              label = 'Cihazlar';
              break;
            case 'StatisticsTab':
              label = 'Sağlık';
              break;
            case 'StoreTab':
              label = 'Mağaza';
              break;
            case 'ProfileTab':
              label = 'Profil';
              break;
            default:
              label = '';
          }

          return (
            <Text style={{ 
              color: route.name === 'StoreTab' ? (focused ? '#09f760' : '#07b52c') : color, 
              fontSize: 12, 
              fontWeight: '600',
              textShadowColor: route.name === 'StoreTab' ? 'rgba(255, 68, 68, 0.3)' : 'transparent',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}>
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="DevicesTab" component={DevicesScreen} />
      <Tab.Screen name="StatisticsTab" component={StatisticsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
      <Tab.Screen name="StoreTab" component={StoreScreen} />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="DeviceDetail" 
        component={DeviceDetailScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="SleepDetails" 
        component={SleepDetailsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="DeviceManagement" 
        component={DeviceManagementScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    marginBottom: Platform.select({ ios: 0, android: 5 }),
  },
});

export default AppNavigator; 