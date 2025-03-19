import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DevicesScreen = () => {
  const devices = [
    {
      id: '1',
      name: 'BioRest Pro',
      status: 'Aktif',
      lastSync: '2 saat önce',
      battery: 85,
    },
    {
      id: '2',
      name: 'BioRest Mini',
      status: 'Bağlı Değil',
      lastSync: '1 gün önce',
      battery: 45,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cihazlarım</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.devicesList}>
          {devices.map((device) => (
            <TouchableOpacity key={device.id} style={styles.deviceCard}>
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.deviceCardGradient}
              >
                <View style={styles.deviceInfo}>
                  <View style={styles.deviceHeader}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      device.status === 'Aktif' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>{device.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.lastSync}>Son Senkronizasyon: {device.lastSync}</Text>
                  <View style={styles.batteryContainer}>
                    <Ionicons name="battery-charging" size={20} color="#fff" />
                    <Text style={styles.batteryText}>{device.battery}%</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <LinearGradient
            colors={['#50c878', '#3da066']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Yeni Cihaz Ekle</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  devicesList: {
    padding: 20,
  },
  deviceCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  deviceCardGradient: {
    padding: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusActive: {
    backgroundColor: 'rgba(80, 200, 120, 0.3)',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  lastSync: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 10,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  addButton: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default DevicesScreen; 