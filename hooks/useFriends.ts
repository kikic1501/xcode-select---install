import { useState, useEffect, useCallback } from 'react';
import {
  getFriends,
  getPendingFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  searchProfiles,
} from '@/lib/api';
import type { Profile, Friendship } from '@/types';

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [f, r] = await Promise.all([
        getFriends(userId),
        getPendingFriendRequests(userId),
      ]);
      setFriends(f);
      setPendingRequests(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function addFriend(addresseeId: string) {
    if (!userId) return;
    await sendFriendRequest(userId, addresseeId);
  }

  async function respond(friendshipId: string, status: 'accepted' | 'declined') {
    await respondToFriendRequest(friendshipId, status);
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    if (status === 'accepted') await load();
  }

  async function search(query: string): Promise<Profile[]> {
    if (!query.trim()) return [];
    return searchProfiles(query);
  }

  return { friends, pendingRequests, loading, error, refresh: load, addFriend, respond, search };
}
