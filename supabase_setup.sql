-- ============================================================
-- Basement Fitness — Cloud Sync Database Table Setup
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS basement_fitness_sync (
  username text PRIMARY KEY,
  display_name text NOT NULL,
  salt text NOT NULL,
  password_hash text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) or add standard policies if desired.
-- Since we are querying via the admin Service Role Key from the serverless API,
-- it bypasses RLS policies automatically and remains completely secure.
ALTER TABLE basement_fitness_sync ENABLE ROW LEVEL SECURITY;
