import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { useSaves } from '@/hooks/useSaves';
import { useFriends } from '@/hooks/useFriends';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { CategoryPicker } from '@/components/CategoryPicker';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import type { SaveCategory, Profile } from '@/types';

// Quick date presets
const DATE_PRESETS = [
  { label: 'Tonight', offset: 0, hour: 19 },
  { label: 'This weekend', offset: 5, hour: 14 },  // next saturday
  { label: 'Next week', offset: 7, hour: 19 },
];

function getPresetDate(offset: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function formatPreviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NewPlanScreen() {
  const { user } = useAuth();
  const { add } = usePlans(user?.id);
  const { saves } = useSaves(user?.id);
  const { friends } = useFriends(user?.id);
  const { saveId } = useLocalSearchParams<{ saveId?: string }>();

  const sourceS = saves.find((s) => s.id === saveId);

  const [title, setTitle] = useState(sourceS?.title ?? '');
  const [category, setCategory] = useState<SaveCategory>(sourceS?.category ?? 'restaurant');
  const [location, setLocation] = useState(sourceS?.location ?? '');
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);

  // Errors
  const [titleError, setTitleError] = useState('');
  const [friendError, setFriendError] = useState('');

  useEffect(() => {
    if (sourceS) {
      setTitle(sourceS.title);
      setCategory(sourceS.category);
      setLocation(sourceS.location ?? '');
    }
  }, [sourceS?.id]);

  function toggleFriend(friend: Profile) {
    setFriendError('');
    setSelectedFriends((prev) =>
      prev.find((f) => f.id === friend.id)
        ? prev.filter((f) => f.id !== friend.id)
        : [...prev, friend]
    );
  }

  function selectPreset(offset: number, hour: number) {
    const iso = getPresetDate(offset, hour);
    setScheduledAt(iso);
    setCustomDate('');
  }

  function handleCustomDateChange(text: string) {
    setCustomDate(text);
    // Try parse as user types
    if (text.length >= 10) {
      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) {
        setScheduledAt(parsed.toISOString());
      } else {
        setScheduledAt(null);
      }
    } else {
      setScheduledAt(null);
    }
  }

  async function handleCreate() {
    let valid = true;

    if (!title.trim()) {
      setTitleError('Give the plan a name');
      valid = false;
    }
    if (selectedFriends.length === 0) {
      setFriendError('Invite at least one friend');
      valid = false;
    }
    if (!valid) return;

    setSaving(true);
    try {
      await add({
        title: title.trim(),
        category,
        location: location.trim() || undefined,
        scheduled_at: scheduledAt ?? undefined,
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Source save tag */}
        {sourceS ? (
          <View style={styles.sourceTag}>
            <Ionicons name="bookmark" size={14} color={Colors.primary} />
            <Text style={styles.sourceTagText}>From your saves: {sourceS.title}</Text>
          </View>
        ) : null}

        {/* Plan name */}
        <Input
          label="What's the plan?"
          placeholder="e.g. Dinner at Nobu, Hiking at Runyon..."
          value={title}
          onChangeText={(t) => { setTitle(t); setTitleError(''); }}
          error={titleError}
          autoFocus={!sourceS}
          returnKeyType="next"
          containerStyle={styles.field}
        />

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <CategoryPicker value={category} onChange={setCategory} />
        </View>

        {/* Location */}
        <Input
          label="Where? (optional)"
          placeholder="e.g. Malibu, CA or leave blank"
          value={location}
          onChangeText={setLocation}
          returnKeyType="next"
          containerStyle={styles.field}
        />

        {/* Date & time */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>When?</Text>

          {/* Quick presets */}
          <View style={styles.presetRow}>
            {DATE_PRESETS.map((p) => {
              const iso = getPresetDate(p.offset, p.hour);
              const isSelected = scheduledAt === iso;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => selectPreset(p.offset, p.hour)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom date input */}
          <View style={styles.customDateRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.text.tertiary} />
            <TextInput
              style={styles.customDateInput}
              placeholder="Or type a date: Oct 15, 7pm"
              placeholderTextColor={Colors.text.tertiary}
              value={customDate}
              onChangeText={handleCustomDateChange}
              returnKeyType="done"
            />
          </View>

          {/* Parsed date preview */}
          {scheduledAt ? (
            <View style={styles.datePreview}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.datePreviewText}>{formatPreviewDate(scheduledAt)}</Text>
              <TouchableOpacity onPress={() => { setScheduledAt(null); setCustomDate(''); }}>
                <Ionicons name="close" size={14} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.dateHint}>No date set — you can add one later</Text>
          )}
        </View>

        {/* Invite friends */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, friendError ? styles.fieldLabelError : null]}>
            Invite friends {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
          </Text>
          {friendError ? <Text style={styles.fieldError}>{friendError}</Text> : null}

          {friends.length === 0 ? (
            <View style={styles.noFriendsBox}>
              <Text style={styles.noFriendsText}>
                You need friends to invite! Go to the Friends tab to add some first.
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/friends')}>
                <Text style={styles.noFriendsLink}>Go to Friends →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.friendsGrid}>
              {friends.map((friend) => {
                const selected = !!selectedFriends.find((f) => f.id === friend.id);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[styles.friendChip, selected && styles.friendChipSelected]}
                    onPress={() => toggleFriend(friend)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.friendChipAvatar}>
                      <Avatar
                        uri={friend.avatar_url}
                        name={friend.full_name ?? friend.username}
                        size={32}
                      />
                      {selected ? (
                        <View style={styles.selectedCheck}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[styles.friendChipName, selected && styles.friendChipNameSelected]}
                      numberOfLines={1}
                    >
                      {friend.username}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <Button
          label={saving ? 'Creating...' : 'Create plan & send invites'}
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
    paddingBottom: Spacing.xxl,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sourceTagText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  fieldLabelError: {
    color: Colors.error,
  },
  fieldError: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  presetChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  presetText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  presetTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    marginBottom: Spacing.xs,
  },
  customDateInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    height: 32,
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  datePreviewText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    fontWeight: Typography.weights.medium,
  },
  dateHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    paddingVertical: 4,
  },
  noFriendsBox: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  noFriendsText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  noFriendsLink: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  friendChip: {
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background.primary,
    width: 80,
  },
  friendChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  friendChipAvatar: {
    position: 'relative',
  },
  selectedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  friendChipName: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  friendChipNameSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  createBtn: {
    marginTop: Spacing.sm,
  },
});
