# 🗄️ Apply Database Schema to Supabase

## Why You Need This:
The signup is failing because the database tables and triggers don't exist yet in your Supabase project.

## Step-by-Step Instructions:

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/sdshhwunbgwjbdflhswh/sql/new

### 2. Copy the Schema
Open the file: `backend/supabase_schema.sql`

**Or copy this entire script:**

```sql
-- RunTrackPro — Supabase PostgreSQL schema

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists postgis;

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null default '',
  bio             text not null default '',
  city            text not null default '',
  avatar_url      text,
  preferred_activity text not null default 'Running',
  fitness_goal_km numeric(6,1) not null default 50,
  units           text not null default 'metric' check (units in ('metric', 'imperial')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0
);

-- Trigger: create a profile row whenever a new auth.user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Activities ───────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  type             text not null check (type in ('Running','Cycling','Walking','Hiking')),
  distance         numeric(8,2) not null default 0,
  duration_seconds integer not null default 0,
  calories         integer not null default 0,
  route_geojson    jsonb,
  created_at       timestamptz not null default now(),
  elevation_gain_m numeric(7,1) not null default 0,
  weather_condition    text,
  temperature_celsius  numeric(4,1),
  wind_speed_kmh       numeric(5,1)
);

create index if not exists activities_user_id_idx on public.activities(user_id);
create index if not exists activities_created_at_idx on public.activities(created_at desc);

-- ─── Likes ────────────────────────────────────────────────────────────────────
create table if not exists public.activity_likes (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (activity_id, user_id)
);

-- ─── Comments ─────────────────────────────────────────────────────────────────
create table if not exists public.activity_comments (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- ─── Friendships ──────────────────────────────────────────────────────────────
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  friend_id  uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id)
);

-- ─── Challenges ───────────────────────────────────────────────────────────────
create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  category    text not null check (category in ('Distance','Time','Community')),
  badge_emoji text not null default '🏅',
  target      numeric(10,2) not null,
  unit        text not null,
  deadline    timestamptz not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.challenge_participants (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  current_value numeric(10,2) not null default 0,
  joined_at     timestamptz not null default now(),
  unique (challenge_id, user_id)
);

-- ─── Achievements ─────────────────────────────────────────────────────────────
create table if not exists public.achievements (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null,
  icon            text not null default '🏆',
  metric          text not null,
  required_value  numeric(10,2) not null
);

create table if not exists public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at      timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- ─── Seed: default achievements ───────────────────────────────────────────────
insert into public.achievements (title, description, icon, metric, required_value) values
  ('First Steps',      'Complete your first activity',  '👟', 'total_activities', 1),
  ('10K Club',         'Run 10km in one session',        '🎯', 'single_run_km',    10),
  ('50km Milestone',   'Log a total of 50km',            '🏆', 'total_distance',   50),
  ('Marathon Runner',  'Complete a marathon distance',   '🥇', 'single_run_km',    42.195),
  ('Century Cyclist',  'Cycle 100km in one ride',        '🚴', 'single_cycle_km',  100),
  ('Iron Will',        'Maintain a 30-day streak',       '💪', 'streak_days',      30)
on conflict do nothing;

-- ─── Seed: sample challenges ──────────────────────────────────────────────────
insert into public.challenges (title, description, category, badge_emoji, target, unit, deadline) values
  ('Run 100km',           'Cover 100km on foot this month',    'Distance',  '🏃', 100,  'km',  (date_trunc('month', now()) + interval '1 month - 1 second')),
  ('June Cycling',        'Rack up 500km on the bike',         'Distance',  '🚴', 500,  'km',  (date_trunc('month', now()) + interval '1 month - 1 second')),
  ('10 Hours Running',    'Log 10 hours of running',           'Time',      '⏱',  600, 'min', (date_trunc('month', now()) + interval '1 month - 1 second')),
  ('Community 5K',        'Participate in a community 5K run', 'Community', '🏅', 5,   'km',  (now() + interval '4 days'))
on conflict do nothing;

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles              enable row level security;
alter table public.activities            enable row level security;
alter table public.activity_likes        enable row level security;
alter table public.activity_comments     enable row level security;
alter table public.friendships           enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.user_achievements     enable row level security;
alter table public.challenges            enable row level security;
alter table public.achievements          enable row level security;

-- Drop existing policies if they exist
drop policy if exists "profiles: public read" on public.profiles;
drop policy if exists "profiles: owner update" on public.profiles;
drop policy if exists "activities: public read" on public.activities;
drop policy if exists "activities: owner insert" on public.activities;
drop policy if exists "activities: owner delete" on public.activities;
drop policy if exists "likes: public read" on public.activity_likes;
drop policy if exists "likes: owner write" on public.activity_likes;
drop policy if exists "likes: owner delete" on public.activity_likes;
drop policy if exists "comments: public read" on public.activity_comments;
drop policy if exists "comments: owner insert" on public.activity_comments;
drop policy if exists "comments: owner delete" on public.activity_comments;
drop policy if exists "challenges: public read" on public.challenges;
drop policy if exists "achievements: public read" on public.achievements;
drop policy if exists "participants: owner insert" on public.challenge_participants;
drop policy if exists "participants: owner delete" on public.challenge_participants;
drop policy if exists "participants: public read" on public.challenge_participants;
drop policy if exists "user_achievements: read" on public.user_achievements;

-- Profiles: anyone authenticated can read; only owner can update
create policy "profiles: public read"  on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = id);

-- Activities: authenticated users can read all; only owner can insert/delete
create policy "activities: public read"   on public.activities for select using (auth.role() = 'authenticated');
create policy "activities: owner insert"  on public.activities for insert with check (auth.uid() = user_id);
create policy "activities: owner delete"  on public.activities for delete using (auth.uid() = user_id);

-- Likes
create policy "likes: public read"   on public.activity_likes for select using (auth.role() = 'authenticated');
create policy "likes: owner write"   on public.activity_likes for insert with check (auth.uid() = user_id);
create policy "likes: owner delete"  on public.activity_likes for delete using (auth.uid() = user_id);

-- Comments
create policy "comments: public read"  on public.activity_comments for select using (auth.role() = 'authenticated');
create policy "comments: owner insert" on public.activity_comments for insert with check (auth.uid() = user_id);
create policy "comments: owner delete" on public.activity_comments for delete using (auth.uid() = user_id);

-- Challenges & participants
create policy "challenges: public read"      on public.challenges             for select using (auth.role() = 'authenticated');
create policy "achievements: public read"    on public.achievements           for select using (auth.role() = 'authenticated');
create policy "participants: owner insert"   on public.challenge_participants for insert with check (auth.uid() = user_id);
create policy "participants: owner delete"   on public.challenge_participants for delete using (auth.uid() = user_id);
create policy "participants: public read"    on public.challenge_participants for select using (auth.role() = 'authenticated');
create policy "user_achievements: read"      on public.user_achievements      for select using (auth.uid() = user_id);
```

