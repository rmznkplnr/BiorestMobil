import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import { useDevices } from '../context/DeviceContext';

type DevicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const DevicesScreen = () => {
  const navigation = useNavigation<DevicesScreenNavigationProp>();
  const { devices } = useDevices();

  const gradientColors = [
    ['#1e3c72', '#2a5298'], // dark blue
    ['#2C3E50', '#3498db'], // night blue
    ['#373B44', '#4286f4'], // steel blue
    ['#0F2027', '#203A43'], // ocean blue
    ['#000046', '#1CB5E0'], // midnight
    ['#243B55', '#141E30'], // deep sea
  ];

  const getGradientColors = (index: number) => {
    return gradientColors[index % gradientColors.length];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cihazlarım</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('DeviceManagement')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.devicesGrid}>
            {devices.map((device, index) => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceCard}
                onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.deviceId })}
              >
                <LinearGradient
                  colors={getGradientColors(index)}
                  style={styles.deviceGradient}
                >
                  <View style={styles.deviceHeader}>
                    <Ionicons 
                      name={device.type === 'faunus' ? 'bed-outline' : 'watch-outline'} 
                      size={24} 
                      color="#fff" 
                    />
                    <View style={[
                      styles.connectionStatus,
                      device.connected ? styles.connected : styles.disconnected
                    ]} />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceType}>
                      {device.type === 'faunus' ? 'Faunus Cihazı' : 'Akıllı Saat'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.select({ ios: 90, android: 70 }),
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deviceGradient: {
    padding: 15,
    height: 140,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  connectionStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#f44336',
  },
  deviceInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  deviceType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default DevicesScreen; 