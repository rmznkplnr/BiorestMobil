import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Text } from '../components/Text';

interface HistoryCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  trend?: string;
}

const HistoryScreen = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const HistoryCard: React.FC<HistoryCardProps> = ({
    title,
    value,
    unit,
    icon,
    color,
    trend,
  }) => (
    <Card style={styles.historyCard}>
      <View style={styles.historyCardContent}>
        <View style={[styles.historyIconContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.historyInfo}>
          <Text variant="body">{title}</Text>
          <View style={styles.historyValueContainer}>
            <Text variant="h3">{value}</Text>
            <Text variant="caption" color={theme.colors.text.secondary}>{unit}</Text>
          </View>
          {trend && (
            <View style={styles.trendContainer}>
              <Icon
                name={trend.startsWith('+') ? 'trending-up' : 'trending-down'}
                size={16}
                color={trend.startsWith('+') ? theme.colors.status.success : theme.colors.status.error}
              />
              <Text
                variant="caption"
                color={trend.startsWith('+') ? theme.colors.status.success : theme.colors.status.error}>
                {trend}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  const sleepData = {
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [
      {
        data: [7.5, 8, 6.5, 7, 8.5, 9, 7],
      },
    ],
  };

  const stressData = {
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [
      {
        data: [45, 52, 38, 42, 35, 30, 40],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Geçmiş Veriler</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Sağlık ve uyku geçmişiniz
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Zaman Aralığı Seçimi */}
        <View style={styles.timeRangeContainer}>
          <Button
            title="Hafta"
            variant={timeRange === 'week' ? 'primary' : 'outline'}
            onPress={() => setTimeRange('week')}
            style={styles.timeRangeButton}
          />
          <Button
            title="Ay"
            variant={timeRange === 'month' ? 'primary' : 'outline'}
            onPress={() => setTimeRange('month')}
            style={styles.timeRangeButton}
          />
          <Button
            title="Yıl"
            variant={timeRange === 'year' ? 'primary' : 'outline'}
            onPress={() => setTimeRange('year')}
            style={styles.timeRangeButton}
          />
        </View>

        {/* Uyku Geçmişi */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Uyku Geçmişi</Text>
          <Card elevation="medium" style={styles.chartCard}>
            <Text variant="body" style={styles.chartTitle}>Haftalık Uyku Süresi</Text>
            <LineChart
              data={sleepData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </Card>
        </View>

        {/* Stres Geçmişi */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Stres Geçmişi</Text>
          <Card elevation="medium" style={styles.chartCard}>
            <Text variant="body" style={styles.chartTitle}>Haftalık Stres Seviyesi</Text>
            <LineChart
              data={stressData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </Card>
        </View>

        {/* Özet Kartları */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Özet</Text>
          <View style={styles.summaryGrid}>
            <HistoryCard
              title="Ortalama Uyku Süresi"
              value="7.5"
              unit="saat"
              icon="bed"
              color={theme.colors.primary}
              trend="+0.5 saat"
            />
            <HistoryCard
              title="Ortalama Stres"
              value="42"
              unit="%"
              icon="brain"
              color={theme.colors.status.warning}
              trend="-3%"
            />
            <HistoryCard
              title="En İyi Uyku"
              value="9"
              unit="saat"
              icon="star"
              color={theme.colors.accent}
            />
            <HistoryCard
              title="En Düşük Stres"
              value="30"
              unit="%"
              icon="heart"
              color={theme.colors.status.success}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  historyCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  historyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
});

export default HistoryScreen; 