### 3. Paste & Run
1. Paste the entire SQL script into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for it to complete (should take 5-10 seconds)

### 4. Verify It Worked
You should see:
- ✅ Green success messages
- ✅ "Query executed successfully"

Check the tables exist:
1. Click **"Table Editor"** in the left sidebar
2. You should see tables: `profiles`, `activities`, `challenges`, `achievements`, etc.

### 5. Enable Email Confirmation (Optional)
Go to: https://supabase.com/dashboard/project/sdshhwunbgwjbdflhswh/auth/providers

Find **"Email"** provider and check:
- ✅ "Enable Email provider" should be ON
- ⚠️ "Confirm email" - Set to OFF for testing (you can enable later)

### 6. Try Signing Up Again!
1. Go to: http://localhost:5173
2. Click **"Sign Up"** tab
3. Use a NEW email (not one you tried before):
   ```
   Email: yourname@gmail.com
   Password: test123456
   ```
4. Click "Create Account"

---

## ✅ It Should Work Now!

If you still get errors, tell me:
1. What error message you see in the browser console (F12)
2. Whether the tables appeared in Table Editor
3. Any error from running the SQL script

---

## 🔍 Common Issues After Running Schema:

### Issue: "relation public.profiles does not exist"
**Solution:** The SQL didn't run. Try running it again.

### Issue: "Email rate limit"
**Solution:** Wait 10 minutes or use a different email address.

### Issue: "duplicate key value violates unique constraint"
**Solution:** The schema is already applied. This is fine - proceed to signup.

---

**Run the schema and let me know what happens!** 🚀
