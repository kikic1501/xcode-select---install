import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji, CategoryLabel } from '@/constants';
import type { Save } from '@/types';

interface SaveCardProps {
  save: Save;
  onPress?: () => void;
  onMakePlan?: () => void;
}

export function SaveCard({ save, onPress, onMakePlan }: SaveCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.85}>
      {/* Image / placeholder */}
      <View style={styles.imageContainer}>
        {save.image_url ? (
          <Image source={{ uri: save.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderEmoji}>{CategoryEmoji[save.category]}</Text>
          </View>
        )}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>
            {CategoryEmoji[save.category]} {CategoryLabel[save.category]}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{save.title}</Text>
        {save.location ? (
          <Text style={styles.meta} numberOfLines={1}>📍 {save.location}</Text>
        ) : null}
        {save.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{save.notes}</Text>
        ) : null}
        <TouchableOpacity style={styles.planCta} onPress={onMakePlan} activeOpacity={0.7}>
          <Text style={styles.planCtaText}>Make it a plan  →</Text>
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 148,
  },
  imagePlaceholder: {
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 44,
  },
  categoryPill: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  body: {
    padding: Spacing.md,
    gap: 6,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  meta: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  notes: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  planCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  planCtaText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});
