import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'aws-amplify/auth';
import { healthDataSyncService } from '../services/HealthDataSyncService';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [testingAmplify, setTestingAmplify] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }]
      });
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
    }
  };

  const testAmplifyConnection = async () => {
    setTestingAmplify(true);
    
    try {
      console.log('🧪 Amplify senkronizasyon testi başlatılıyor...');
      const result = await healthDataSyncService.testAmplifyConnection();
      
      Alert.alert(
        result.success ? '✅ Test Başarılı' : '❌ Test Başarısız',
        result.message,
        [
          {
            text: 'Detayları Göster',
            onPress: () => {
              console.log('📋 Amplify Test Detayları:', result.details);
              Alert.alert('Test Detayları', JSON.stringify(result.details, null, 2));
            }
          },
          { text: 'Tamam' }
        ]
      );
      
    } catch (error) {
      Alert.alert('❌ Test Hatası', `Amplify test sırasında hata: ${error}`);
      console.error('🧪 Amplify test hatası:', error);
    } finally {
      setTestingAmplify(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistem Testleri</Text>
          
          <TouchableOpacity 
            style={[styles.option, testingAmplify && styles.optionDisabled]} 
            onPress={testAmplifyConnection}
            disabled={testingAmplify}
          >
            <View style={styles.optionContent}>
              <Ionicons name="cloud-outline" size={24} color="#007AFF" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {testingAmplify ? 'Test Ediliyor...' : 'Amplify Senkronizasyonu Test Et'}
                </Text>
                <Text style={styles.optionSubtitle}>
                  AWS bağlantısını ve veri senkronizasyonunu test eder
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          
          <TouchableOpacity style={styles.option} onPress={handleSignOut}>
            <View style={styles.optionContent}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: '#FF3B30' }]}>Çıkış Yap</Text>
                <Text style={styles.optionSubtitle}>Hesabınızdan güvenli çıkış yapın</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
});

export default SettingsScreen; 
