import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';

type DeviceManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeviceManagement'>;

interface Device {
  id: string;
  name: string;
  type: 'faunus' | 'other';
  status: 'connected' | 'disconnected';
  lastSeen: string;
}

const DeviceManagementScreen = () => {
  const navigation = useNavigation<DeviceManagementScreenNavigationProp>();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedType, setSelectedType] = useState<'faunus' | 'other' | null>(null);

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Faunus Pro',
      type: 'faunus',
      status: 'connected',
      lastSeen: '2 dakika önce',
    },
    {
      id: '2',
      name: 'Akıllı Saat',
      type: 'other',
      status: 'disconnected',
      lastSeen: '1 saat önce',
    },
  ]);

  const handleAddDevice = () => {
    if (selectedType) {
      const newDevice: Device = {
        id: (devices.length + 1).toString(),
        name: selectedType === 'faunus' ? 'Faunus Pro' : 'Akıllı Saat',
        type: selectedType,
        status: 'connected',
        lastSeen: 'Şimdi',
      };
      setDevices([...devices, newDevice]);
      setShowAddDevice(false);
      setSelectedType(null);
    }
  };

  return (
    <LinearGradient
      colors={['#1A1A1A', '#000000']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Icon name="devices" size={24} color={theme.colors.primary} />
            <Text variant="h1" style={styles.headerTitle}>Cihaz Yönetimi</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Cihaz Listesi */}
          <View style={styles.deviceList}>
            {devices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceCard}
                onPress={() => navigation.navigate('DeviceSettings', { deviceId: device.id })}>
                <View style={styles.deviceInfo}>
                  <Icon
                    name={device.type === 'faunus' ? 'spray' : 'watch'}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.deviceText}>
                    <Text variant="h3" style={styles.deviceName}>{device.name}</Text>
                    <Text variant="caption" style={styles.deviceStatus}>
                      {device.status === 'connected' ? 'Bağlı' : 'Bağlı Değil'} • {device.lastSeen}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Cihaz Ekle Butonu */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddDevice(true)}>
            <Icon name="plus" size={24} color={theme.colors.primary} />
            <Text variant="body" style={styles.addButtonText}>Cihaz Ekle</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Cihaz Ekleme Modalı */}
        <Modal
          visible={showAddDevice}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddDevice(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="h2" style={styles.modalTitle}>Cihaz Ekle</Text>
                <TouchableOpacity
                  onPress={() => setShowAddDevice(false)}>
                  <Icon name="close" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.deviceTypes}>
                <TouchableOpacity
                  style={[
                    styles.deviceTypeButton,
                    selectedType === 'faunus' && styles.selectedDeviceType,
                  ]}
                  onPress={() => setSelectedType('faunus')}>
                  <Icon
                    name="spray"
                    size={24}
                    color={selectedType === 'faunus' ? theme.colors.background : theme.colors.primary}
                  />
                  <Text
                    variant="body"
                    style={[
                      styles.deviceTypeText,
                      selectedType === 'faunus' && styles.selectedDeviceTypeText,
                    ]}>
                    Faunus Pro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deviceTypeButton,
                    selectedType === 'other' && styles.selectedDeviceType,
                  ]}
                  onPress={() => setSelectedType('other')}>
                  <Icon
                    name="watch"
                    size={24}
                    color={selectedType === 'other' ? theme.colors.background : theme.colors.primary}
                  />
                  <Text
                    variant="body"
                    style={[
                      styles.deviceTypeText,
                      selectedType === 'other' && styles.selectedDeviceTypeText,
                    ]}>
                    Diğer Cihaz
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="İptal"
                  onPress={() => setShowAddDevice(false)}
                  style={styles.cancelButton}
                />
                <Button
                  title="Ekle"
                  onPress={handleAddDevice}
                  disabled={!selectedType}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  deviceList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    ...theme.elevation.medium,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  deviceText: {
    gap: theme.spacing.xs,
  },
  deviceName: {
    color: theme.colors.primary,
  },
  deviceStatus: {
    color: theme.colors.text.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    ...theme.elevation.medium,
  },
  addButtonText: {
    color: theme.colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.primary,
  },
  deviceTypes: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  deviceTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
  },
  selectedDeviceType: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  deviceTypeText: {
    color: theme.colors.primary,
  },
  selectedDeviceTypeText: {
    color: theme.colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.card.background,
  },
});

export default DeviceManagementScreen; 