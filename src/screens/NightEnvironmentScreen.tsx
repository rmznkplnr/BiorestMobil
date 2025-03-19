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
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';

type NightEnvironmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NightEnvironment'>;

type LightSettings = {
  enabled: boolean;
  brightness: number;
  color: 'warm' | 'cool' | 'natural';
};

type SoundSettings = {
  enabled: boolean;
  volume: number;
  type: 'rain' | 'waves' | 'white-noise';
};

type AromaSettings = {
  enabled: boolean;
  intensity: number;
  type: 'lavender' | 'chamomile' | 'vanilla';
};

type Settings = {
  light: LightSettings;
  sound: SoundSettings;
  aroma: AromaSettings;
};

const NightEnvironmentScreen = () => {
  const navigation = useNavigation<NightEnvironmentScreenNavigationProp>();
  const [settings, setSettings] = useState<Settings>({
    light: {
      enabled: false,
      brightness: 50,
      color: 'warm',
    },
    sound: {
      enabled: false,
      volume: 50,
      type: 'rain',
    },
    aroma: {
      enabled: false,
      intensity: 50,
      type: 'lavender',
    },
  });

  const toggleSetting = (category: keyof Settings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
      },
    }));
  };

  const updateValue = (category: keyof Settings, setting: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const updateType = (category: keyof Settings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const renderSettingSection = (
    title: string,
    category: keyof Settings,
    icon: string,
    options: {
      type: string;
      label: string;
      icon: string;
    }[],
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={24} color={theme.colors.primary} />
        <Text variant="h2" style={styles.sectionTitle}>{title}</Text>
        <Switch
          value={settings[category].enabled}
          onValueChange={() => toggleSetting(category, 'enabled')}
          trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
          thumbColor={theme.colors.primary}
        />
      </View>

      {settings[category].enabled && (
        <>
          <View style={styles.optionsContainer}>
            {options.map(option => {
              const isSelected = category === 'light'
                ? settings.light.color === option.type
                : category === 'sound'
                ? settings.sound.type === option.type
                : settings.aroma.type === option.type;

              return (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption,
                  ]}
                  onPress={() => updateType(category, 'type', option.type)}>
                  <Icon
                    name={option.icon}
                    size={24}
                    color={
                      isSelected
                        ? theme.colors.background
                        : theme.colors.primary
                    }
                  />
                  <Text
                    variant="body"
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sliderContainer}>
            <Text variant="caption" style={styles.sliderLabel}>
              {category === 'aroma'
                ? 'Yoğunluk'
                : category === 'sound'
                ? 'Ses Seviyesi'
                : 'Parlaklık'}
            </Text>
            <Slider
              value={
                category === 'aroma'
                  ? settings.aroma.intensity
                  : category === 'sound'
                  ? settings.sound.volume
                  : settings.light.brightness
              }
              onValueChange={value =>
                updateValue(
                  category,
                  category === 'aroma'
                    ? 'intensity'
                    : category === 'sound'
                    ? 'volume'
                    : 'brightness',
                  value,
                )
              }
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor={theme.colors.accent}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </>
      )}
    </View>
  );

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
            <Icon name="moon-waning-crescent" size={24} color={theme.colors.primary} />
            <Text variant="h1" style={styles.headerTitle}>Gece Ortamı</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {renderSettingSection('Işık', 'light', 'lightbulb', [
            { type: 'warm', label: 'Sıcak', icon: 'white-balance-sunny' },
            { type: 'cool', label: 'Soğuk', icon: 'white-balance-iridescent' },
            { type: 'natural', label: 'Doğal', icon: 'white-balance-auto' },
          ])}

          {renderSettingSection('Ses', 'sound', 'volume-high', [
            { type: 'rain', label: 'Yağmur', icon: 'weather-rainy' },
            { type: 'waves', label: 'Dalga', icon: 'waves' },
            { type: 'white-noise', label: 'Beyaz Gürültü', icon: 'white-balance-sunny' },
          ])}

          {renderSettingSection('Aroma', 'aroma', 'spray', [
            { type: 'lavender', label: 'Lavanta', icon: 'flower' },
            { type: 'chamomile', label: 'Papatya', icon: 'flower-tulip' },
            { type: 'vanilla', label: 'Vanilya', icon: 'food-variant' },
          ])}
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
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedOption: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionText: {
    color: theme.colors.primary,
  },
  selectedOptionText: {
    color: theme.colors.background,
  },
  sliderContainer: {
    gap: theme.spacing.sm,
  },
  sliderLabel: {
    color: theme.colors.text.secondary,
  },
});

export default NightEnvironmentScreen;