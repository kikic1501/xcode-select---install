import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji, CategoryLabel } from '@/constants';
import type { SaveCategory } from '@/types';

const CATEGORIES: SaveCategory[] = ['restaurant', 'event', 'activity', 'other'];

interface CategoryPickerProps {
  value: SaveCategory;
  onChange: (category: SaveCategory) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const selected = value === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(cat)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{CategoryEmoji[cat]}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {CategoryLabel[cat]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
});
