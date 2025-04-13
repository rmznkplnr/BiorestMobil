import { Alert } from 'react-native';

/**
 * Sağlık verisi tipleri
 */
export interface HealthData {
  heartRate: {
    average: number;
    values: number[];
    times: string[];
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    max: number;
    min: number;
  };
  oxygen: {
    average: number;
    values: number[];
    times: string[];
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    max: number;
    min: number;
  };
  sleep: {
    duration: number;
    efficiency: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    deep: number;
  };
  stress: {
    average: number;
    values: number[];
    times: string[];
    lastUpdated: string;
    status: 'good' | 'warning' | 'bad';
    category: string;
    count?: number;
  };
  steps: {
    count: number;
    goal: number;
    lastUpdated: string;
  };
  distance: {
    value: number;
    unit: string;
    lastUpdated: string;
  };
  calories: {
    value: number;
    goal: number;
    lastUpdated: string;
  };
}

export interface SelectedPoint {
  value: number;
  time: string;
  x: number;
  y: number;
  chartType: 'heartRate' | 'oxygen' | 'stress';
  index: number;
}

/**
 * Health Connect'ten gelen verileri işleyip formatlayan fonksiyon
 */
export const processHealthConnectData = (rawData: any): HealthData => {
  console.log('İşlenecek ham veri:', rawData);
  
  // Sonuç nesnesini oluştur
  const result: HealthData = {
    heartRate: {
      average: 0,
      values: [],
      times: [],
      lastUpdated: new Date().toISOString(),
      status: 'good',
      max: 0,
      min: 0
    },
    oxygen: {
      average: 0,
      values: [],
      times: [],
      lastUpdated: new Date().toISOString(),
      status: 'good',
      max: 0,
      min: 0
    },
    sleep: {
      duration: 0,
      efficiency: 0,
      deepSleep: 0,
      lightSleep: 0,
      remSleep: 0,
      lastUpdated: new Date().toISOString(),
      status: 'good',
      deep: 0
    },
    stress: {
      average: 0,
      values: [],
      times: [],
      lastUpdated: new Date().toISOString(),
      status: 'good',
      category: 'Normal',
      count: 0
    },
    steps: {
      count: 0,
      goal: 10000,
      lastUpdated: new Date().toISOString()
    },
    distance: {
      value: 0,
      unit: 'm',
      lastUpdated: new Date().toISOString()
    },
    calories: {
      value: 0,
      goal: 2000,
      lastUpdated: new Date().toISOString()
    }
  };
  
  // Kalp atış hızı verilerini işle
  if (rawData.heartRate && 
      rawData.heartRate.values && 
      rawData.heartRate.values.length > 0) {
    
    result.heartRate.values = [...rawData.heartRate.values];
    result.heartRate.times = [...rawData.heartRate.times];
    
    if (rawData.heartRate.average !== undefined) {
      result.heartRate.average = rawData.heartRate.average;
    } else if (result.heartRate.values.length > 0) {
      result.heartRate.average = result.heartRate.values.reduce((a, b) => a + b, 0) / result.heartRate.values.length;
    }
    
    if (rawData.heartRate.max !== undefined) {
      result.heartRate.max = rawData.heartRate.max;
    } else if (result.heartRate.values.length > 0) {
      result.heartRate.max = Math.max(...result.heartRate.values);
    }
    
    if (rawData.heartRate.min !== undefined) {
      result.heartRate.min = rawData.heartRate.min;
    } else if (result.heartRate.values.length > 0) {
      result.heartRate.min = Math.min(...result.heartRate.values);
    }
    
    // Timestamp'i ayarla
    if (rawData.heartRate.lastUpdated) {
      result.heartRate.lastUpdated = rawData.heartRate.lastUpdated;
    } else if (result.heartRate.times.length > 0) {
      result.heartRate.lastUpdated = result.heartRate.times[result.heartRate.times.length - 1];
    }
    
    // Status kontrolü
    if (!rawData.heartRate.status) {
      if (result.heartRate.average > 100) {
        result.heartRate.status = 'warning';
      } else if (result.heartRate.average > 120) {
        result.heartRate.status = 'bad';
      } else {
        result.heartRate.status = 'good';
      }
    } else {
      result.heartRate.status = rawData.heartRate.status;
    }
  }
  
  // Oksijen seviyesi verilerini işle
  if (rawData.oxygen && 
      rawData.oxygen.values && 
      rawData.oxygen.values.length > 0) {
    
    result.oxygen.values = [...rawData.oxygen.values];
    result.oxygen.times = [...rawData.oxygen.times];
    
    if (rawData.oxygen.average !== undefined) {
      result.oxygen.average = rawData.oxygen.average;
    } else if (result.oxygen.values.length > 0) {
      result.oxygen.average = result.oxygen.values.reduce((a, b) => a + b, 0) / result.oxygen.values.length;
    }
    
    // En yüksek ve en düşük değerleri hesapla
    if (result.oxygen.values.length > 0) {
      result.oxygen.max = Math.max(...result.oxygen.values);
      result.oxygen.min = Math.min(...result.oxygen.values);
    }
    
    // Timestamp'i ayarla
    if (rawData.oxygen.lastUpdated) {
      result.oxygen.lastUpdated = rawData.oxygen.lastUpdated;
    } else if (result.oxygen.times.length > 0) {
      result.oxygen.lastUpdated = result.oxygen.times[result.oxygen.times.length - 1];
    }
    
    // Status kontrolü
    if (!rawData.oxygen.status) {
      if (result.oxygen.average < 95) {
        result.oxygen.status = 'warning';
      } else if (result.oxygen.average < 90) {
        result.oxygen.status = 'bad';
      } else {
        result.oxygen.status = 'good';
      }
    } else {
      result.oxygen.status = rawData.oxygen.status || 'good';
    }
  }

  // Uyku verisini işle
  if (rawData.sleep && rawData.sleep.duration) {
    // HealthConnectService'den gelen verileri doğru alanlara kopyala
    result.sleep.duration = rawData.sleep.duration || 0;
    result.sleep.efficiency = rawData.sleep.efficiency || 0;
    
    // HealthConnectService'den gelen uyku aşamaları
    result.sleep.deep = rawData.sleep.deep || 0;
    result.sleep.lightSleep = rawData.sleep.light || 0; // light -> lightSleep eşlemesi
    result.sleep.remSleep = rawData.sleep.rem || 0;     // rem -> remSleep eşlemesi
    
    // HealthData interface'i ile uyumlu olması için 'deep' değerini de kopyala
    result.sleep.deep = rawData.sleep.deep || 0;
    
    if (rawData.sleep.lastUpdated) {
      result.sleep.lastUpdated = rawData.sleep.lastUpdated;
    } else if (rawData.sleep.endTime) {
      result.sleep.lastUpdated = rawData.sleep.endTime;
    }
    
    // Status kontrolü
    if (!rawData.sleep.status) {
      if (rawData.sleep.efficiency < 70) {
        result.sleep.status = 'bad';
      } else if (rawData.sleep.efficiency < 85) {
        result.sleep.status = 'warning';
      } else {
        result.sleep.status = 'good';
      }
    } else {
      result.sleep.status = rawData.sleep.status || 'good';
    }
  }

  // Stres verisini işle
  if (rawData.stress && 
      rawData.stress.values && 
      rawData.stress.values.length > 0) {
    
    result.stress.values = [...rawData.stress.values];
    result.stress.times = [...rawData.stress.times];
    
    if (rawData.stress.average !== undefined) {
      result.stress.average = rawData.stress.average;
    } else if (result.stress.values.length > 0) {
      result.stress.average = result.stress.values.reduce((a, b) => a + b, 0) / result.stress.values.length;
    }
    
    result.stress.count = result.stress.values.length;
    
    // Kategori bilgisini al
    if (rawData.stress.category) {
      result.stress.category = rawData.stress.category;
    } else {
      // Ortalama stres seviyesine göre kategori belirle
      const avgStress = result.stress.average;
      if (avgStress < 30) {
        result.stress.category = 'Düşük';
      } else if (avgStress < 60) {
        result.stress.category = 'Normal';
      } else if (avgStress < 80) {
        result.stress.category = 'Yüksek';
      } else {
        result.stress.category = 'Çok Yüksek';
      }
    }
    
    // Status kontrolü
    if (!rawData.stress.status) {
      if (result.stress.average > 70) {
        result.stress.status = 'bad';
      } else if (result.stress.average > 50) {
        result.stress.status = 'warning';
      } else {
        result.stress.status = 'good';
      }
    } else {
      result.stress.status = rawData.stress.status;
    }

    // Timestamp'i ayarla
    if (rawData.stress.lastUpdated) {
      result.stress.lastUpdated = rawData.stress.lastUpdated;
    } else if (result.stress.times.length > 0) {
      result.stress.lastUpdated = result.stress.times[result.stress.times.length - 1];
    }
  }

  // Diğer aktivite verilerini işle
  if (rawData.steps !== undefined) {
    result.steps.count = rawData.steps;
  }
  
  if (rawData.distance !== undefined) {
    result.distance.value = rawData.distance;
  }
  
  if (rawData.calories !== undefined) {
    result.calories.value = rawData.calories;
  }

  console.log('İşlenmiş veriler:', 
              'Nabız:', result.heartRate.values.length, 
              'Oksijen:', result.oxygen.values.length,
              'Uyku:', result.sleep.duration);
              
  // Eğer veriler boş ise uyarı göster
  if (result.heartRate.values.length === 0 && result.oxygen.values.length === 0) {
    console.warn('Health Connect\'ten veri alınamadı veya yeterli veri bulunamadı');
  }

  return result;
};

