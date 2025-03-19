import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  elevation?: 'light' | 'medium' | 'high';
  style?: ViewStyle;
  onPress?: () => void;
}

type ElevationStyle = {
  [key: string]: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'light',
  style,
  onPress,
}) => {
  const elevationStyles: ElevationStyle = {
    elevationLight: {
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: theme.card.elevation.low,
    },
    elevationMedium: {
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: theme.card.elevation.medium,
    },
    elevationHigh: {
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: theme.card.elevation.high,
    },
  };

  const cardStyle = [
    styles.card,
    elevationStyles[`elevation${elevation.charAt(0).toUpperCase() + elevation.slice(1)}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.card.padding.md,
  },
}); 