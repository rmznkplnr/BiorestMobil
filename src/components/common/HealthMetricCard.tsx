import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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
  const screenWidth = Dimensions.get('window').width;
  
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
  
  const renderChart = () => {
    if (!values || !times || values.length < 2) return null;
    
    // En son 5 veriyi göster
    const displayCount = Math.min(values.length, 5);
    const displayValues = values.slice(-displayCount);
    const displayTimes = times.slice(-displayCount);
    
    const chartData = {
      labels: displayTimes.map(time => formatTime(time)),
      datasets: [
        {
          data: displayValues,
          color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          strokeWidth: 2,
        },
      ],
    };
    
    const chartConfig = {
      backgroundGradientFrom: '#1e2124',
      backgroundGradientTo: '#1e2124',
      decimalPlaces: precision,
      color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: color
      },
      propsForBackgroundLines: {
        stroke: '#3a3f44',
        strokeWidth: 1
      },
      propsForLabels: {
        fontSize: 10,
        fontWeight: 'normal'
      }
    };
    
    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 60}
          height={100}
          chartConfig={chartConfig}
          bezier
          withDots={true}
          withShadow
          withVerticalLines
          withHorizontalLines
          yAxisLabel=""
          yAxisSuffix={` ${unit}`}
          yLabelsOffset={10}
          segments={3}
          style={{
            marginVertical: 4,
            borderRadius: 12,
          }}
        />
      </View>
    );
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
  
  return (
    <View style={styles.card}>
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
          
          {renderSleepData()}
          {renderStepsData()}
        </View>
      </View>
      
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e2124',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#aaa',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueContainer: {
    marginRight: 16,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressUnit: {
    fontSize: 10,
    color: '#aaa',
  },
  sleepDataContainer: {
    marginTop: 8,
  },
  sleepQuality: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sleepQualityLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  sleepQualityValue: {
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 6,
  },
  sleepStageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sleepStageLabel: {
    fontSize: 11,
    color: '#aaa',
    marginRight: 4,
  },
  sleepStageValue: {
    fontSize: 11,
    color: '#fff',
  },
  extraDataContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  extraDataLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  extraDataValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});

export default HealthMetricCard; 