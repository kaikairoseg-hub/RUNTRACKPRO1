# Deploy Backend to Render.com

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Go to Render
Open: https://render.com

### Step 2: Sign Up/Login
- Click **"Get Started"**
- Choose **"Sign in with GitHub"**
- Authorize Render to access your repositories

### Step 3: Create New Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### Step 4: Connect Repository
- Find **"RUNTRACKPRO"** in the list
- Click **"Connect"**

### Step 5: Configure Settings

Fill in these exact values:

| Setting | Value |
|---------|-------|
| **Name** | `runtrackpro-backend` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Step 6: Add Environment Variables

Click **"Advanced"** button, then add these 4 variables:

**Variable 1:**
```
Key: PORT
Value: 4000
```

**Variable 2:**
```
Key: CLIENT_URL
Value: https://runtrackpro-frontend.vercel.app
```

**Variable 3:**
```
Key: SUPABASE_URL
Value: https://sdshhwunbgwjbdflhswh.supabase.co
```

**Variable 4:**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1MTIzNSwiZXhwIjoyMDk2NzI3MjM1fQ.N0g5W_jIbFRQHnmRGoTum7fh3KE495eCjPPJtT8EAGo
```

### Step 7: Select Free Plan
- Instance Type: **Free**
- Click **"Create Web Service"**

### Step 8: Wait for Deployment
- Watch the build logs (3-5 minutes)
- Wait for status: **Live** ✅

### Step 9: Copy Backend URL
Your backend URL will be something like:
```
https://runtrackpro-backend.onrender.com
```

Copy this URL!

### Step 10: Update Frontend in Vercel

1. Go to https://vercel.com/dashboard
2. Click on **"runtrackpro-frontend"** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://runtrackpro-backend.onrender.com` (your Render URL)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment

### Step 11: Test!
1. Visit: `https://runtrackpro-frontend.vercel.app`
2. Login
3. Go to **Feed** page
4. Should now work! 🎉

---

## ✅ What You Get

After deployment:
- ✅ Backend API running on Render
- ✅ Activity feed works
- ✅ Challenges work
- ✅ Leaderboard works
- ✅ Real-time GPS tracking with Socket.io
- ✅ Automatic deploys from GitHub
- ✅ HTTPS included
- ✅ Free forever

---

## ⚠️ Free Tier Limitations

**Spin Down After 15 Minutes:**
- Free tier spins down after 15 min of inactivity
- First request takes ~30 seconds to wake up
- Not a problem for testing/portfolio

**Keep Alive Solution:**
Use [cron-job.org](https://cron-job.org) to ping every 10 minutes:
1. Create free account
2. Add new cron job
3. URL: `https://runtrackpro-backend.onrender.com/health`
4. Interval: Every 10 minutes
5. Keeps backend always awake!

---

## 🔧 Troubleshooting

### Build Fails
Check logs for:
- Missing dependencies → Update package.json
- Wrong Node version → Add `.node-version` file

### Backend Returns 404
- Verify Root Directory is set to `backend`
- Check Start Command is `npm start`

### CORS Errors
Already configured in backend code!
Check `CLIENT_URL` matches frontend URL exactly.

### Can't Connect to Backend
- Check backend is **Live** in Render dashboard
- Verify `VITE_API_URL` in Vercel matches Render URL
- Redeploy frontend after adding variable

---

## 📊 Monitor Your Backend

**Render Dashboard:**
- View logs in real-time
- See deployment history
- Monitor uptime
- Check metrics

**Endpoints to Test:**
- Health: `https://your-backend.onrender.com/health`
- Activities: `https://your-backend.onrender.com/api/activities`

---

## 🎉 Success!

Your full-stack app is now:
- ✅ Frontend on Vercel
- ✅ Backend on Render
- ✅ Database on Supabase
- ✅ All features working
- ✅ 100% free hosting

---

**Next:** Visit your app and test all features!