/**
 * Tarih formatını kısaltan yardımcı fonksiyon
 */
export const formatTime = (time: string, format: 'day' | 'week' | 'month'): string => {
  try {
    const date = new Date(time);
    if (format === 'day') {
      // Sadece saat ve dakika
      return date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
    } else if (format === 'week') {
      // Kısa gün ismi (Pzt, Sal vb.)
      return date.toLocaleDateString('tr-TR', {weekday: 'short'});
    } else {
      // Gün/Ay şeklinde (01/03 gibi)
      return date.toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit'});
    }
  } catch (error) {
    // Eğer geçerli bir tarih değilse olduğu gibi döndür
    return time;
  }
};

/**
 * Uyku fazları için saat ve dakika formatını hazırla
 */
export const formatSleepTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}s ${m}d`;
};

/**
 * Google Play'de Health Connect sayfasını açar
 */
export const openHealthConnectPlayStore = () => {
  // Bu fonksiyonu, import edilen HealthConnectService ile uygulama içinden çağırabilirsiniz
  console.log('Google Play\'de Health Connect sayfası açılıyor...');
};

/**
 * Health Connect uygulamasını açar
 */
export const openHealthConnectApp = () => {
  // Bu fonksiyonu, import edilen HealthConnectService ile uygulama içinden çağırabilirsiniz
  console.log('Health Connect uygulaması açılıyor...');
}; 