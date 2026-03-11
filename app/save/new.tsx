import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useSaves } from '@/hooks/useSaves';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { Colors, Spacing, Typography } from '@/constants';
import type { SaveCategory } from '@/types';

export default function NewSaveScreen() {
  const { user } = useAuth();
  const { add } = useSaves(user?.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SaveCategory>('restaurant');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setTitleError('Give this a name');
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="What do you want to do?"
          placeholder="e.g. Nobu Malibu, Coachella, Weekend hike..."
          value={title}
          onChangeText={(t) => { setTitle(t); setTitleError(''); }}
          error={titleError}
          autoFocus
          returnKeyType="next"
          containerStyle={styles.field}
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <CategoryPicker value={category} onChange={setCategory} />
        </View>

        <Input
          label="Location (optional)"
          placeholder="e.g. West Hollywood, CA"
          value={location}
          onChangeText={setLocation}
          returnKeyType="next"
          containerStyle={styles.field}
        />

        <Input
          label="Link (optional)"
          placeholder="https://..."
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          returnKeyType="next"
          containerStyle={styles.field}
        />

        <Input
          label="Notes (optional)"
          placeholder="Why do you want to go? Any details..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          returnKeyType="done"
          style={styles.textArea}
          containerStyle={styles.field}
        />

        <Button label="Save it" onPress={handleSave} loading={saving} style={styles.btn} />
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
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  btn: {
    marginTop: Spacing.xs,
  },
});
