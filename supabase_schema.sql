-- ========================================================================
-- SafeSafar: PostgreSQL Database Schema for Supabase
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  role text default 'commuter' check (role in ('commuter', 'guardian', 'civic')),
  hub text default 'SVNIT Surat Hub',
  avatar_url text,
  normal_pin text default '1234',
  duress_pin text default '9999',
  secret_safe_word text default 'reach soon',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GUARDIANS TABLE (Each user has their own safety circle of guardians)
create table if not exists public.guardians (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  relation text not null,
  phone text not null,
  email text,
  is_emergency_alert boolean default true,
  is_primary boolean default false,
  avatar text,
  battery_status integer default 90,
  last_active text default 'Active now',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LANDMARKS TABLE (Safe Havens, Police Booths, Pink Booths)
create table if not exists public.landmarks (
  id text primary key,
  name text not null,
  type text not null check (type in ('police', 'pink_booth', 'hospital', 'pharmacy', 'safe_haven')),
  lat double precision not null,
  lng double precision not null,
  address text,
  phone text,
  open_hours text default '24/7 Open',
  verified boolean default true,
  distance_meters integer default 150,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INCIDENTS TABLE (Community Safety & Harassment Reports)
create table if not exists public.incidents (
  id text primary key,
  type text not null check (type in ('poor_lighting', 'harassment', 'deserted', 'suspicious', 'blocked_path', 'well_lit')),
  severity text default 'medium' check (severity in ('low', 'medium', 'high', 'safe')),
  lat double precision not null,
  lng double precision not null,
  title text not null,
  description text,
  timestamp_str text,
  confirmations integer default 1,
  required_confirmations integer default 3,
  verified boolean default false,
  decay_hours_left integer default 48,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices for performance
create index if not exists guardians_user_id_idx on public.guardians (user_id);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists landmarks_type_idx on public.landmarks (type);
create index if not exists incidents_created_idx on public.incidents (created_at desc);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

alter table public.profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.landmarks enable row level security;
alter table public.incidents enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Guardians
create policy "Users can view own guardians" on public.guardians for select using (auth.uid() = user_id);
create policy "Users can insert own guardians" on public.guardians for insert with check (auth.uid() = user_id);
create policy "Users can update own guardians" on public.guardians for update using (auth.uid() = user_id);
create policy "Users can delete own guardians" on public.guardians for delete using (auth.uid() = user_id);

-- Landmarks & Incidents (Public Read for all users)
create policy "Anyone can view landmarks" on public.landmarks for select using (true);
create policy "Anyone can view incidents" on public.incidents for select using (true);
create policy "Authenticated users can insert incidents" on public.incidents for insert with check (true);

-- ========================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'SafeSafar User'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'commuter'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
