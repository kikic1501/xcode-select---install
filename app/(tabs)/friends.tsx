import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants';
import type { Profile, Friendship } from '@/types';

export default function FriendsScreen() {
  const { user } = useAuth();
  const { friends, pendingRequests, loading, refresh, addFriend, respond, search } =
    useFriends(user?.id);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function handleSearch(text: string) {
    setQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const friendIds = new Set(friends.map((f) => f.id));
      const results = await search(text);
      setSearchResults(results.filter((p) => p.id !== user?.id && !friendIds.has(p.id)));
    } finally {
      setSearching(false);
    }
  }

  async function handleAddFriend(profile: Profile) {
    setAddingId(profile.id);
    try {
      await addFriend(profile.id);
      Alert.alert('Request sent!', `Friend request sent to @${profile.username}.`);
      setQuery('');
      setSearchResults([]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setAddingId(null);
    }
  }

  const isSearching = query.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        {friends.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{friends.length}</Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find friends by username..."
          placeholderTextColor={Colors.text.tertiary}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searching && <ActivityIndicator size="small" color={Colors.primary} style={styles.searchSpinner} />}
        {query.length > 0 && !searching && (
          <TouchableOpacity onPress={() => { setQuery(''); setSearchResults([]); }}>
            <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {isSearching ? (
        /* Search results */
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar uri={item.avatar_url} name={item.full_name ?? item.username} size={44} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.full_name ?? item.username}</Text>
                <Text style={styles.rowSub}>@{item.username}</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, styles.addBtn]}
                onPress={() => handleAddFriend(item)}
                disabled={addingId === item.id}
              >
                {addingId === item.id ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.addBtnText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            !searching ? (
              <Text style={styles.noResults}>No users found for "{query}"</Text>
            ) : null
          }
          contentContainerStyle={styles.list}
        />
      ) : (
        /* Friends list + pending requests */
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Profile }) => (
            <View style={styles.row}>
              <Avatar uri={item.avatar_url} name={item.full_name ?? item.username} size={44} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.full_name ?? item.username}</Text>
                <Text style={styles.rowSub}>@{item.username}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          )}
          ListHeaderComponent={
            pendingRequests.length > 0 ? (
              <View style={styles.requestsSection}>
                <SectionHeader title="Requests" count={pendingRequests.length} />
                {pendingRequests.map((req: Friendship) => {
                  const requester = req.requester as any as Profile;
                  return (
                    <View key={req.id} style={styles.requestCard}>
                      <Avatar
                        uri={requester?.avatar_url}
                        name={requester?.full_name ?? requester?.username}
                        size={44}
                      />
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName}>
                          {requester?.full_name ?? requester?.username}
                        </Text>
                        <Text style={styles.rowSub}>@{requester?.username}</Text>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.ignoreBtn]}
                          onPress={() => respond(req.id, 'declined')}
                        >
                          <Text style={styles.ignoreBtnText}>Ignore</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() => respond(req.id, 'accepted')}
                        >
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null
          }
          ListEmptyComponent={
            pendingRequests.length === 0 ? (
              <EmptyState
                emoji="👥"
                title="No friends yet"
                subtitle="Search for friends by their username and send them a request."
              />
            ) : null
          }
          contentContainerStyle={[styles.list, friends.length === 0 && pendingRequests.length === 0 && styles.listEmpty]}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />
          }
        />
      )}
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
    alignItems: 'center',
    gap: Spacing.sm,
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
  countBadge: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
  },
  searchSpinner: {
    marginLeft: 4,
  },
  list: {
    padding: Spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  requestsSection: {
    marginBottom: Spacing.lg,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  rowName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  rowSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    minWidth: 60,
    alignItems: 'center',
  },
  ignoreBtn: {
    backgroundColor: Colors.background.tertiary,
  },
  ignoreBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    fontSize: Typography.sizes.sm,
    color: '#fff',
    fontWeight: Typography.weights.semibold,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
  },
  addBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  noResults: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: Spacing.xl,
    fontSize: Typography.sizes.md,
  },
});
