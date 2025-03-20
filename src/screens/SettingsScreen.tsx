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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sleepReminders, setSleepReminders] = useState(true);
  const [dataSync, setDataSync] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Bildirim Ayarları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bildirimler</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Bildirimler</Text>
                  <Text style={styles.settingDescription}>Tüm bildirimleri aç/kapat</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#333', true: '#4a90e2' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="bed-outline" size={24} color="#4a90e2" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Uyku Hatırlatıcıları</Text>
                  <Text style={styles.settingDescription}>Uyku zamanı hatırlatmaları</Text>
                </View>
              </View>
              <Switch
                value={sleepReminders}
                onValueChange={setSleepReminders}
                trackColor={{ false: '#333', true: '#4a90e2' }}
                thumbColor={sleepReminders ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Uygulama Ayarları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={24} color="#4a90e2" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Karanlık Mod</Text>
                  <Text style={styles.settingDescription}>Karanlık temayı aç/kapat</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#333', true: '#4a90e2' }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="sync-outline" size={24} color="#4a90e2" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Veri Senkronizasyonu</Text>
                  <Text style={styles.settingDescription}>Otomatik veri senkronizasyonu</Text>
                </View>
              </View>
              <Switch
                value={dataSync}
                onValueChange={setDataSync}
                trackColor={{ false: '#333', true: '#4a90e2' }}
                thumbColor={dataSync ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Diğer Ayarlar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diğer</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={24} color="#4a90e2" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Dil</Text>
                  <Text style={styles.settingDescription}>Türkçe</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={24} color="#4a90e2" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Hakkında</Text>
                  <Text style={styles.settingDescription}>Versiyon 1.0.0</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
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
  settingInfo: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
});

export default SettingsScreen; 
export default SettingsScreen; 