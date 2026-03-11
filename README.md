# 🎉 Recess

> Turn "we should do that sometime" into real plans.

Recess helps friends discover and plan things to do together — restaurants, events, activities. Save ideas, invite friends, lock in a date.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile | React Native + Expo SDK 51 | Zero native config, iOS + Android from one codebase |
| Navigation | Expo Router (file-based) | Feels like Next.js, typed routes |
| Backend | Supabase | Auth + PostgreSQL + Realtime + Storage, generous free tier |
| Language | TypeScript | Type safety without ceremony |
| Styling | StyleSheet (RN built-in) | No dependencies, fast |

---

## App Architecture

```
recess/
├── app/                    # Expo Router screens (file = route)
│   ├── _layout.tsx         # Root layout + auth guard
│   ├── (auth)/             # Unauthenticated screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/             # Main tab navigation
│   │   ├── home.tsx        # Upcoming plans + invite banners
│   │   ├── saves.tsx       # Saved places/events
│   │   ├── friends.tsx     # Friends list + search + requests
│   │   └── profile.tsx     # User profile + stats + settings
│   ├── plan/
│   │   ├── new.tsx         # Create plan modal
│   │   └── [id].tsx        # Plan detail + RSVP
│   └── save/
│       └── new.tsx         # Save item modal
│
├── components/             # Shared UI components
│   ├── Avatar.tsx
│   ├── Button.tsx
│   ├── PlanCard.tsx
│   └── SaveCard.tsx
│
├── hooks/                  # Data-fetching hooks (state + API)
│   ├── useAuth.ts
│   ├── useSaves.ts
│   ├── usePlans.ts
│   └── useFriends.ts
│
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── api.ts              # All DB query functions
│
├── types/index.ts          # TypeScript interfaces
├── constants/index.ts      # Colors, spacing, typography
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Database Schema

```
profiles          → extends auth.users
saves             → items users want to do
plans             → saves turned into concrete plans
plan_invites      → who's invited + RSVP status
friendships       → friend requests + accepted friends
```

All tables use Row Level Security (RLS) — users only see their own data and plans they're invited to.

---

## Core User Flows

### 1. Save → Plan → Done
```
Save tab → "+ Save" → Fill in name/category/location
Saves tab → tap "Make it a plan →" on any save
Create Plan modal → set date + invite friends → Create
Friends receive invite on Home tab → Accept/Decline
Everyone sees upcoming plan on Home tab
```

### 2. Fresh Plan
```
Home tab → "+ New Plan" → fill in details + invite friends
```

### 3. Add Friends
```
Friends tab → search by username → send request
Friend sees request in Friends tab → accepts
Both can now invite each other to plans
```

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd recess
npm install
```

### 2. Create Supabase project

1. Go to [app.supabase.com](https://app.supabase.com) → New project
2. Open SQL Editor → paste contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to Settings → API → copy your **Project URL** and **anon public key**

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 4. Run

```bash
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

---

## Supabase Auth Setup

In your Supabase dashboard:
1. **Authentication → Providers** — Email is enabled by default ✓
2. **Authentication → URL Configuration** — Add `recess://` as a redirect URL for deep links
3. (Optional) Disable "Confirm email" for faster testing: Authentication → Settings → uncheck "Enable email confirmations"

---

## MVP Screens

| Screen | Route | Purpose |
|---|---|---|
| Login | `/(auth)/login` | Email/password sign in |
| Sign Up | `/(auth)/signup` | Create account |
| Plans (Home) | `/(tabs)/home` | Upcoming plans + invite banners |
| Saved | `/(tabs)/saves` | Browseable saves with category filter |
| Friends | `/(tabs)/friends` | Friend list, requests, search |
| Profile | `/(tabs)/profile` | Stats, settings, sign out |
| Plan Detail | `/plan/[id]` | Full plan view + RSVP |
| New Plan | `/plan/new` | Create plan modal |
| New Save | `/save/new` | Save something modal |

---

## What's Next (Post-MVP)

- [ ] Push notifications (Expo Notifications + Supabase Edge Functions)
- [ ] Date picker (replace text input with a proper date picker)
- [ ] Share sheets — save from any app via Share Extension
- [ ] Plan comments/chat
- [ ] Photo uploads (Supabase Storage)
- [ ] Google Places autocomplete for location
- [ ] Recurring plans
- [ ] Group discovery feed (see what friends are saving)
