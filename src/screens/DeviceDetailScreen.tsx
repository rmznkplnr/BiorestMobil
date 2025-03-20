import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const DeviceDetailScreen = () => {
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = useState(true);

  const handleDisconnect = () => {
    Alert.alert(
      'Cihazı Ayır',
      'Bu cihazı ayırmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Ayır',
          style: 'destructive',
          onPress: () => {
            setIsConnected(false);
            // Cihaz ayırma işlemleri burada yapılacak
          },
        },
      ],
    );
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
          <Text style={styles.headerTitle}>Cihaz Detayları</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Cihaz Durumu */}
          <View style={styles.statusSection}>
            <View style={styles.deviceIcon}>
              <Ionicons name="watch-outline" size={48} color="#4a90e2" />
            </View>
            <Text style={styles.deviceName}>Biorest Watch</Text>
            <View style={[styles.statusBadge, isConnected ? styles.connected : styles.disconnected]}>
              <Text style={styles.statusText}>
                {isConnected ? 'Bağlı' : 'Bağlı Değil'}
              </Text>
            </View>
          </View>

          {/* Cihaz Bilgileri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cihaz Bilgileri</Text>
            
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="bluetooth" size={24} color="#4a90e2" />
                <Text style={styles.infoLabel}>MAC Adresi</Text>
              </View>
              <Text style={styles.infoValue}>00:11:22:33:44:55</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="hardware-chip-outline" size={24} color="#4a90e2" />
                <Text style={styles.infoLabel}>Firmware Versiyonu</Text>
              </View>
              <Text style={styles.infoValue}>v2.1.0</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="battery-full-outline" size={24} color="#4a90e2" />
                <Text style={styles.infoLabel}>Pil Durumu</Text>
              </View>
              <Text style={styles.infoValue}>85%</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="time-outline" size={24} color="#4a90e2" />
                <Text style={styles.infoLabel}>Son Bağlantı</Text>
              </View>
              <Text style={styles.infoValue}>2 dk önce</Text>
            </View>
          </View>

          {/* Cihaz Ayarları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ayarlar</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
                <Text style={styles.settingText}>Bildirim Ayarları</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="sync-outline" size={24} color="#4a90e2" />
                <Text style={styles.settingText}>Veri Senkronizasyonu</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="refresh-outline" size={24} color="#4a90e2" />
                <Text style={styles.settingText}>Firmware Güncelleme</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Cihazı Ayır */}
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            <Text style={styles.disconnectText}>Cihazı Ayır</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deviceIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connected: {
    backgroundColor: '#2ecc71',
  },
  disconnected: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  infoValue: {
    color: '#888',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  disconnectText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default DeviceDetailScreen; 