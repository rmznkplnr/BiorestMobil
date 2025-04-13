import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import ChartTooltip from './ChartTooltip';
import { formatTime } from '../../utils/healthDataUtils';

const screenWidth = Dimensions.get('window').width - 40;

interface HeartRateChartProps {
  heartRateData: {
    time: number;
    value: number;
  }[];
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
}

const HeartRateChart = ({ 
  heartRateData, 
  avgHeartRate = 0, 
  maxHeartRate = 0, 
  minHeartRate = 0 
}: HeartRateChartProps) => {
  const [selectedPoint, setSelectedPoint] = useState<{
    value: number;
    time: string;
    x: number;
    y: number;
  } | null>(null);

  if (!heartRateData || heartRateData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Kalp Atış Hızı</Text>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.noDataText}>Kalp atış hızı verisi bulunamadı</Text>
        </View>
      </View>
    );
  }

  // Düzgün bir grafik için veri sayısını azaltalım
  const sampleRate = Math.max(1, Math.floor(heartRateData.length / 12));
  const sampledData = heartRateData.filter((_, i) => i % sampleRate === 0);
  
  const values = sampledData.map(item => item.value);
  const times = sampledData.map(item => formatTime(String(item.time), 'day'));
  
  const chartData = {
    labels: times,
    datasets: [
      {
        data: values,
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2
      }
    ],
  };
  
  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ff6384',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  const handleDataPointClick = (data: any) => {
    if (data.index !== undefined && data.x !== undefined && data.y !== undefined) {
      const value = values[data.index];
      const time = times[data.index];
      setSelectedPoint({ value, time, x: data.x, y: data.y });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Kalp Atış Hızı</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => Alert.alert('Ortalama Kalp Atış Hızı', `Bugünkü ortalama kalp atış hızınız: ${avgHeartRate.toFixed(0)} bpm`)}
        >
          <Text style={styles.statValue}>{avgHeartRate.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Ortalama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => Alert.alert('Maksimum Kalp Atış Hızı', `Bugünkü maksimum kalp atış hızınız: ${maxHeartRate.toFixed(0)} bpm`)}
        >
          <Text style={styles.statValue}>{maxHeartRate.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Maksimum</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => Alert.alert('Minimum Kalp Atış Hızı', `Bugünkü minimum kalp atış hızınız: ${minHeartRate.toFixed(0)} bpm`)}
        >
          <Text style={styles.statValue}>{minHeartRate.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Minimum</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          onDataPointClick={handleDataPointClick}
          withInnerLines={true}
          withOuterLines={false}
          withHorizontalLines={true}
          withVerticalLines={false}
          yAxisSuffix=" bpm"
          yAxisInterval={1}
          fromZero={false}
          segments={5}
        />
        
        {selectedPoint && (
          <ChartTooltip
            value={selectedPoint.value}
            time={selectedPoint.time}
            x={selectedPoint.x}
            y={selectedPoint.y}
            chartType="heartRate"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    position: 'relative',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,99,132,0.1)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6384',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  noDataText: {
    color: '#888',
    fontSize: 16,
    padding: 20,
  },
});

export default HeartRateChart; 