import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  HealthData: undefined;
  DeviceSettings: undefined;
};

interface NavigationCardProps {
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [deviceStatus, setDeviceStatus] = useState({
    isConnected: false,
    batteryLevel: 85,
    lastSync: new Date(),
  });

  const StatusCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="bluetooth" size={24} color="#3498db" />
        <Text style={styles.cardTitle}>Cihaz Durumu</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Icon
            name={deviceStatus.isConnected ? 'check-circle' : 'close-circle'}
            size={32}
            color={deviceStatus.isConnected ? '#2ecc71' : '#e74c3c'}
          />
          <Text style={styles.statusLabel}>
            {deviceStatus.isConnected ? 'Bağlı' : 'Bağlı Değil'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Icon name="battery" size={32} color="#f1c40f" />
          <Text style={styles.statusLabel}>{deviceStatus.batteryLevel}%</Text>
        </View>
        <View style={styles.statusItem}>
          <Icon name="clock" size={32} color="#9b59b6" />
          <Text style={styles.statusLabel}>
            {deviceStatus.lastSync.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const NavigationCard: React.FC<NavigationCardProps> = ({ title, icon, description, onPress }) => (
    <TouchableOpacity style={styles.navCard} onPress={onPress}>
      <View style={styles.navIconContainer}>
        <Icon name={icon} size={32} color="#3498db" />
      </View>
      <View style={styles.navContent}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navDescription}>{description}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#bdc3c7" />
    </TouchableOpacity>
  );

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity style={styles.quickActionButton}>
        <Icon name="power" size={24} color="#e74c3c" />
        <Text style={styles.quickActionText}>Kapat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton}>
        <Icon name="refresh" size={24} color="#2ecc71" />
        <Text style={styles.quickActionText}>Yenile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton}>
        <Icon name="cog" size={24} color="#3498db" />
        <Text style={styles.quickActionText}>Ayarlar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BioRest</Text>
          <Text style={styles.headerSubtitle}>Akıllı Ortam Kontrolü</Text>
        </View>

        <StatusCard />

        <NavigationCard
          title="Sağlık Verileri"
          icon="heart-pulse"
          description="Uyku ve aktivite verilerinizi görüntüleyin"
          onPress={() => navigation.navigate('HealthData')}
        />

        <NavigationCard
          title="Cihaz Ayarları"
          icon="tune"
          description="Ortam ayarlarını özelleştirin"
          onPress={() => navigation.navigate('DeviceSettings')}
        />

        <QuickActions />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    marginTop: 5,
    fontSize: 14,
    color: '#7f8c8d',
  },
  navCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  navIconContainer: {
    width: 50,
    alignItems: 'center',
  },
  navContent: {
    flex: 1,
    marginLeft: 15,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  navDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: (Dimensions.get('window').width - 60) / 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  quickActionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default HomeScreen;