import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type SleepDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SleepDetails'>;
type SleepDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SleepDetails'>;

const SleepDetailsScreen = () => {
  const route = useRoute<SleepDetailsScreenRouteProp>();
  const navigation = useNavigation<SleepDetailsScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'details' | 'rating'>('details');
  const [sleepRating, setSleepRating] = useState(0);
  const [comment, setComment] = useState('');

  const { sleepData } = route.params;
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const handleSleepRating = () => {
    // Burada veritabanına kayıt işlemi yapılacak
    Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!');
    navigation.goBack();
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uyku Analizi</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'details' && styles.activeTab]}
          onPress={() => setSelectedTab('details')}
        >
          <Text style={[styles.tabText, selectedTab === 'details' && styles.activeTabText]}>
            Detaylar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'rating' && styles.activeTab]}
          onPress={() => setSelectedTab('rating')}
        >
          <Text style={[styles.tabText, selectedTab === 'rating' && styles.activeTabText]}>
            Değerlendirme
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'details' ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.chartTitle}>Gece Boyunca Nabız Değişimi</Text>
            <LineChart
              data={{
                labels: sleepData.heartRateData.time,
                datasets: [{
                  data: sleepData.heartRateData.rates
                }]
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>Önemli Olaylar</Text>
              {sleepData.heartRateData.events.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Ionicons name="time-outline" size={20} color="#4a90e2" />
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                  <Text style={styles.eventAction}>{event.action}</Text>
                  <Text style={styles.eventEffect}>{event.effect}</Text>
                </View>
              ))}
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Özet Bilgiler</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ortalama Nabız:</Text>
                <Text style={styles.summaryValue}>
                  {Math.round(
                    sleepData.heartRateData.rates.reduce((a, b) => a + b) / 
                    sleepData.heartRateData.rates.length
                  )} BPM
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>En Yüksek Nabız:</Text>
                <Text style={styles.summaryValue}>
                  {Math.max(...sleepData.heartRateData.rates)} BPM
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>En Düşük Nabız:</Text>
                <Text style={styles.summaryValue}>
                  {Math.min(...sleepData.heartRateData.rates)} BPM
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>Uykunuzu Değerlendirin</Text>
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
            <TouchableOpacity
              style={[styles.submitButton, !sleepRating && styles.disabledButton]}
              onPress={handleSleepRating}
              disabled={!sleepRating}
            >
              <Text style={styles.buttonText}>Değerlendirmeyi Gönder</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    flex: 1,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  eventsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  eventsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  eventAction: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  eventEffect: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    padding: 20,
  },
  ratingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SleepDetailsScreen; 