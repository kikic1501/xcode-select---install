// ============================================================
// Recess - Core TypeScript Types
// ============================================================

export type SaveCategory = 'restaurant' | 'event' | 'activity' | 'other';
export type PlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type InviteStatus = 'pending' | 'accepted' | 'declined';
export type FriendStatus = 'pending' | 'accepted' | 'declined';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Save {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: SaveCategory;
  image_url: string | null;
  location: string | null;
  address: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  save_id: string | null;
  creator_id: string;
  title: string;
  description: string | null;
  category: SaveCategory;
  image_url: string | null;
  location: string | null;
  address: string | null;
  scheduled_at: string | null;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: Profile;
  invites?: PlanInvite[];
}

export interface PlanInvite {
  id: string;
  plan_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  invitee?: Profile;
  inviter?: Profile;
  plan?: Plan;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  requester?: Profile;
  addressee?: Profile;
}

// Convenience type for a friend (profile + friendship metadata)
export interface Friend {
  profile: Profile;
  friendship_id: string;
  status: FriendStatus;
  is_requester: boolean;
}

// Form types
export interface CreateSaveForm {
  title: string;
  description?: string;
  category: SaveCategory;
  image_url?: string;
  location?: string;
  address?: string;
  url?: string;
  notes?: string;
}

export interface CreatePlanForm {
  title: string;
  description?: string;
  category: SaveCategory;
  image_url?: string;
  location?: string;
  address?: string;
  scheduled_at?: string;
  save_id?: string;
  invitee_ids: string[];
}
