import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChartTooltipProps {
  value: number;
  time: string;
  x: number;
  y: number;
  chartType: 'heartRate' | 'oxygen' | 'stress';
}

/**
 * Grafik üzerindeki veri noktalarına tıklandığında gösterilen tooltip bileşeni
 */
const ChartTooltip = ({ value, time, x, y, chartType }: ChartTooltipProps) => {
  let unit = '';
  let color = '';
  
  if (chartType === 'heartRate') {
    unit = 'bpm';
    color = 'rgba(255, 99, 132, 0.8)';
  } else if (chartType === 'oxygen') {
    unit = '%';
    color = 'rgba(76, 175, 229, 0.8)';
  } else if (chartType === 'stress') {
    unit = '';
    color = 'rgba(245, 158, 11, 0.8)';
  }
  
  return (
    <View style={[styles.tooltipContainer, { left: x - 50, top: y - 70 }]}>
      <View style={[styles.tooltipContent, { borderColor: color }]}>
        <Text style={styles.tooltipValue}>{value.toFixed(chartType === 'oxygen' ? 1 : 0)} {unit}</Text>
        <Text style={styles.tooltipTime}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    zIndex: 9999,
    alignItems: 'center',
  },
  tooltipContent: {
    backgroundColor: '#1e1e1e',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  tooltipValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tooltipTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ translateY: -1 }],
  },
});

export default ChartTooltip; 