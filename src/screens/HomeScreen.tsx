import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList, TabParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

interface SleepNotification {
  date: string;
  lightLevel: string;
  fragrance: string;
  sound: string;
  duration: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sleepRating, setSleepRating] = useState(0);
  const [comment, setComment] = useState('');

  // Örnek bildirim verisi (daha sonra veritabanından gelecek)
  const [lastNightData] = useState<SleepNotification>({
    date: new Date().toLocaleDateString('tr-TR'),
    lightLevel: 'Yumuşak Mavi',
    fragrance: 'Lavanta',
    sound: 'Yağmur Sesi',
    duration: '8 saat'
  });

  const navigateToTab = (routeName: keyof TabParamList) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: routeName,
        },
      })
    );
  };

  const handleSleepRating = () => {
    // Burada veritabanına kayıt işlemi yapılacak
    Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!');
    setShowRatingModal(false);
    setSleepRating(0);
    setComment('');
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setSleepRating(i)}>
          <Ionicons
            name={i <= sleepRating ? 'star' : 'star-outline'}
            size={40}
            color="#FFD700"
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>BioRest</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
            <Text style={styles.subtitleText}>Sağlıklı uyku için BioRest ile tanışın</Text>
          </View>

          {/* Uyku Bildirimi Kartı */}
          <TouchableOpacity 
            style={styles.notificationCard}
            onPress={() => setShowRatingModal(true)}
          >
            <LinearGradient
              colors={['#2c3e50', '#3498db']}
              style={styles.notificationGradient}
            >
              <View style={styles.notificationHeader}>
                <Ionicons name="notifications" size={24} color="#fff" />
                <Text style={styles.notificationTitle}>Dün Geceki Uykunuz</Text>
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>Tarih: {lastNightData.date}</Text>
                <Text style={styles.notificationText}>Işık: {lastNightData.lightLevel}</Text>
                <Text style={styles.notificationText}>Koku: {lastNightData.fragrance}</Text>
                <Text style={styles.notificationText}>Ses: {lastNightData.sound}</Text>
                <Text style={styles.notificationText}>Süre: {lastNightData.duration}</Text>
              </View>
              <Text style={styles.notificationFooter}>
                Uykunuzu değerlendirmek için tıklayın
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.cardContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigateToTab('DevicesTab')}
            >
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.cardGradient}
              >
                <Ionicons name="hardware-chip" size={32} color="#fff" />
                <Text style={styles.cardTitle}>Cihazlarım</Text>
                <Text style={styles.cardSubtitle}>Cihazlarınızı yönetin</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigateToTab('StatisticsTab')}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.cardGradient}
              >
                <Ionicons name="stats-chart" size={32} color="#fff" />
                <Text style={styles.cardTitle}>İstatistikler</Text>
                <Text style={styles.cardSubtitle}>Uyku verilerinizi görüntüleyin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Değerlendirme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRatingModal}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uykunuzu Değerlendirin</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorumunuzu yazın (isteğe bağlı)"
              placeholderTextColor="#666"
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSleepRating}
                disabled={sleepRating === 0}
              >
                <Text style={styles.buttonText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#888',
  },
  notificationCard: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  notificationGradient: {
    padding: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  notificationContent: {
    marginBottom: 15,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationFooter: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (Dimensions.get('window').width - 60) / 2,
    height: 160,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  commentInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;