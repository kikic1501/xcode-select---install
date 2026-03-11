import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface SectionHeaderProps {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, count, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 99,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#fff',
  },
  action: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});
