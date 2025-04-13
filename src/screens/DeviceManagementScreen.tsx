import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import { BleManager, Device } from 'react-native-ble-plx';
import { useDevices } from '../context/DeviceContext';

type DeviceManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeviceManagement'>;

const bleManager = new BleManager();

const DeviceManagementScreen = () => {
  const navigation = useNavigation<DeviceManagementScreenNavigationProp>();
  const { addDevice } = useDevices();
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<'faunus' | 'watch'>('faunus');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    // Bluetooth izinlerini kontrol et
    checkBluetoothPermissions();
  }, []);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Android 10 ve üzeri için konum izni gerekli
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        ]);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            'İzin Gerekli',
            'Bluetooth cihazlarını taramak için konum izinleri gerekiyor. Lütfen ayarlardan izinleri kontrol edin.',
            [
              {
                text: 'Ayarlara Git',
                onPress: () => Linking.openSettings(),
              },
              {
                text: 'İptal',
                onPress: () => navigation.goBack(),
                style: 'cancel',
              },
            ]
          );
          return false;
        }
      } catch (err) {
        console.error('İzin isteme hatası:', err);
        return false;
      }
    }
    return true;
  };

  const checkLocationServices = async () => {
    try {
      const state = await bleManager.state();
      if (state === 'PoweredOn') {
        return true;
      }

      Alert.alert(
        'Konum Servisleri Kapalı',
        'Bluetooth cihazlarını taramak için konum servislerinin açık olması gerekiyor.',
        [
          {
            text: 'Ayarlara Git',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openSettings();
              } else {
                Linking.openURL('app-settings:');
              }
            },
          },
          {
            text: 'İptal',
            style: 'cancel',
          },
        ]
      );
      return false;
    } catch (error) {
      console.error('Konum servisleri kontrol edilirken hata:', error);
      return false;
    }
  };

  const checkBluetoothPermissions = async () => {
    try {
      const hasPermissions = await requestBluetoothPermissions();
      if (!hasPermissions) return false;

      const locationEnabled = await checkLocationServices();
      if (!locationEnabled) return false;

      const state = await bleManager.state();
      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth Kapalı',
          'Lütfen Bluetooth\'u açın ve tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Bluetooth durumu kontrol edilirken hata:', error);
      return false;
    }
  };

  const startScan = async () => {
    if (!deviceName.trim()) {
      Alert.alert('Hata', 'Lütfen cihaz adını giriniz.');
      return;
    }

    const hasPermission = await checkBluetoothPermissions();
    if (!hasPermission) return;

    setIsScanning(true);
    setDevices([]);
    setSelectedDevice(null);

    try {
      bleManager.startDeviceScan(
        null,
        { 
          allowDuplicates: false,
          scanMode: 2 // Yüksek güç tarama modu
        },
        (error, device) => {
          if (error) {
            console.error('Tarama hatası:', error);
            setIsScanning(false);
            if (error.message.includes('Location services are disabled')) {
              Alert.alert(
                'Konum Servisleri Kapalı',
                'Bluetooth cihazlarını taramak için konum servislerinin açık olması gerekiyor.',
                [
                  {
                    text: 'Ayarlara Git',
                    onPress: () => {
                      if (Platform.OS === 'android') {
                        Linking.openSettings();
                      } else {
                        Linking.openURL('app-settings:');
                      }
                    },
                  },
                  {
                    text: 'İptal',
                    style: 'cancel',
                  },
                ]
              );
            }
            return;
          }

          if (device) {
            // Xiaomi Mi Band 3 için özel kontroller
            const localName = device.localName || device.name || '';
            const manufacturerData = device.manufacturerData || '';
            
            // Xiaomi Mi Band 3'ün üretici ID'si ve cihaz adı kontrolü
            const isXiaomiDevice = 
              manufacturerData.includes('0x0157') || // Xiaomi üretici ID'si
              localName.toLowerCase().includes('mi band') ||
              localName.toLowerCase().includes('miband');

            if (isXiaomiDevice) {
              setDevices(prevDevices => {
                const existingDevice = prevDevices.find(d => d.id === device.id);
                if (!existingDevice) {
                  return [...prevDevices, device];
                }
                return prevDevices;
              });
            }
          }
        }
      );

      // 15 saniye sonra taramayı durdur
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
        if (devices.length === 0) {
          Alert.alert(
            'Cihaz Bulunamadı',
            'Tarama süresi doldu ve cihaz bulunamadı. Lütfen cihazınızın açık olduğundan emin olun ve tekrar deneyin.',
            [
              {
                text: 'Tekrar Tara',
                onPress: startScan,
              },
              {
                text: 'İptal',
                style: 'cancel',
              },
            ]
          );
        }
      }, 15000);

    } catch (error) {
      console.error('Tarama başlatılırken hata:', error);
      setIsScanning(false);
      Alert.alert('Hata', 'Cihaz taraması başlatılırken bir hata oluştu.');
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      setIsScanning(false);
      bleManager.stopDeviceScan();
      
      await device.connect();
      await device.discoverAllServicesAndCharacteristics();

      // Cihazı context'e ekle
      addDevice({
        id: Math.random().toString(),
        name: deviceName,
        type: deviceType,
        connected: true,
        deviceId: device.id,
      });

      Alert.alert('Başarılı', 'Cihaz başarıyla bağlandı!', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Cihaz bağlantı hatası:', error);
      Alert.alert(
        'Bağlantı Hatası',
        'Cihaza bağlanırken bir hata oluştu. Lütfen tekrar deneyin.',
        [
          {
            text: 'Tekrar Dene',
            onPress: () => connectToDevice(device),
          },
          {
            text: 'İptal',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cihaz Ekle</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.label}>Cihaz Adı</Text>
            <TextInput
              style={styles.input}
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder="Cihazınıza bir isim verin"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Cihaz Tipi</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  deviceType === 'faunus' && styles.selectedType,
                ]}
                onPress={() => setDeviceType('faunus')}
              >
                <Ionicons 
                  name="bed-outline" 
                  size={24} 
                  color={deviceType === 'faunus' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.typeText,
                  deviceType === 'faunus' && styles.selectedTypeText,
                ]}>
                  Faunus Cihazı
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  deviceType === 'watch' && styles.selectedType,
                ]}
                onPress={() => setDeviceType('watch')}
              >
                <Ionicons 
                  name="watch-outline" 
                  size={24} 
                  color={deviceType === 'watch' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.typeText,
                  deviceType === 'watch' && styles.selectedTypeText,
                ]}>
                  Akıllı Saat
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.addButton, isScanning && styles.scanningButton]}
              onPress={isScanning ? () => bleManager.stopDeviceScan() : startScan}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Cihazı Tara</Text>
              )}
            </TouchableOpacity>

            {devices.length > 0 && (
              <View style={styles.devicesList}>
                <Text style={styles.devicesTitle}>Bulunan Cihazlar</Text>
                {devices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceItem,
                      selectedDevice?.id === device.id && styles.selectedDevice,
                    ]}
                    onPress={() => {
                      setSelectedDevice(device);
                      connectToDevice(device);
                    }}
                  >
                    <Ionicons 
                      name={deviceType === 'watch' ? 'watch-outline' : 'bed-outline'} 
                      size={24} 
                      color="#fff" 
                    />
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>
                        {device.localName || device.name || 'Mi Band 3'}
                      </Text>
                      <Text style={styles.deviceId}>
                        {device.id} • Sinyal Gücü: {device.rssi} dBm
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.select({ ios: 90, android: 70 }),
  },
  form: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
  },
  selectedType: {
    backgroundColor: '#4a90e2',
  },
  typeText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 10,
  },
  selectedTypeText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanningButton: {
    backgroundColor: '#666',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devicesList: {
    marginTop: 20,
  },
  devicesTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedDevice: {
    backgroundColor: '#4a90e2',
  },
  deviceInfo: {
    marginLeft: 15,
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
});

export default DeviceManagementScreen; 