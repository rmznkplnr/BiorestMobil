import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export interface HealthData {
  heartRate: number;
  sleepQuality: number;
  activityLevel: number;
  stressLevel: number;
  sleepDuration: number; // Saat cinsinden
  deepSleepPercentage: number;
  lastSleepTime: Date;
}

export interface OptimalSettings {
  temperature: number;
  humidity: number;
  lightLevel: number;
  soundLevel: number;
  aromatherapyLevel: number;
  selectedScent: string;
  selectedSound: string;
  lightColor: string; // RGB formatında
  lightMode: 'sunset' | 'sunrise' | 'night' | 'relax';
}

class MLService {
  private static instance: MLService;
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;

  private readonly SOUNDS = {
    RAIN: 'rain',
    OCEAN: 'ocean',
    FOREST: 'forest',
    WHITE_NOISE: 'white_noise',
    MEDITATION: 'meditation',
  };

  private constructor() {}

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await tf.ready();
      // Model yükleme işlemi burada yapılacak
      // this.model = await tf.loadLayersModel('path/to/model');
      
      this.isInitialized = true;
      console.log('ML servisi başlatıldı');
    } catch (error) {
      console.error('ML başlatma hatası:', error);
      throw error;
    }
  }

  public async getOptimalSettings(healthData: HealthData): Promise<OptimalSettings> {
    if (!this.isInitialized) {
      throw new Error('ML servisi başlatılmamış');
    }

    try {
      const settings = this.calculateSettings(healthData);
      return settings;
    } catch (error) {
      console.error('Optimal ayar hesaplama hatası:', error);
      throw error;
    }
  }

  private calculateSettings(healthData: HealthData): OptimalSettings {
    const { 
      stressLevel, 
      heartRate, 
      sleepQuality, 
      activityLevel,
      sleepDuration,
      deepSleepPercentage,
      lastSleepTime 
    } = healthData;

    // Günün saatine göre ışık modu belirleme
    const currentHour = new Date().getHours();
    let lightMode: 'sunset' | 'sunrise' | 'night' | 'relax' = 'relax';
    let lightColor = '#FFFFFF';

    if (currentHour >= 20 || currentHour < 6) {
      lightMode = 'night';
      lightColor = '#FF8C69'; // Turuncu-kırmızı, melatonin üretimini etkilemeyecek
    } else if (currentHour >= 6 && currentHour < 9) {
      lightMode = 'sunrise';
      lightColor = '#FFE4B5'; // Açık sarı
    } else if (currentHour >= 18 && currentHour < 20) {
      lightMode = 'sunset';
      lightColor = '#FFA07A'; // Turuncu
    }

    // Stres ve uyku kalitesine göre koku seçimi
    let selectedScent = 'lavanta';
    if (stressLevel > 70 || sleepQuality < 50) {
      selectedScent = 'lavanta'; // Rahatlatıcı
    } else if (deepSleepPercentage < 20) {
      selectedScent = 'vanilya'; // Sakinleştirici
    } else if (sleepDuration < 6) {
      selectedScent = 'okaliptus'; // Ferahlatıcı
    }

    // Ses seçimi
    let selectedSound = this.SOUNDS.RAIN;
    if (heartRate > 80) {
      selectedSound = this.SOUNDS.MEDITATION;
    } else if (stressLevel > 60) {
      selectedSound = this.SOUNDS.OCEAN;
    } else if (sleepQuality < 50) {
      selectedSound = this.SOUNDS.WHITE_NOISE;
    }

    // Sıcaklık ayarı (18-23°C arası - uyku için optimal)
    const temperature = Math.min(Math.max(20.5 - (stressLevel / 100) * 2.5, 18), 23);

    // Nem ayarı (%40-60 arası - uyku için optimal)
    const humidity = Math.min(Math.max(50 - (stressLevel / 100) * 10, 40), 60);

    // Işık seviyesi (%0-100 arası)
    let lightLevel = 100;
    if (currentHour >= 20 || currentHour < 6) {
      lightLevel = 10; // Gece modu
    } else if (currentHour >= 18 && currentHour < 20) {
      lightLevel = 50; // Gün batımı
    }

    // Ses seviyesi (0-50 dB arası)
    const soundLevel = Math.min(Math.max(25 - (stressLevel / 100) * 15, 10), 40);

    // Koku yoğunluğu (%20-80 arası)
    const aromatherapyLevel = Math.min(Math.max(40 + (stressLevel / 100) * 20, 20), 60);

    return {
      temperature,
      humidity,
      lightLevel,
      soundLevel,
      aromatherapyLevel,
      selectedScent,
      selectedSound,
      lightColor,
      lightMode,
    };
  }

  // Uyku kalitesi tahmin metodu (gelecekte ML modeli ile değiştirilecek)
  public predictSleepQuality(settings: OptimalSettings, healthData: HealthData): number {
    const baseQuality = 70; // Temel kalite puanı
    let qualityScore = baseQuality;

    // Sıcaklık etkisi
    if (settings.temperature >= 18 && settings.temperature <= 21) {
      qualityScore += 10;
    }

    // Nem etkisi
    if (settings.humidity >= 45 && settings.humidity <= 55) {
      qualityScore += 5;
    }

    // Işık etkisi
    if (settings.lightMode === 'night' && settings.lightLevel <= 20) {
      qualityScore += 5;
    }

    // Ses etkisi
    if (settings.soundLevel <= 30) {
      qualityScore += 5;
    }

    // Koku etkisi
    if (settings.selectedScent === 'lavanta') {
      qualityScore += 5;
    }

    return Math.min(Math.max(qualityScore, 0), 100);
  }
}

export default MLService; 