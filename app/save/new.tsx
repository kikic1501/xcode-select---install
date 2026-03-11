import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useSaves } from '@/hooks/useSaves';
import { Button } from '@/components/Button';
import { Colors, Spacing, BorderRadius, Typography, CategoryEmoji, CategoryLabel } from '@/constants';
import type { SaveCategory } from '@/types';

const CATEGORIES: SaveCategory[] = ['restaurant', 'event', 'activity', 'other'];

export default function NewSaveScreen() {
  const { user } = useAuth();
  const { add } = useSaves(user?.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SaveCategory>('restaurant');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Name required', 'Give this save a name.');
      return;
    }
    setSaving(true);
    try {
      await add({
        title: title.trim(),
        category,
        location: location.trim() || undefined,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
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
        <Text style={styles.label}>What do you want to save?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Nobu Malibu, Taylor Swift concert..."
          placeholderTextColor={Colors.text.tertiary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          autoFocus
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

        <Text style={styles.label}>Link (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor={Colors.text.tertiary}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          returnKeyType="next"
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Why do you want to go? Any notes..."
          placeholderTextColor={Colors.text.tertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          returnKeyType="done"
        />

        <Button label="Save it" onPress={handleSave} loading={saving} style={styles.saveBtn} />
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
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
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
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  saveBtn: {
    marginTop: Spacing.xl,
  },
});
