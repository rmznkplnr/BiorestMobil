import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';

type DeviceSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeviceSettings'>;

interface DeviceSettings {
  name: string;
  type: 'faunus' | 'other';
  status: 'connected' | 'disconnected';
  lastSeen: string;
  aromas: {
    id: number;
    name: string;
    enabled: boolean;
  }[];
  sounds: {
    id: number;
    name: string;
    enabled: boolean;
  }[];
  lights: {
    id: number;
    name: string;
    enabled: boolean;
    color: string;
    intensity: number;
  }[];
}

const DeviceSettingsScreen = () => {
  const navigation = useNavigation<DeviceSettingsScreenNavigationProp>();
  const route = useRoute();
  const deviceId = (route.params as { deviceId: string }).deviceId;

  const [settings, setSettings] = useState<DeviceSettings>({
    name: 'Faunus Pro',
    type: 'faunus',
    status: 'connected',
    lastSeen: '2 dakika önce',
    aromas: [
      { id: 1, name: 'Lavanta', enabled: true },
      { id: 2, name: 'Papatya', enabled: false },
      { id: 3, name: 'Vanilya', enabled: false },
      { id: 4, name: 'Sandal Ağacı', enabled: false },
      { id: 5, name: 'Bergamot', enabled: false },
      { id: 6, name: 'Yasemin', enabled: false },
      { id: 7, name: 'Nane', enabled: false },
      { id: 8, name: 'Okaliptüs', enabled: false },
      { id: 9, name: 'Portakal', enabled: false },
      { id: 10, name: 'Limon', enabled: false },
    ],
    sounds: [
      { id: 1, name: 'Yağmur', enabled: true },
      { id: 2, name: 'Okyanus', enabled: false },
      { id: 3, name: 'Orman', enabled: false },
      { id: 4, name: 'Meditasyon', enabled: false },
      { id: 5, name: 'Beyaz Gürültü', enabled: false },
    ],
    lights: [
      { id: 1, name: 'Sıcak Beyaz', enabled: true, color: '#FFB74D', intensity: 50 },
      { id: 2, name: 'Soğuk Beyaz', enabled: false, color: '#81C784', intensity: 50 },
    ],
  });

  const handleAromaToggle = (id: number) => {
    setSettings(prev => ({
      ...prev,
      aromas: prev.aromas.map(aroma =>
        aroma.id === id ? { ...aroma, enabled: !aroma.enabled } : aroma
      ),
    }));
  };

  const handleSoundToggle = (id: number) => {
    setSettings(prev => ({
      ...prev,
      sounds: prev.sounds.map(sound =>
        sound.id === id ? { ...sound, enabled: !sound.enabled } : sound
      ),
    }));
  };

  const handleLightToggle = (id: number) => {
    setSettings(prev => ({
      ...prev,
      lights: prev.lights.map(light =>
        light.id === id ? { ...light, enabled: !light.enabled } : light
      ),
    }));
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
            <Icon name="spray" size={24} color={theme.colors.primary} />
            <Text variant="h1" style={styles.headerTitle}>{settings.name}</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Aroma Ayarları */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="spray" size={24} color={theme.colors.primary} />
              <Text variant="h3" style={styles.sectionTitle}>Aroma Ayarları</Text>
            </View>
            <View style={styles.optionsList}>
              {settings.aromas.map(aroma => (
                <TouchableOpacity
                  key={aroma.id}
                  style={styles.optionItem}
                  onPress={() => handleAromaToggle(aroma.id)}>
                  <Text variant="body" style={styles.optionText}>{aroma.name}</Text>
                  <Switch
                    value={aroma.enabled}
                    onValueChange={() => handleAromaToggle(aroma.id)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                    thumbColor={theme.colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ses Ayarları */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="volume-high" size={24} color={theme.colors.primary} />
              <Text variant="h3" style={styles.sectionTitle}>Ses Ayarları</Text>
            </View>
            <View style={styles.optionsList}>
              {settings.sounds.map(sound => (
                <TouchableOpacity
                  key={sound.id}
                  style={styles.optionItem}
                  onPress={() => handleSoundToggle(sound.id)}>
                  <Text variant="body" style={styles.optionText}>{sound.name}</Text>
                  <Switch
                    value={sound.enabled}
                    onValueChange={() => handleSoundToggle(sound.id)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                    thumbColor={theme.colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Işık Ayarları */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lightbulb" size={24} color={theme.colors.primary} />
              <Text variant="h3" style={styles.sectionTitle}>Işık Ayarları</Text>
            </View>
            <View style={styles.optionsList}>
              {settings.lights.map(light => (
                <TouchableOpacity
                  key={light.id}
                  style={styles.optionItem}
                  onPress={() => handleLightToggle(light.id)}>
                  <View style={styles.lightOption}>
                    <View style={[styles.colorIndicator, { backgroundColor: light.color }]} />
                    <Text variant="body" style={styles.optionText}>{light.name}</Text>
                  </View>
                  <Switch
                    value={light.enabled}
                    onValueChange={() => handleLightToggle(light.id)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                    thumbColor={theme.colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
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
  section: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    ...theme.elevation.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.primary,
  },
  optionsList: {
    gap: theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  optionText: {
    color: theme.colors.primary,
  },
  lightOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
});

export default DeviceSettingsScreen; 