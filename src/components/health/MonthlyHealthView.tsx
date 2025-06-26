import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import { HealthData } from '../../types/health';
import { fetchHealthDataForRange } from '../../services/HealthDataService';
import HealthViewStyles from '../common/HealthViewStyles';
import HealthMetricCard from '../common/HealthMetricCard';

interface MonthlyHealthViewProps {
  onError?: (error: Error) => void;
}

const MonthlyHealthView: React.FC<MonthlyHealthViewProps> = ({ onError }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthData = useCallback(async (date: Date) => {
    try {
      setError(null);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      const data = await fetchHealthDataForRange(startDate, endDate);
      setHealthData(data);
    } catch (err) {
      console.error('Aylık sağlık verisi alınırken hata:', err);
      setError('Aylık sağlık verileri alınamadı. Lütfen daha sonra tekrar deneyin.');
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onError]);

  const handleMonthChange = useCallback((date: Date) => {
    setLoading(true);
    setSelectedMonth(date);
  }, []);

  const goToPreviousMonth = useCallback(() => {
    handleMonthChange(subMonths(selectedMonth, 1));
  }, [selectedMonth, handleMonthChange]);

  const goToNextMonth = useCallback(() => {
    handleMonthChange(addMonths(selectedMonth, 1));
  }, [selectedMonth, handleMonthChange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMonthData(selectedMonth);
  }, [selectedMonth, fetchMonthData]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMonthData(selectedMonth);
      
      return () => {
        // Temizleme fonksiyonu - gerekirse iptal et
      };
    }, [selectedMonth, fetchMonthData])
  );

  useEffect(() => {
    fetchMonthData(selectedMonth);
  }, [selectedMonth, fetchMonthData]);

  if (loading && !refreshing) {
    return (
      <View style={HealthViewStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={HealthViewStyles.container}>
      <View style={HealthViewStyles.dateControlContainer}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={HealthViewStyles.dateButton}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={HealthViewStyles.dateText}>
          {format(selectedMonth, 'MMMM yyyy', { locale: tr })}
        </Text>
        
        <TouchableOpacity
          onPress={goToNextMonth}
          style={HealthViewStyles.dateButton}
        >
          <Icon name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={HealthViewStyles.errorText}>{error}</Text>
      ) : (
        <ScrollView
          style={HealthViewStyles.scrollView}
          contentContainerStyle={HealthViewStyles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
        >
          <View style={HealthViewStyles.grid}>
            <View style={HealthViewStyles.gridItem}>
              <HealthMetricCard
                title="Nabız"
                value={healthData?.heartRate?.average ? `${Math.round(healthData.heartRate.average)}` : '0'}
                unit="BPM"
                icon="heart"
                color="#e74c3c"
              />
            </View>
            
            <View style={HealthViewStyles.gridItem}>
              <HealthMetricCard
                title="Oksijen"
                value={healthData?.oxygen?.average ? `${Math.round(healthData.oxygen.average)}` : '0'}
                unit="%"
                icon="water"
                color="#3498db"
              />
            </View>
                        
            <View style={HealthViewStyles.gridItemLarge}>
              <HealthMetricCard
                title="Uyku"
                value={healthData?.sleep?.totalMinutes ? healthData.sleep.totalMinutes : 0}
                unit="dk"
                icon="moon"
                color="#8e44ad"
                formatValue={(value) => {
                  const hours = Math.floor(value / 60);
                  const minutes = value % 60;
                  return `${hours}s ${minutes}dk`;
                }}
              />
            </View>
            
            <View style={HealthViewStyles.gridItem}>
              <HealthMetricCard
                title="Adımlar"
                value={typeof healthData?.steps.total === 'number' ? healthData.steps.total : 0}
                unit="adım"
                icon="footsteps"
                color="#2ecc71"
              />
            </View>
            
            <View style={HealthViewStyles.gridItem}>
              <HealthMetricCard
                title="Kalori"
                value={typeof healthData?.calories.total === 'number' ? healthData.calories.total : 0}
                unit="kcal"
                icon="flame"
                color="#f39c12"
              />
            </View>
            



          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MonthlyHealthView; 