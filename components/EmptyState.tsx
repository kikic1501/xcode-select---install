import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';
import { Colors, Spacing, Typography } from '@/constants';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Button
          label={secondaryActionLabel}
          onPress={onSecondaryAction}
          variant="ghost"
          style={styles.secondaryButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    alignSelf: 'stretch',
  },
  secondaryButton: {
    alignSelf: 'stretch',
    marginTop: Spacing.sm,
  },
});
