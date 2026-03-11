import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Avatar } from './Avatar';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import type { PlanInvite, Profile, Plan } from '@/types';

interface InviteBannerProps {
  invite: PlanInvite;
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export function InviteBanner({ invite, onAccept, onDecline, loading }: InviteBannerProps) {
  const inviter = invite.inviter as Profile | undefined;
  const plan = invite.plan as Plan | undefined;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Avatar
          uri={inviter?.avatar_url}
          name={inviter?.full_name ?? inviter?.username}
          size={36}
        />
        <View style={styles.info}>
          <Text style={styles.inviterName} numberOfLines={1}>
            {inviter?.full_name ?? inviter?.username ?? 'Someone'}
          </Text>
          <Text style={styles.inviterSub}>invited you to join a plan</Text>
        </View>
      </View>

      <Text style={styles.planTitle} numberOfLines={2}>
        {plan?.title ?? 'A new plan'}
      </Text>

      {plan?.scheduled_at ? (
        <Text style={styles.planDate}>
          {new Date(plan.scheduled_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      ) : (
        <Text style={styles.planDate}>Date TBD</Text>
      )}

      {plan?.location ? (
        <Text style={styles.planLocation} numberOfLines={1}>
          📍 {plan.location}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.declineBtn]}
          onPress={onDecline}
          disabled={loading}
        >
          <Text style={styles.declineText}>Can't make it</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.acceptBtn]}
          onPress={onAccept}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.acceptText}>I'm in! 🎉</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  inviterName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  inviterSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
  },
  planTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
  },
  planLocation: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  btn: {
    flex: 1,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  declineText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptText: {
    fontSize: Typography.sizes.sm,
    color: '#fff',
    fontWeight: Typography.weights.bold,
  },
});
