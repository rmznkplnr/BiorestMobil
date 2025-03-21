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
          height: Platform.select({ ios: 80, android: 60 }),
          paddingBottom: Platform.select({ ios: 25, android: 10 }),
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
            case 'StatisticsTab':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'DevicesTab':
              iconName = focused ? 'watch' : 'watch-outline';
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

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label;

          switch (route.name) {
            case 'HomeTab':
              label = 'Ana Sayfa';
              break;
            case 'StatisticsTab':
              label = 'İstatistik';
              break;
            case 'DevicesTab':
              label = 'Cihazlar';
              break;
            case 'StoreTab':
              label = 'Mağaza';
              break;
            case 'ProfileTab':
              label = 'Profil';
              break;
            default:
              label = route.name;
          }

          return (
            <Text style={[
              styles.tabLabel,
              { color, opacity: focused ? 1 : 0.8 }
            ]}>
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="StatisticsTab" component={StatisticsScreen} />
      <Tab.Screen name="DevicesTab" component={DevicesScreen} />
      <Tab.Screen name="StoreTab" component={StoreScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
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