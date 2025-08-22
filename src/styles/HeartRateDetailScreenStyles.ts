import { StyleSheet } from 'react-native';

export const heartRateDetailStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  chartTypeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.2)'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000'
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10
  },
  primaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    position: 'relative'
  },
  primaryCardContent: {
    alignItems: 'center'
  },
  primaryValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10
  },
  primaryUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -5
  },
  primaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5
  },
  secondaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  chartTypeIndicator: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  chartTypeText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '600'
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  chartBackground: {
    borderRadius: 20
  },
  chartTips: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginTop: 20
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  tipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10
  },
  tipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  rangesSection: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15
  },
  rangesList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  rangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  rangeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  },
  rangeDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16
  },
  noDataText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20
  },
  gaugeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gaugeWrapper: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gaugeCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    textAlign: 'center'
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff'
  },
  gaugeUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -5
  },
  gaugeCategory: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600'
  },
  gaugeDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10
  },
  simpleChart: {
    flex: 1,
    padding: 20
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  simpleValues: {
    flexDirection: 'column',
    marginBottom: 20
  },
  simpleValueItem: {
    marginBottom: 15
  },
  simpleLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5
  },
  simpleBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginVertical: 5
  },
  simpleBarFill: {
    height: '100%',
    borderRadius: 4
  },
  simpleValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  simpleInfo: {
    alignItems: 'center'
  },
  simpleInfoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14
  },
  chart: {
    borderRadius: 16
  },
  chartLegend: {
    alignItems: 'center',
    marginTop: 10
  },
  legendText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14
  }
}); 