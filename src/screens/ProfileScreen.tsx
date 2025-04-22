import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Auth } from 'aws-amplify';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // Kullanıcı bilgilerini AWS Cognito'dan al
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      const user = await Auth.currentAuthenticatedUser();
      console.log('Kullanıcı bilgileri:', user);
      
      try {
        // Kullanıcı özelliklerini al
        const userAttributes = await Auth.userAttributes(user);
        const attributes: Record<string, string> = {};
        
        // Öznitelikleri eşleştir
        userAttributes.forEach(attribute => {
          attributes[attribute.Name] = attribute.Value;
        });
        
        setUserData({
          username: user.username,
          email: attributes.email || user.username,
          name: attributes.name || user.username,
          phone: attributes.phone_number || '',
        });
      } catch (attributeError) {
        console.log('Kullanıcı özellikleri alınamadı:', attributeError);
        // Temel kullanıcı bilgileriyle devam et
        setUserData({
          username: user.username,
          email: user.username,
          name: user.username,
          phone: '',
        });
      }
    } catch (error) {
      console.log('Kullanıcı bilgileri alınamadı:', error);
      // Kullanıcı bulunmazsa login sayfasına yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // AWS Cognito çıkış işlemi
      await Auth.signOut();
      console.log('Başarıyla çıkış yapıldı');
      
      // Giriş ekranına yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.log('Çıkış yaparken hata oluştu:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUserData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Bilgiler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profil Bilgileri */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../assets/avatar.png')}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{userData?.name || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{userData?.email || 'kullanici@example.com'}</Text>
          </View>

          {/* Ayarlar Menüsü */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Ayarlar</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={24} color="#4a90e2" />
                <Text style={styles.menuItemText}>Hesap Bilgileri</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications-outline" size={24} color="#4a90e2" />
                <Text style={styles.menuItemText}>Bildirimler</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="lock-closed-outline" size={24} color="#4a90e2" />
                <Text style={styles.menuItemText}>Gizlilik</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="help-circle-outline" size={24} color="#4a90e2" />
                <Text style={styles.menuItemText}>Yardım</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Çıkış Butonu */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#e74c3c" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
                <Text style={styles.logoutText}>Çıkış Yap</Text>
              </>
            )}
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4a90e2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#888',
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen; 