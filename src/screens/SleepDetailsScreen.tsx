import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SleepNotification } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import Svg, { Path, Line } from 'react-native-svg';

type SleepDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SleepDetails'
>;

type SleepDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SleepDetails'>;

interface Props {
  navigation: SleepDetailsScreenNavigationProp;
  route: SleepDetailsScreenRouteProp;
}

const SleepDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sleepData } = route.params;
  const [selectedTab, setSelectedTab] = useState<'details' | 'rating'>('details');
  const [sleepRating, setSleepRating] = useState({
    fallAsleep: 0,
    freshness: 0,
    interruption: 0
  });
  const [comment, setComment] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Örnek veri - gerçek veriler akıllı saatten gelecek
  const timeLabels = ['23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];
  const valueLabels = ['40', '60', '80', '100'];

  const events = [
    {
      time: '23:45',
      action: '2. slottaki koku ortama verildi',
      y: 80,
      values: {
        oxygen: 95,
        stress: 72,
        heartRate: 82
      }
    },
    {
      time: '00:30',
      action: 'Ses seviyesi ayarlandı',
      y: 160,
      values: {
        oxygen: 96,
        stress: 65,
        heartRate: 75
      }
    },
    {
      time: '01:15',
      action: 'Işık seviyesi düşürüldü',
      y: 240,
      values: {
        oxygen: 97,
        stress: 45,
        heartRate: 68
      }
    },
    {
      time: '02:45',
      action: 'Ayarlar stabil',
      y: 320,
      values: {
        oxygen: 98,
        stress: 35,
        heartRate: 62
      }
    },
  ];

  const renderArrow = (y: number, text: string) => (
    <View style={[styles.arrowContainer, { top: y }]}>
      <View style={styles.arrowLine}>
        <Svg height="2" width={80}>
          <Line
            x1="0"
            y1="1"
            x2="70"
            y2="1"
            stroke="#4a90e2"
            strokeWidth="2"
          />
        </Svg>
        <View style={styles.arrowHead} />
      </View>
      <Text style={styles.arrowText}>{text}</Text>
    </View>
  );

  const handleSleepRating = () => {
    if (!sleepRating.fallAsleep || !sleepRating.freshness || !sleepRating.interruption) {
      Alert.alert('Uyarı', 'Lütfen tüm kriterleri değerlendirin.');
      return;
    }
    // Burada veritabanına kayıt işlemi yapılacak
    Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!');
    navigation.goBack();
  };

  const renderStars = (category: 'fallAsleep' | 'freshness' | 'interruption', value: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => setSleepRating(prev => ({
            ...prev,
            [category]: i
          }))}
        >
          <Ionicons
            name={i <= value ? 'star' : 'star-outline'}
            size={32}
            color="#FFD700"
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Uyku Analizi</Text>
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
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Uyku Özeti</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tarih:</Text>
                  <Text style={styles.infoValue}>{sleepData.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Süre:</Text>
                  <Text style={styles.infoValue}>{sleepData.duration}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ortam Işığı:</Text>
                  <Text style={styles.infoValue}>{sleepData.lightLevel}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ortam Sesi:</Text>
                  <Text style={styles.infoValue}>{sleepData.sound}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Aroma:</Text>
                  <Text style={styles.infoValue}>{sleepData.fragrance}</Text>
                </View>
              </View>

              <View style={styles.graphContainer}>
                <View style={styles.legendContainer}>
                  {[
                    { label: 'Oksijen (%)', color: '#9370DB' },
                    { label: 'Stres', color: '#FFA500' },
                    { label: 'Nabız (bpm)', color: '#4169E1' },
                  ].map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.graphContent}>
                  <View style={styles.valueLabels}>
                    {valueLabels.reverse().map((value) => (
                      <Text key={value} style={styles.axisLabel}>{value}</Text>
                    ))}
                  </View>

                  <View style={styles.graphArea}>
                    <View style={styles.verticalGraph}>
                      {/* Yatay referans çizgileri */}
                      <Svg width="120" height="400">
                        {[0, 100, 200, 300].map((y) => (
                          <Line
                            key={y}
                            x1="0"
                            y1={y + 50}
                            x2="120"
                            y2={y + 50}
                            stroke="#333"
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Nabız çizgisi - Mavi */}
                        <Path
                          d="M10,350 C30,340 50,320 70,300 C90,280 100,260 110,240 C120,220 110,200 100,180 C90,160 80,140 70,120"
                          stroke="#4169E1"
                          strokeWidth="2"
                          fill="none"
                        />
                        {/* Stres çizgisi - Turuncu */}
                        <Path
                          d="M10,280 C30,260 50,240 70,220 C90,200 100,180 110,160 C120,140 110,120 100,100 C90,80 80,60 70,40"
                          stroke="#FFA500"
                          strokeWidth="2"
                          fill="none"
                        />
                        {/* Oksijen çizgisi - Mor */}
                        <Path
                          d="M10,150 C30,140 50,130 70,120 C90,110 100,100 110,90 C120,80 110,70 100,60 C90,50 80,40 70,30"
                          stroke="#9370DB"
                          strokeWidth="2"
                          fill="none"
                        />
                      </Svg>
                    </View>

                    <View style={styles.timeLabelsVertical}>
                      {timeLabels.map((time, index) => (
                        <Text key={time} style={styles.axisLabel}>
                          {time}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View style={styles.arrowsContainer}>
                    {events.map((event, index) => (
                      <View key={index} style={[styles.eventItem, { top: event.y }]}>
                        <View style={styles.arrowLine}>
                          <Svg height="2" width={40}>
                            <Line
                              x1="0"
                              y1="1"
                              x2="35"
                              y2="1"
                              stroke="#4a90e2"
                              strokeWidth="2"
                            />
                          </Svg>
                          <View style={styles.arrowHead} />
                        </View>
                        <View style={styles.eventContent}>
                          <Text style={styles.eventText}>{event.action}</Text>
                          <View style={styles.eventValues}>
                            <Text style={[styles.valueText, { color: '#9370DB' }]}>
                              O₂: {event.values.oxygen}%
                            </Text>
                            <Text style={[styles.valueText, { color: '#FFA500' }]}>
                              Stres: {event.values.stress}
                            </Text>
                            <Text style={[styles.valueText, { color: '#4169E1' }]}>
                              Nabız: {event.values.heartRate}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>Uykunuzu Değerlendirin</Text>
              
              <View style={styles.ratingCriteriaContainer}>
                <View style={styles.criteriaItem}>
                  <Text style={styles.criteriaTitle}>Uykuya rahat dalabildiniz mi?</Text>
                  <View style={styles.starsContainer}>
                    {renderStars('fallAsleep', sleepRating.fallAsleep)}
                  </View>
                </View>

                <View style={styles.criteriaItem}>
                  <Text style={styles.criteriaTitle}>Dinç uyandınız mı?</Text>
                  <View style={styles.starsContainer}>
                    {renderStars('freshness', sleepRating.freshness)}
                  </View>
                </View>

                <View style={styles.criteriaItem}>
                  <Text style={styles.criteriaTitle}>Uykunuz ne sıklıklı bölündü ?</Text>
                  <View style={styles.starsContainer}>
                    {renderStars('interruption', sleepRating.interruption)}
                  </View>
                </View>
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
                style={[
                  styles.submitButton,
                  (!sleepRating.fallAsleep || !sleepRating.freshness || !sleepRating.interruption) && 
                  styles.disabledButton
                ]}
                onPress={handleSleepRating}
                disabled={!sleepRating.fallAsleep || !sleepRating.freshness || !sleepRating.interruption}
              >
                <Text style={styles.submitButtonText}>Değerlendirmeyi Gönder</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
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
    paddingVertical: 10,
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
  },
  detailsContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  graphContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  graphContent: {
    flexDirection: 'row',
    height: 400,
    marginTop: 20,
  },
  valueLabels: {
    width: 40,
    height: 400,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  graphArea: {
    flex: 1,
    flexDirection: 'row',
  },
  verticalGraph: {
    width: 120,
    height: 400,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timeLabelsVertical: {
    width: 40,
    height: 400,
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  axisLabel: {
    color: '#666',
    fontSize: 10,
  },
  eventContent: {
    flex: 1,
    paddingLeft: 8,
  },
  eventText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  eventValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valueText: {
    fontSize: 10,
    fontWeight: '500',
  },
  arrowsContainer: {
    flex: 1,
    position: 'relative',
  },
  arrowContainer: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  eventItem: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  arrowLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4a90e2',
    transform: [{ rotate: '90deg' }],
  },
  arrowText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  ratingCriteriaContainer: {
    width: '100%',
    marginBottom: 20,
  },
  criteriaItem: {
    marginBottom: 20,
    width: '100%',
  },
  criteriaTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  star: {
    marginRight: 8,
  },
  commentInput: {
    width: '100%',
    height: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SleepDetailsScreen; 