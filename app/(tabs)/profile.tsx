import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useSaves } from '@/hooks/useSaves';
import { usePlans } from '@/hooks/usePlans';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { signOut } from '@/lib/api';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants';

export default function ProfileScreen() {
  const { user, profile } = useAuth();
  const { saves } = useSaves(user?.id);
  const { plans } = usePlans(user?.id);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await signOut();
        },
      },
    ]);
  }

  const upcomingPlans = plans.filter(
    (p) => p.status === 'active' && p.scheduled_at && new Date(p.scheduled_at) > new Date()
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile header */}
        <View style={styles.profileCard}>
          <Avatar
            uri={profile?.avatar_url}
            name={profile?.full_name ?? profile?.username}
            size={80}
          />
          <Text style={styles.displayName}>{profile?.full_name ?? profile?.username}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{saves.length}</Text>
            <Text style={styles.statLabel}>Saves</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{upcomingPlans.length}</Text>
            <Text style={styles.statLabel}>Upcoming plans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{plans.length}</Text>
            <Text style={styles.statLabel}>Total plans</Text>
          </View>
        </View>

        {/* Settings section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingsRow}>
            <Text style={styles.settingsRowText}>Edit profile</Text>
            <Text style={styles.settingsRowChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow}>
            <Text style={styles.settingsRowText}>Notifications</Text>
            <Text style={styles.settingsRowChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow}>
            <Text style={styles.settingsRowText}>Privacy</Text>
            <Text style={styles.settingsRowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Button
            label="Sign out"
            onPress={handleSignOut}
            variant="ghost"
            loading={signingOut}
          />
        </View>

        <Text style={styles.version}>Recess v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scroll: {
    padding: Spacing.md,
  },
  profileCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  displayName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  username: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  email: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  statsRow: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  section: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  settingsRowText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
  },
  settingsRowChevron: {
    fontSize: Typography.sizes.xl,
    color: Colors.text.tertiary,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
