import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import { Device } from 'react-native-ble-plx';

import miBand9Service, { HeartRateData, MiBandConnectionStatus, SleepHeartRateSession } from '../services/MiBand9Service';

const MiBand9Screen = () => {
  const navigation = useNavigation();
  
  // State
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<MiBandConnectionStatus>({ connected: false, authenticated: false });
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [latestHeartRate, setLatestHeartRate] = useState<HeartRateData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Yeni gerçek zamanlı uyku monitoring state'leri
  const [isRealtimeSleepMonitoring, setIsRealtimeSleepMonitoring] = useState(false);
  const [currentSleepSession, setCurrentSleepSession] = useState<SleepHeartRateSession | null>(null);
  const [sleepMonitoringDuration, setSleepMonitoringDuration] = useState(0);
  const [recentSleepHeartRate, setRecentSleepHeartRate] = useState<HeartRateData[]>([]);

  useEffect(() => {
    // İlk durum kontrolü
    updateConnectionStatus();
    updateHeartRateData();
    updateSleepMonitoringStatus();

    // Dinleyicileri ekle
    const heartRateListener = (data: HeartRateData) => {
      setLatestHeartRate(data);
      setHeartRateData(prev => [...prev.slice(-9), data]); // Son 10 ölçümü tut
      
      // Eğer uyku monitoring aktifse recent sleep heart rate'i güncelle
      if (isRealtimeSleepMonitoring) {
        setRecentSleepHeartRate(prev => [...prev.slice(-19), data]); // Son 20 uyku ölçümü
      }
    };

    const connectionListener = (status: MiBandConnectionStatus) => {
      setConnectionStatus(status);
    };

    miBand9Service.addHeartRateListener(heartRateListener);
    miBand9Service.addConnectionListener(connectionListener);

    // Uyku monitoring durumunu periyodik kontrol et
    const statusInterval = setInterval(() => {
      updateSleepMonitoringStatus();
    }, 10000); // 10 saniyede bir kontrol

    // Cleanup
    return () => {
      miBand9Service.removeHeartRateListener(heartRateListener);
      miBand9Service.removeConnectionListener(connectionListener);
      clearInterval(statusInterval);
    };
  }, [isRealtimeSleepMonitoring]);

  const updateConnectionStatus = () => {
    const status = miBand9Service.getConnectionStatus();
    setConnectionStatus(status);
  };

  const updateHeartRateData = () => {
    const data = miBand9Service.getHeartRateData(10);
    setHeartRateData(data);
    
    const latest = miBand9Service.getLatestHeartRate();
    setLatestHeartRate(latest);
  };

  const updateSleepMonitoringStatus = () => {
    const isActive = miBand9Service.isRealtimeSleepMonitoringActive();
    const session = miBand9Service.getCurrentSleepSession();
    const duration = miBand9Service.getSleepMonitoringDuration();
    const recentData = miBand9Service.getRecentSleepHeartRateData(30); // Son 30 dakika

    setIsRealtimeSleepMonitoring(isActive);
    setCurrentSleepSession(session);
    setSleepMonitoringDuration(duration);
    setRecentSleepHeartRate(recentData);
  };

  const handleScanDevices = async () => {
    try {
      setIsScanning(true);
      setDevices([]);
      
      const foundDevices = await miBand9Service.scanForMiBand9();
      setDevices(foundDevices);
      
      if (foundDevices.length === 0) {
        Alert.alert(
          'Mi Band 9 Bulunamadı',
          'Yakındaki Mi Band 9 cihazı bulunamadı.\n\nSorun giderme önerileri için "Sorun Gider" butonunu kullanın.',
          [
            { text: '🔄 Tekrar Tara', onPress: handleScanDevices },
            { text: '🔧 Sorun Gider', onPress: handleTroubleshoot },
            { text: 'İptal', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Mi Band 9 tarama hatası:', error);
      Alert.alert('Hata', `Tarama sırasında hata oluştu: ${error}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTroubleshoot = async () => {
    try {
      const suggestions = await miBand9Service.troubleshootMiBandConnection();
      
      Alert.alert(
        '🔧 Mi Band 9 Sorun Giderme',
        suggestions.join('\n'),
        [
          { text: '🔄 Tekrar Tara', onPress: handleScanDevices },
          { text: 'Tamam', style: 'default' },
        ]
      );
    } catch (error) {
      console.error('Sorun giderme hatası:', error);
      Alert.alert('Hata', 'Sorun giderme analizi yapılamadı');
    }
  };

  const handleSimulationMode = async () => {
    Alert.alert(
      'Simülasyon Modu Kaldırıldı',
      'Simülasyon modu artık desteklenmiyor. Lütfen gerçek Mi Band 9 cihazınızı bağlayın.',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const handleConnectDevice = async (device: Device) => {
    try {
      Alert.alert(
        'Mi Band 9 Bağlantısı',
        `${device.name || 'Mi Band 9'} cihazına bağlanılacak. Devam etmek istediğinizden emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Bağlan',
            onPress: async () => {
              const success = await miBand9Service.connectToMiBand9();
              
              if (success) {
                updateConnectionStatus();
                Alert.alert('Başarılı', 'Mi Band 9 başarıyla bağlandı.');
              } else {
                Alert.alert('Hata', 'Mi Band 9 bağlantısı kurulamadı.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Mi Band 9 bağlantı hatası:', error);
      Alert.alert('Hata', `Bağlantı sırasında hata oluştu: ${error}`);
    }
  };

  const handleStartHeartRateMonitoring = async () => {
    try {
      const success = await miBand9Service.startHeartRateMonitoring();
      
      if (success) {
        setIsMonitoring(true);
        Alert.alert('Başarılı', 'Nabız izleme başlatıldı. Her 10 saniyede bir ölçüm alınacak.');
      } else {
        Alert.alert('Hata', 'Nabız izleme başlatılamadı. Cihaz bağlantısını kontrol edin.');
      }
    } catch (error) {
      console.error('Nabız izleme başlatma hatası:', error);
      Alert.alert('Hata', `Nabız izleme başlatılamadı: ${error}`);
    }
  };

  const handleStopHeartRateMonitoring = async () => {
    try {
      await miBand9Service.stopHeartRateMonitoring();
      setIsMonitoring(false);
      Alert.alert('Başarılı', 'Nabız izleme durduruldu.');
    } catch (error) {
      console.error('Nabız izleme durdurma hatası:', error);
      Alert.alert('Hata', `Nabız izleme durdurulamadı: ${error}`);
    }
  };

  const handleStartSleepMonitoring = async () => {
    try {
      const success = await miBand9Service.startSleepHeartRateMonitoring();
      
      if (success) {
        setIsMonitoring(true);
        Alert.alert('Uyku İzleme Başlatıldı', 'Uyku sırasında nabız izleme aktif edildi. Her 2 dakikada bir ölçüm alınacak.');
      } else {
        Alert.alert('Hata', 'Uyku nabız izleme başlatılamadı. Cihaz bağlantısını kontrol edin.');
      }
    } catch (error) {
      console.error('Uyku nabız izleme hatası:', error);
      Alert.alert('Hata', `Uyku nabız izleme başlatılamadı: ${error}`);
    }
  };

  const handleStartRealtimeSleepMonitoring = async () => {
    Alert.alert(
      'Gerçek Zamanlı Uyku Nabız İzleme',
      'Uyku sırasında 30 saniyede bir nabız ölçümü yapılacak. Bu mod uyku boyunca aktif kalacak ve sürekli veri toplayacak.\n\nBu modu başlatmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Başlat',
          onPress: async () => {
            try {
              const success = await miBand9Service.startRealtimeSleepHeartRateMonitoring();
              
              if (success) {
                setIsRealtimeSleepMonitoring(true);
                setIsMonitoring(true);
                Alert.alert(
                  '🌙 Gerçek Zamanlı Uyku İzleme Başlatıldı',
                  'Uyku sırasında nabız izleme aktif edildi. Her 30 saniyede bir ölçüm alınacak ve AWS\'e kaydedilecek.\n\n💡 İpucu: Bu mod uyku boyunca çalışacağı için telefonunuzu şarjda bırakın.'
                );
              } else {
                Alert.alert('Hata', 'Gerçek zamanlı uyku nabız izleme başlatılamadı. Cihaz bağlantısını kontrol edin.');
              }
            } catch (error) {
              console.error('Gerçek zamanlı uyku nabız izleme hatası:', error);
              Alert.alert('Hata', `Gerçek zamanlı uyku nabız izleme başlatılamadı: ${error}`);
            }
          },
        },
      ]
    );
  };

  const handleStopRealtimeSleepMonitoring = async () => {
    Alert.alert(
      'Gerçek Zamanlı Uyku İzlemeyi Durdur',
      'Uyku nabız izleme session\'ı sonlandırılacak ve istatistikler gösterilecek. Devam etmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Durdur',
          style: 'destructive',
          onPress: async () => {
            try {
              const completedSession = await miBand9Service.stopRealtimeSleepHeartRateMonitoring();
              
              setIsRealtimeSleepMonitoring(false);
              setIsMonitoring(false);
              setCurrentSleepSession(null);
              
              if (completedSession) {
                Alert.alert(
                  '🌙 Uyku İzleme Tamamlandı',
                  `Session ID: ${completedSession.sessionId}\n\n` +
                  `⏱️ Süre: ${((new Date().getTime() - completedSession.startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)} saat\n` +
                  `📊 Toplam ölçüm: ${completedSession.heartRateReadings.length}\n` +
                  `💗 Ortalama nabız: ${completedSession.averageHeartRate} BPM\n` +
                  `📈 Max nabız: ${completedSession.maxHeartRate} BPM\n` +
                  `📉 Min nabız: ${completedSession.minHeartRate} BPM\n\n` +
                  `Tüm veriler AWS'e kaydedildi.`
                );
              } else {
                Alert.alert('Başarılı', 'Gerçek zamanlı uyku nabız izleme durduruldu.');
              }
            } catch (error) {
              console.error('Gerçek zamanlı uyku nabız izleme durdurma hatası:', error);
              Alert.alert('Hata', `Gerçek zamanlı uyku nabız izleme durdurulamadı: ${error}`);
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Bağlantıyı Kes',
      'Mi Band 9 bağlantısını kesmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bağlantıyı Kes',
          style: 'destructive',
          onPress: async () => {
            try {
              await miBand9Service.disconnect();
              setIsMonitoring(false);
              setIsRealtimeSleepMonitoring(false);
              setCurrentSleepSession(null);
              updateConnectionStatus();
              Alert.alert('Başarılı', 'Mi Band 9 bağlantısı kesildi.');
            } catch (error) {
              console.error('Bağlantı kesme hatası:', error);
              Alert.alert('Hata', `Bağlantı kesilemedi: ${error}`);
            }
          },
        },
      ]
    );
  };

  const getHeartRateQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}d`;
  };

  const getSleepHeartRateStatus = (): string => {
    if (!currentSleepSession || currentSleepSession.heartRateReadings.length === 0) {
      return 'Veri bekleniyor...';
    }

    const avg = currentSleepSession.averageHeartRate;
    if (avg >= 40 && avg <= 80) return 'Normal';
    if (avg < 40) return 'Düşük';
    return 'Yüksek';
  };

  const handleConnectWithAES = async () => {
    Alert.alert(
      '🔐 AES Şifrelenmiş Gerçek Bağlantı',
      'Bu mod Mi Band 9\'a doğrudan bağlanarak AES şifrelenmiş gerçek nabız verilerini alır.\n\n✅ Gerçek veriler\n✅ AES şifreleme\n✅ Kimlik doğrulama\n\n⚠️ Mi Fitness uygulamasını kapatın!\n\nDevam etmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: '🔐 Bağlan',
          onPress: async () => {
            try {
              setIsScanning(true);
              
              console.log('🔐 === AES BAĞLANTI TESTİ BAŞLIYOR ===');
              
              // Önce cihazları tara
              console.log('🔐 1. Cihaz tarama başlıyor...');
              const foundDevices = await miBand9Service.scanForMiBand9();
              
              console.log(`🔐 2. Tarama tamamlandı: ${foundDevices.length} cihaz bulundu`);
              
              if (foundDevices.length === 0) {
                console.log('🔐 3. HATA: Hiç cihaz bulunamadı');
                Alert.alert('Hata', 'Mi Band 9 bulunamadı. Cihazınızın yakında olduğundan ve Mi Fitness\'in kapalı olduğundan emin olun.');
                return;
              }

              // En güçlü sinyale sahip cihaza bağlan
              const bestDevice = foundDevices[0];
              console.log(`🔐 3. En iyi cihaz seçildi: ${bestDevice.name || 'İsimsiz'} (${bestDevice.id})`);
              console.log(`🔐 4. RSSI: ${bestDevice.rssi}, Bağlanabilir: ${bestDevice.isConnectable}`);
              
              Alert.alert(
                'Cihaz Bulundu',
                `${bestDevice.name || 'Mi Band 9'} (${bestDevice.id}) bulundu.\n\nRSSI: ${bestDevice.rssi}\n\nAES şifrelenmiş bağlantı kurulsun mu?`,
                [
                  { text: 'İptal', style: 'cancel' },
                  {
                    text: '🔐 AES Bağlantı Kur',
                    onPress: async () => {
                      console.log('🔐 5. AES bağlantı kurma başlıyor...');
                      
                      const success = await miBand9Service.connectToMiBand9();
                      
                      console.log(`🔐 6. Bağlantı sonucu: ${success ? 'BAŞARILI' : 'BAŞARISIZ'}`);
                      
                      if (success) {
                        updateConnectionStatus();
                        console.log('🔐 7. ✅ Bağlantı başarılı, gerçek nabız ölçümü başlatılıyor...');
                        
                        Alert.alert(
                          '🎉 AES Bağlantı Başarılı!',
                          'Mi Band 9 AES şifrelenmiş bağlantı kuruldu!\n\n✅ Kimlik doğrulama tamamlandı\n✅ Şifrelenmiş veri kanalı açık\n\nŞimdi gerçek nabız ölçümünü başlatabilirsiniz.',
                          [
                            { text: 'Tamam', onPress: () => {
                              // Otomatik olarak gerçek nabız ölçümünü başlat
                              console.log('🔐 8. Otomatik nabız ölçümü başlatılıyor...');
                              handleStartRealHeartRateMonitoring();
                            }}
                          ]
                        );
                      } else {
                        console.log('🔐 7. ❌ Bağlantı başarısız');
                        Alert.alert(
                          '❌ AES Bağlantı Başarısız',
                          'Mi Band 9 AES bağlantısı kurulamadı.\n\nSorun giderme:\n• Mi Fitness uygulamasını tamamen kapatın\n• Mi Band\'i restart edin\n• Bluetooth\'u yenileyin\n• Tekrar deneyin'
                        );
                      }
                    }
                  }
                ]
              );
              
            } catch (error) {
              console.error('🔐 AES bağlantı hatası:', error);
              Alert.alert('Hata', `AES bağlantı kurma hatası: ${error}`);
            } finally {
              setIsScanning(false);
            }
          }
        }
      ]
    );
  };

  const handleStartRealHeartRateMonitoring = async () => {
    try {
      const success = await miBand9Service.startHeartRateMonitoring();
      
      if (success) {
        setIsMonitoring(true);
        Alert.alert(
          '🔐 Gerçek Nabız İzleme Başlatıldı',
          'AES şifrelenmiş gerçek nabız verileri alınıyor!\n\n✅ Her 10 saniyede ölçüm\n✅ AES şifre çözme\n✅ Doğrulanmış veriler\n\nNabız verileri ekranda görünecek.'
        );
      } else {
        Alert.alert('Hata', 'Gerçek nabız izleme başlatılamadı. AES bağlantısını kontrol edin.');
      }
    } catch (error) {
      console.error('Gerçek nabız izleme hatası:', error);
      Alert.alert('Hata', `Gerçek nabız izleme başlatılamadı: ${error}`);
    }
  };

  const handleStartPassiveMonitoring = async () => {
    try {
      const success = await miBand9Service.startPassiveHeartRateMonitoring();
      
      if (success) {
        setIsMonitoring(true);
        
        // Demo veri ekle (test için)
        const demoHeartRate: HeartRateData = {
          value: 72,
          timestamp: new Date(),
          quality: 'good'
        };
        setLatestHeartRate(demoHeartRate);
        setHeartRateData([demoHeartRate]);
        
        Alert.alert(
          '🔍 Passive İzleme Başlatıldı', 
          'Mi Band cihazları taranıyor ve advertising verileri okunuyor.\n\n✅ Passive mod aktif\n⚠️ Gerçek nabız için AES bağlantı kurun\n\nDemo nabız verisi gösteriliyor.',
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert('Hata', 'Passive nabız izleme başlatılamadı.');
      }
    } catch (error) {
      console.error('Passive monitoring hatası:', error);
      Alert.alert('Hata', `Passive izleme başlatılamadı: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={['#000', '#1a1a1a']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Band 9</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bağlantı Durumu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bağlantı Durumu</Text>
            
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusLeft}>
                  <View 
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: connectionStatus.connected ? '#4CAF50' : '#F44336' }
                    ]} 
                  />
                  <Text style={styles.statusLabel}>Bağlantı</Text>
                </View>
                <Text style={styles.statusValue}>
                  {connectionStatus.connected ? 'Bağlı' : 'Bağlı Değil'}
                </Text>
              </View>
              
              {connectionStatus.connected && (
                <>
                  <View style={styles.statusRow}>
                    <View style={styles.statusLeft}>
                      <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                      <Text style={styles.statusLabel}>Kimlik Doğrulama</Text>
                    </View>
                    <Text style={styles.statusValue}>
                      {connectionStatus.authenticated ? 'Doğrulandı' : 'Bekliyor'}
                    </Text>
                  </View>
                  
                  {connectionStatus.deviceName && (
                    <View style={styles.statusRow}>
                      <View style={styles.statusLeft}>
                        <Ionicons name="watch" size={16} color="#2196F3" />
                        <Text style={styles.statusLabel}>Cihaz</Text>
                      </View>
                      <Text style={styles.statusValue}>{connectionStatus.deviceName}</Text>
                    </View>
                  )}
                  
                  {connectionStatus.batteryLevel !== undefined && (
                    <View style={styles.statusRow}>
                      <View style={styles.statusLeft}>
                        <Ionicons name="battery-half" size={16} color="#FF9800" />
                        <Text style={styles.statusLabel}>Batarya</Text>
                      </View>
                      <Text style={styles.statusValue}>{connectionStatus.batteryLevel}%</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {!connectionStatus.connected ? (
            /* Cihaz Tarama */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mi Band 9 Bağlantısı</Text>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton, isScanning && styles.disabledButton]}
                onPress={handleScanDevices}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="search" size={24} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>
                  {isScanning ? 'Taranıyor...' : 'Mi Band 9 Tara'}
                </Text>
              </TouchableOpacity>

              {/* Sorun Giderme Butonu */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.troubleshootButton]}
                onPress={handleTroubleshoot}
              >
                <Ionicons name="help-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Sorun Giderme</Text>
              </TouchableOpacity>

              {/* AES Gerçek Bağlantı Butonu */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.aesButton]}
                onPress={handleConnectWithAES}
              >
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>🔐 AES Şifrelenmiş Gerçek Bağlantı</Text>
              </TouchableOpacity>

              {/* Passive Monitoring Butonu */}
              <TouchableOpacity 
                style={[styles.actionButton, styles.passiveButton]}
                onPress={handleStartPassiveMonitoring}
              >
                <Ionicons name="radio" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Mi Fitness'i Bozmadan İzle</Text>
              </TouchableOpacity>

              {devices.length > 0 && (
                <View style={styles.devicesList}>
                  <Text style={styles.devicesTitle}>Bulunan Cihazlar:</Text>
                  {devices.map((device, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.deviceItem}
                      onPress={() => handleConnectDevice(device)}
                    >
                      <Ionicons name="watch" size={24} color="#2196F3" />
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceItemName}>
                          {device.name || 'Mi Band 9'}
                        </Text>
                        <Text style={styles.deviceId}>{device.id}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Gerçek Zamanlı Uyku Nabız İzleme Kontrolleri */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gerçek Zamanlı Uyku İzleme</Text>
                
                <View style={styles.monitoringControls}>
                  {!isRealtimeSleepMonitoring ? (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.sleepButton]}
                      onPress={handleStartRealtimeSleepMonitoring}
                    >
                      <Ionicons name="moon" size={24} color="#fff" />
                      <Text style={styles.actionButtonText}>Uyku İzleme Başlat</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.stopButton]}
                      onPress={handleStopRealtimeSleepMonitoring}
                    >
                      <Ionicons name="stop" size={24} color="#fff" />
                      <Text style={styles.actionButtonText}>Uyku İzleme Durdur</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Uyku İzleme Durumu */}
                {isRealtimeSleepMonitoring && currentSleepSession && (
                  <View style={styles.sleepSessionCard}>
                    <View style={styles.sleepSessionHeader}>
                      <Ionicons name="moon" size={20} color="#9C27B0" />
                      <Text style={styles.sleepSessionTitle}>Aktif Uyku Session</Text>
                      <View style={styles.activeDot} />
                    </View>
                    
                    <View style={styles.sleepSessionStats}>
                      <View style={styles.sleepStat}>
                        <Text style={styles.sleepStatValue}>{formatDuration(sleepMonitoringDuration)}</Text>
                        <Text style={styles.sleepStatLabel}>Süre</Text>
                      </View>
                      
                      <View style={styles.sleepStat}>
                        <Text style={styles.sleepStatValue}>{currentSleepSession.heartRateReadings.length}</Text>
                        <Text style={styles.sleepStatLabel}>Ölçüm</Text>
                      </View>
                      
                      <View style={styles.sleepStat}>
                        <Text style={styles.sleepStatValue}>
                          {currentSleepSession.averageHeartRate > 0 ? `${currentSleepSession.averageHeartRate}` : '-'}
                        </Text>
                        <Text style={styles.sleepStatLabel}>Ort. Nabız</Text>
                      </View>
                      
                      <View style={styles.sleepStat}>
                        <Text style={styles.sleepStatValue}>{getSleepHeartRateStatus()}</Text>
                        <Text style={styles.sleepStatLabel}>Durum</Text>
                      </View>
                    </View>

                    {currentSleepSession.heartRateReadings.length > 0 && (
                      <View style={styles.sleepRangeInfo}>
                        <Text style={styles.sleepRangeText}>
                          Nabız Aralığı: {currentSleepSession.minHeartRate} - {currentSleepSession.maxHeartRate} BPM
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Normal Nabız İzleme Kontrolleri */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Normal Nabız İzleme</Text>
                
                <View style={styles.monitoringControls}>
                  {!isMonitoring || isRealtimeSleepMonitoring ? (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.primaryButton, isRealtimeSleepMonitoring && styles.disabledButton]}
                        onPress={handleStartHeartRateMonitoring}
                        disabled={isRealtimeSleepMonitoring}
                      >
                        <Ionicons name="heart" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Normal İzleme</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.sleepButton, isRealtimeSleepMonitoring && styles.disabledButton]}
                        onPress={handleStartSleepMonitoring}
                        disabled={isRealtimeSleepMonitoring}
                      >
                        <Ionicons name="moon" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Eski Uyku İzleme</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.stopButton]}
                      onPress={handleStopHeartRateMonitoring}
                    >
                      <Ionicons name="stop" size={24} color="#fff" />
                      <Text style={styles.actionButtonText}>İzlemeyi Durdur</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {isRealtimeSleepMonitoring && (
                  <Text style={styles.warningText}>
                    ⚠️ Gerçek zamanlı uyku izleme aktif olduğu için normal izleme devre dışı
                  </Text>
                )}
              </View>

              {/* Nabız Verileri (Bağlantı olmasa da göster) */}
              {latestHeartRate && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {connectionStatus.connected ? 
                      (isRealtimeSleepMonitoring ? 'Gerçek Uyku Nabızı' : 'Gerçek Nabız Ölçümü') : 
                      'Passive Nabız Verisi'
                    }
                  </Text>
                  
                  <View style={styles.heartRateCard}>
                    <View style={styles.heartRateMain}>
                      <Text style={styles.heartRateValue}>{latestHeartRate.value}</Text>
                      <Text style={styles.heartRateUnit}>BPM</Text>
                    </View>
                    
                    <View style={styles.heartRateDetails}>
                      <View style={styles.heartRateQuality}>
                        <View 
                          style={[
                            styles.qualityIndicator,
                            { backgroundColor: getHeartRateQualityColor(latestHeartRate.quality) }
                          ]} 
                        />
                        <Text style={styles.qualityText}>
                          {latestHeartRate.quality === 'excellent' ? 'Mükemmel' :
                           latestHeartRate.quality === 'good' ? 'İyi' : 'Zayıf'}
                        </Text>
                      </View>
                      
                      <Text style={styles.heartRateTime}>
                        {formatTime(latestHeartRate.timestamp)}
                      </Text>
                    </View>

                    {!connectionStatus.connected && (
                      <View style={styles.passiveWarning}>
                        <Text style={styles.passiveWarningText}>
                          ⚠️ Bu passive veri - gerçek nabız için AES bağlantı kurun
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Nabız Geçmişi (Bağlantı olmasa da göster) */}
              {heartRateData.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {connectionStatus.connected ? 
                      (isRealtimeSleepMonitoring ? 'Gerçek Uyku Ölçümleri' : 'Gerçek Son Ölçümler') : 
                      'Passive Ölçümler'
                    }
                  </Text>
                  
                  <View style={styles.historyList}>
                    {heartRateData.slice().reverse().slice(0, 10).map((data, index) => (
                      <View key={index} style={styles.historyItem}>
                        <View style={styles.historyMain}>
                          <Text style={styles.historyValue}>{data.value} BPM</Text>
                          <View 
                            style={[
                              styles.historyQuality,
                              { backgroundColor: getHeartRateQualityColor(data.quality) }
                            ]} 
                          />
                        </View>
                        <Text style={styles.historyTime}>
                          {formatTime(data.timestamp)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {!connectionStatus.connected && (
                    <View style={styles.passiveInfo}>
                      <Text style={styles.passiveInfoText}>
                        💡 Passive mod aktif - advertising verilerini okuyorum
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Bağlantıyı Kes */}
              <View style={styles.section}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={handleDisconnect}
                >
                  <Ionicons name="unlink" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Bağlantıyı Kes</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 14,
  },
  statusValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
    flex: 1,
    marginRight: 5,
  },
  sleepButton: {
    backgroundColor: '#9C27B0',
    flex: 1,
    marginLeft: 5,
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  disconnectButton: {
    backgroundColor: '#666',
  },
  disabledButton: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  monitoringControls: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  devicesList: {
    marginTop: 20,
  },
  devicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  deviceItemName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deviceId: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  heartRateCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  heartRateMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 15,
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  heartRateUnit: {
    fontSize: 18,
    color: '#666',
    marginLeft: 8,
  },
  heartRateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartRateQuality: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  qualityText: {
    color: '#fff',
    fontSize: 14,
  },
  heartRateTime: {
    color: '#666',
    fontSize: 14,
  },
  historyList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyQuality: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  historyTime: {
    color: '#666',
    fontSize: 12,
  },
  warningText: {
    color: '#FF9800',
    fontSize: 14,
    marginTop: 10,
  },
  sleepSessionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sleepSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sleepSessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  sleepSessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleepStat: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  sleepStatValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sleepStatLabel: {
    color: '#666',
    fontSize: 14,
  },
  sleepRangeInfo: {
    marginTop: 10,
  },
  sleepRangeText: {
    color: '#fff',
    fontSize: 14,
  },
  troubleshootButton: {
    backgroundColor: '#FF9800',
  },
  passiveButton: {
    backgroundColor: '#9C27B0',
  },
  aesButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  passiveWarning: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FF9800',
  },
  passiveWarningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  passiveInfo: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
  },
  passiveInfoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MiBand9Screen; 