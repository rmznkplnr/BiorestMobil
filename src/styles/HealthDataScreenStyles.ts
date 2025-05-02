import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  timeRangeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  timeRangeOption: {
    width: 80,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  selectedTimeRange: {
    backgroundColor: '#4a90e2',
  },
  selectedTimeRangeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.select({ ios: 100, android: 90 }),
    gap: 16,
  },
  connectButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      },
      android: {
        elevation: 7,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      },
    }),
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    marginVertical: 10,
  },
  noDataText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartStats: {
    flexDirection: 'row',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 15,
  },
  chartGraph: {
    marginVertical: 10,
    borderRadius: 8,
    paddingRight: 10,
  },
  heartRateChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff6384',
    borderWidth: 1,
  },
  oxygenChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#4169e1',
    borderWidth: 1,
  },
  sleepChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#9c64a6',
    borderWidth: 1,
  },
  stressChartContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff914d',
    borderWidth: 1,
  },
  heartRateChartGraph: {
    backgroundColor: 'rgba(255, 87, 87, 0.05)',
  },
  oxygenChartGraph: {
    backgroundColor: 'rgba(76, 175, 229, 0.05)',
  },
  sleepChartGraph: {
    backgroundColor: 'rgba(167, 139, 250, 0.05)',
  },
  stressChartGraph: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  statItem: {
    marginLeft: 15,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sleepContainer: {
    marginTop: 10,
  },
  sleepHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sleepTitle: {
    color: '#888',
    fontSize: 14,
  },
  sleepDuration: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  sleepEfficiency: {
    color: '#4a90e2',
    fontSize: 16,
  },
  sleepPhases: {
    marginTop: 10,
  },
  sleepPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepPhaseColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  sleepPhaseName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  sleepPhaseTime: {
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
  },
  sleepPhasePercentage: {
    color: '#888',
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  activityItem: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activityLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#ffa726',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  warningText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  installButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  installButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoUnit: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  dataUnit: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chartWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#888',
  },
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
  sleepInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  sleepInfoContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  sleepLabel: {
    fontSize: 14,
    color: '#fff',
  },
  sleepValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  sleepPercentage: {
    fontSize: 12,
    color: '#aaa',
  },
  infoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepSummary: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepMetric: {
    alignItems: 'center',
  },
  sleepMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sleepMetricLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  sleepInfoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  lastMeasurement: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  weekDayButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  weekDayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  weekDayButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedWeekDayButton: {
    transform: [{scale: 1.05}],
  },
  todayButton: {
    borderWidth: 0,
  },
  weekDayButtonText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedWeekDayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  
  // Ay butonları için stiller
  monthButtonsContainer: {
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  monthButtonsScrollContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthButton: {
    width: 60,
    height: 40,
    marginHorizontal: 6,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  monthButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedMonthButton: {
    transform: [{scale: 1.05}],
  },
  currentMonthButton: {
    borderWidth: 0,
  },
  monthButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMonthButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tapForPermissionText: {
    color: '#4a90e2',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionRequired: {
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumberContainer: {
    width: 20,
    marginRight: 10,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  permissionList: {
    marginBottom: 10,
  },
  permissionItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeRangeText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  stepNote: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  androidInfoBanner: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  androidInfoText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  stepsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12, // Kartlar arası sabit boşluk
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    height: 180, // Kartların aynı yükseklikte olmasını sağlayacak
  },
  stepsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',  // Yazı rengi beyaz
  },
  stepsLabel: {
    fontSize: 14,
    color: '#AAAAAA',  // Yazı rengi açık gri
  },
  stepsSummary: {
    flex: 1,
    marginLeft: 16,
  },
  stepsSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#AAAAAA',  // Yazı rengi açık gri
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',  // Yazı rengi beyaz
  },
  topCard: {
    marginBottom: 10,
  },
  bottomCard: {
    marginBottom: 20,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardsContainer: {
    marginTop: 15,
  },
  
  // Modal stilleri
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
 
  modalText: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalSteps: {
    width: '100%',
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  modalCancelButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalConfirmButton: {
    backgroundColor: '#4a90e2',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewTypeTabs: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 8,
  },
  viewTypeOption: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedViewType: {
    borderRadius: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  viewTypeText: {
    fontSize: 12,
    marginTop: 4,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default styles; 