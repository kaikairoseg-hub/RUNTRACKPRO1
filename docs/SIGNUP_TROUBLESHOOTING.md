# 🔧 Sign Up Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Rate limit exceeded" / "Too many requests"
**Cause:** You tried signing up multiple times quickly  
**Solution:**
1. Wait 5-10 minutes
2. Try a different email address
3. Use incognito/private browsing mode

---

### Issue 2: "Invalid request" / "Auth code empty"
**Cause:** System clock is wrong  
**Solution:**
1. Press Windows + I
2. Go to "Time & Language" → "Date & Time"
3. Turn ON "Set time automatically"
4. Click "Sync now"
5. Restart browser
6. Try again

---

### Issue 3: "Email already registered"
**Cause:** Account already exists  
**Solution:**
1. Click "Sign In" tab instead of "Sign Up"
2. Enter your email and password
3. Click "Sign In"

---

### Issue 4: Nothing happens when clicking "Create Account"
**Cause:** JavaScript error or form validation  
**Solution:**
1. Open browser console (F12)
2. Check for red errors
3. Share the error message
4. Or try a different browser (Chrome, Firefox, Edge)

---

### Issue 5: "Email confirmation required"
**Cause:** Supabase email confirmation is enabled  
**Solution:**
1. Check your email inbox for confirmation link
2. Click the link to verify
3. Return to login page
4. Sign in with your credentials

---

## 🧪 Test Sign Up Manually

### Step-by-Step Test:

1. **Open browser console** (F12 → Console tab)
2. **Clear all data:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. **Go to:** http://localhost:5173

4. **Fill in form:**
   - Full name: `Test User`
   - Email: `test${Date.now()}@example.com` (unique email)
   - Password: `test123456`
   - Confirm: `test123456`

5. **Click "Create Account"**

6. **Watch console for errors**

---

## 🔍 Debug via Console

Run this in browser console to test signup directly:

```javascript
// Test Supabase connection
const { createClient } = window.supabase;
const supabase = createClient(
  'https://sdshhwunbgwjbdflhswh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTEyMzUsImV4cCI6MjA5NjcyNzIzNX0.30WeGw5I-nsmmGfa-KU9HWLa5kALwRWWlSqvFS3EgZU'
);

// Try signing up
const testEmail = `test${Date.now()}@example.com`;
const { data, error } = await supabase.auth.signUp({
  email: testEmail,
  password: 'test123456',
  options: {
    data: { full_name: 'Test User' }
  }
});

console.log('Result:', { data, error });
```

**If you see an error, share it with me!**

---

## 🎯 Quick Fixes to Try Now

### Fix 1: Use Different Email Domain
Instead of `@example.com`, try:
- `@gmail.com`
- `@yahoo.com`
- `@outlook.com`

### Fix 2: Clear Everything & Restart
```
1. Close ALL browser windows
2. Open Task Manager
3. End all Chrome/Firefox processes
4. Restart browser
5. Go to http://localhost:5173
6. Try signing up
```

### Fix 3: Check Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/sdshhwunbgwjbdflhswh
2. Click "Authentication" → "Users"
3. Check if your email already exists
4. If yes, just sign in instead
5. If no, check rate limits in "Logs"

---

## ⚠️ Check These Settings in Supabase

Go to: https://supabase.com/dashboard/project/sdshhwunbgwjbdflhswh/auth/providers

1. **Email Provider:**
   - Should be ENABLED
   - "Confirm email" - Check if this is ON
   - If ON, you need to check your email for confirmation link

2. **Rate Limits:**
   - Check if you hit the limit
   - Default: 30 requests per hour

3. **Auth Settings:**
   - Ensure "Enable email signups" is ON
   - Check redirect URLs include `http://localhost:5173`

---

## 📸 What to Share if Still Not Working

Please provide:
1. **Screenshot** of the error message
2. **Browser console** errors (F12 → Console tab, screenshot any red text)
3. **Network tab** errors (F12 → Network tab, filter by "supabase", screenshot any red/failed requests)
4. **Which step** fails (form validation, loading state, redirect, etc.)

---

## ✅ Expected Behavior

When sign up works correctly:
1. You fill in the form
2. Click "Create Account"
3. Button shows "…" (loading)
4. Either:
   - **A)** Redirects to Dashboard (if email confirmation disabled)
   - **B)** Shows success message "Check your email" (if confirmation enabled)

---

## 🆘 Emergency Workaround

If signup absolutely won't work, you can create a user directly in Supabase:

1. Go to: https://supabase.com/dashboard/project/sdshhwunbgwjbdflhswh/auth/users
2. Click "Add user" button
3. Enter email and password
4. Click "Create user"
5. Return to http://localhost:5173
6. Click "Sign In" and use those credentials

---

**What specific error are you seeing? Share the message and I'll help fix it!**
