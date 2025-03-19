import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList, TabParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isNightMode, setIsNightMode] = useState(false);

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    navigation.navigate('NightMode');
  };

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

            <TouchableOpacity 
              style={styles.card}
              onPress={toggleNightMode}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.cardGradient}
              >
                <Ionicons name={isNightMode ? "moon" : "moon-outline"} size={32} color="#fff" />
                <Text style={styles.cardTitle}>Gece Modu</Text>
                <Text style={styles.cardSubtitle}>Gözlerinizi koruyun</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
});

export default HomeScreen;