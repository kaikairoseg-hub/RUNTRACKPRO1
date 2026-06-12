-- ============================================
-- QUICK FIX for RunTrack Pro Profile Issue
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add INSERT policy so authenticated users can create their own profiles
DROP POLICY IF EXISTS "profiles: owner insert" ON public.profiles;
CREATE POLICY "profiles: owner insert"
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Manually create profile for the current user (replace with your user ID)
-- Get your user ID from: SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL';
INSERT INTO public.profiles (id, full_name, bio, city, preferred_activity, fitness_goal_km, units)
VALUES (
  '4c9c8e66-740a-4154-a6c5-fb497f2bc018',  -- Your user ID (update this!)
  '20221326',  -- Name from email
  '',
  '',
  'Running',
  50,
  'metric'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- 3. Verify the profile was created
SELECT id, full_name, created_at FROM public.profiles 
WHERE id = '4c9c8e66-740a-4154-a6c5-fb497f2bc018';

-- 4. Check if the auth trigger exists
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 5. If trigger is missing, recreate it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Done! Now refresh your browser
