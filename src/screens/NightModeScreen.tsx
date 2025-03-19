import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NightModeScreen = () => {
  const [isNightMode, setIsNightMode] = useState(true);
  const [isWhiteNoise, setIsWhiteNoise] = useState(false);
  const [isTemperatureControl, setIsTemperatureControl] = useState(true);
  const [isLightControl, setIsLightControl] = useState(true);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gece Modu</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
            <Ionicons name="settings-outline" size={24} color="#888" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Gece Modu</Text>
              <Text style={styles.settingDescription}>Uyku ortamını optimize et</Text>
            </View>
            <Switch
              value={isNightMode}
              onValueChange={setIsNightMode}
              trackColor={{ false: '#767577', true: '#50c878' }}
              thumbColor={isNightMode ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Beyaz Gürültü</Text>
              <Text style={styles.settingDescription}>Rahatlatıcı sesler</Text>
            </View>
            <Switch
              value={isWhiteNoise}
              onValueChange={setIsWhiteNoise}
              trackColor={{ false: '#767577', true: '#50c878' }}
              thumbColor={isWhiteNoise ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ortam Kontrolü</Text>
            <Ionicons name="thermometer-outline" size={24} color="#888" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sıcaklık Kontrolü</Text>
              <Text style={styles.settingDescription}>Oda sıcaklığını optimize et</Text>
            </View>
            <Switch
              value={isTemperatureControl}
              onValueChange={setIsTemperatureControl}
              trackColor={{ false: '#767577', true: '#50c878' }}
              thumbColor={isTemperatureControl ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Işık Kontrolü</Text>
              <Text style={styles.settingDescription}>Oda aydınlatmasını ayarla</Text>
            </View>
            <Switch
              value={isLightControl}
              onValueChange={setIsLightControl}
              trackColor={{ false: '#767577', true: '#50c878' }}
              thumbColor={isLightControl ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <LinearGradient
            colors={['#50c878', '#3da066']}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
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
  section: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#888',
  },
  saveButton: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NightModeScreen; 