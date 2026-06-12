-- Fix Profile Creation - Add INSERT policy for authenticated users
-- Run this in your Supabase SQL Editor

-- Drop the policy if it exists, then recreate it
DROP POLICY IF EXISTS "profiles: owner insert" ON public.profiles;

-- Allow authenticated users to insert their own profile
CREATE POLICY "profiles: owner insert"
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'profiles';
