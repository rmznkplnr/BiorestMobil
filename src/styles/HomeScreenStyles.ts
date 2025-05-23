import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Modern koyu renk paleti
const colors = {
  background: '#121214',
  cardBackground: '#1E1E24',
  cardBackgroundAlt: '#25252D',
  primary: '#7C3AED',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  text: {
    primary: '#FFFFFF',
    secondary: '#E2E8F0',
    light: '#94A3B8',
    dark: '#1E293B'
  },
  gradient: {
    primary: ['#7C3AED', '#8B5CF6'],
    secondary: ['#3B82F6', '#06B6D4'],
    success: ['#059669', '#10B981']
  },
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)'
  }
};

// Platform'a özgü değerler
const platformSpacing = {
  paddingBottom: Platform.select({ ios: 90, android: 70 }) as number,
  headerPadding: Platform.select({ ios: 20, android: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 20 }) as number,
  cardPadding: Platform.select({ ios: 16, android: 12 }) as number,
  summaryCardWidth: Platform.select({ ios: '30%', android: '30%' }) as string,
};

// Gelişmiş gölge stili
const shadowStyle = Platform.select({
  ios: {
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  android: {
    elevation: 8,
  },
}) as any;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingBottom: platformSpacing.paddingBottom,
    gap: 12,
  },
  header: {
    padding: 16,
    paddingTop: platformSpacing.headerPadding,
    backgroundColor: colors.background,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  zScoreContainer: {
    marginBottom: 12,
    borderRadius: 24,
    width: '95%',
    minHeight: 280,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    ...shadowStyle,
  },
  zScoreGradient: {
    flex: 1,
    padding: 0,
    justifyContent: 'space-between',
    borderRadius: 24,
  },
  zScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  zScoreZ: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  zScoreTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  zStack: {
    width: 80,
    height: 50,
    position: 'relative',
    marginRight: 8,
  },
  zLetter: {
    position: 'absolute',
    color: colors.text.primary,
    fontWeight: '800',
    bottom: 0,
  },
  zScoreTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  zScoreContent: {
    alignItems: 'center',
    marginVertical: 12,
  },
  zScoreTextContainer: {
    alignItems: 'center',
  },
  zScoreValue: {
    fontSize: 52,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  zScoreLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 6,
  },
  zScoreDetails: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  zScoreMessage: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
    flexWrap: 'wrap',
  },
  zScoreDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 20,
    flexWrap: 'wrap',
    width: '90%',
  },
  zScoreStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 12,
    marginTop: 'auto',
    marginBottom: 8,
  },
  zScoreStat: {
    alignItems: 'center',
    flex: 1,
  },
  zScoreStatLabel: {
    fontSize: 12,
    color: colors.text.light,
    marginBottom: 3,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  zScoreStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
    flexWrap: 'wrap',
  },
  summarySection: {
    padding: 16,
    width: '100%',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
    width: '100%',
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: platformSpacing.cardPadding,
    width: platformSpacing.summaryCardWidth,
    alignItems: 'center',
    minHeight: 100,
    ...shadowStyle,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    marginVertical: 10,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  summaryUnit: {
    fontSize: 11,
    color: colors.text.light,
    marginTop: 3,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: Platform.select({ ios: '85%', android: '90%' }),
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 20,
    ...shadowStyle,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  modalScroll: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text.light,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.text.primary,
  },
  detailsContainer: {
    flex: 1,
  },
  chartTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    width: screenWidth - 80,
    alignSelf: 'center',
  },
  eventsContainer: {
    marginTop: 16,
    padding: 15,
    backgroundColor: colors.cardBackgroundAlt,
    borderRadius: 20,
  },
  eventsTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  eventItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  eventTime: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  eventAction: {
    color: colors.text.primary,
    fontSize: 14,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  eventEffect: {
    color: colors.text.light,
    fontSize: 13,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  summaryContainer: {
    marginTop: 16,
    padding: 15,
    backgroundColor: colors.cardBackgroundAlt,
    borderRadius: 20,
  },
  summaryTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    padding: 16,
  },
  ratingTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  star: {
    marginHorizontal: 5,
  },
  commentInput: {
    width: '100%',
    height: Platform.select({ ios: 100, android: 120 }),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    color: colors.text.primary,
    textAlignVertical: Platform.OS === 'android' ? 'top' : 'auto',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 24,
    width: '95%',
    minHeight: 200,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: colors.cardBackgroundAlt,
    ...shadowStyle,
  },
  notificationGradient: {
    flex: 1,
   
    justifyContent: 'space-between',
    borderRadius: 24,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: 12,
    letterSpacing: -0.3,
    flexShrink: 1,
    flexWrap: 'wrap',
    
  },
  notificationContent: {
    marginBottom: 12,
    flex: 1,
    padding: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  notificationText: {
    color: colors.text.secondary,
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 20,
    flexWrap: 'wrap',
    width: '100%',
    
  },
  notificationFooter: {
    color: colors.text.light,
    fontSize: 13,
    textAlign: 'center',
    paddingTop: 5,
    flexWrap: 'wrap',
    paddingBottom: 5,
  },
  googleFitCard: {
    marginBottom: 12,
    borderRadius: 24,
    width: '95%',
    minHeight: 120,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    ...shadowStyle,
    
  },
  googleFitGradient: {
    flex: 1,
    padding: 0,
    paddingVertical: 0,
    justifyContent: 'space-between',
    borderRadius: 24,
    
  },
  googleFitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    width: '100%',
    padding: 10,
    paddingTop: 12,

    
  },
  googleFitTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    letterSpacing: -0.3,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  googleFitText: {
    color: colors.text.secondary,
    paddingLeft: 16,
    paddingBottom: 5,
    flexWrap: 'wrap',
    width: '100%',
  },
  googleFitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
   
    flexWrap: 'wrap',
  },
  googleFitButtonText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
    flexWrap: 'wrap',
    flexShrink: 1,
    
  },
  infoSection: {
    marginBottom: 16,
  },
  infoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  bulletList: {
    marginVertical: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 10,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  scoreIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  scoreText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
}); 