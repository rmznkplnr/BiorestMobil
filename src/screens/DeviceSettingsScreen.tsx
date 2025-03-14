import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';

const DeviceSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    isAutoMode: false,
    temperature: '22',
    humidity: '45',
    lightLevel: '70',
    soundLevel: '30',
    aromatherapyLevel: '50',
    selectedScent: 'lavanta', // Varsayılan koku
  });

  const [isConnected, setIsConnected] = useState(false);

  const scents = [
    { id: 'lavanta', name: 'Lavanta' },
    { id: 'vanilya', name: 'Vanilya' },
    { id: 'okaliptus', name: 'Okaliptus' },
    { id: 'limon', name: 'Limon' },
  ];

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  const SettingItem = ({
    title,
    value,
    onChangeText,
    unit,
  }: {
    title: string;
    value: string;
    onChangeText: (text: string) => void;
    unit: string;
  }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          maxLength={3}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.connectionSection}>
          <Text style={styles.sectionTitle}>Cihaz Bağlantısı</Text>
          <TouchableOpacity
            style={[
              styles.connectionButton,
              isConnected ? styles.connectedButton : styles.disconnectedButton,
            ]}
            onPress={toggleConnection}>
            <Text style={styles.connectionButtonText}>
              {isConnected ? 'Bağlantıyı Kes' : 'Bağlan'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.connectionStatus}>
            Durum: {isConnected ? 'Bağlı' : 'Bağlı Değil'}
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Ortam Ayarları</Text>
          
          <View style={styles.autoModeContainer}>
            <Text style={styles.settingTitle}>Otomatik Mod</Text>
            <Switch
              value={settings.isAutoMode}
              onValueChange={(value) =>
                setSettings({ ...settings, isAutoMode: value })
              }
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.isAutoMode ? '#2196F3' : '#f4f3f4'}
            />
          </View>

          <SettingItem
            title="Sıcaklık"
            value={settings.temperature}
            onChangeText={(text) => setSettings({ ...settings, temperature: text })}
            unit="°C"
          />

          <SettingItem
            title="Nem"
            value={settings.humidity}
            onChangeText={(text) => setSettings({ ...settings, humidity: text })}
            unit="%"
          />

          <SettingItem
            title="Işık Seviyesi"
            value={settings.lightLevel}
            onChangeText={(text) => setSettings({ ...settings, lightLevel: text })}
            unit="%"
          />

          <SettingItem
            title="Ses Seviyesi"
            value={settings.soundLevel}
            onChangeText={(text) => setSettings({ ...settings, soundLevel: text })}
            unit="dB"
          />

          <View style={styles.aromatherapySection}>
            <Text style={styles.settingTitle}>Aromaterapi Ayarları</Text>
            <SettingItem
              title="Koku Yoğunluğu"
              value={settings.aromatherapyLevel}
              onChangeText={(text) => setSettings({ ...settings, aromatherapyLevel: text })}
              unit="%"
            />
            
            <Text style={styles.settingTitle}>Koku Seçimi</Text>
            <View style={styles.scentButtonsContainer}>
              {scents.map((scent) => (
                <TouchableOpacity
                  key={scent.id}
                  style={[
                    styles.scentButton,
                    settings.selectedScent === scent.id && styles.selectedScentButton,
                  ]}
                  onPress={() => setSettings({ ...settings, selectedScent: scent.id })}>
                  <Text
                    style={[
                      styles.scentButtonText,
                      settings.selectedScent === scent.id && styles.selectedScentButtonText,
                    ]}>
                    {scent.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            !isConnected && styles.saveButtonDisabled,
          ]}
          disabled={!isConnected}
          onPress={() => {/* Ayarları kaydet */}}>
          <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 15,
  },
  connectionSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  settingsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  connectionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  connectedButton: {
    backgroundColor: '#e74c3c',
  },
  disconnectedButton: {
    backgroundColor: '#2ecc71',
  },
  connectionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  connectionStatus: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  autoModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingTitle: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#7f8c8d',
    width: 40,
  },
  aromatherapySection: {
    marginTop: 10,
  },
  scentButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scentButton: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  selectedScentButton: {
    backgroundColor: '#3498db',
  },
  scentButtonText: {
    color: '#34495e',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedScentButtonText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeviceSettingsScreen; 