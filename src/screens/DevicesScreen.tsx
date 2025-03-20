import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type DevicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Renk kombinasyonları
const gradientColors = [
  ['#1e3c72', '#2a5298'], // Koyu lacivert
  ['#2C3E50', '#3498db'], // Gece mavisi
  ['#373B44', '#4286f4'], // Çelik mavisi
  ['#0F2027', '#203A43'], // Okyanus mavisi
  ['#000046', '#1CB5E0'], // Gece yarısı
  ['#243B55', '#141E30'], // Derin deniz
];

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  icon: string;
}

const DevicesScreen = () => {
  const navigation = useNavigation<DevicesScreenNavigationProp>();

  // Örnek cihaz verileri
  const devices: Device[] = [
    {
      id: '1',
      name: 'Faunus Yatak Odası',
      type: 'Faunus Cihazı',
      status: 'connected',
      icon: 'bed-outline',
    },
    {
      id: '2',
      name: 'Faunus Salon',
      type: 'Faunus Cihazı',
      status: 'disconnected',
      icon: 'home-outline',
    },
    {
      id: '3',
      name: 'Akıllı Saat',
      type: 'Sağlık Cihazı',
      status: 'connected',
      icon: 'watch-outline',
    },
  ];

  const getGradientColors = (index: number) => {
    return gradientColors[index % gradientColors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cihazlarım</Text>
        <TouchableOpacity onPress={() => {}} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.devicesGrid}>
          {devices.map((device, index) => (
            <TouchableOpacity
              key={device.id}
              style={styles.deviceCard}
              onPress={() => {}}
            >
              <LinearGradient
                colors={getGradientColors(index)}
                style={styles.cardGradient}
              >
                <View style={styles.deviceIcon}>
                  <Ionicons name={device.icon} size={32} color="#fff" />
                  <View style={[
                    styles.statusDot,
                    device.status === 'connected' ? styles.statusConnected : styles.statusDisconnected
                  ]} />
                </View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceType}>{device.type}</Text>
                <Text style={styles.deviceStatus}>
                  {device.status === 'connected' ? 'Bağlı' : 'Bağlı Değil'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  deviceCard: {
    width: (Dimensions.get('window').width - 60) / 2,
    height: 160,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIcon: {
    position: 'relative',
    marginBottom: 10,
  },
  statusDot: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#f44336',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  deviceStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});

export default DevicesScreen; 