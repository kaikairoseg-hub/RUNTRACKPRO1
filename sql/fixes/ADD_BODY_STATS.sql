-- Add body stats columns to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age          integer,
  ADD COLUMN IF NOT EXISTS weight_kg    numeric(5,1),
  ADD COLUMN IF NOT EXISTS height_cm    numeric(5,1),
  ADD COLUMN IF NOT EXISTS gender       text CHECK (gender IN ('male','female','other')),
  ADD COLUMN IF NOT EXISTS activity_level text NOT NULL DEFAULT 'moderate'
    CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  ADD COLUMN IF NOT EXISTS weight_goal  text NOT NULL DEFAULT 'maintain'
    CHECK (weight_goal IN ('lose','maintain','gain')),
  ADD COLUMN IF NOT EXISTS daily_steps_goal integer NOT NULL DEFAULT 8000;
