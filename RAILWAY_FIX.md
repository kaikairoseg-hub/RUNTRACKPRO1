# 🔧 Fix Railway Build Error

Your Railway build failed because it needs the correct root directory configured. Here's how to fix it:

---

## ✅ Quick Fix (2 Steps)

### Step 1: Configure Root Directory in Railway

1. Go to Railway dashboard: https://railway.app
2. Click on your service (the one that failed)
3. Click **"Settings"** tab (top menu)
4. Scroll down to **"Service Settings"** section
5. Find **"Root Directory"** field
6. Enter: `backend`
7. Click **"Save"** or the field will auto-save

### Step 2: Redeploy

1. Go to **"Deployments"** tab
2. Click the **"Deploy"** button (or wait for auto-deploy)
3. Watch the logs - build should succeed now!

---

## 🎯 Expected Result

After setting root directory to `backend`, you should see:

```
✓ Initialization (00:06)
✓ Build > Build Image (00:45)
✓ Deploy > Start (00:03)
```

**Success!** 🎉

---

## 📋 Complete Railway Settings

Make sure these are configured:

### Root Directory
```
backend
```

### Build Command (auto-detected)
```
npm install
```

### Start Command (auto-detected)
```
npm start
```

### Environment Variables (4 required)

Go to **"Variables"** tab and add:

1. **PORT**
   ```
   4000
   ```

2. **CLIENT_URL**
   ```
   https://runtrackpro-frontend.vercel.app
   ```

3. **SUPABASE_URL**
   ```
   https://sdshhwunbgwjbdflhswh.supabase.co
   ```

4. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1MTIzNSwiZXhwIjoyMDk2NzI3MjM1fQ.N0g5W_jIbFRQHnmRGoTum7fh3KE495eCjPPJtT8EAGo
   ```

---

## 🔍 Why This Happened

**Problem:** Railway was trying to run `npm ci` in the root directory, but your `package.json` is in the `backend` folder.

**Solution:** Setting root directory to `backend` tells Railway to look there for package.json.

---

## 📊 Visual Guide

### Before (❌ Failed):
```
RUNTRACKPRO/
├── package.json (root - wrong one)
├── backend/
│   ├── package.json (correct one)
│   └── src/
└── frontend/
```
Railway was reading root package.json (wrong)

### After (✅ Success):
```
RUNTRACKPRO/
└── backend/ ← Root Directory set here
    ├── package.json ✓
    ├── src/
    └── nixpacks.toml
```
Railway now reads backend/package.json (correct)

---

## 🚀 After Fix - Next Steps

1. **Wait for successful deployment** (~2 minutes)
2. **Generate domain** (Settings → Networking → Generate Domain)
3. **Copy your Railway URL** (e.g., `https://runtrackpro-production-xxxx.up.railway.app`)
4. **Test backend:**
   ```
   https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

5. **Update Vercel:**
   - Go to Vercel dashboard
   - Project: runtrackpro-frontend
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = Your Railway URL
   - Redeploy frontend

6. **Test your app:**
   - Visit: https://runtrackpro-frontend.vercel.app
   - Login and test features

---

## 🆘 If Still Failing

### Check Logs
Go to **Deployments** → Click on failed deployment → View full logs

### Common Issues:

**Issue 1: Missing Environment Variables**
- Go to Variables tab
- Ensure all 4 variables are added
- Check for typos

**Issue 2: Wrong Root Directory**
- Settings → Root Directory should be exactly: `backend`
- Not `/backend` or `./backend`

**Issue 3: Build Command Issues**
- Let Railway auto-detect (don't manually set)
- It will use: `npm install` from backend/package.json

**Issue 4: Port Issues**
- Railway auto-assigns PORT variable
- Your app should use: `process.env.PORT || 4000`
- This is already configured in your code ✓

---

## 📝 Quick Checklist

After making changes:
- [ ] Root directory set to `backend`
- [ ] All 4 environment variables added
- [ ] Deployment succeeded (check Deployments tab)
- [ ] Domain generated
- [ ] `/health` endpoint returns 200 OK
- [ ] Vercel updated with Railway URL
- [ ] Frontend redeployed
- [ ] App works without backend errors

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ Build completes without errors
- ✅ Deployment shows "SUCCESS" status
- ✅ Health endpoint returns JSON
- ✅ Logs show: `🚀 RunTrack Pro backend running on port 4000`
- ✅ Frontend connects without "Backend Unavailable"

---

## 🎯 TL;DR

**The Fix:**
1. Railway Dashboard → Your Service
2. Settings → Root Directory → Enter `backend`
3. Redeploy
4. Done! ✅

---

**Need more help?** Check the detailed guide: `DEPLOY_RAILWAY.md`

*Last Updated: June 13, 2026*
