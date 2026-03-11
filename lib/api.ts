// ============================================================
// Recess - Supabase API helpers
// All data-fetching logic lives here, keeping screens clean.
// ============================================================

import { supabase } from './supabase';
import type {
  Profile,
  Save,
  Plan,
  PlanInvite,
  Friendship,
  CreateSaveForm,
  CreatePlanForm,
} from '@/types';

// ---- AUTH ----

export async function signUpWithEmail(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---- PROFILES ----

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

// ---- SAVES ----

export async function getSaves(userId: string): Promise<Save[]> {
  const { data, error } = await supabase
    .from('saves')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createSave(userId: string, form: CreateSaveForm): Promise<Save> {
  const { data, error } = await supabase
    .from('saves')
    .insert({ ...form, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSave(saveId: string) {
  const { error } = await supabase.from('saves').delete().eq('id', saveId);
  if (error) throw error;
}

// ---- PLANS ----

export async function getMyPlans(userId: string): Promise<Plan[]> {
  // Plans I created OR am invited to
  const { data: createdPlans, error: e1 } = await supabase
    .from('plans')
    .select(`
      *,
      creator:profiles!creator_id(*),
      invites:plan_invites(*, invitee:profiles!invitee_id(*))
    `)
    .eq('creator_id', userId)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true });

  if (e1) throw e1;

  const { data: invitedPlanInvites, error: e2 } = await supabase
    .from('plan_invites')
    .select(`
      plan:plans(
        *,
        creator:profiles!creator_id(*),
        invites:plan_invites(*, invitee:profiles!invitee_id(*))
      )
    `)
    .eq('invitee_id', userId)
    .neq('status', 'declined');

  if (e2) throw e2;

  const invitedPlans = (invitedPlanInvites ?? [])
    .map((i) => i.plan)
    .filter(Boolean) as Plan[];

  // Merge + deduplicate
  const all = [...(createdPlans ?? []), ...invitedPlans];
  const seen = new Set<string>();
  return all.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export async function createPlan(
  creatorId: string,
  form: CreatePlanForm
): Promise<Plan> {
  const { invitee_ids, ...planData } = form;

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert({ ...planData, creator_id: creatorId })
    .select()
    .single();
  if (planError) throw planError;

  if (invitee_ids.length > 0) {
    const invites = invitee_ids.map((invitee_id) => ({
      plan_id: plan.id,
      inviter_id: creatorId,
      invitee_id,
    }));
    const { error: inviteError } = await supabase.from('plan_invites').insert(invites);
    if (inviteError) throw inviteError;
  }

  return plan;
}

export async function respondToInvite(inviteId: string, status: 'accepted' | 'declined') {
  const { error } = await supabase
    .from('plan_invites')
    .update({ status })
    .eq('id', inviteId);
  if (error) throw error;
}

export async function getPendingInvites(userId: string): Promise<PlanInvite[]> {
  const { data, error } = await supabase
    .from('plan_invites')
    .select(`
      *,
      plan:plans(*),
      inviter:profiles!inviter_id(*)
    `)
    .eq('invitee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---- FRIENDS ----

export async function getFriends(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      requester:profiles!requester_id(*),
      addressee:profiles!addressee_id(*)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');
  if (error) throw error;

  return (data ?? []).map((f: any) =>
    f.requester.id === userId ? f.addressee : f.requester
  );
}

export async function getPendingFriendRequests(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select(`*, requester:profiles!requester_id(*)`)
    .eq('addressee_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  return data ?? [];
}

export async function sendFriendRequest(requesterId: string, addresseeId: string) {
  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId });
  if (error) throw error;
}

export async function respondToFriendRequest(
  friendshipId: string,
  status: 'accepted' | 'declined'
) {
  const { error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId);
  if (error) throw error;
}
