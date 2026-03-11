-- ============================================================
-- Recess MVP Database Schema
-- ============================================================
-- Run this in Supabase SQL Editor to set up your database.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- Extends Supabase auth.users with app-specific data
-- ============================================================
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- FRIENDS
-- Bidirectional friendship with pending/accepted states
-- ============================================================
create type friend_status as enum ('pending', 'accepted', 'declined');

create table public.friendships (
  id          uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status      friend_status default 'pending' not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

-- ============================================================
-- SAVES
-- Items users have saved (restaurants, events, activities)
-- ============================================================
create type save_category as enum ('restaurant', 'event', 'activity', 'other');

create table public.saves (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  description text,
  category    save_category default 'other' not null,
  image_url   text,
  location    text,
  address     text,
  url         text,              -- original link user saved from
  notes       text,              -- personal note from user
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ============================================================
-- PLANS
-- A save turned into a concrete plan with date/time
-- ============================================================
create type plan_status as enum ('draft', 'active', 'completed', 'cancelled');

create table public.plans (
  id           uuid default uuid_generate_v4() primary key,
  save_id      uuid references public.saves(id) on delete set null,
  creator_id   uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  description  text,
  category     save_category default 'other' not null,
  image_url    text,
  location     text,
  address      text,
  scheduled_at timestamptz,     -- when the plan happens
  status       plan_status default 'active' not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- ============================================================
-- PLAN INVITES
-- Who's been invited and their RSVP status
-- ============================================================
create type invite_status as enum ('pending', 'accepted', 'declined');

create table public.plan_invites (
  id         uuid default uuid_generate_v4() primary key,
  plan_id    uuid references public.plans(id) on delete cascade not null,
  inviter_id uuid references public.profiles(id) on delete cascade not null,
  invitee_id uuid references public.profiles(id) on delete cascade not null,
  status     invite_status default 'pending' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (plan_id, invitee_id),
  check (inviter_id <> invitee_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.friendships  enable row level security;
alter table public.saves        enable row level security;
alter table public.plans        enable row level security;
alter table public.plan_invites enable row level security;

-- Profiles: anyone can read, only you can update yours
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Saves: private to owner
create policy "Users can CRUD own saves"
  on public.saves for all using (auth.uid() = user_id);

-- Friendships: visible to both parties
create policy "Users can view their friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Addressee can update friendship status"
  on public.friendships for update
  using (auth.uid() = addressee_id or auth.uid() = requester_id);

create policy "Users can delete their friendships"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Plans: creator can manage, invitees can read
create policy "Creator can manage their plans"
  on public.plans for all using (auth.uid() = creator_id);

create policy "Invitees can view plans they're invited to"
  on public.plans for select
  using (
    exists (
      select 1 from public.plan_invites
      where plan_id = plans.id and invitee_id = auth.uid()
    )
  );

-- Plan invites: creator manages, invitee can update status
create policy "Creator can manage plan invites"
  on public.plan_invites for all using (auth.uid() = inviter_id);

create policy "Invitee can view their invites"
  on public.plan_invites for select using (auth.uid() = invitee_id);

create policy "Invitee can respond to their invites"
  on public.plan_invites for update using (auth.uid() = invitee_id);

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Friends list (accepted friendships in both directions)
create view public.friends as
  select
    requester_id as user_id,
    addressee_id as friend_id
  from public.friendships where status = 'accepted'
  union all
  select
    addressee_id as user_id,
    requester_id as friend_id
  from public.friendships where status = 'accepted';

-- My plans (created + invited)
create view public.my_plans as
  select
    p.*,
    pi.status   as invite_status,
    pi.invitee_id
  from public.plans p
  left join public.plan_invites pi on pi.plan_id = p.id;

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.friendships
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.saves
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.plans
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.plan_invites
  for each row execute procedure public.set_updated_at();
