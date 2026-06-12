# How to Fix Signup Issues

## Common Issues & Solutions

### Issue 1: Email Confirmation Required

**Symptom:** Account created but can't login immediately

**Solution:** Disable email confirmation in Supabase

1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **Settings**
3. Find "**Email Confirmation**" setting
4. **Disable** "Enable email confirmations"
5. Click **Save**

Now users can sign up and login immediately without email verification.

---

### Issue 2: Profile Not Created Automatically

**Symptom:** User created but profile missing, errors on dashboard

**Solution:** Ensure the database trigger exists

Run this SQL in Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If not found, create it:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

### Issue 3: RLS Policy Blocks Profile Creation

**Symptom:** Error: "new row violates row-level security policy"

**Solution:** Ensure INSERT policy exists for profiles

Run the SQL from `FIX_PROFILE_RLS.sql`:

```sql
-- Drop existing policy if any
DROP POLICY IF EXISTS "profiles: owner insert" ON public.profiles;

-- Allow authenticated users to insert their own profile
CREATE POLICY "profiles: owner insert"
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

---

### Issue 4: Password Too Weak

**Symptom:** Error: "Password should be at least 6 characters"

**Solution:** User needs to use a password with 6+ characters

---

### Issue 5: Email Already Exists

**Symptom:** Error: "User already registered"

**Solution:** 
- User should use Sign In instead
- Or use a different email address
- Or delete the existing user from Supabase Dashboard

---

## Testing Signup

### Step 1: Open Browser Console
Press F12 → Console tab

### Step 2: Try to Sign Up
Fill the form:
- Full name: "Test User"
- Email: "test@example.com"
- Password: "password123"
- Confirm password: "password123"

Click "Create Account"

### Step 3: Check Console Logs
Look for:
```
🔐 Attempting signup... {email: "test@example.com", fullName: "Test User"}
✅ Signup successful: {...}
```

Or error:
```
❌ Signup error: {...}
```

---

## Quick Fix Checklist

✅ 1. **Disable email confirmation** (Supabase Dashboard → Auth → Settings)

✅ 2. **Run profile trigger SQL** (check `supabase_schema.sql` or create manually)

✅ 3. **Run RLS policy SQL** (from `FIX_PROFILE_RLS.sql`)

✅ 4. **Test with valid email & password** (6+ characters)

✅ 5. **Check browser console** for errors

---

## After Successful Signup

User should:
1. See success (no error message)
2. Be automatically logged in
3. Redirected to Dashboard
4. See their profile with stats

If profile data is missing, the backend will auto-create it on first `/api/users/me` request.

---

## Manual User Creation (Last Resort)

If signup still doesn't work, create user manually:

### 1. Create Auth User in Supabase
Dashboard → Authentication → Users → Add user

### 2. Create Profile
Run this SQL (replace USER_ID with the new user's ID):

```sql
INSERT INTO public.profiles (id, full_name, bio, city)
VALUES ('USER_ID', 'Test User', '', '')
ON CONFLICT (id) DO NOTHING;
```

### 3. User Can Now Login
Use the email/password you set

---

## Prevention

To avoid these issues in future:
- Keep `supabase_schema.sql` up to date
- Always run the schema in new environments
- Test signup after any auth changes
- Monitor Supabase logs for errors
