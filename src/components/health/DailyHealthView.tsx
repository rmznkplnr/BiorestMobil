import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator,TouchableOpacity } from 'react-native';
import { format, subDays, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HealthMetricCard from '../common/HealthMetricCard';
import HealthViewStyles from '../common/HealthViewStyles';
import { HealthData } from '../../types/health';
import { fetchHealthDataForDate } from '../../services/HealthDataService';

interface DailyHealthViewProps {
  onDataLoaded?: (data: HealthData) => void;
  isActive: boolean;
}

const DailyHealthView: React.FC<DailyHealthViewProps> = ({ onDataLoaded, isActive }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isFocused = useIsFocused();
  const dataFetchingRef = useRef<boolean>(false);
  const dateChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (date: Date, isRefresh = false) => {
    // Veri yükleme işlemi zaten devam ediyorsa, yeni bir işlem başlatmayalım
    if (dataFetchingRef.current && !isRefresh) return;
    
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      dataFetchingRef.current = true;
      setError(null);
      
      const data = await fetchHealthDataForDate(date);
      setHealthData(data);
      
      if (onDataLoaded && data) {
        onDataLoaded(data);
      }
    } catch (err) {
      console.error('Günlük sağlık verisi yüklenirken hata:', err);
      setError('Sağlık verileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      dataFetchingRef.current = false;
    }
  }, [onDataLoaded]);

  // Tarihi değiştirme işlemi için debounce uygulayalım
  const handleDateChange = useCallback((newDate: Date) => {
    setSelectedDate(newDate);
    
    // Önceki timeout'u temizle
    if (dateChangeTimeoutRef.current) {
      clearTimeout(dateChangeTimeoutRef.current);
    }
    
    // 300ms sonra veri yükleme işlemini başlat
    dateChangeTimeoutRef.current = setTimeout(() => {
      fetchData(newDate);
    }, 300);
  }, [fetchData]);

  const goToPreviousDay = useCallback(() => {
    handleDateChange(subDays(selectedDate, 1));
  }, [selectedDate, handleDateChange]);

  const goToNextDay = useCallback(() => {
    handleDateChange(addDays(selectedDate, 1));
  }, [selectedDate, handleDateChange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(selectedDate, true);
  }, [selectedDate, fetchData]);

  // Sekme aktif olduğunda veya tarih değiştiğinde veri yükle
  useEffect(() => {
    if (isActive && isFocused) {
      fetchData(selectedDate);
    }
    
    return () => {
      // Komponent unmount edildiğinde timeout'u temizle
      if (dateChangeTimeoutRef.current) {
        clearTimeout(dateChangeTimeoutRef.current);
      }
    };
  }, [selectedDate, fetchData, isActive, isFocused]);

  if (loading && !refreshing) {
    return (
      <View style={HealthViewStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={HealthViewStyles.container}>
      <View style={HealthViewStyles.dateControlContainer}>
        <TouchableOpacity onPress={goToPreviousDay} style={HealthViewStyles.dateButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={HealthViewStyles.dateText}>
          {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
        </Text>
        
        <TouchableOpacity 
          onPress={goToNextDay} 
          style={HealthViewStyles.dateButton}
          disabled={format(new Date(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={format(new Date(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? '#555' : '#fff'} 
          />
        </TouchableOpacity>
      </View>

      {error && <Text style={HealthViewStyles.errorText}>{error}</Text>}

      <ScrollView
        style={HealthViewStyles.scrollView}
        contentContainerStyle={HealthViewStyles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2980b9']}
            tintColor="#fff"
            titleColor="#fff"
            title="Yenileniyor..."
          />
        }
      >
        <View style={HealthViewStyles.grid}>
          {/* Kalp Atış Hızı */}
          <View style={HealthViewStyles.gridItem}>
            <HealthMetricCard
              title="Kalp Atış Hızı"
              value={healthData?.heartRate.average || 0}
              unit="bpm"
              icon="heart"
              color="#e74c3c"
              values={healthData?.heartRate.values || []}
              times={healthData?.heartRate.times || []}
              lastUpdated={healthData?.heartRate.lastUpdated}
            />
          </View>

          {/* Oksijen Seviyesi */}
          <View style={HealthViewStyles.gridItem}>
            <HealthMetricCard
              title="Oksijen Seviyesi"
              value={healthData?.oxygen.average || 0}
              unit="%"
              icon="water"
              color="#3498db"
              minValue={90}
              maxValue={100}
              values={healthData?.oxygen.values || []}
              times={healthData?.oxygen.times || []}
              lastUpdated={healthData?.oxygen.lastUpdated}
            />
          </View>

          {/* Adımlar */}
          <View style={HealthViewStyles.gridItem}>
            <HealthMetricCard
              title="Adımlar"
              value={typeof healthData?.steps.total === 'number' ? healthData.steps.total : 0}
              unit="adım"
              icon="footsteps"
              color="#27ae60"
              goal={10000}
              precision={0}
              lastUpdated={healthData?.steps.lastUpdated}
            />
          </View>

          {/* Kalori */}
          <View style={HealthViewStyles.gridItem}>
            <HealthMetricCard
              title="Kalori"
              value={typeof healthData?.calories.total === 'number' ? healthData.calories.total : 0}
              unit="kcal"
              icon="flame"
              color="#f39c12"
              precision={0}
              lastUpdated={healthData?.calories.lastUpdated}
            />
          </View>

          {/* Uyku */}
          <View style={HealthViewStyles.gridItemLarge}>
            <HealthMetricCard
              title="Uyku"
              value={healthData?.sleep.totalMinutes || 0}
              unit="dk"
              icon="moon"
              color="#34495e"
              extraData={healthData?.sleep}
              formatValue={(value) => {
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return `${hours}s ${minutes}dk`;
              }}
              lastUpdated={healthData?.sleep.lastUpdated}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DailyHealthView; 