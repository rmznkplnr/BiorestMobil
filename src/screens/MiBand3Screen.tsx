import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaWrapper } from '../components/common/SafeAreaWrapper';
import { Colors } from '../constants/Colors';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import MiBand3Service from '../services/MiBand3Service';
import { PermissionService } from '../services/PermissionService';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isSmallScreen = width < 350;

export default function MiBand3Screen() {
  const dispatch = useDispatch();
  
  // Redux state
  const { miBand3 } = useSelector((state: RootState) => state.device);
  
  // Local state
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [foundDevices, setFoundDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  // 🆕 Periyodik nabız ölçümü state
  const [periodicInterval, setPeriodicInterval] = useState(30); // 30 saniye default
  const [isPeriodicActive, setIsPeriodicActive] = useState(false);
  
  // 🆕 Nabız verileri görüntüleme state
  const [showHeartRateModal, setShowHeartRateModal] = useState(false);
  const [allHeartRateData, setAllHeartRateData] = useState<any[]>([]);
  
  // 🆕 Kalıcı veri istatistikleri
  const [dataStats, setDataStats] = useState<{
    heartRateCount: number;
    sleepSessionCount: number;
    lastSync: string | null;
  }>({
    heartRateCount: 0,
    sleepSessionCount: 0,
    lastSync: null
  });

  useEffect(() => {
    // Component mount olduğunda cihaz durumunu kontrol et
    checkDeviceStatus();
    // 🆕 Kalıcı veri istatistiklerini yükle
    loadDataStatistics();
    // 🆕 Periyodik ölçüm durumunu kontrol et
    updatePeriodicStatus();
  }, []);

  // 🆕 Periyodik ölçüm durumunu güncelle
  const updatePeriodicStatus = () => {
    const status = MiBand3Service.getConnectionStatus();
    setIsPeriodicActive(status.periodicHR);
  };

  // Cihaz durumunu kontrol et
  const checkDeviceStatus = () => {
    const status = MiBand3Service.getConnectionStatus();
    console.log('📊 Mi Band 3 durumu:', status);
  };

  // 🆕 Kalıcı veri istatistiklerini yükle
  const loadDataStatistics = async () => {
    try {
      const stats = await MiBand3Service.getDataStatistics();
      setDataStats(stats);
      console.log('📊 Kalıcı veri istatistikleri:', stats);
    } catch (error) {
      console.error('❌ Veri istatistik yükleme hatası:', error);
    }
  };

  // 🆕 Kalıcı verileri temizle
  const handleClearPersistedData = () => {
    Alert.alert(
      'Verileri Temizle',
      'Tüm kalıcı Mi Band 3 verileri silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await MiBand3Service.clearPersistedData();
              await loadDataStatistics(); // İstatistikleri güncelle
              Alert.alert('Başarılı', 'Kalıcı veriler temizlendi');
            } catch (error) {
              Alert.alert('Hata', 'Veri temizleme sırasında hata oluştu');
            }
          }
        }
      ]
    );
  };

  // Mi Band 3 tara
  const handleScanDevices = async () => {
    try {
      setIsScanning(true);
      setFoundDevices([]);
      
      console.log('🔍 Mi Band 3 tarama başlatılıyor...');
      
      const devices = await MiBand3Service.scanForMiBand3Devices();
      
      const deviceList = devices.map(device => ({
        id: device.id,
        name: device.name || 'Mi Band 3',
        device: device
      }));
      
      setFoundDevices(deviceList);
      console.log('✅ Tarama tamamlandı:', deviceList.length, 'cihaz bulundu');
      
    } catch (error) {
      console.error('❌ Tarama hatası:', error);
      
      // Konum servisleri hatası için özel mesaj
      if (String(error).includes('Location services are disabled') || 
          String(error).includes('konum servisleri') ||
          String(error).includes('Bluetooth tarama gereksinimleri')) {
        Alert.alert(
          '🔍 Bluetooth Tarama Sorunu',
          'Mi Band 3 cihazını bulabilmek için gereksinimler karşılanmadı.\n\n⚠️ En muhtemel sebep: Konum servisleri kapalı\n\n📱 Android cihazlarda Bluetooth tarama için konum servisleri gereklidir.',
          [
            { text: 'Daha Sonra', style: 'cancel' },
            { 
              text: 'Ayarları Aç', 
              onPress: () => {
                PermissionService.showLocationServicesAlert();
              }
            }
          ]
        );
      } else {
        Alert.alert('Tarama Hatası', String(error));
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Cihaza bağlan
  const handleConnectDevice = async (deviceInfo: any) => {
    try {
      setIsConnecting(true);
      setSelectedDevice(deviceInfo);
      
      console.log('🔗 Bağlanıyor:', deviceInfo.name);
      
      const connected = await MiBand3Service.connectToDevice(deviceInfo.device);
      
      if (connected) {
        Alert.alert('Başarılı', 'Mi Band 3 bağlantısı kuruldu!');
      } else {
        Alert.alert('Hata', 'Bağlantı kurulamadı');
      }
      
    } catch (error) {
      console.error('❌ Bağlantı hatası:', error);
      Alert.alert('Hata', 'Bağlantı sırasında hata oluştu');
    } finally {
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  // Heart rate monitoring başlat
  const handleStartHeartRateMonitoring = async () => {
    try {
      await MiBand3Service.startHeartRateMonitoring();
      Alert.alert('Başarılı', 'Heart rate monitoring başlatıldı');
    } catch (error) {
      console.error('❌ HR monitoring hatası:', error);
      Alert.alert('Hata', String(error));
    }
  };

  // Manuel heart rate ölçümü
  const handleTriggerHeartRate = async () => {
    try {
      await MiBand3Service.triggerHeartRateMeasurement();
      Alert.alert(
        'Nabız Ölçümü Başlatıldı', 
        'Manuel nabız ölçümü başlatıldı! (Gadgetbridge Protocol)\n\n' +
        '⏱️ İlk sonuç: ~13.3 saniye\n' +
        '📊 İkinci ölçüm: ~2 saniye sonra\n' +
        '📊 Üçüncü ölçüm: ~4 saniye sonra\n' +
        '💫 Toplam süre: ~20 saniye\n\n' +
        'Komut dizisi: 15 01 00 → 15 02 00 → 15 02 01\n' +
        'Sonuçlar "Son Ölçümler" bölümünde görünecek.'
      );
    } catch (error) {
      console.error('❌ HR trigger hatası:', error);
      Alert.alert('Hata', String(error));
    }
  };

  // 🆕 Periyodik nabız ölçümünü başlat
  const handleStartPeriodicHeartRate = async () => {
    try {
      await MiBand3Service.startPeriodicHeartRateMeasurement(periodicInterval);
      setIsPeriodicActive(true);
      updatePeriodicStatus();
      Alert.alert(
        'Periyodik Nabız Ölçümü Başlatıldı',
        `Her ${periodicInterval} saniyede bir nabız ölçümü yapılacak.\n\n` +
        '⏰ İlk ölçüm: Hemen\n' +
        `⏰ Sonraki ölçümler: ${periodicInterval}s aralıklarla\n` +
        '💾 Tüm ölçümler otomatik kaydedilir\n\n' +
        'Sonuçları "Son Ölçümler" bölümünde takip edebilirsiniz.'
      );
    } catch (error) {
      console.error('❌ Periyodik HR başlatma hatası:', error);
      Alert.alert('Hata', String(error));
    }
  };

  // 🆕 Periyodik nabız ölçümünü durdur
  const handleStopPeriodicHeartRate = () => {
    MiBand3Service.stopPeriodicHeartRateMeasurement();
    setIsPeriodicActive(false);
    updatePeriodicStatus();
    Alert.alert(
      'Periyodik Nabız Ölçümü Durduruldu',
      'Periyodik nabız ölçümü başarıyla durduruldu.\n\n' +
      '📊 Kaydedilen veriler korunmuştur\n' +
      '🔄 İstediğiniz zaman yeniden başlatabilirsiniz'
    );
  };

  // 🆕 Tüm nabız verilerini yükle ve göster
  const handleViewAllHeartRateData = () => {
    try {
      // Redux store'dan tüm nabız verilerini al
      const reduxData = miBand3.heartRateData || [];
      
      // Verileri tarihe göre sırala (en yeni ilk)
      const sortedData = [...reduxData].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setAllHeartRateData(sortedData);
      setShowHeartRateModal(true);
      
      console.log('📊 Tüm nabız verileri yüklendi:', sortedData.length, 'adet');
    } catch (error) {
      console.error('❌ Nabız verileri yükleme hatası:', error);
      Alert.alert('Hata', 'Nabız verileri yüklenirken hata oluştu');
    }
  };

  // 🆕 Kalıcı nabız verilerini de yükle ve birleştir
  const handleViewAllHeartRateDataWithPersistent = async () => {
    try {
      console.log('📊 Tüm nabız verileri yükleniyor (Redux + Kalıcı)...');
      
      // Redux store'dan al
      const reduxData = miBand3.heartRateData || [];
      
      // Kalıcı verilerden de al
      const stats = await MiBand3Service.getDataStatistics();
      console.log('💾 Kalıcı veri sayısı:', stats.heartRateCount);
      
      // AsyncStorage'dan tüm kalıcı verileri al
      // Not: Bu fonksiyon MiBand3Service'e eklenmeli
      
      // Şimdilik sadece Redux verileri göster
      const sortedData = [...reduxData].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setAllHeartRateData(sortedData);
      setShowHeartRateModal(true);
      
      console.log('📊 Toplam nabız verisi:', sortedData.length, 'adet (Redux)');
      console.log('💾 Kalıcı nabız verisi:', stats.heartRateCount, 'adet (AsyncStorage)');
      
    } catch (error) {
      console.error('❌ Nabız verileri yükleme hatası:', error);
      Alert.alert('Hata', 'Nabız verileri yüklenirken hata oluştu');
    }
  };

  // Bağlantıyı kes
  const handleDisconnect = async () => {
    Alert.alert(
      'Bağlantıyı Kes',
      'Mi Band 3 ile bağlantıyı kesmek istediğinizden emin misiniz? Tüm monitoring işlemleri duracak.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Bağlantıyı Kes', 
          style: 'destructive',
          onPress: async () => {
            setIsConnecting(true); // Loading state için
                         try {
               console.log('🔌 Kullanıcı bağlantı kesme isteği yaptı');
               await MiBand3Service.disconnect();
               
               // İstatistikleri güncelle (disconnect sonrası)
               await loadDataStatistics();
               
               Alert.alert(
                 'Bağlantı Kesildi', 
                 'Mi Band 3 bağlantısı kesildi (Gadgetbridge Protocol)\n\n' +
                 '🔌 Disconnect sequence tamamlandı:\n' +
                 '• GATT device disconnected\n' +
                 '• BLE Manager unregistered\n' +
                 '• Queue dispatch terminated\n' +
                 '• Connection state: NOT_CONNECTED\n\n' +
                 '💾 Kalıcı veriler korundu\n' +
                 '🔍 Yeniden bağlanmak için "Tara" yapın\n\n' +
                 'Not: Gadgetbridge ile aynı protokol kullanıldı.'
               );
             } catch (error) {
               console.error('❌ Disconnect hatası:', error);
               Alert.alert(
                 'Bağlantı Kesme Hatası', 
                 'Bağlantı kesme sırasında hata oluştu.\n\n' +
                 'Lütfen Mi Band 3\'ü manuel olarak yeniden başlatın ve tekrar deneyin.'
               );
             } finally {
               setIsConnecting(false);
             }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaWrapper backgroundColor={Colors.background}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Band 3</Text>
          <Text style={styles.subtitle}>Akıllı Bileklik Yönetimi</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Bağlantı Durumu</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Bağlı:</Text>
            <Text style={[styles.statusValue, miBand3.connected ? styles.statusConnected : styles.statusDisconnected]}>
              {miBand3.connected ? 'Evet' : 'Hayır'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Eşleştirilmiş:</Text>
            <Text style={[styles.statusValue, miBand3.paired ? styles.statusConnected : styles.statusDisconnected]}>
              {miBand3.paired ? 'Evet' : 'Hayır'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Monitoring:</Text>
            <Text style={[styles.statusValue, miBand3.isMonitoring ? styles.statusConnected : styles.statusDisconnected]}>
              {miBand3.isMonitoring ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>

        {/* 🆕 KALICI VERİ İSTATİSTİKLERİ */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>💾 Kalıcı Veri Durumu</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Kayıtlı Nabız Ölçümü:</Text>
            <Text style={[styles.statusValue, styles.statusConnected]}>
              {dataStats.heartRateCount} adet
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Uyku Session'ı:</Text>
            <Text style={[styles.statusValue, styles.statusConnected]}>
              {dataStats.sleepSessionCount} adet
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Redux Store Nabız:</Text>
            <Text style={[styles.statusValue, styles.statusInfo]}>
              {miBand3.heartRateData?.length || 0} adet
            </Text>
          </View>

          {dataStats.lastSync && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Son Güncelleme:</Text>
              <Text style={[styles.statusValue, styles.statusInfo]}>
                {new Date(dataStats.lastSync).toLocaleString('tr-TR')}
              </Text>
            </View>
          )}

          <View style={styles.dataManagementButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.refreshButton]}
              onPress={loadDataStatistics}
            >
              <Text style={styles.buttonText}>📊 İstatistikleri Yenile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClearPersistedData}
            >
              <Text style={styles.buttonText}>🗑️ Kalıcı Verileri Temizle</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.dataInfo}>
            * Kalıcı veriler uygulama kapatılıp açılsa bile korunur{'\n'}
            * Redux Store veriler oturum bazlıdır{'\n'}
            * En fazla 500 nabız ölçümü ve 30 uyku session'ı saklanır
          </Text>
        </View>

        {/* Scan Section */}
        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Cihaz Tarama</Text>
          
          {/* Bluetooth Tarama Bilgisi */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              📱 Android cihazlarda Bluetooth tarama için konum servisleri açık olmalıdır.{'\n'}
              📍 Bu, Android güvenlik politikasıdır - konumunuz kullanılmaz.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.scanButton]}
            onPress={handleScanDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <Text style={styles.buttonText}>🔍 Mi Band 3 Tara</Text>
            )}
          </TouchableOpacity>

          {/* Found Devices */}
          {foundDevices.length > 0 && (
            <View style={styles.devicesList}>
              <Text style={styles.devicesTitle}>Bulunan Cihazlar:</Text>
              {foundDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => handleConnectDevice(device)}
                  disabled={isConnecting}
                >
                  {isConnecting && selectedDevice?.id === device.id ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceId}>{device.id}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Heart Rate Section */}
        {miBand3.connected && (
          <View style={styles.actionCard}>
            <Text style={styles.cardTitle}>Heart Rate İşlemleri</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.heartRateButton]}
                onPress={handleStartHeartRateMonitoring}
              >
                <Text style={styles.buttonText}>Monitoring Başlat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.measureButton]}
                onPress={handleTriggerHeartRate}
              >
                <Text style={styles.buttonText}>Ölç</Text>
              </TouchableOpacity>
            </View>

            {/* Heart Rate Data */}
            {miBand3.heartRateData && miBand3.heartRateData.length > 0 && (
              <View style={styles.dataSection}>
                <Text style={styles.dataTitle}>Son Ölçümler:</Text>
                {miBand3.heartRateData.slice(-3).map((data, index) => (
                  <View key={index} style={styles.dataItem}>
                    <Text style={styles.dataValue}>{data.heartRate} BPM</Text>
                    <Text style={styles.dataTime}>
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={handleViewAllHeartRateData}
                >
                  <Text style={styles.viewAllText}>
                    📊 Tüm Nabız Verileri ({miBand3.heartRateData.length} ölçüm)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 🆕 PERİYODİK NABIZ ÖLÇÜMÜ SECTION */}
        {miBand3.connected && (
          <View style={styles.actionCard}>
            <Text style={styles.cardTitle}>⏰ Periyodik Nabız Ölçümü</Text>
            
            {/* Interval Ayarı */}
            <View style={styles.intervalSection}>
              <Text style={styles.intervalLabel}>Ölçüm Aralığı (saniye):</Text>
              <View style={styles.intervalButtons}>
                {[15, 30, 60, 120].map((interval) => (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.intervalButton,
                      periodicInterval === interval && styles.intervalButtonActive
                    ]}
                    onPress={() => setPeriodicInterval(interval)}
                    disabled={isPeriodicActive}
                  >
                    <Text style={[
                      styles.intervalButtonText,
                      periodicInterval === interval && styles.intervalButtonTextActive
                    ]}>
                      {interval}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Durum Bilgisi */}
            <View style={styles.periodicStatusSection}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Periyodik Ölçüm:</Text>
                <Text style={[
                  styles.statusValue, 
                  isPeriodicActive ? styles.statusConnected : styles.statusDisconnected
                ]}>
                  {isPeriodicActive ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
              
              {isPeriodicActive && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Aralık:</Text>
                  <Text style={[styles.statusValue, styles.statusInfo]}>
                    {periodicInterval} saniye
                  </Text>
                </View>
              )}
            </View>

            {/* Kontrol Butonları */}
            <View style={styles.periodicControlButtons}>
              {!isPeriodicActive ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.periodicStartButton]}
                  onPress={handleStartPeriodicHeartRate}
                >
                  <Text style={styles.buttonText}>
                    ⏰ Periyodik Ölçümü Başlat ({periodicInterval}s)
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.periodicStopButton]}
                  onPress={handleStopPeriodicHeartRate}
                >
                  <Text style={styles.buttonText}>⏹️ Periyodik Ölçümü Durdur</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bilgi Metni */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                💡 Periyodik ölçüm, belirlenen aralıklarla otomatik nabız ölçümü yapar.{'\n'}
                📊 Her ölçüm kalıcı olarak kaydedilir ve anlık olarak görüntülenir.{'\n'}
                🔋 Daha sık ölçüm Mi Band'ın bataryasını daha hızlı tüketir.
              </Text>
            </View>
          </View>
        )}

        {/* 🆕 SLEEP MONITORING SECTION */}
        {miBand3.connected && (
          <View style={styles.actionCard}>
            <Text style={styles.cardTitle}>💤 Uyku Monitoring (Otomatik)</Text>
            
            <View style={styles.sleepStatusContainer}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Uyku Algılama:</Text>
                <Text style={[styles.statusValue, styles.statusConnected]}>
                  Aktif
                </Text>
              </View>
              <Text style={styles.sleepInfo}>
                Mi Band 3 uyku durumunuzu otomatik algılar ve uyku sırasında nabız ölçümü yapar
              </Text>
            </View>

            {/* Real-time Sleep Heart Rate Data */}
            {miBand3.heartRateData && miBand3.heartRateData.length > 0 && (
              <View style={styles.dataSection}>
                <Text style={styles.dataTitle}>🛌 Son Nabız Ölçümleri (Uyku + Normal):</Text>
                {miBand3.heartRateData.slice(-5).reverse().map((data, index) => {
                  const time = new Date(data.timestamp);
                  const isNightTime = time.getHours() >= 22 || time.getHours() <= 6;
                  
                  return (
                    <View key={index} style={styles.dataItem}>
                      <View style={styles.heartRateRow}>
                        <Text style={[
                          styles.dataValue,
                          isNightTime && { color: Colors.info }
                        ]}>
                          {data.heartRate} BPM
                          {isNightTime && ' 💤'}
                        </Text>
                        <Text style={styles.dataTime}>
                          {time.toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                      {isNightTime && (
                        <Text style={styles.sleepIndicator}>
                          Gece saati ölçümü (muhtemel uyku)
                        </Text>
                      )}
                    </View>
                  );
                })}
                
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={handleViewAllHeartRateData}
                >
                  <Text style={styles.viewAllText}>
                    📊 Tüm Veriler ({miBand3.heartRateData.length} ölçüm)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Disconnect Section */}
        {miBand3.connected && (
          <View style={styles.actionCard}>
            <TouchableOpacity
              style={[styles.actionButton, styles.disconnectButton]}
              onPress={handleDisconnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <Text style={styles.buttonText}>🔌 Bağlantıyı Kes</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.disconnectInfo}>
              * Tüm monitoring işlemleri duracak{'\n'}
              * Kalıcı veriler korunacak{'\n'}
              * Yeniden bağlanmak için "Tara" yapın
            </Text>
          </View>
        )}

      </ScrollView>

      {/* 🆕 NABIZ VERİLERİ MODAL */}
      <Modal
        visible={showHeartRateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHeartRateModal(false)}
      >
        <SafeAreaWrapper backgroundColor={Colors.background}>
          <View style={styles.modalContainer}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💓 Nabız Verileri</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowHeartRateModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Veri İstatistikleri */}
            <View style={styles.modalStatsContainer}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>{allHeartRateData.length}</Text>
                <Text style={styles.modalStatLabel}>Toplam Ölçüm</Text>
              </View>
              
              {allHeartRateData.length > 0 && (
                <>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>
                      {Math.round(allHeartRateData.reduce((acc, item) => acc + item.heartRate, 0) / allHeartRateData.length)}
                    </Text>
                    <Text style={styles.modalStatLabel}>Ortalama BPM</Text>
                  </View>
                  
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>
                      {Math.min(...allHeartRateData.map(item => item.heartRate))} - {Math.max(...allHeartRateData.map(item => item.heartRate))}
                    </Text>
                    <Text style={styles.modalStatLabel}>Min - Max</Text>
                  </View>
                </>
              )}
            </View>

            {/* Nabız Verileri Listesi */}
            {allHeartRateData.length > 0 ? (
              <FlatList
                data={allHeartRateData}
                style={styles.modalDataList}
                keyExtractor={(item, index) => `${item.timestamp}-${index}`}
                renderItem={({ item, index }) => {
                  const date = new Date(item.timestamp);
                  const isNightTime = date.getHours() >= 22 || date.getHours() <= 6;
                  
                  return (
                    <View style={styles.modalDataItem}>
                      <View style={styles.modalDataContent}>
                        <Text style={[
                          styles.modalDataHeartRate,
                          isNightTime && { color: Colors.info }
                        ]}>
                          {item.heartRate} BPM
                          {isNightTime && ' 💤'}
                        </Text>
                        
                        <View style={styles.modalDataTimeContainer}>
                          <Text style={styles.modalDataTime}>
                            {date.toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </Text>
                          <Text style={styles.modalDataDate}>
                            {date.toLocaleDateString('tr-TR', { 
                              day: '2-digit', 
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.modalDataIndex}>
                        <Text style={styles.modalDataIndexText}>#{index + 1}</Text>
                      </View>
                    </View>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.modalDataSeparator} />}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              <View style={styles.modalEmptyContainer}>
                <Text style={styles.modalEmptyText}>📊 Henüz nabız verisi bulunmuyor</Text>
                <Text style={styles.modalEmptySubtext}>
                  Nabız ölçümü yaparak verileri görüntüleyebilirsiniz
                </Text>
              </View>
            )}

            {/* Modal Alt Butonlar */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalRefreshButton]}
                onPress={() => {
                  handleViewAllHeartRateData();
                }}
              >
                <Text style={styles.modalActionText}>🔄 Yenile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalExportButton]}
                onPress={() => {
                  // TODO: Export functionality
                  Alert.alert('Export', `${allHeartRateData.length} adet nabız verisi konsola yazdırıldı`);
                  console.log('📊 Nabız Verileri Export:', JSON.stringify(allHeartRateData, null, 2));
                }}
              >
                <Text style={styles.modalActionText}>📤 Export</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaWrapper>
      </Modal>

    </SafeAreaWrapper>
  );
}

// Responsive Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: isTablet ? 24 : isSmallScreen ? 12 : 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 24 : 16,
  },
  title: {
    fontSize: isTablet ? 32 : isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
    color: Colors.textSecondary,
  },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 24 : isSmallScreen ? 16 : 20,
    marginBottom: isTablet ? 24 : 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 24 : isSmallScreen ? 16 : 20,
    marginBottom: isTablet ? 24 : 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: isTablet ? 20 : 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTablet ? 16 : 12,
  },
  statusLabel: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    fontWeight: '600',
  },
  statusConnected: {
    color: Colors.success,
  },
  statusDisconnected: {
    color: Colors.error,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 16 : isSmallScreen ? 12 : 14,
    paddingHorizontal: isTablet ? 24 : isSmallScreen ? 16 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isTablet ? 16 : 12,
  },
  scanButton: {
    backgroundColor: Colors.info,
  },
  heartRateButton: {
    backgroundColor: Colors.heartRate,
    flex: 1,
    marginRight: 8,
  },
  measureButton: {
    backgroundColor: Colors.accent,
    flex: 1,
    marginLeft: 8,
  },
  disconnectButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: isTablet ? 16 : 12,
  },
  devicesList: {
    marginTop: isTablet ? 20 : 16,
  },
  devicesTitle: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: isTablet ? 16 : 12,
  },
  deviceItem: {
    backgroundColor: Colors.cardAlt,
    borderRadius: isTablet ? 12 : 8,
    padding: isTablet ? 16 : isSmallScreen ? 12 : 14,
    marginBottom: isTablet ? 12 : 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceName: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
    color: Colors.textSecondary,
  },
  dataSection: {
    marginTop: isTablet ? 20 : 16,
    paddingTop: isTablet ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dataTitle: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: isTablet ? 16 : 12,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isTablet ? 12 : 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataValue: {
    fontSize: isTablet ? 18 : isSmallScreen ? 16 : 17,
    fontWeight: 'bold',
    color: Colors.heartRate,
  },
  dataTime: {
    fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
    color: Colors.textSecondary,
  },
  sleepStatusContainer: {
    marginTop: isTablet ? 20 : 16,
    paddingTop: isTablet ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sleepInfo: {
    fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
    color: Colors.textSecondary,
    marginTop: isTablet ? 12 : 8,
    textAlign: 'center',
  },
  heartRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleepIndicator: {
    fontSize: isTablet ? 12 : isSmallScreen ? 10 : 11,
    color: Colors.info,
    marginTop: isTablet ? 8 : 6,
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: Colors.info,
    borderRadius: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 12 : isSmallScreen ? 10 : 12,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isTablet ? 16 : 12,
  },
  viewAllText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
    fontWeight: '600',
    color: Colors.text,
  },
  dataManagementButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: isTablet ? 20 : 16,
    marginBottom: isTablet ? 16 : 12,
  },
  refreshButton: {
    backgroundColor: Colors.info,
    flex: 1,
    marginRight: 8,
  },
  clearButton: {
    backgroundColor: Colors.error,
    flex: 1,
    marginLeft: 8,
  },
  dataInfo: {
    fontSize: isTablet ? 12 : isSmallScreen ? 10 : 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: isTablet ? 16 : 12,
  },
  statusInfo: {
    color: Colors.textSecondary,
  },
  disconnectInfo: {
    fontSize: isTablet ? 12 : isSmallScreen ? 10 : 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: isTablet ? 16 : 12,
    lineHeight: isTablet ? 18 : 16,
  },
  infoSection: {
    backgroundColor: Colors.cardAlt,
    borderRadius: isTablet ? 12 : 8,
    padding: isTablet ? 16 : isSmallScreen ? 12 : 14,
    marginBottom: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: isTablet ? 20 : 18,
  },
  // 🆕 Periyodik nabız ölçümü stilleri
  intervalSection: {
    marginBottom: isTablet ? 20 : 16,
  },
  intervalLabel: {
    fontSize: isTablet ? 16 : isSmallScreen ? 14 : 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: isTablet ? 12 : 10,
  },
  intervalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: isTablet ? 12 : 8,
  },
  intervalButton: {
    backgroundColor: Colors.cardAlt,
    borderRadius: isTablet ? 10 : 8,
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 20 : 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: isTablet ? 80 : 70,
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  intervalButtonText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 12 : 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  intervalButtonTextActive: {
    color: Colors.text,
  },
  periodicStatusSection: {
    backgroundColor: Colors.cardAlt,
    borderRadius: isTablet ? 12 : 8,
    padding: isTablet ? 16 : isSmallScreen ? 12 : 14,
    marginBottom: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodicControlButtons: {
    marginBottom: isTablet ? 16 : 12,
  },
  periodicStartButton: {
    backgroundColor: Colors.success,
  },
  periodicStopButton: {
    backgroundColor: Colors.error,
  },
  // 🆕 Modal stilleri
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? 24 : 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalCloseButton: {
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    borderRadius: isTablet ? 22 : 18,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  modalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: isTablet ? 20 : 16,
    backgroundColor: Colors.card,
    marginHorizontal: isTablet ? 24 : 16,
    marginVertical: isTablet ? 16 : 12,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: Colors.heartRate,
    marginBottom: isTablet ? 8 : 6,
  },
  modalStatLabel: {
    fontSize: isTablet ? 14 : 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalDataList: {
    flex: 1,
    paddingHorizontal: isTablet ? 24 : 16,
  },
  modalDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: isTablet ? 12 : 8,
    padding: isTablet ? 16 : 12,
    marginVertical: isTablet ? 6 : 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalDataContent: {
    flex: 1,
  },
  modalDataHeartRate: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: Colors.heartRate,
    marginBottom: isTablet ? 6 : 4,
  },
  modalDataTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 12 : 8,
  },
  modalDataTime: {
    fontSize: isTablet ? 14 : 12,
    color: Colors.text,
    fontWeight: '600',
  },
  modalDataDate: {
    fontSize: isTablet ? 12 : 11,
    color: Colors.textSecondary,
  },
  modalDataIndex: {
    backgroundColor: Colors.primary,
    borderRadius: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 6 : 4,
  },
  modalDataIndexText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalDataSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: isTablet ? 16 : 12,
  },
  modalEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: isTablet ? 40 : 32,
  },
  modalEmptyText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: isTablet ? 12 : 8,
  },
  modalEmptySubtext: {
    fontSize: isTablet ? 14 : 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: isTablet ? 20 : 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: isTablet ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  modalActionButton: {
    backgroundColor: Colors.primary,
    borderRadius: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 24 : 18,
    flex: 1,
    marginHorizontal: isTablet ? 8 : 6,
    alignItems: 'center',
  },
  modalRefreshButton: {
    backgroundColor: Colors.info,
  },
  modalExportButton: {
    backgroundColor: Colors.success,
  },
  modalActionText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: Colors.text,
  },
}); 