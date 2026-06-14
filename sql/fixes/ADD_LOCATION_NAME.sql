-- Add location_name column to activities table
-- Run this in Supabase SQL Editor

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS location_name text;
