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
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { Avatar } from '@/components/Avatar';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants';
import type { Profile, Friendship } from '@/types';

export default function FriendsScreen() {
  const { user } = useAuth();
  const { friends, pendingRequests, loading, refresh, addFriend, respond, search } =
    useFriends(user?.id);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(text: string) {
    setQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await search(text);
      // Exclude self and existing friends
      const friendIds = new Set(friends.map((f) => f.id));
      setSearchResults(
        results.filter((p) => p.id !== user?.id && !friendIds.has(p.id))
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleAddFriend(profile: Profile) {
    try {
      await addFriend(profile.id);
      Alert.alert('Request sent', `Friend request sent to ${profile.username}!`);
      setQuery('');
      setSearchResults([]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  function renderFriendRequest({ item }: { item: Friendship }) {
    const requester = item.requester as any as Profile;
    return (
      <View style={styles.requestCard}>
        <Avatar uri={requester?.avatar_url} name={requester?.full_name ?? requester?.username} size={44} />
        <View style={styles.requestInfo}>
          <Text style={styles.name}>{requester?.full_name ?? requester?.username}</Text>
          <Text style={styles.username}>@{requester?.username}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.declineBtn]}
            onPress={() => respond(item.id, 'declined')}
          >
            <Text style={styles.declineBtnText}>Ignore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => respond(item.id, 'accepted')}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderFriend({ item }: { item: Profile }) {
    return (
      <View style={styles.friendRow}>
        <Avatar uri={item.avatar_url} name={item.full_name ?? item.username} size={44} />
        <View style={styles.friendInfo}>
          <Text style={styles.name}>{item.full_name ?? item.username}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </View>
    );
  }

  const isSearching = query.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={Colors.text.tertiary}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator style={styles.searchSpinner} color={Colors.primary} />}
      </View>

      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendRow}>
              <Avatar uri={item.avatar_url} name={item.full_name ?? item.username} size={44} />
              <View style={styles.friendInfo}>
                <Text style={styles.name}>{item.full_name ?? item.username}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddFriend(item)}
              >
                <Text style={styles.addBtnText}>Add</Text>
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
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          ListHeaderComponent={
            pendingRequests.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Requests ({pendingRequests.length})
                </Text>
                {pendingRequests.map((req) => renderFriendRequest({ item: req }))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            pendingRequests.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyTitle}>No friends yet</Text>
                <Text style={styles.emptySubtitle}>
                  Search for friends by username above.
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.list}
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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    backgroundColor: Colors.background.tertiary,
  },
  searchSpinner: {
    marginLeft: Spacing.sm,
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
  requestCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  declineBtn: {
    backgroundColor: Colors.background.tertiary,
  },
  declineBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    fontSize: Typography.sizes.xs,
    color: '#fff',
    fontWeight: Typography.weights.semibold,
  },
  friendRow: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  username: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
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
