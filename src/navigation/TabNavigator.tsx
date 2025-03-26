import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import StoreScreen from '../screens/StoreScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Devices') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'Health') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Store') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: route.name === 'Store' ? '#FF6B6B' : '#4a90e2',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
          paddingBottom: Platform.OS === 'android' ? 20 : 0,
          height: Platform.OS === 'android' ? 70 : 85,
          paddingTop: 10,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 0 : 5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarHideOnKeyboard: true,
        tabBarSafeAreaInsets: {
          bottom: Platform.OS === 'android' ? 0 : insets.bottom,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa'
        }}
      />
      <Tab.Screen 
        name="Devices" 
        component={DevicesScreen}
        options={{
          tabBarLabel: 'Cihazlar'
        }}
      />
      <Tab.Screen 
        name="Health" 
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Sağlık'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil'
        }}
      />
      <Tab.Screen 
        name="Store" 
        component={StoreScreen}
        options={{
          tabBarLabel: 'Mağaza',
          tabBarActiveTintColor: '#FF6B6B'
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 