# ⚡ How to Fix Profile Error RIGHT NOW

## The Problem
Your user exists in `auth.users` but has no profile in `profiles` table.

## 🚀 Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Click your project: `sdshhwunbgwjbdflhswh`
3. Click **SQL Editor** in left sidebar
4. Click **+ New query**

### Step 2: Run This SQL
Copy and paste this into the SQL editor:

```sql
-- Fix RLS policy
CREATE POLICY IF NOT EXISTS "profiles: owner insert"
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create your profile
INSERT INTO public.profiles (id, full_name, bio, city, preferred_activity, fitness_goal_km, units)
VALUES (
  '4c9c8e66-740a-4154-a6c5-fb497f2bc018',
  'User',
  '',
  '',
  'Running',
  50,
  'metric'
)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Click "Run" or press `Ctrl+Enter`

You should see: **Success. No rows returned**

### Step 4: Refresh Your Browser

Go back to http://localhost:5173 and refresh - it should work now!

---

## ✅ Expected Result

After the fix:
- Dashboard loads successfully
- No more 500 errors
- Profile stats appear
- You can start tracking activities

---

## 🔐 The Real Issue (Fix Later)

Your `backend/.env` has the wrong key. The **service_role key** is needed.

**To get it:**
1. Supabase Dashboard → Settings → API
2. Copy **service_role** key (NOT anon key)
3. Update `backend/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (paste service_role key)
   ```

**How to tell them apart:**
- Anon key JWT has: `"role":"anon"` ❌ (you have this)
- Service role JWT has: `"role":"service_role"` ✅ (you need this)

---

## 📝 Alternative: Let Frontend Create Profile

If you run the SQL above, the frontend can also create profiles automatically for new signups since we added the INSERT policy!

---

**Just run the SQL and refresh - you'll be up and running! 🎉**
