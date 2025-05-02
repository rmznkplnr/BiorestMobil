import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SleepData, SleepNotification as ImportedSleepNotification } from '../types/sleepTypes';

// Z-score hesaplama için tip tanımları
export interface SleepMetrics {
    date: string;
    remSleep: number; // dakika
    deepSleep: number; // dakika
    heartRate: number; // BPM
    sleepDuration: number; // dakika
    sleepEfficiency: number; // yüzde
  }
  
  // Uyku bildirimi için tip tanımı
  export interface SleepNotification {
    date: string;
    lightLevel: string;
    fragrance: string;
    sound: string;
    duration: string;
    heartRateData: {
      time: string[];
      rates: number[];
      events: {
        time: string;
        action: string;
        effect: string;
      }[];
    };
  }
  
  export type RootStackParamList = {
    // Auth Screens
    Auth: undefined;
    Register: undefined;
    ConfirmAccount: { email: string };
    ForgotPassword: undefined;
    ResetPassword: { email: string };
    
    // Main App Screens
    Main: undefined;
    
    // Device Screens
    DeviceManagement: undefined;
    DeviceDetail: { deviceId: string };
    
    // Sleep Screens
    SleepDetails: { sleepData: SleepData };
    
    // Health Screens
    HealthData: undefined;

    // Store Screens
    ProductDetail: { productId: string };

    // Settings Screen
    Settings: undefined;
  };
  
  export type AuthStackParamList = {
    Login: undefined;
  };
export type MainTabParamList = {
    HomeTab: undefined;
    StatisticsTab: undefined;
    DevicesTab: undefined;
    StoreTab: undefined;
    ProfileTab: undefined;
    HealthTab: undefined;
  };
  
  export type TabParamList = {
    Home: undefined;
    Devices: undefined;
    Store: undefined;
    Profile: undefined;
    Health: undefined;
  };
  
  export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
    RootStackParamList,
    Screen
  >; 