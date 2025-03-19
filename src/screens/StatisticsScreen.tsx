import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StatisticsScreen = () => {
  const weeklyStats = [
    { day: 'Pzt', hours: 7.5, quality: 85 },
    { day: 'Sal', hours: 8.0, quality: 90 },
    { day: 'Çar', hours: 7.0, quality: 80 },
    { day: 'Per', hours: 8.5, quality: 95 },
    { day: 'Cum', hours: 7.8, quality: 88 },
    { day: 'Cmt', hours: 9.0, quality: 92 },
    { day: 'Paz', hours: 8.2, quality: 87 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>İstatistikler</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>7.8</Text>
            <Text style={styles.summaryLabel}>Ortalama Uyku Süresi</Text>
            <Text style={styles.summaryUnit}>saat</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>88%</Text>
            <Text style={styles.summaryLabel}>Ortalama Kalite</Text>
            <Text style={styles.summaryUnit}>gece</Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Haftalık Uyku Süresi</Text>
            <TouchableOpacity>
              <Ionicons name="calendar-outline" size={24} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            {weeklyStats.map((stat, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={[styles.bar, { height: `${(stat.hours / 10) * 100}%` }]} />
                <Text style={styles.barLabel}>{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detaylı Analiz</Text>
            <TouchableOpacity>
              <Ionicons name="analytics-outline" size={24} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>En İyi Uyku</Text>
                <Text style={styles.detailValue}>Perşembe - 8.5 saat</Text>
              </View>
              <Ionicons name="trending-up" size={20} color="#50c878" />
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>En Kötü Uyku</Text>
                <Text style={styles.detailValue}>Çarşamba - 7.0 saat</Text>
              </View>
              <Ionicons name="trending-down" size={20} color="#e74c3c" />
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>Ortalama Kalite</Text>
                <Text style={styles.detailValue}>88%</Text>
              </View>
              <Ionicons name="star" size={20} color="#f1c40f" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    width: '45%',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  summaryUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#4a90e2',
    borderRadius: 10,
  },
  barLabel: {
    color: '#888',
    marginTop: 5,
  },
  detailsSection: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  detailsList: {
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#888',
  },
});

export default StatisticsScreen; 