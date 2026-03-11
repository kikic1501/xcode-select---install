import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { useSaves } from '@/hooks/useSaves';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji, CategoryLabel } from '@/constants';
import type { SaveCategory, Profile } from '@/types';

const CATEGORIES: SaveCategory[] = ['restaurant', 'event', 'activity', 'other'];

export default function NewPlanScreen() {
  const { user } = useAuth();
  const { add } = usePlans(user?.id);
  const { saves } = useSaves(user?.id);
  const { friends } = useFriends(user?.id);
  const { saveId } = useLocalSearchParams<{ saveId?: string }>();

  // Pre-fill from save if coming from saves tab
  const sourceS = saves.find((s) => s.id === saveId);

  const [title, setTitle] = useState(sourceS?.title ?? '');
  const [category, setCategory] = useState<SaveCategory>(sourceS?.category ?? 'restaurant');
  const [location, setLocation] = useState(sourceS?.location ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sourceS) {
      setTitle(sourceS.title);
      setCategory(sourceS.category);
      setLocation(sourceS.location ?? '');
    }
  }, [sourceS?.id]);

  function toggleFriend(friend: Profile) {
    setSelectedFriends((prev) =>
      prev.find((f) => f.id === friend.id)
        ? prev.filter((f) => f.id !== friend.id)
        : [...prev, friend]
    );
  }

  async function handleCreate() {
    if (!title.trim()) {
      Alert.alert('Name required', 'Give the plan a name.');
      return;
    }
    if (selectedFriends.length === 0) {
      Alert.alert('Invite someone', 'Add at least one friend to this plan.');
      return;
    }

    // Parse date + time into ISO string
    let scheduled_at: string | undefined;
    if (date.trim()) {
      try {
        const dt = time.trim() ? new Date(`${date}T${time}`) : new Date(date);
        if (isNaN(dt.getTime())) throw new Error('bad date');
        scheduled_at = dt.toISOString();
      } catch {
        Alert.alert('Invalid date', 'Use format: YYYY-MM-DD and HH:MM (optional)');
        return;
      }
    }

    setSaving(true);
    try {
      await add({
        title: title.trim(),
        category,
        location: location.trim() || undefined,
        scheduled_at,
        save_id: saveId,
        invitee_ids: selectedFriends.map((f) => f.id),
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {sourceS && (
          <View style={styles.sourceTag}>
            <Text style={styles.sourceTagText}>
              📌 From your saves: {sourceS.title}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Plan name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dinner at Nobu"
          placeholderTextColor={Colors.text.tertiary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          autoFocus={!sourceS}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryEmoji}>{CategoryEmoji[cat]}</Text>
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {CategoryLabel[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Location (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Malibu, CA"
          placeholderTextColor={Colors.text.tertiary}
          value={location}
          onChangeText={setLocation}
          returnKeyType="next"
        />

        <Text style={styles.label}>Date (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD (e.g. 2025-08-15)"
          placeholderTextColor={Colors.text.tertiary}
          value={date}
          onChangeText={setDate}
          returnKeyType="next"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Time (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM (e.g. 19:30)"
          placeholderTextColor={Colors.text.tertiary}
          value={time}
          onChangeText={setTime}
          returnKeyType="done"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>
          Invite friends ({selectedFriends.length} selected)
        </Text>
        {friends.length === 0 ? (
          <Text style={styles.noFriends}>
            Add friends first in the Friends tab.
          </Text>
        ) : (
          <View style={styles.friendsGrid}>
            {friends.map((friend) => {
              const selected = !!selectedFriends.find((f) => f.id === friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[styles.friendChip, selected && styles.friendChipSelected]}
                  onPress={() => toggleFriend(friend)}
                >
                  <Avatar uri={friend.avatar_url} name={friend.full_name ?? friend.username} size={32} />
                  <Text style={[styles.friendChipText, selected && styles.friendChipTextSelected]}>
                    {friend.username}
                  </Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Button
          label="Create plan & invite"
          onPress={handleCreate}
          loading={saving}
          style={styles.createBtn}
        />
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
  sourceTag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sourceTagText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    minHeight: 48,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryEmoji: { fontSize: 16 },
  categoryText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  noFriends: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  friendChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  friendChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  friendChipTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  checkmark: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  createBtn: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
});
