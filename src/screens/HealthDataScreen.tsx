import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Text } from '../components/Text';

interface HealthMetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  trend?: string;
}

const HealthDataScreen = () => {
  const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
    title,
    value,
    unit,
    icon,
    color,
    trend,
  }) => (
    <Card style={styles.metricCard}>
      <View style={[styles.metricIconContainer, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.metricInfo}>
        <Text variant="caption" color={theme.colors.text.secondary}>{title}</Text>
        <View style={styles.metricValueContainer}>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Sağlık Verileri</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Son 24 saat
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Uyku Kalitesi */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Uyku Kalitesi</Text>
          <Card elevation="medium" style={styles.sleepQualityCard}>
            <View style={styles.sleepQualityHeader}>
              <Text variant="h3">Genel Uyku Skoru</Text>
              <Text variant="h2" color={theme.colors.primary}>85/100</Text>
            </View>
            <View style={styles.sleepQualityDetails}>
              <View style={styles.sleepQualityDetail}>
                <Icon name="clock-outline" size={20} color={theme.colors.text.secondary} />
                <Text variant="body" color={theme.colors.text.secondary}>7.5 saat</Text>
              </View>
              <View style={styles.sleepQualityDetail}>
                <Icon name="bed" size={20} color={theme.colors.text.secondary} />
                <Text variant="body" color={theme.colors.text.secondary}>23:30</Text>
              </View>
              <View style={styles.sleepQualityDetail}>
                <Icon name="alarm" size={20} color={theme.colors.text.secondary} />
                <Text variant="body" color={theme.colors.text.secondary}>07:00</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Haftalık Uyku Grafiği */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Haftalık Uyku Süresi</Text>
          <Card elevation="medium" style={styles.chartContainer}>
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

        {/* Sağlık Metrikleri */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Sağlık Metrikleri</Text>
          <View style={styles.metricsGrid}>
            <HealthMetricCard
              title="Kalp Atış Hızı"
              value="72"
              unit="bpm"
              icon="heart-pulse"
              color={theme.colors.accent}
              trend="+2 bpm"
            />
            <HealthMetricCard
              title="Oksijen Seviyesi"
              value="98"
              unit="%"
              icon="lungs"
              color={theme.colors.secondary}
              trend="+1%"
            />
            <HealthMetricCard
              title="Adım Sayısı"
              value="8,547"
              unit="adım"
              icon="walk"
              color={theme.colors.primary}
              trend="-234 adım"
            />
            <HealthMetricCard
              title="Stres Seviyesi"
              value="45"
              unit="%"
              icon="brain"
              color={theme.colors.status.warning}
              trend="-5%"
            />
          </View>
        </View>

        {/* Optimizasyon Butonu */}
        <Button
          title="Ortamı Optimize Et"
          onPress={() => {}}
          style={styles.optimizeButton}
        />
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
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  sleepQualityCard: {
    marginBottom: theme.spacing.lg,
  },
  sleepQualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sleepQualityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepQualityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: theme.spacing.lg,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  metricInfo: {
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  optimizeButton: {
    margin: theme.spacing.lg,
  },
});

export default HealthDataScreen; 