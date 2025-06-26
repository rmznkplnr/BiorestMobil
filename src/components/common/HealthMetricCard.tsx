import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: string;
  color: string;
  minValue?: number;
  maxValue?: number;
  goal?: number;
  lastUpdated?: string;
  values?: number[];
  times?: string[];
  precision?: number;
  formatValue?: (value: number) => string;
  extraData?: any;
}

const HealthMetricCard = ({
  title,
  value,
  unit,
  icon,
  color,
  minValue,
  maxValue,
  goal,
  lastUpdated,
  values,
  times,
  precision = 0,
  formatValue,
  extraData
}: HealthMetricCardProps) => {
  const navigation = useNavigation<NavigationProp>();
  
  const displayValue = typeof value === 'string' 
    ? value 
    : formatValue 
      ? formatValue(value) 
      : value.toLocaleString('tr-TR', { maximumFractionDigits: precision });
  
  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '--:--';
    }
  };
  
  const renderProgressCircle = () => {
    if (!goal || typeof value === 'string') return null;
    
    const percentage = Math.min((value / goal) * 100, 100);
    
    return (
      <AnimatedCircularProgress
        size={70}
        width={7}
        fill={percentage}
        tintColor={color}
        backgroundColor="#333"
      >
        {() => (
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressValue}>{displayValue}</Text>
            <Text style={styles.progressUnit}>{unit}</Text>
          </View>
        )}
      </AnimatedCircularProgress>
    );
  };
  
  const renderValueDisplay = () => {
    if (goal && typeof value === 'number') return null;
    
    return (
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{displayValue}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    );
  };
  
  const handleCardPress = () => {
    // Karta tıklandığında ilgili detay sayfasına yönlendir
    if (title === "Nabız") {
      navigation.navigate('HeartRateDetail', { date: lastUpdated });
    } else if (title === "Oksijen") {
      navigation.navigate('OxygenLevelDetail', { date: lastUpdated });
    }
  };
  
  const renderSleepData = () => {
    if (title !== "Uyku Süresi" || !extraData) return null;
    
    const { deep, light, rem, awake, efficiency } = extraData;
    
    // Süreleri saat:dakika formatına dönüştür
    const formatDuration = (minutes: number): string => {
      if (minutes <= 0) return "0s 0d";
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}s ${mins}d`;
    };
    
    return (
      <View style={styles.sleepDataContainer}>
        <View style={styles.sleepQuality}>
          <Text style={styles.sleepQualityLabel}>Kalite</Text>
          <Text style={[styles.sleepQualityValue, { color }]}>{efficiency ? `%${efficiency.toFixed(0)}` : '%0'}</Text>
        </View>
        
        <View style={styles.sleepStages}>
          <View style={styles.sleepStage}>
            <View style={[styles.sleepStageIndicator, { backgroundColor: '#8E44AD' }]} />
            <Text style={styles.sleepStageLabel}>Derin</Text>
            <Text style={styles.sleepStageValue}>{formatDuration(deep)}</Text>
          </View>
          
          <View style={styles.sleepStage}>
            <View style={[styles.sleepStageIndicator, { backgroundColor: '#3498DB' }]} />
            <Text style={styles.sleepStageLabel}>Hafif</Text>
            <Text style={styles.sleepStageValue}>{formatDuration(light)}</Text>
          </View>
          
          <View style={styles.sleepStage}>
            <View style={[styles.sleepStageIndicator, { backgroundColor: '#2ECC71' }]} />
            <Text style={styles.sleepStageLabel}>REM</Text>
            <Text style={styles.sleepStageValue}>{formatDuration(rem)}</Text>
          </View>
          
          <View style={styles.sleepStage}>
            <View style={[styles.sleepStageIndicator, { backgroundColor: '#E74C3C' }]} />
            <Text style={styles.sleepStageLabel}>Uyanık</Text>
            <Text style={styles.sleepStageValue}>{formatDuration(awake)}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderStepsData = () => {
    if (title !== "Adımlar" || !extraData) return null;
    
    const { distance } = extraData;
    const distanceInKm = distance ? (distance / 1000).toFixed(2) : "0.00";
    
    return (
      <View style={styles.extraDataContainer}>
        <Text style={styles.extraDataLabel}>Mesafe</Text>
        <Text style={styles.extraDataValue}>{distanceInKm} km</Text>
      </View>
    );
  };

  // Kalp atış hızı ve oksijen seviyesi için detay sayfası gösterimi
  const isDetailNavigable = title === "Nabız" || title === "Oksijen";
  
  const renderCardContent = () => (
    <>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Son: {formatTime(lastUpdated)}
          </Text>
        )}
      </View>
      
      <View style={styles.content}>
        {renderProgressCircle()}
        {renderValueDisplay()}
        
        <View style={styles.details}>
          {(minValue !== undefined && maxValue !== undefined) && (
            <View style={styles.minMaxContainer}>
              <View style={styles.minMaxItem}>
                <Text style={styles.minMaxLabel}>Min</Text>
                <Text style={styles.minMaxValue}>{minValue}</Text>
              </View>
              
              <View style={styles.minMaxItem}>
                <Text style={styles.minMaxLabel}>Max</Text>
                <Text style={styles.minMaxValue}>{maxValue}</Text>
              </View>
            </View>
          )}
        </View>
        
        {renderSleepData()}
        {renderStepsData()}
      </View>
      
      {isDetailNavigable && (
        <View style={styles.detailPrompt}>
          <Ionicons name="chevron-forward-circle" size={20} color={color} />
          <Text style={[styles.detailPromptText, { color }]}>Detayları Görüntüle</Text>
        </View>
      )}
    </>
  );
  
  // Eğer tıklanabilir bir kart ise TouchableOpacity ile sarmala, değilse normal View döndür
  return isDetailNavigable ? (
    <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.8}>
      {renderCardContent()}
    </TouchableOpacity>
  ) : (
    <View style={styles.card}>
      {renderCardContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e2124',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastUpdated: {
    color: '#aaa',
    fontSize: 12,
  },
  content: {
    alignItems: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  unit: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressUnit: {
    fontSize: 12,
    color: '#aaa',
  },
  details: {
    width: '100%',
    marginTop: 8,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  minMaxItem: {
    alignItems: 'center',
  },
  minMaxLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  minMaxValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  sleepDataContainer: {
    width: '100%',
    marginTop: 12,
  },
  sleepQuality: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  sleepQualityLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  sleepQualityValue: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sleepStages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  sleepStage: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepStageIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  sleepStageLabel: {
    color: '#aaa',
    fontSize: 12,
    marginRight: 4,
  },
  sleepStageValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  extraDataContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  extraDataLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  extraDataValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  detailPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  detailPromptText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500'
  }
});

export default HealthMetricCard; 