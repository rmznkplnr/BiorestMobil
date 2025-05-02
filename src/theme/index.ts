import { Platform, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width > 768;
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Platformlar arası uyumlu metrikler
const metrics = {
  screenWidth: width,
  screenHeight: height,
  isSmallDevice,
  isTablet,
  headerHeight: isIOS ? 44 : 56,
  tabBarHeight: isIOS ? (isTablet ? 85 : 75) : (isTablet ? 70 : 60),
  statusBarHeight: isIOS ? 20 : StatusBar.currentHeight || 0,
  paddingHorizontal: isIOS ? 16 : 20,
  paddingVertical: isIOS ? 16 : 15,
  borderRadius: {
    small: isIOS ? 8 : 8,
    medium: isIOS ? 12 : 12,
    large: isIOS ? 16 : 18,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  fontSize: {
    xs: isIOS ? (isTablet ? 13 : 11) : (isTablet ? 12 : 10),
    s: isIOS ? (isTablet ? 15 : 13) : (isTablet ? 14 : 12),
    m: isIOS ? (isTablet ? 17 : 15) : (isTablet ? 16 : 14),
    l: isIOS ? (isTablet ? 20 : 17) : (isTablet ? 20 : 16),
    xl: isIOS ? (isTablet ? 24 : 20) : (isTablet ? 24 : 20),
    xxl: isIOS ? (isTablet ? 32 : 24) : (isTablet ? 32 : 24),
  },
  iconSize: {
    tiny: isTablet ? 16 : 12,
    small: isTablet ? 20 : 16,
    medium: isTablet ? 26 : 22,
    large: isTablet ? 32 : 28,
    xlarge: isTablet ? 38 : 32,
  },
};

// Platform'a özgü gölge stilleri
const platformShadow = {
  ios: (elevation = 5) => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation * 0.5 },
    shadowOpacity: 0.15,
    shadowRadius: elevation * 1.5,
  }),
  android: (elevation = 5) => ({
    elevation,
  }),
};

type ElevationLevel = 'low' | 'medium' | 'high';

// Card bileşeni için varsayılan değerler
const card = {
  borderRadius: isIOS ? 12 : 15,
  padding: {
    horizontal: isIOS ? 16 : 20,
    vertical: isIOS ? 16 : 20,
  },
  margin: {
    horizontal: isIOS ? 16 : 20,
    vertical: isIOS ? 8 : 10,
  },
  elevation: {
    low: isIOS ? 2 : 2,
    medium: isIOS ? 4 : 5,
    high: isIOS ? 6 : 8,
  },
  typography: {
    title: {
      fontSize: isIOS ? 17 : 16,
      lineHeight: isIOS ? 22 : 24,
      letterSpacing: isIOS ? -0.4 : 0,
      fontWeight: isIOS ? '600' : 'bold',
    },
    subtitle: {
      fontSize: isIOS ? 15 : 14,
      lineHeight: isIOS ? 20 : 20,
      letterSpacing: isIOS ? -0.24 : 0,
      fontWeight: isIOS ? '400' : 'normal',
    },
    body: {
      fontSize: isIOS ? 15 : 14,
      lineHeight: isIOS ? 20 : 20,
      letterSpacing: isIOS ? -0.24 : 0,
      fontWeight: isIOS ? '400' : 'normal',
    },
  },
  // Her platform için doğru gölgelendirme
  getShadow: (level: ElevationLevel = 'medium') => {
    const elevationValue = card.elevation[level];
    return isIOS 
      ? platformShadow.ios(elevationValue) 
      : platformShadow.android(elevationValue);
  },
};

const colors = {
  primary: {
    light: '#4a90e2',
    main: '#3a70b2',
    dark: '#2c5282',
  },
  secondary: {
    light: '#ff914d',
    main: '#ff7a1c',
    dark: '#e65c00',
  },
  background: {
    primary: '#121212',
    secondary: '#1a1a1a',
    tertiary: '#333333',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.8)',
    tertiary: 'rgba(255,255,255,0.6)',
    disabled: 'rgba(255,255,255,0.4)',
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#ff6b6b',
    info: '#2196f3',
  },
  border: {
    light: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.2)',
  },
};

const theme = {
  colors,
  metrics,
  isIOS,
  isAndroid,
  isTablet,
  card,
  shadow: (level: ElevationLevel = 'medium') => isIOS 
    ? platformShadow.ios(card.elevation[level])
    : platformShadow.android(card.elevation[level]),
};

export default theme; 