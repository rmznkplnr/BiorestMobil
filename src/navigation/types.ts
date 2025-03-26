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
  Auth: undefined;
  Main: undefined;
  DeviceDetail: {
    deviceId: string;
  };
  SleepDetails: {
    sleepData: SleepNotification;
  };
  DeviceManagement: undefined;
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
};

export type TabParamList = {
  HomeTab: undefined;
  DevicesTab: undefined;
  StatisticsTab: undefined;
  ProfileTab: undefined;
}; 