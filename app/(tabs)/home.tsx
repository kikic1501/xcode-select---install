import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { useSaves } from '@/hooks/useSaves';
import { PlanCard } from '@/components/PlanCard';
import { InviteBanner } from '@/components/InviteBanner';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants';
import type { Plan, PlanInvite } from '@/types';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { plans, pendingInvites, loading, refresh, respond } = usePlans(user?.id);
  const { saves } = useSaves(user?.id);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const upcoming = plans
    .filter((p) => p.status === 'active' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

  const unscheduled = plans.filter((p) => p.status === 'active' && !p.scheduled_at);
  const allPlans: Plan[] = [...upcoming, ...unscheduled];

  async function handleRespond(inviteId: string, status: 'accepted' | 'declined') {
    setRespondingId(inviteId);
    try {
      await respond(inviteId, status);
    } finally {
      setRespondingId(null);
    }
  }

  function renderEmptyState() {
    if (saves.length === 0) {
      return (
        <EmptyState
          emoji="🔖"
          title="Start by saving something"
          subtitle="Find a restaurant, event, or activity you want to do — then turn it into a real plan with friends."
          actionLabel="Save something"
          onAction={() => router.push('/save/new')}
        />
      );
    }
    return (
      <EmptyState
        emoji="📅"
        title="No plans yet"
        subtitle="You've saved some great ideas. Pick one and make it a real plan with friends."
        actionLabel="Make a plan"
        onAction={() => router.push('/plan/new')}
        secondaryActionLabel="Browse saves"
        onSecondaryAction={() => router.push('/(tabs)/saves')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {profile?.username ?? 'there'} 👋</Text>
          <Text style={styles.subtitle}>Your plans</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/plan/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>New plan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Plan }) => (
          <PlanCard
            plan={item}
            currentUserId={user?.id ?? ''}
            onPress={() => router.push(`/plan/${item.id}`)}
          />
        )}
        ListHeaderComponent={
          <>
            {pendingInvites.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Invites" count={pendingInvites.length} />
                {pendingInvites.map((invite: PlanInvite) => (
                  <InviteBanner
                    key={invite.id}
                    invite={invite}
                    loading={respondingId === invite.id}
                    onAccept={() => handleRespond(invite.id, 'accepted')}
                    onDecline={() => handleRespond(invite.id, 'declined')}
                  />
                ))}
              </View>
            )}
            {allPlans.length > 0 && (
              <SectionHeader
                title={upcoming.length > 0 ? 'Upcoming' : 'Plans'}
                count={allPlans.length}
              />
            )}
          </>
        }
        ListEmptyComponent={renderEmptyState()}
        contentContainerStyle={[styles.list, allPlans.length === 0 && styles.listEmpty]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  newBtnText: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
  },
  list: {
    padding: Spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
});
