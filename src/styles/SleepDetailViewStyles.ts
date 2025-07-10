import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const sleepDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: Colors.text,
    marginTop: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDescription: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 10,
  },
  timingContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  timingItem: {
    flex: 1,
    alignItems: 'center',
  },
  timingLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginVertical: 5,
  },
  timingValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timingDivider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 10,
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chart: {
    marginTop: 8,
    borderRadius: 16,
  },
  stagesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  stageLabel: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
  },
  stageValue: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginRight: 10,
  },
  stagePercent: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  tipsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipsContent: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  lastUpdated: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  heartRateContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heartRateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heartRateStat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  heartRateStatLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  heartRateStatValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heartRateInfo: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  heartRateInfoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
}); 