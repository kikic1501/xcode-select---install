import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji } from '@/constants';
import type { Save } from '@/types';

interface SaveCardProps {
  save: Save;
  onPress?: () => void;
  onMakePlan?: () => void;
}

export function SaveCard({ save, onPress, onMakePlan }: SaveCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.9}>
      {save.image_url ? (
        <Image source={{ uri: save.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.emoji}>{CategoryEmoji[save.category]}</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.category}>{CategoryEmoji[save.category]} {save.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{save.title}</Text>
        {save.location ? (
          <Text style={styles.location} numberOfLines={1}>📍 {save.location}</Text>
        ) : null}
        <TouchableOpacity style={styles.planButton} onPress={onMakePlan}>
          <Text style={styles.planButtonText}>Make it a plan →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  placeholder: {
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  content: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  category: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  location: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  planButton: {
    alignSelf: 'flex-start',
  },
  planButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});
