export interface BaseHealthMetric {
  values: number[];
  times: string[];
  lastUpdated: string;
  status: 'good' | 'warning' | 'bad';
}

export interface HeartRateMetric extends BaseHealthMetric {
  average: number;
  max: number;
  min: number;
}

export interface OxygenMetric extends BaseHealthMetric {
  average: number;
  max: number;
  min: number;
}

export interface SleepStage {
  stage: 'deep' | 'light' | 'rem' | 'awake';
  startTime: string;
  endTime: string;
}

export interface SleepMetric extends BaseHealthMetric {
  // Temel uyku süreleri
  duration: number;       // Toplam uyku süresi (dakika)
  efficiency: number;     // Uyku verimliliği (%)
  
  // Uyku aşama süreleri
  deep: number;           // Derin uyku süresi (dakika)
  light: number;          // Hafif uyku süresi (dakika)
  rem: number;            // REM uyku süresi (dakika)
  awake: number;          // Uyanık kalma süresi (dakika)
  
  // Başlangıç/bitiş zamanları
  startTime: string;      // Uykunun başlangıç zamanı (ISO string)
  endTime: string;        // Uykunun bitiş zamanı (ISO string)
  
  // Uyku aşamaları detaylı bilgisi
  stages: SleepStage[];   // Uyku aşamaları dizisi
  
  // Toplam dakika (BaseHealthMetric yapısından farklı bir hesaplama için)
  totalMinutes: number;   // Toplam uyku süresi (dakika)
  
  // Farklı veri yapılarıyla uyumluluk için alternatif alanlar
  sleepScore?: number;    // Uyku puanı (isteğe bağlı)
}


export interface ActivityMetric extends BaseHealthMetric {
  total: number;
}

export interface HealthData {
  heartRate: HeartRateMetric;
  oxygen: OxygenMetric;
  sleep: SleepMetric;
  steps: ActivityMetric;
  calories: ActivityMetric;
}

// Platform spesifik tip dönüşümleri için yardımcı fonksiyonlar
export const mapHealthConnectData = (rawData: any): HealthData => {
  console.log('mapHealthConnectData gelen veri:', JSON.stringify(rawData));

  const defaultMetric = {
    values: [],
    times: [],
    lastUpdated: new Date().toISOString(),
    status: 'good' as const
  };

  const heartRate = {
    ...defaultMetric,
    average: rawData?.heartRate?.average || 0,
    max: rawData?.heartRate?.max || 0,
    min: rawData?.heartRate?.min || 0,
    values: rawData?.heartRate?.values || [],
    times: rawData?.heartRate?.times || [],
    lastUpdated: rawData?.heartRate?.lastUpdated || new Date().toISOString()
  };

  const oxygen = {
    ...defaultMetric,
    average: rawData?.oxygen?.average || 0,
    max: rawData?.oxygen?.max || 0,
    min: rawData?.oxygen?.min || 0,
    values: rawData?.oxygen?.values || [],
    times: rawData?.oxygen?.times || [],
    lastUpdated: rawData?.oxygen?.lastUpdated || new Date().toISOString()
  };

  const sleep = {
    ...defaultMetric,
    // Temel uyku verileri
    duration: rawData?.sleep?.duration || 0,
    efficiency: rawData?.sleep?.efficiency || 0,
    
    // Aşama süreleri
    deep: rawData?.sleep?.deep || 0,
    light: rawData?.sleep?.light || 0,
    rem: rawData?.sleep?.rem || 0,
    awake: rawData?.sleep?.awake || 0,
    
    // Zaman bilgileri
    startTime: rawData?.sleep?.startTime || new Date().toISOString(),
    endTime: rawData?.sleep?.endTime || new Date().toISOString(),
    
    // Aşama detayları
    stages: rawData?.sleep?.stages || [],
    
    // İstatistik bilgileri
    values: rawData?.sleep?.values || [],
    times: rawData?.sleep?.times || [],
    totalMinutes: rawData?.sleep?.totalMinutes || rawData?.sleep?.duration || 0,
    
    // Opsiyonel alanlar
    sleepScore: rawData?.sleep?.sleepScore || 0
  };

  // Veri yapısı kontrolü ve düzeltme - HealthConnectService'ten gelen veri yapısına göre
  let stepsTotal = 0;
  if (typeof rawData?.steps === 'number') {
    stepsTotal = rawData.steps;
  } else if (rawData?.steps?.total !== undefined) {
    stepsTotal = rawData.steps.total;
  }
  
  const steps = {
    ...defaultMetric,
    total: stepsTotal,
    goal: 10000,
    values: rawData?.steps?.values || [],
    times: rawData?.steps?.times || []
  };

  // Veri yapısı kontrolü ve düzeltme - HealthConnectService'ten gelen veri yapısına göre
  let caloriesTotal = 0;
  if (typeof rawData?.calories === 'number') {
    caloriesTotal = rawData.calories;
  } else if (rawData?.calories?.total !== undefined) {
    caloriesTotal = rawData.calories.total;
  }
  
  const calories = {
    ...defaultMetric,
    total: caloriesTotal,
    goal: 2000,
    values: rawData?.calories?.values || [],
    times: rawData?.calories?.times || []
  };

  console.log('mapHealthConnectData dönüştürülmüş veri:', JSON.stringify({
    steps: steps.total,
    calories: calories.total
  }));

  return {
    heartRate,
    oxygen,
    sleep,
    steps,
    calories
  };
};

