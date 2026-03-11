import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useSaves } from '@/hooks/useSaves';
import { SaveCard } from '@/components/SaveCard';
import { Colors, Spacing, Typography, BorderRadius, CategoryLabel } from '@/constants';
import type { SaveCategory } from '@/types';

const CATEGORIES: (SaveCategory | 'all')[] = ['all', 'restaurant', 'event', 'activity', 'other'];

export default function SavesScreen() {
  const { user } = useAuth();
  const { saves, loading, refresh, remove } = useSaves(user?.id);
  const [filter, setFilter] = useState<SaveCategory | 'all'>('all');

  const filtered = filter === 'all' ? saves : saves.filter((s) => s.category === filter);

  function confirmDelete(saveId: string, title: string) {
    Alert.alert('Remove save', `Remove "${title}" from your saves?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(saveId) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/save/new')}
        >
          <Text style={styles.addBtnText}>+ Save</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter chips */}
      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, filter === cat && styles.chipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>
              {cat === 'all' ? 'All' : CategoryLabel[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SaveCard
            save={item}
            onMakePlan={() =>
              router.push({ pathname: '/plan/new', params: { saveId: item.id } })
            }
            onPress={() =>
              Alert.alert(item.title, item.notes ?? item.description ?? '', [
                { text: 'Close', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => confirmDelete(item.id, item.title),
                },
              ])
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔖</Text>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "+ Save" to add restaurants, events, or activities you want to do.
            </Text>
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
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.tertiary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  list: {
    padding: Spacing.md,
    flexGrow: 1,
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
  },
});
