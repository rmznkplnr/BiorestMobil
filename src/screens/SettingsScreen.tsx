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
  Switch,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'aws-amplify/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sleepReminders, setSleepReminders] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  const renderSettingSection = (
    title: string, 
    items: Array<{
      icon: string;
      label: string;
      value?: boolean;
      onToggle?: (newValue: boolean) => void;
      onPress?: () => void;
      rightIcon?: string;
      description?: string;
    }>
  ) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item, index) => (
          <View key={index} style={[
            styles.settingItem,
            index === items.length - 1 && { borderBottomWidth: 0 }
          ]}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color="#4a90e2" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingDescription}>{item.description}</Text>
                )}
              </View>
            </View>
            <View style={styles.settingRight}>
              {item.value !== undefined && item.onToggle && (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#3e3e3e', true: '#81b0ff' }}
                  thumbColor={item.value ? '#4a90e2' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              )}
              {item.rightIcon && (
                <Ionicons name={item.rightIcon} size={20} color="#777" />
              )}
              {item.onPress && !item.value && (
                <TouchableOpacity onPress={item.onPress}>
                  <Ionicons name="chevron-forward" size={20} color="#777" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
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
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderSettingSection('Görünüm', [
            {
              icon: 'moon-outline',
              label: 'Karanlık Mod',
              value: darkMode,
              onToggle: setDarkMode,
            },
            {
              icon: 'color-palette-outline',
              label: 'Tema Rengi',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
            {
              icon: 'text-outline',
              label: 'Yazı Tipi Boyutu',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
          ])}

          {renderSettingSection('Bildirimler', [
            {
              icon: 'notifications-outline',
              label: 'Bildirimleri Etkinleştir',
              value: notifications,
              onToggle: setNotifications,
            },
            {
              icon: 'alarm-outline',
              label: 'Hatırlatıcılar',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
          ])}

          {renderSettingSection('Sağlık', [
            {
              icon: 'fitness-outline',
              label: 'Sağlık Verilerini Senkronize Et',
              value: healthSyncEnabled,
              onToggle: setHealthSyncEnabled,
            },
            {
              icon: 'watch-outline',
              label: 'Mi Band 9 Bağlantısı',
              rightIcon: 'chevron-forward',
              description: 'Uyku sırasında nabız izleme',
              onPress: () => navigation.navigate('MiBand9'),
            },
            {
              icon: 'refresh-outline',
              label: 'Veri Senkronizasyon Aralığı',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
            {
              icon: 'analytics-outline',
              label: 'Sağlık Hedeflerim',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
          ])}

          {renderSettingSection('Veri ve Gizlilik', [
            {
              icon: 'cloud-upload-outline',
              label: 'Otomatik Yedekleme',
              value: autoBackupEnabled,
              onToggle: setAutoBackupEnabled,
            },
            {
              icon: 'download-outline',
              label: 'Verilerimi İndir',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
            {
              icon: 'trash-outline',
              label: 'Tüm Verilerimi Sil',
              rightIcon: 'chevron-forward',
              description: 'Dikkat: Bu işlem geri alınamaz!',
              onPress: () => Alert.alert(
                'Uyarı', 
                'Tüm verilerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
                [
                  { text: 'Vazgeç', style: 'cancel' },
                  { text: 'Sil', style: 'destructive', onPress: () => Alert.alert('Bilgi', 'Bu özellik henüz aktif değil') }
                ]
              ),
            },
          ])}

          {renderSettingSection('Hesap', [
            {
              icon: 'person-outline',
              label: 'Profil Bilgilerim',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
            {
              icon: 'key-outline',
              label: 'Şifremi Değiştir',
              rightIcon: 'chevron-forward',
              onPress: () => Alert.alert('Bilgi', 'Bu özellik yakında gelecek'),
            },
            {
              icon: 'log-out-outline',
              label: 'Çıkış Yap',
              rightIcon: 'chevron-forward',
              onPress: handleSignOut,
            },
          ])}

          <View style={styles.version}>
            <Text style={styles.versionText}>Biorest Mobil v1.0.0</Text>
          </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
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
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  version: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    color: '#666',
    fontSize: 12,
  },
});

export default SettingsScreen; 
