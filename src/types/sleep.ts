export interface SleepNotification {
  date: string;
  lightLevel: string;
  fragrance: string;
  sound: string;
  duration: string;
  heartRateData: {
    time: string[];
    rates: number[];
    events: Array<{
      time: string;
      action: string;
      effect: string;
    }>;
  };
} 