-- Supabase Database Schema for Bloom
-- Copy and run these SQL statements in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  streak INTEGER DEFAULT 0,
  companion_plant_stage TEXT,
  seed_type TEXT,
  smoking_profile JSONB,
  settings JSONB,
  last_simulated_date TEXT
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- 2. Create Smoking Records (Logs) Table
CREATE TABLE IF NOT EXISTS public.smoking_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  habit TEXT NOT NULL,
  consumed BOOLEAN NOT NULL,
  quantity INTEGER DEFAULT 0,
  reason TEXT,
  solution TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Smoking Records
ALTER TABLE public.smoking_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Smoking Records
CREATE POLICY "Users can manage their own smoking records"
  ON public.smoking_records FOR ALL
  USING (auth.uid() = user_id);


-- 3. Create Diary Entries (Journals) Table
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Diary Entries
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Diary Entries
CREATE POLICY "Users can manage their own diary entries"
  ON public.diary_entries FOR ALL
  USING (auth.uid() = user_id);
