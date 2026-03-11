import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useSaves } from '@/hooks/useSaves';
import { SaveCard } from '@/components/SaveCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors, Spacing, Typography, BorderRadius, CategoryEmoji, CategoryLabel } from '@/constants';
import type { SaveCategory } from '@/types';

const FILTERS: (SaveCategory | 'all')[] = ['all', 'restaurant', 'event', 'activity', 'other'];

const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  restaurant: `${CategoryEmoji.restaurant} Restaurants`,
  event: `${CategoryEmoji.event} Events`,
  activity: `${CategoryEmoji.activity} Activities`,
  other: `${CategoryEmoji.other} Other`,
};

export default function SavesScreen() {
  const { user } = useAuth();
  const { saves, loading, refresh, remove } = useSaves(user?.id);
  const [filter, setFilter] = useState<SaveCategory | 'all'>('all');

  const filtered = filter === 'all' ? saves : saves.filter((s) => s.category === filter);

  function confirmDelete(saveId: string, title: string) {
    Alert.alert(
      'Remove save',
      `Remove "${title}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => remove(saveId) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/save/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, filter === cat && styles.chipActive]}
              onPress={() => setFilter(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>
                {FILTER_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SaveCard
            save={item}
            onPress={() =>
              Alert.alert(
                item.title,
                item.notes ?? item.description ?? 'No notes added.',
                [
                  { text: 'Close', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => confirmDelete(item.id, item.title),
                  },
                ]
              )
            }
            onMakePlan={() =>
              router.push({ pathname: '/plan/new', params: { saveId: item.id } })
            }
          />
        )}
        ListHeaderComponent={
          saves.length > 0 ? (
            <SectionHeader
              title={filter === 'all' ? 'All saves' : CategoryLabel[filter] + 's'}
              count={filtered.length}
            />
          ) : null
        }
        ListEmptyComponent={
          saves.length === 0 ? (
            <EmptyState
              emoji="🔖"
              title="Nothing saved yet"
              subtitle="Tap Save to add restaurants, events, or activities you want to do with friends."
              actionLabel="Save something"
              onAction={() => router.push('/save/new')}
            />
          ) : (
            <Text style={styles.noResults}>No {filter}s saved yet.</Text>
          )
        }
        contentContainerStyle={[styles.list, saves.length === 0 && styles.listEmpty]}
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
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
  },
  filterWrapper: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.tertiary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
  },
  list: {
    padding: Spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  noResults: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: Spacing.xl,
    fontSize: Typography.sizes.md,
  },
});
