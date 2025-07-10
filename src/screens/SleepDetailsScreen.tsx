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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import SleepDetailView from '../components/health/SleepDetailView';

type SleepDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SleepDetailsScreen'
>;

type SleepDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SleepDetailsScreen'>;

interface Props {
  navigation: SleepDetailsScreenNavigationProp;
  route: SleepDetailsScreenRouteProp;
}

/**
 * Güvenli tarih ayrıştırma - geçersiz tarih formatları için hata önleme
 */
const safeDateParser = (dateString?: string, fallbackText: string = 'Bilinmiyor'): { date: Date | null, formatted: string } => {
  if (!dateString) {
    return { date: null, formatted: fallbackText };
  }
  
  try {
    // Doğrudan ISO string'i ayrıştırmayı dene
    const parsedDate = new Date(dateString);
    
    // Geçerli bir tarih mi kontrol et
    if (isNaN(parsedDate.getTime())) {
      console.warn('Geçersiz tarih formatı:', dateString);
      return { date: null, formatted: fallbackText };
    }
    
    return { 
      date: parsedDate, 
      formatted: format(parsedDate, 'dd MMMM yyyy, HH:mm', { locale: tr }) 
    };
  } catch (error) {
    console.error('Tarih ayrıştırma hatası:', error);
    return { date: null, formatted: fallbackText };
  }
};

const SleepDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sleepData } = route.params;
  const date = new Date();

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

        <SleepDetailView sleepData={sleepData} date={date} />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
});

export default SleepDetailsScreen; 