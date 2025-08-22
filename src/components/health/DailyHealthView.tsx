import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { format, subDays, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import HealthMetricCard from '../common/HealthMetricCard';
import HealthViewStyles from '../common/HealthViewStyles';
import { HealthData } from '../../types/health';
import { RootStackParamList } from '../../navigation/types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchDailyHealthData } from '../../store/slices/healthSlice';
import HealthConnectService from '../../services/HealthConnectService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DailyHealthViewProps {
  onDataLoaded?: (data: HealthData) => void;
  isActive: boolean;
}

const DailyHealthView: React.FC<DailyHealthViewProps> = ({ onDataLoaded, isActive }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // Redux state ve dispatch
  const dispatch = useAppDispatch();
  const { dailyData, dailyLoading, dailyError } = useAppSelector((state) => state.health);
  
  const navigation = useNavigation<NavigationProp>();

  // Redux'tan veri geldiğinde callback'i çağır
  useEffect(() => {
    if (dailyData && onDataLoaded) {
      onDataLoaded(dailyData);
    }
  }, [dailyData, onDataLoaded]);

  // Veri yenileme
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchDailyHealthData(selectedDate)).unwrap();
    } catch (error) {
      console.error('Veri yenileme hatası:', error);
    }
    setRefreshing(false);
  }, [dispatch, selectedDate]);

  // Tarih değiştirme
  const handleDateChange = useCallback(async (newDate: Date) => {
    setSelectedDate(newDate);
    try {
      await dispatch(fetchDailyHealthData(newDate)).unwrap();
    } catch (error) {
      console.error('Tarih değiştirme hatası:', error);
    }
  }, [dispatch]);

  // Önceki gün
  const goToPrevDay = () => {
    const prevDay = subDays(selectedDate, 1);
    handleDateChange(prevDay);
  };

  // Sonraki gün
  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    handleDateChange(nextDay);
  };

  // Bugün
  const goToToday = () => {
    const today = new Date();
    handleDateChange(today);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  if (dailyLoading && !dailyData) {
    return (
      <View style={HealthViewStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Günlük veriler yükleniyor...</Text>
      </View>
    );
  }

  if (dailyError) {
    return (
      <View style={HealthViewStyles.loadingContainer}>
        <Text style={HealthViewStyles.errorText}>
          Veri yüklenirken hata oluştu: {dailyError}
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 10, padding: 10, backgroundColor: '#4a90e2', borderRadius: 5 }}
          onPress={() => handleDateChange(selectedDate)}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={HealthViewStyles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          colors={['#4a90e2']}
          tintColor="#4a90e2"
        />
      }
    >
      {/* Tarih Navigasyonu */}
      <View style={HealthViewStyles.dateControlContainer}>
        <TouchableOpacity onPress={goToPrevDay} style={HealthViewStyles.dateButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={HealthViewStyles.dateText}>
          {format(selectedDate, 'dd MMMM yyyy', { locale: tr })}
        </Text>
        
        <TouchableOpacity onPress={goToNextDay} style={HealthViewStyles.dateButton}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Sağlık Metrikleri */}
      <View style={HealthViewStyles.grid}>
        {/* Kalp Atış Hızı */}
        <View style={HealthViewStyles.gridItem}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('HeartRateDetail', { 
              date: format(selectedDate, 'yyyy-MM-dd') 
            })}
            activeOpacity={0.8}
          >
            <HealthMetricCard
              title="Manuel Nabız"
              value={dailyData?.heartRate?.average ? Math.round(dailyData.heartRate.average) : 0}
              unit="BPM"
              icon="heart"
              color="#e74c3c"
              values={dailyData?.heartRate?.values}
              times={dailyData?.heartRate?.times}
              lastUpdated={dailyData?.heartRate?.lastUpdated}
            />
          </TouchableOpacity>
        </View>

        {/* Oksijen Satürasyonu */}
        <View style={HealthViewStyles.gridItem}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('OxygenLevelDetail', { 
              date: format(selectedDate, 'yyyy-MM-dd') 
            })}
            activeOpacity={0.8}
          >
            <HealthMetricCard
              title="Oksijen"
              value={dailyData?.oxygen?.average ? Math.round(dailyData.oxygen.average) : 0}
              unit="%"
              icon="water"
              color="#3498db"
              values={dailyData?.oxygen?.values}
              times={dailyData?.oxygen?.times}
              lastUpdated={dailyData?.oxygen?.lastUpdated}
            />
          </TouchableOpacity>
        </View>
{/* Uyku */}
        <View style={HealthViewStyles.gridItemLarge}>
          <TouchableOpacity 
            onPress={async () => {
              if (dailyData?.sleep) {
                console.log('🛌 DailyHealthView: Uyku detaylarına gidiliyor...');
                
                // Eğer uyku nabız verisi eksikse, AWS'ten almaya çalış
                let sleepDataWithHeartRate = { ...dailyData.sleep };
                
                if (!sleepDataWithHeartRate.sleepHeartRate && sleepDataWithHeartRate.startTime && sleepDataWithHeartRate.endTime) {
                  try {
                    console.log('🛌❤️ Uyku nabız verisi eksik, Health Connect\'ten alınıyor...');
                    
                    
                    const sleepHeartRateData = await HealthConnectService.getSleepHeartRateData(
                      selectedDate.toISOString(),
                      selectedDate.toISOString(),
                      sleepDataWithHeartRate.startTime,
                      sleepDataWithHeartRate.endTime
                    );
                    
                    if (sleepHeartRateData.values && sleepHeartRateData.values.length > 0) {
                      console.log('🛌❤️ Uyku nabız verisi bulundu:', {
                        ölçümSayısı: sleepHeartRateData.values.length,
                        ortalama: Math.round(sleepHeartRateData.average)
                      });
                      
                      sleepDataWithHeartRate.sleepHeartRate = {
                        average: sleepHeartRateData.average,
                        min: sleepHeartRateData.min,
                        max: sleepHeartRateData.max,
                        values: sleepHeartRateData.values,
                        times: sleepHeartRateData.times
                      };
                    } else {
                      console.log('🛌❤️ Uyku nabız verisi bulunamadı');
                    }
                  } catch (error) {
                    console.error('🛌❤️ Uyku nabız verisi alma hatası:', error);
                  }
                }
                
                navigation.navigate('SleepDetailsScreen', { 
                  sleepData: sleepDataWithHeartRate 
                });
              }
            }}
            activeOpacity={0.8}
          >
            <HealthMetricCard
              title="Uyku"
              value={dailyData?.sleep?.totalMinutes || 0}
              unit="dk"
              icon="moon"
              color="#34495e"
              extraData={dailyData?.sleep}
              formatValue={(value) => {
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return `${hours}s ${minutes}dk`;
              }}
              lastUpdated={dailyData?.sleep?.lastUpdated}
            />
          </TouchableOpacity>
        </View>
      </View>

    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
        {/* Adımlar */}
        <View style={HealthViewStyles.gridItem}>
          <HealthMetricCard
            title="Adımlar"
            value={dailyData?.steps?.total || 0}
            unit="adım"
            icon="footsteps"
            color="#27ae60"
            goal={10000}
            precision={0}
            lastUpdated={dailyData?.steps?.lastUpdated}
          />
        </View>

        {/* Kalori */}
        <View style={HealthViewStyles.gridItem}>
          <HealthMetricCard
            title="Kalori"
            value={dailyData?.calories?.total || 0}
            unit="kcal"
            icon="flame"
            color="#f39c12"
            precision={0}
            lastUpdated={dailyData?.calories?.lastUpdated}
          />
        </View>
        </View>      
        

      {/* Veri Durumu */}
      {dailyData && (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#666', fontSize: 12 }}>
            Son güncelleme: {format(new Date(dailyData.heartRate?.lastUpdated || Date.now()), 'HH:mm')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default DailyHealthView; 