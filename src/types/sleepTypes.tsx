// Uyku bildirimleri için türler
export interface SleepNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  time: string;
  type: 'sleepStart' | 'sleepEnd' | 'sleepQuality' | 'sleepDisturbed';
  data?: {
    sleepQuality?: number;
    sleepDuration?: number;
    deepSleepPercentage?: number;
    remSleepPercentage?: number;
    lightSleepPercentage?: number;
    disturbanceCount?: number;
    timeToFallAsleep?: number;
  };
}

// Uyku verisi için tip tanımlamaları
export interface SleepData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // dakika cinsinden
  quality: number; // 0-100 arası
  stages: {
    deep: number; // dakika cinsinden
    light: number; // dakika cinsinden
    rem: number; // dakika cinsinden
    awake: number; // dakika cinsinden
  };
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  respirationRate: {
    average: number;
    min: number;
    max: number;
  };
  disturbances: Array<{
    time: string;
    duration: number;
    type: 'movement' | 'noise' | 'light' | 'temperature';
  }>;
  environmentalFactors: {
    avgTemperature: number;
    avgHumidity: number;
    avgNoise: number;
    avgLight: number;
  };
} 