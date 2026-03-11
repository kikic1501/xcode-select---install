import React from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { PlanCard } from '@/components/PlanCard';
import { Button } from '@/components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants';
import type { Plan, PlanInvite } from '@/types';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { plans, pendingInvites, loading, refresh, respond } = usePlans(user?.id);

  const upcoming = plans
    .filter((p) => p.status === 'active' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

  const unscheduled = plans.filter((p) => p.status === 'active' && !p.scheduled_at);

  function renderInviteBanner({ item }: { item: PlanInvite }) {
    return (
      <View style={styles.inviteBanner}>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteFrom}>
            {(item.inviter as any)?.username ?? 'Someone'} invited you to
          </Text>
          <Text style={styles.inviteTitle} numberOfLines={1}>
            {(item.plan as any)?.title ?? 'a plan'}
          </Text>
        </View>
        <View style={styles.inviteActions}>
          <TouchableOpacity
            style={[styles.inviteBtn, styles.declineBtn]}
            onPress={() => respond(item.id, 'declined')}
          >
            <Text style={styles.declineBtnText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inviteBtn, styles.acceptBtn]}
            onPress={() => respond(item.id, 'accepted')}
          >
            <Text style={styles.acceptBtnText}>I'm in!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hey {profile?.username ?? 'there'} 👋
          </Text>
          <Text style={styles.subtitle}>Your upcoming plans</Text>
        </View>
        <TouchableOpacity
          style={styles.newPlanBtn}
          onPress={() => router.push('/plan/new')}
        >
          <Text style={styles.newPlanBtnText}>+ New Plan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...upcoming, ...unscheduled]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
                <Text style={styles.sectionTitle}>
                  Invites ({pendingInvites.length})
                </Text>
                {pendingInvites.map((invite) => renderInviteBanner({ item: invite }))}
              </View>
            )}
            {plans.length > 0 && (
              <Text style={styles.sectionTitle}>Upcoming</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptySubtitle}>
              Save something interesting, then turn it into a plan with friends.
            </Text>
            <Button
              label="Browse your saves"
              onPress={() => router.push('/(tabs)/saves')}
              variant="secondary"
              style={styles.emptyBtn}
            />
          </View>
        }
        contentContainerStyle={styles.list}
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
    paddingVertical: Spacing.md,
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
    marginTop: 2,
  },
  newPlanBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  newPlanBtnText: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
  },
  list: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inviteBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  inviteFrom: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
  },
  inviteTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inviteBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  declineBtn: {
    backgroundColor: Colors.background.primary,
  },
  declineBtnText: {
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.sm,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  emptyBtn: { alignSelf: 'center' },
});
