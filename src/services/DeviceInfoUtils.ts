import { NativeModules, Platform } from 'react-native';

/**
 * Cihazın markasını alır
 */
export async function getBrand(): Promise<string> {
  if (Platform.OS === 'android') {
    try {
      // Cihaz markasını al
      return Platform.constants.Brand || '';
    } catch (error) {
      console.error('Cihaz markası alınamadı:', error);
      return '';
    }
  }
  return '';
}

/**
 * Cihazın MIUI arayüzüne sahip olup olmadığını kontrol eder
 */
export async function isMiui(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      // MIUI tipik olarak Xiaomi cihazlarda bulunur
      const brand = await getBrand();
      return brand.toLowerCase() === 'xiaomi' || 
             brand.toLowerCase() === 'redmi' || 
             brand.toLowerCase() === 'poco';
    } catch (error) {
      console.error('MIUI kontrolü yapılamadı:', error);
      return false;
    }
  }
  return false;
}

/**
 * Cihazın Android sürümünü alır
 */
export function getAndroidVersion(): number {
  if (Platform.OS === 'android') {
    return Platform.Version as number;
  }
  return 0;
}

/**
 * Cihazın cihaz modelini alır
 */
export async function getDeviceModel(): Promise<string> {
  if (Platform.OS === 'android') {
    try {
      return Platform.constants.Model || '';
    } catch (error) {
      console.error('Cihaz modeli alınamadı:', error);
      return '';
    }
  }
  return '';
} 