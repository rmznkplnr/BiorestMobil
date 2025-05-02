import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator,TouchableOpacity} from 'react-native';
import { format, subWeeks, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HealthMetricCard from '../common/HealthMetricCard';
import HealthViewStyles from '../common/HealthViewStyles';
import { HealthData } from '../../types/health';
import { fetchHealthDataForRange } from '../../services/HealthDataService';

interface WeeklyHealthViewProps {
  onDataLoaded?: (data: HealthData) => void;
  isActive: boolean;
}

const WeeklyHealthView: React.FC<WeeklyHealthViewProps> = ({ onDataLoaded, isActive }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isFocused = useIsFocused();
  const dataFetchingRef = useRef<boolean>(false);
  const weekChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (date: Date, isRefresh = false) => {
    // Veri yükleme işlemi zaten devam ediyorsa, yeni bir işlem başlatmayalım
    if (dataFetchingRef.current && !isRefresh) return;
    
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      dataFetchingRef.current = true;
      setError(null);
      
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıç
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Pazar bitiş
      
      const data = await fetchHealthDataForRange(weekStart, weekEnd);
      setHealthData(data);
      
      if (onDataLoaded && data) {
        onDataLoaded(data);
      }
    } catch (err) {
      console.error('Haftalık sağlık verisi yüklenirken hata:', err);
      setError('Sağlık verileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      dataFetchingRef.current = false;
    }
  }, [onDataLoaded]);

  // Hafta değiştirme işlemi için debounce uygulayalım
  const handleWeekChange = useCallback((newDate: Date) => {
    setSelectedWeek(newDate);
    
    // Önceki timeout'u temizle
    if (weekChangeTimeoutRef.current) {
      clearTimeout(weekChangeTimeoutRef.current);
    }
    
    // 300ms sonra veri yükleme işlemini başlat
    weekChangeTimeoutRef.current = setTimeout(() => {
      fetchData(newDate);
    }, 300);
  }, [fetchData]);

  const goToPreviousWeek = useCallback(() => {
    handleWeekChange(subWeeks(selectedWeek, 1));
  }, [selectedWeek, handleWeekChange]);

  const goToNextWeek = useCallback(() => {
    handleWeekChange(addWeeks(selectedWeek, 1));
  }, [selectedWeek, handleWeekChange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(selectedWeek, true);
  }, [selectedWeek, fetchData]);

  // Sekme aktif olduğunda veya hafta değiştiğinde veri yükle
  useEffect(() => {
    if (isActive && isFocused) {
      fetchData(selectedWeek);
    }
    
    return () => {
      // Komponent unmount edildiğinde timeout'u temizle
      if (weekChangeTimeoutRef.current) {
        clearTimeout(weekChangeTimeoutRef.current);
      }
    };
  }, [selectedWeek, fetchData, isActive, isFocused]);

  // Hafta aralığını gösterme formatlama
  const formatWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(start, 'd MMM', { locale: tr })} - ${format(end, 'd MMM yyyy', { locale: tr })}`;
  };

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
        <TouchableOpacity onPress={goToPreviousWeek} style={HealthViewStyles.dateButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={HealthViewStyles.dateText}>
          {formatWeekRange(selectedWeek)}
        </Text>
        
        <TouchableOpacity 
          onPress={goToNextWeek} 
          style={HealthViewStyles.dateButton}
          disabled={format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') === 
                   format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd')}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') === 
                  format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd') ? '#555' : '#fff'} 
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
              goal={70000}
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

export default WeeklyHealthView; 