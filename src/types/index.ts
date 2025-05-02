import type { HealthData, HeartRateMetric, OxygenMetric, SleepMetric, StressMetric, ActivityMetric } from './health';

// Genel uygulama tipleri için bir ihracat
export type { HealthData, HeartRateMetric, OxygenMetric, SleepMetric, StressMetric, ActivityMetric };

// Sağlık durumu belirten tip (geriye dönük uyumluluk)
export type HealthStatus = 'normal' | 'caution' | 'danger' | 'unknown';

// Sağlık durum tiplerini dönüştürme fonksiyonu
export const mapHealthStatus = (status: 'good' | 'warning' | 'bad'): HealthStatus => {
  switch (status) {
    case 'good': return 'normal';
    case 'warning': return 'caution';
    case 'bad': return 'danger';
    default: return 'unknown';
  }
}; 