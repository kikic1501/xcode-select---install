import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { Avatar } from '@/components/Avatar';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji } from '@/constants';
import type { Plan, PlanInvite, Profile } from '@/types';

function formatDate(iso: string | null): string {
  if (!iso) return 'Date TBD';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { plans, pendingInvites, respond } = usePlans(user?.id);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const found = plans.find((p) => p.id === id);
    if (found) setPlan(found);
  }, [plans, id]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading plan...</Text>
      </SafeAreaView>
    );
  }

  const isCreator = plan.creator_id === user?.id;
  const myPendingInvite = pendingInvites.find((i) => i.plan_id === plan.id);
  const myInvite = plan.invites?.find((i) => i.invitee_id === user?.id);
  const going = plan.invites?.filter((i) => i.status === 'accepted') ?? [];
  const pending = plan.invites?.filter((i) => i.status === 'pending') ?? [];
  const declined = plan.invites?.filter((i) => i.status === 'declined') ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{CategoryEmoji[plan.category]}</Text>
        </View>

        {/* Title block */}
        <View style={styles.card}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.date}>{formatDate(plan.scheduled_at)}</Text>
          {plan.location && <Text style={styles.location}>📍 {plan.location}</Text>}
          {plan.description && <Text style={styles.description}>{plan.description}</Text>}
        </View>

        {/* RSVP banner (for invitees with pending status) */}
        {myPendingInvite && (
          <View style={styles.rsvpBanner}>
            <Text style={styles.rsvpTitle}>You've been invited!</Text>
            <Text style={styles.rsvpSubtitle}>
              {(myPendingInvite.inviter as any)?.username ?? 'Someone'} invited you to this plan.
            </Text>
            <View style={styles.rsvpButtons}>
              <TouchableOpacity
                style={[styles.rsvpBtn, styles.declineBtn]}
                onPress={() => {
                  respond(myPendingInvite.id, 'declined');
                  router.back();
                }}
              >
                <Text style={styles.declineBtnText}>Can't make it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rsvpBtn, styles.acceptBtn]}
                onPress={() => respond(myPendingInvite.id, 'accepted')}
              >
                <Text style={styles.acceptBtnText}>I'm in! 🎉</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Your RSVP status */}
        {!isCreator && myInvite && myInvite.status !== 'pending' && (
          <View style={[styles.statusBadge, myInvite.status === 'accepted' ? styles.statusAccepted : styles.statusDeclined]}>
            <Text style={styles.statusText}>
              {myInvite.status === 'accepted' ? "✓ You're going!" : "✗ You declined"}
            </Text>
          </View>
        )}

        {/* Attendees */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Going ({going.length + (isCreator ? 1 : 0)})
          </Text>
          {isCreator && (
            <AttendeeRow
              profile={plan.creator as any}
              label="Organizer"
              status="accepted"
            />
          )}
          {going.map((invite) => (
            <AttendeeRow
              key={invite.id}
              profile={invite.invitee as any}
              status="accepted"
            />
          ))}

          {pending.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>
                Waiting ({pending.length})
              </Text>
              {pending.map((invite) => (
                <AttendeeRow
                  key={invite.id}
                  profile={invite.invitee as any}
                  status="pending"
                />
              ))}
            </>
          )}

          {declined.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>
                Can't make it ({declined.length})
              </Text>
              {declined.map((invite) => (
                <AttendeeRow
                  key={invite.id}
                  profile={invite.invitee as any}
                  status="declined"
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AttendeeRow({
  profile,
  label,
  status,
}: {
  profile: Profile | null;
  label?: string;
  status: 'accepted' | 'pending' | 'declined';
}) {
  const statusIcon = { accepted: '✓', pending: '⏳', declined: '✗' }[status];
  const statusColor = {
    accepted: Colors.success,
    pending: Colors.warning,
    declined: Colors.error,
  }[status];

  return (
    <View style={attendeeStyles.row}>
      <Avatar
        uri={profile?.avatar_url}
        name={profile?.full_name ?? profile?.username}
        size={36}
      />
      <View style={attendeeStyles.info}>
        <Text style={attendeeStyles.name}>
          {profile?.full_name ?? profile?.username ?? 'Unknown'}
          {label ? ` · ${label}` : ''}
        </Text>
        <Text style={attendeeStyles.username}>@{profile?.username ?? '...'}</Text>
      </View>
      <Text style={[attendeeStyles.status, { color: statusColor }]}>{statusIcon}</Text>
    </View>
  );
}

const attendeeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  username: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
  },
  status: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loading: {
    textAlign: 'center',
    marginTop: Spacing.xxl,
    color: Colors.text.secondary,
  },
  scroll: {
    padding: Spacing.md,
  },
  hero: {
    height: 160,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroEmoji: {
    fontSize: 72,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  location: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  rsvpBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  rsvpTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  rsvpSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rsvpBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  declineBtn: {
    backgroundColor: Colors.background.primary,
  },
  declineBtnText: {
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: Typography.weights.bold,
  },
  statusBadge: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  statusAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusDeclined: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
});
