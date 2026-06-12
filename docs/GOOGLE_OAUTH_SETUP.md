# 🔐 Google OAuth Setup for RunTrack Pro

## Current Issue
Getting `400 Bad Request` when clicking "Continue with Google" button because Google OAuth is not configured in Supabase.

---

## Quick Fix: Use Email Authentication Instead

**You don't need Google OAuth to use the app!**

1. On the login page, click **"Sign Up"** tab
2. Enter your name, email, and password
3. Click **"Create Account"**
4. ✅ Done! Email auth works out of the box

---

## Optional: Enable Google OAuth

If you want Google sign-in, follow these steps:

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   ```
   https://sdshhwunbgwjbdflhswh.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/sdshhwunbgwjbdflhswh
2. Click **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

### Step 3: Test

1. Restart your frontend server (or just refresh the page)
2. Click "Continue with Google"
3. ✅ Should work now!

---

## Alternative: Hide Google Button

If you don't want Google OAuth at all, you can remove the button:

**Edit:** `frontend/src/pages/Auth.jsx`

Find and remove/comment out this section (around line 85):
```jsx
{/* Google OAuth placeholder */}
<button
  type="button"
  onClick={async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setToastMsg(err.message || "Google sign-in failed. Please try again.");
    }
  }}
  className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all"
>
  <span className="text-lg font-bold text-blue-600">G</span> Continue with Google
</button>
```

---

## Recommendation

**For development/testing:** Just use email authentication - it's simpler and works immediately.

**For production:** Set up Google OAuth using the steps above for better user experience.

---

## Summary

- ✅ **Email auth works now** - no configuration needed
- ⚠️ **Google OAuth requires setup** - follow steps above
- 💡 **You can use the app right now** with email sign-up!
