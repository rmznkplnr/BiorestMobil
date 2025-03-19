export const theme = {
  colors: {
    primary: '#FFFFFF',
    accent: '#1E293B',
    background: '#000000',
    surface: '#1A1A1A',
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      tertiary: '#666666',
    },
    border: '#333333',
    card: {
      background: '#1E293B',
      border: '#333333',
    },
    status: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFC107',
      info: '#2196F3',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      h1: 32,
      h2: 28,
      h3: 24,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      h1: 40,
      h2: 36,
      h3: 32,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
    },
  },
  icons: {
    size: {
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
    },
  },
  card: {
    padding: {
      sm: 12,
      md: 16,
      lg: 24,
    },
    elevation: {
      low: 2,
      medium: 4,
      high: 8,
    },
  },
  button: {
    height: 48,
    padding: {
      sm: 12,
      md: 16,
      lg: 20,
    },
    borderRadius: 8,
  },
  input: {
    height: 48,
    padding: 16,
    borderRadius: 8,
  },
  listItem: {
    height: 56,
    padding: 16,
  },
  header: {
    height: 56,
    padding: 16,
  },
  tabBar: {
    height: 56,
    padding: 8,
  },
  elevation: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme; 