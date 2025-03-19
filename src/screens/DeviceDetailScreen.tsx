import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Text } from '../components/Text';
import Slider from '@react-native-community/slider';

const DeviceDetailScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const [fragranceLevel, setFragranceLevel] = useState(50);
  const [lightLevel, setLightLevel] = useState(0);
  const [soundLevel, setSoundLevel] = useState(30);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Fanus Detay</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Cihaz ayarlarını yönetin
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Cihaz Durumu */}
        <Card elevation="medium" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text variant="h2">Fanus</Text>
              <Text variant="body" color={theme.colors.text.secondary}>
                Bağlı ve Aktif
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isActive ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.statusDetails}>
            <View style={styles.statusItem}>
              <Icon name="battery" size={24} color={theme.colors.status.success} />
              <Text variant="body">%85</Text>
            </View>
            <View style={styles.statusItem}>
              <Icon name="wifi" size={24} color={theme.colors.primary} />
              <Text variant="body">Bağlı</Text>
            </View>
          </View>
        </Card>

        {/* Koku Ayarları */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Koku Ayarları</Text>
          <Card elevation="medium" style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="spray" size={24} color={theme.colors.accent} />
                <View style={styles.settingText}>
                  <Text variant="body">Lavanta</Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Kalan: 75%
                  </Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={fragranceLevel}
                onValueChange={setFragranceLevel}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </Card>
        </View>

        {/* Işık Ayarları */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Işık Ayarları</Text>
          <Card elevation="medium" style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="lightbulb" size={24} color={theme.colors.accent} />
                <View style={styles.settingText}>
                  <Text variant="body">Işık Seviyesi</Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Gece modu aktif
                  </Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={lightLevel}
                onValueChange={setLightLevel}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </Card>
        </View>

        {/* Ses Ayarları */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Ses Ayarları</Text>
          <Card elevation="medium" style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="volume-high" size={24} color={theme.colors.accent} />
                <View style={styles.settingText}>
                  <Text variant="body">Ses Seviyesi</Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Beyaz gürültü
                  </Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={soundLevel}
                onValueChange={setSoundLevel}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </Card>
        </View>

        {/* Zamanlayıcı */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Zamanlayıcı</Text>
          <Card elevation="medium" style={styles.timerCard}>
            <View style={styles.timerContent}>
              <View style={styles.timerItem}>
                <Text variant="h3">2 saat</Text>
                <Text variant="caption" color={theme.colors.text.secondary}>
                  Kalan süre
                </Text>
              </View>
              <Button
                title="Zamanlayıcıyı Ayarla"
                variant="outline"
                onPress={() => {}}
              />
            </View>
          </Card>
        </View>

        {/* Kaydet Butonu */}
        <Button
          title="Ayarları Kaydet"
          variant="primary"
          onPress={() => {}}
          style={styles.saveButton}
        />
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
  statusCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  settingsCard: {
    padding: theme.spacing.md,
  },
  settingItem: {
    gap: theme.spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timerCard: {
    padding: theme.spacing.md,
  },
  timerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerItem: {
    alignItems: 'center',
  },
  saveButton: {
    margin: theme.spacing.lg,
  },
});

export default DeviceDetailScreen; 