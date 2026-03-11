import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji } from '@/constants';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  currentUserId: string;
  onPress?: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Date TBD';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PlanCard({ plan, currentUserId, onPress }: PlanCardProps) {
  const acceptedCount = plan.invites?.filter((i) => i.status === 'accepted').length ?? 0;
  const totalInvited = plan.invites?.length ?? 0;
  const isCreator = plan.creator_id === currentUserId;
  const myInvite = plan.invites?.find((i) => i.invitee_id === currentUserId);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.9}>
      {plan.image_url ? (
        <Image source={{ uri: plan.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.emoji}>{CategoryEmoji[plan.category]}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(plan.scheduled_at)}</Text>
          {!isCreator && myInvite && (
            <View style={[styles.badge, styles[`badge_${myInvite.status}`]]}>
              <Text style={styles.badgeText}>{myInvite.status}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>{plan.title}</Text>
        {plan.location ? (
          <Text style={styles.location} numberOfLines={1}>📍 {plan.location}</Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.attendees}>
            {isCreator ? '👤 You + ' : ''}
            {acceptedCount} / {totalInvited + (isCreator ? 0 : 1)} going
          </Text>
        </View>
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
    height: 140,
  },
  placeholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badge_pending: { backgroundColor: Colors.background.tertiary },
  badge_accepted: { backgroundColor: '#D1FAE5' },
  badge_declined: { backgroundColor: '#FEE2E2' },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
    color: Colors.text.secondary,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendees: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
});
