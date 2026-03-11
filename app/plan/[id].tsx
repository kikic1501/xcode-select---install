import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji } from '@/constants';
import type { Plan, PlanInvite, Profile } from '@/types';

function formatFullDate(iso: string | null): string {
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

// Status config for invite statuses
const STATUS_CONFIG = {
  accepted: { color: Colors.success, bg: '#D1FAE5', icon: 'checkmark-circle' as const, label: 'Going' },
  pending:  { color: Colors.warning, bg: '#FEF3C7', icon: 'time' as const,             label: 'Pending' },
  declined: { color: Colors.error,   bg: '#FEE2E2', icon: 'close-circle' as const,     label: "Can't go" },
};

function AttendeeRow({ profile, label, status }: {
  profile: Profile | null;
  label?: string;
  status: 'accepted' | 'pending' | 'declined';
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={attendeeStyles.row}>
      <Avatar uri={profile?.avatar_url} name={profile?.full_name ?? profile?.username} size={38} />
      <View style={attendeeStyles.info}>
        <Text style={attendeeStyles.name} numberOfLines={1}>
          {profile?.full_name ?? profile?.username ?? 'Unknown'}
          {label ? <Text style={attendeeStyles.label}>  {label}</Text> : null}
        </Text>
        <Text style={attendeeStyles.username}>@{profile?.username ?? '...'}</Text>
      </View>
      <View style={[attendeeStyles.statusBadge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={12} color={cfg.color} />
        <Text style={[attendeeStyles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { plans, pendingInvites, respond } = usePlans(user?.id);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [respondingTo, setRespondingTo] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    const found = plans.find((p) => p.id === id);
    if (found) setPlan(found);
  }, [plans, id]);

  async function handleRespond(inviteId: string, status: 'accepted' | 'declined') {
    setRespondingTo(status);
    try {
      await respond(inviteId, status);
      if (status === 'declined') router.back();
    } finally {
      setRespondingTo(null);
    }
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const isCreator = plan.creator_id === user?.id;
  const myPendingInvite = pendingInvites.find((i) => i.plan_id === plan.id);
  const myInvite = plan.invites?.find((i) => i.invitee_id === user?.id);

  const going = plan.invites?.filter((i) => i.status === 'accepted') ?? [];
  const waiting = plan.invites?.filter((i) => i.status === 'pending') ?? [];
  const declined = plan.invites?.filter((i) => i.status === 'declined') ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{CategoryEmoji[plan.category]}</Text>
        </View>

        {/* Title card */}
        <View style={styles.card}>
          <Text style={styles.title}>{plan.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
            <Text style={styles.metaDate}>{formatFullDate(plan.scheduled_at)}</Text>
          </View>

          {plan.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{plan.location}</Text>
            </View>
          ) : null}

          {plan.description ? (
            <Text style={styles.description}>{plan.description}</Text>
          ) : null}
        </View>

        {/* RSVP banner — shown when user has a pending invite */}
        {myPendingInvite ? (
          <View style={styles.rsvpCard}>
            <View style={styles.rsvpHeader}>
              <Text style={styles.rsvpEmoji}>🎉</Text>
              <View>
                <Text style={styles.rsvpTitle}>You're invited!</Text>
                <Text style={styles.rsvpSub}>
                  {(myPendingInvite.inviter as any)?.username ?? 'Someone'} wants you to join.
                </Text>
              </View>
            </View>
            <View style={styles.rsvpActions}>
              <TouchableOpacity
                style={[styles.rsvpBtn, styles.rsvpDecline]}
                onPress={() => handleRespond(myPendingInvite.id, 'declined')}
                disabled={!!respondingTo}
              >
                {respondingTo === 'declined' ? (
                  <ActivityIndicator size="small" color={Colors.text.secondary} />
                ) : (
                  <Text style={styles.rsvpDeclineText}>Can't make it</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rsvpBtn, styles.rsvpAccept]}
                onPress={() => handleRespond(myPendingInvite.id, 'accepted')}
                disabled={!!respondingTo}
              >
                {respondingTo === 'accepted' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.rsvpAcceptText}>I'm in! 🎉</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* My RSVP status (if already responded) */}
        {!isCreator && myInvite && myInvite.status !== 'pending' ? (
          <View style={[
            styles.statusBar,
            myInvite.status === 'accepted' ? styles.statusBarGreen : styles.statusBarRed,
          ]}>
            <Ionicons
              name={myInvite.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={myInvite.status === 'accepted' ? Colors.success : Colors.error}
            />
            <Text style={[
              styles.statusBarText,
              { color: myInvite.status === 'accepted' ? Colors.success : Colors.error },
            ]}>
              {myInvite.status === 'accepted' ? "You're going!" : "You can't make it"}
            </Text>
          </View>
        ) : null}

        {/* Attendees card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Who's going ({going.length + (isCreator ? 1 : 0)} / {(plan.invites?.length ?? 0) + 1})
          </Text>

          {/* Creator */}
          {plan.creator ? (
            <AttendeeRow
              profile={plan.creator as Profile}
              label="organizer"
              status="accepted"
            />
          ) : null}

          {/* Going invites */}
          {going.map((invite: PlanInvite) => (
            <AttendeeRow
              key={invite.id}
              profile={invite.invitee as Profile}
              status="accepted"
            />
          ))}

          {/* Waiting */}
          {waiting.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Waiting to hear back ({waiting.length})
              </Text>
              {waiting.map((invite: PlanInvite) => (
                <AttendeeRow
                  key={invite.id}
                  profile={invite.invitee as Profile}
                  status="pending"
                />
              ))}
            </>
          ) : null}

          {/* Declined */}
          {declined.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Can't make it ({declined.length})
              </Text>
              {declined.map((invite: PlanInvite) => (
                <AttendeeRow
                  key={invite.id}
                  profile={invite.invitee as Profile}
                  status="declined"
                />
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const attendeeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    color: Colors.text.secondary,
  },
  username: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    height: 150,
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
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 6,
  },
  metaDate: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  metaText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  rsvpCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
  },
  rsvpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rsvpEmoji: {
    fontSize: 32,
  },
  rsvpTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  rsvpSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  rsvpActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rsvpBtn: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rsvpDecline: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rsvpDeclineText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  rsvpAccept: {
    backgroundColor: Colors.primary,
  },
  rsvpAcceptText: {
    fontSize: Typography.sizes.md,
    color: '#fff',
    fontWeight: Typography.weights.bold,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusBarGreen: {
    backgroundColor: '#D1FAE5',
  },
  statusBarRed: {
    backgroundColor: '#FEE2E2',
  },
  statusBarText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  sectionLabelSpaced: {
    marginTop: Spacing.md,
  },
});