// iOS HealthKit verisini HealthData formatına dönüştürür
export const mapHealthKitData = (rawData: any): HealthData => {
  const defaultMetric = {
    values: [],
    times: [],
    lastUpdated: new Date().toISOString(),
    status: 'good' as const
  };

  const heartRate = {
    ...defaultMetric,
    average: rawData?.heartRate?.average || 0,
    max: rawData?.heartRate?.max || 0,
    min: rawData?.heartRate?.min || 0,
    values: rawData?.heartRate?.values || [],
    times: rawData?.heartRate?.times || [],
    lastUpdated: rawData?.heartRate?.lastUpdated || new Date().toISOString()
  };

  const oxygen = {
    ...defaultMetric,
    average: rawData?.oxygen?.average || 0,
    max: rawData?.oxygen?.max || 0,
    min: rawData?.oxygen?.min || 0,
    values: rawData?.oxygen?.values || [],
    times: rawData?.oxygen?.times || [],
    lastUpdated: rawData?.oxygen?.lastUpdated || new Date().toISOString()
  };

  const sleep = {
    ...defaultMetric,
    duration: rawData?.sleep?.duration || 0,
    efficiency: rawData?.sleep?.efficiency || 0,
    deep: rawData?.sleep?.deep || 0,
    light: rawData?.sleep?.light || 0,
    rem: rawData?.sleep?.rem || 0,
    awake: rawData?.sleep?.awake || 0,
    startTime: rawData?.sleep?.startTime || new Date().toISOString(),
    endTime: rawData?.sleep?.endTime || new Date().toISOString(),
    stages: rawData?.sleep?.stages || [],
    totalMinutes: rawData?.sleep?.totalMinutes || rawData?.sleep?.duration || 0,
    sleepScore: rawData?.sleep?.sleepScore || 0,
    values: rawData?.sleep?.values || [],
    times: rawData?.sleep?.times || []
  };

  const steps = {
    ...defaultMetric,
    total: rawData?.steps || 0,
    values: rawData?.steps?.values || [],
    times: rawData?.steps?.times || []
  };

  const calories = {
    ...defaultMetric,
    total: rawData?.calories || 0,
    values: rawData?.calories?.values || [],
    times: rawData?.calories?.times || []
  };

  return {
    heartRate,
    oxygen,
    sleep,
    steps,
    calories
  };
};
