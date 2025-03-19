import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../theme/theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  style,
  ...props
}) => {
  const textStyle = getTextStyle(variant);

  return (
    <RNText
      style={[
        textStyle,
        color && { color },
        style,
      ]}
      {...props}
    />
  );
};

const getTextStyle = (variant: TextVariant): TextStyle => {
  switch (variant) {
    case 'h1':
      return {
        fontSize: theme.typography.fontSize.h1,
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.lineHeight.h1,
        color: theme.colors.text.primary,
      };
    case 'h2':
      return {
        fontSize: theme.typography.fontSize.h2,
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.lineHeight.h2,
        color: theme.colors.text.primary,
      };
    case 'h3':
      return {
        fontSize: theme.typography.fontSize.h3,
        fontWeight: theme.typography.fontWeight.bold,
        lineHeight: theme.typography.lineHeight.h3,
        color: theme.colors.text.primary,
      };
    case 'body':
      return {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.regular,
        lineHeight: theme.typography.lineHeight.md,
        color: theme.colors.text.primary,
      };
    case 'caption':
      return {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.regular,
        lineHeight: theme.typography.lineHeight.sm,
        color: theme.colors.text.secondary,
      };
    default:
      return {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.regular,
        lineHeight: theme.typography.lineHeight.md,
        color: theme.colors.text.primary,
      };
  }
};

export default Text; 