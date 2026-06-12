# 🔧 Fix Profile Creation Issue

## Problem
The backend `.env` file has the **anon key** instead of the **service role key**, causing RLS (Row Level Security) to block profile creation.

Error: `new row violates row-level security policy for table "profiles"`

## Solution Options

### Option 1: Update Backend Service Role Key (RECOMMENDED)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select project: `sdshhwunbgwjbdflhswh`
3. Navigate to **Settings** → **API**
4. Find the **`service_role`** key section (NOT the anon key)
5. Copy the `service_role` secret key
6. Update `backend/.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (paste the service_role key here)
```

7. The backend will auto-restart and profiles will be created automatically

### Option 2: Manually Create Profile via SQL (TEMPORARY FIX)

If you can't access the service role key right now, run this SQL in Supabase SQL Editor:

```sql
-- Create profile for your current user
INSERT INTO public.profiles (id, full_name, bio, city, preferred_activity, fitness_goal_km, units)
VALUES (
  '4c9c8e66-740a-4154-a6c5-fb497f2bc018',  -- Your user ID from the error logs
  '20221326',  -- Your username from email
  '',
  '',
  'Running',
  50,
  'metric'
)
ON CONFLICT (id) DO NOTHING;
```

Then refresh your browser - the app should work!

### Option 3: Temporarily Disable RLS (NOT RECOMMENDED)

**⚠️ Only use this for local development testing!**

```sql
-- Disable RLS on profiles table (TEMPORARY)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

To re-enable later:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## How to Identify the Keys

**Anon Key** (Public, safe for frontend):
```
Decoded JWT has: "role":"anon"
```

**Service Role Key** (Secret, backend only):
```
Decoded JWT has: "role":"service_role"
```

Your current backend key shows `"role":"anon"` - that's why RLS is blocking.

## Current User Info

From the error logs:
- **User ID:** `4c9c8e66-740a-4154-a6c5-fb497f2bc018`
- **Email:** `20221326@nbsc.edu.ph`

## Quick Test After Fix

Once fixed, refresh the browser and you should see:
- ✅ Dashboard loads without errors
- ✅ Profile stats appear
- ✅ No more 500 errors in console
- ✅ Activities can be tracked and saved

## Need Help?

If you can't find the service role key:
1. Check your Supabase project **Settings** → **API** 
2. Look for the section labeled "Project API keys"
3. The service_role key is longer and marked as "secret"
4. Never commit this key to Git!

---

**Choose Option 1 for the permanent fix, or Option 2 for immediate testing!**
