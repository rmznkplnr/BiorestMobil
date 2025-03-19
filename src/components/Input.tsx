import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import Text from './Text';

interface InputProps extends TextInputProps {
  label: string;
  containerStyle?: any;
}

const Input = ({ label, containerStyle, ...props }: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="body" style={styles.label}>
        {label}
      </Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.text.tertiary}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default Input; 