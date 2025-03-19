import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import Text from '../components/Text';

interface ActivityItem {
  id: string;
  type: 'aroma' | 'temperature' | 'humidity' | 'light' | 'sound';
  title: string;
  description: string;
  time: string;
  impact: number;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'aroma',
    title: 'Lavanta Aroması',
    description: 'Derin uyku evresinde lavanta aroması verildi',
    time: '03:15',
    impact: 3,
  },
  {
    id: '2',
    type: 'temperature',
    title: 'Sıcaklık Optimizasyonu',
    description: 'Oda sıcaklığı 22°C\'ye ayarlandı',
    time: '02:30',
    impact: 2,
  },
  {
    id: '3',
    type: 'humidity',
    title: 'Nem Dengesi',
    description: 'Nem seviyesi %45\'e ayarlandı',
    time: '02:00',
    impact: 2,
  },
  {
    id: '4',
    type: 'light',
    title: 'Işık Optimizasyonu',
    description: 'Ortam ışığı karanlık moda alındı',
    time: '01:45',
    impact: 1,
  },
  {
    id: '5',
    type: 'sound',
    title: 'Beyaz Gürültü',
    description: 'Rahatlatıcı beyaz gürültü başlatıldı',
    time: '01:30',
    impact: 2,
  },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'aroma':
      return 'spray';
    case 'temperature':
      return 'thermometer';
    case 'humidity':
      return 'water-percent';
    case 'light':
      return 'lightbulb';
    case 'sound':
      return 'volume-high';
    default:
      return 'information';
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'aroma':
      return theme.colors.accent;
    case 'temperature':
      return theme.colors.primary;
    case 'humidity':
      return theme.colors.accent;
    case 'light':
      return theme.colors.status.warning;
    case 'sound':
      return theme.colors.status.success;
    default:
      return theme.colors.text.primary;
  }
};

const DeviceActivitiesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Cihaz Aktiviteleri</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Gece boyunca yapılan optimizasyonlar
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Özet Kartı */}
        <Card elevation="medium" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Icon name="chart-line-variant" size={24} color={theme.colors.primary} />
            <Text variant="h3">Uyku Kalitesi Etkisi</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text variant="body" color={theme.colors.text.secondary}>Toplam İyileştirme</Text>
              <Text variant="h3" color={theme.colors.status.success}>+10</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="body" color={theme.colors.text.secondary}>Aktivite Sayısı</Text>
              <Text variant="h3">{activities.length}</Text>
            </View>
          </View>
        </Card>

        {/* Aktiviteler */}
        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <Card key={activity.id} elevation="medium" style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                  <Icon name={getActivityIcon(activity.type)} size={24} color="#fff" />
                </View>
                <View style={styles.activityInfo}>
                  <Text variant="h3">{activity.title}</Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    {activity.time}
                  </Text>
                </View>
                <View style={styles.impactContainer}>
                  <Icon name="arrow-up" size={16} color={theme.colors.status.success} />
                  <Text variant="body" color={theme.colors.status.success}>+{activity.impact}</Text>
                </View>
              </View>
              <Text variant="body" style={styles.activityDescription}>
                {activity.description}
              </Text>
            </Card>
          ))}
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
  summaryCard: {
    margin: theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryContent: {
    gap: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activitiesContainer: {
    padding: theme.spacing.lg,
  },
  activityCard: {
    marginBottom: theme.spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  activityDescription: {
    color: theme.colors.text.secondary,
  },
});

export default DeviceActivitiesScreen; 