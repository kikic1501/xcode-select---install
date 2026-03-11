import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, containerStyle, style, ...props }, ref) => {
    const hasError = !!error;

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          style={[styles.input, hasError && styles.inputError, style]}
          placeholderTextColor={Colors.text.tertiary}
          {...props}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
  },
});
