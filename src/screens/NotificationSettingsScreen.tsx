import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';

interface NotificationSettingProps {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const NotificationSettingsScreen = () => {
  const [settings, setSettings] = useState({
    healthAlerts: true,
    deviceStatus: true,
    optimization: true,
    sleepReminders: true,
    maintenance: true,
    updates: false,
  });

  const NotificationSetting: React.FC<NotificationSettingProps> = ({
    icon,
    title,
    description,
    enabled,
    onToggle,
  }) => (
    <Card style={styles.settingCard}>
      <View style={styles.settingContent}>
        <View style={[styles.settingIconContainer, { backgroundColor: theme.colors.primary }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.settingInfo}>
          <Text variant="body">{title}</Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {description}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={enabled ? theme.colors.primary : '#f4f3f4'}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Bildirim Ayarları</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Bildirim tercihlerinizi yönetin
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sağlık Bildirimleri */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Sağlık Bildirimleri</Text>
          <NotificationSetting
            icon="heart-pulse"
            title="Sağlık Uyarıları"
            description="Önemli sağlık değişikliklerinde bildirim alın"
            enabled={settings.healthAlerts}
            onToggle={(value) => setSettings({ ...settings, healthAlerts: value })}
          />
          <NotificationSetting
            icon="bed"
            title="Uyku Hatırlatıcıları"
            description="Uyku düzeninizi korumak için hatırlatmalar"
            enabled={settings.sleepReminders}
            onToggle={(value) => setSettings({ ...settings, sleepReminders: value })}
          />
        </View>

        {/* Cihaz Bildirimleri */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Cihaz Bildirimleri</Text>
          <NotificationSetting
            icon="cog"
            title="Cihaz Durumu"
            description="Cihaz bağlantı ve durum bildirimleri"
            enabled={settings.deviceStatus}
            onToggle={(value) => setSettings({ ...settings, deviceStatus: value })}
          />
          <NotificationSetting
            icon="tools"
            title="Bakım Bildirimleri"
            description="Cihaz bakım ve temizlik hatırlatmaları"
            enabled={settings.maintenance}
            onToggle={(value) => setSettings({ ...settings, maintenance: value })}
          />
        </View>

        {/* Sistem Bildirimleri */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Sistem Bildirimleri</Text>
          <NotificationSetting
            icon="chart-line"
            title="Optimizasyon Bildirimleri"
            description="Ortam optimizasyonu ile ilgili bildirimler"
            enabled={settings.optimization}
            onToggle={(value) => setSettings({ ...settings, optimization: value })}
          />
          <NotificationSetting
            icon="update"
            title="Güncelleme Bildirimleri"
            description="Uygulama güncellemeleri hakkında bilgilendirme"
            enabled={settings.updates}
            onToggle={(value) => setSettings({ ...settings, updates: value })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  settingCard: {
    marginBottom: theme.spacing.sm,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
});

export default NotificationSettingsScreen; 