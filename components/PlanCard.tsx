import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji } from '@/constants';
import type { Plan, Profile } from '@/types';

interface PlanCardProps {
  plan: Plan;
  currentUserId: string;
  onPress?: () => void;
}

function shortDate(iso: string | null): string {
  if (!iso) return 'Date TBD';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function shortTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const INVITE_STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  accepted: { bg: '#D1FAE5', text: '#065F46', label: 'Going ✓' },
  declined: { bg: '#FEE2E2', text: '#991B1B', label: 'Declined' },
};

export function PlanCard({ plan, currentUserId, onPress }: PlanCardProps) {
  const isCreator = plan.creator_id === currentUserId;
  const myInvite = plan.invites?.find((i) => i.invitee_id === currentUserId);
  const goingInvites = plan.invites?.filter((i) => i.status === 'accepted') ?? [];
  const goingCount = goingInvites.length + (isCreator ? 1 : 0);
  const totalCount = (plan.invites?.length ?? 0) + 1; // +1 for creator

  // Show up to 3 going avatars
  const goingProfiles: Profile[] = [
    ...(isCreator && plan.creator ? [plan.creator as Profile] : []),
    ...goingInvites
      .slice(0, 3)
      .map((i) => i.invitee as Profile)
      .filter(Boolean),
  ].slice(0, 3);

  const statusInfo =
    !isCreator && myInvite ? INVITE_STATUS_STYLE[myInvite.status] : null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.85}>
      {/* Hero */}
      <View style={styles.heroContainer}>
        {plan.image_url ? (
          <Image source={{ uri: plan.image_url }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.heroEmoji}>{CategoryEmoji[plan.category]}</Text>
          </View>
        )}

        {/* Date chip overlaid on hero */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{shortDate(plan.scheduled_at)}</Text>
          {shortTime(plan.scheduled_at) ? (
            <Text style={styles.timeBadgeText}>{shortTime(plan.scheduled_at)}</Text>
          ) : null}
        </View>

        {/* My RSVP badge (top-right) */}
        {statusInfo ? (
          <View style={[styles.rsvpBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.rsvpBadgeText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{plan.title}</Text>

        {plan.location ? (
          <Text style={styles.location} numberOfLines={1}>📍 {plan.location}</Text>
        ) : null}

        {/* Footer: avatar stack + count */}
        <View style={styles.footer}>
          <View style={styles.avatarStack}>
            {goingProfiles.map((p, i) => (
              <View key={p.id} style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -10 }]}>
                <Avatar uri={p.avatar_url} name={p.full_name ?? p.username} size={26} />
              </View>
            ))}
          </View>
          <Text style={styles.goingText}>
            {goingCount} / {totalCount} going
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroContainer: {
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 130,
  },
  heroPlaceholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 44,
  },
  dateBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  dateBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#fff',
  },
  timeBadgeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  rsvpBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  rsvpBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
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
  location: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    borderWidth: 1.5,
    borderColor: Colors.background.primary,
    borderRadius: 99,
  },
  goingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
});
