# Deploy Backend to Railway.app

## 🚂 Quick Deploy (5 Minutes, No Credit Card Required)

Railway offers **$5 free credit per month** without requiring a credit card - perfect for development and testing!

---

## 🚀 Step-by-Step Deployment

### Step 1: Go to Railway
Open: **https://railway.app**

### Step 2: Sign Up with GitHub
1. Click **"Login"** or **"Start a New Project"**
2. Choose **"Login with GitHub"**
3. Authorize Railway to access your repositories
4. **No credit card required!** ✅

### Step 3: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and click **"RUNTRACKPRO"**
4. Railway will start deploying automatically

### Step 4: Configure Root Directory
1. Click on your deployed service
2. Click **"Settings"** tab
3. Scroll to **"Build"** section
4. Set **Root Directory**: `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`

### Step 5: Add Environment Variables
1. Click **"Variables"** tab
2. Click **"New Variable"**
3. Add these **4 variables** one by one:

```
PORT
4000

CLIENT_URL
https://runtrackpro-frontend.vercel.app

SUPABASE_URL
https://sdshhwunbgwjbdflhswh.supabase.co

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1MTIzNSwiZXhwIjoyMDk2NzI3MjM1fQ.N0g5W_jIbFRQHnmRGoTum7fh3KE495eCjPPJtT8EAGo
```

**How to add each variable:**
- Click **"New Variable"**
- Enter **Variable Name** (e.g., `PORT`)
- Enter **Value** (e.g., `4000`)
- Click **"Add"**
- Repeat for all 4 variables

### Step 6: Generate Public Domain
1. Go to **"Settings"** tab
2. Scroll down to **"Networking"** section
3. Click **"Generate Domain"** button
4. Railway will create a public URL like: `https://runtrackpro-backend-production-xxxx.up.railway.app`
5. **Copy this URL!** You'll need it for the next step

### Step 7: Wait for Deployment
1. Go to **"Deployments"** tab
2. Watch the build logs (usually takes 1-3 minutes)
3. Wait for status: **"SUCCESS"** ✅
4. Your backend is now live!

### Step 8: Test Backend
Open your Railway URL in browser and add `/health`:
```
https://your-backend.up.railway.app/health
```

You should see a response indicating the server is running!

### Step 9: Update Frontend in Vercel
1. Go to https://vercel.com/dashboard
2. Click on your **"runtrackpro-frontend"** project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend.up.railway.app` (your Railway URL from Step 6)
6. Click **"Save"**

### Step 10: Redeploy Frontend
1. Go to **"Deployments"** tab in Vercel
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment to complete

### Step 11: Test Your App! 🎉
1. Visit: `https://runtrackpro-frontend.vercel.app`
2. Login to your account
3. Go to **Feed** page - should now work!
4. Try **Challenges** and **Leaderboard** - all working!

---

## ✅ What You Get Free on Railway

**Free Tier Benefits:**
- ✅ **$5 credit per month** (enough for small apps)
- ✅ **No credit card required** for signup
- ✅ **Automatic deploys** from GitHub
- ✅ **Custom domains** supported
- ✅ **HTTPS included** by default
- ✅ **Doesn't spin down** (always active!)
- ✅ **Environment variables** management
- ✅ **Build & deployment logs**
- ✅ **Metrics & monitoring**

**Free Tier Limits:**
- $5 credit/month (~500 hours)
- Enough for development/testing
- Your app uses ~$3-4/month typically
- Service pauses when credit runs out (resets monthly)

---

## 🌏 Railway for Philippines Users

**Benefits for Filipino Users:**
- ✅ Fast deployment from Asia
- ✅ Good latency to Philippines
- ✅ No credit card needed
- ✅ Free tier is generous
- ✅ Easy to use interface

**Expected Performance:**
- Latency: ~50-150ms from Philippines
- Uptime: 99%+ on free tier
- No cold starts (stays warm)

---

## 📊 Railway vs Other Platforms

| Feature | Railway | Render | Heroku |
|---------|---------|--------|--------|
| **Credit Card** | ❌ Not needed | ✅ Required | ✅ Required |
| **Free Tier** | $5/month credit | 750 hours | None (paid only) |
| **Spin Down** | ❌ No | ✅ Yes | N/A |
| **Setup Ease** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ✅ Yes |

**Winner: Railway** for students and developers without credit cards!

---

## 🔧 Configuration Files

Your repository includes `railway.json` for automatic configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

This tells Railway how to build and run your backend automatically!

---

## 🔄 Automatic Deployments

After initial setup, every time you push to GitHub:
1. Railway automatically detects the change
2. Rebuilds your backend
3. Deploys the new version
4. Zero downtime!

```bash
# Make changes to backend
git add .
git commit -m "Update backend"
git push origin main

# Railway auto-deploys! 🚀
```

---

## 📈 Monitor Your Backend

**Railway Dashboard shows:**
- ✅ Real-time deployment logs
- ✅ Resource usage (CPU, Memory)
- ✅ Request metrics
- ✅ Deployment history
- ✅ Environment variables
- ✅ Credit usage

**Access logs:**
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on a deployment to see logs

---

## 🛠️ Troubleshooting

### Build Fails
**Check:**
- Root directory is set to `backend`
- Build command is `npm install`
- Start command is `npm start`

**Solution:**
- View build logs in Railway
- Fix any npm dependency issues
- Push changes to trigger rebuild

### Backend Returns 500 Error
**Check:**
- All 4 environment variables are set correctly
- Supabase URL is correct
- Service role key is correct

**Solution:**
- Go to Variables tab
- Verify all values match
- Redeploy if needed

### Frontend Can't Connect
**Check:**
- `VITE_API_URL` in Vercel matches Railway URL exactly
- Railway backend shows "SUCCESS" status
- Domain was generated in Railway

**Solution:**
- Copy exact URL from Railway
- Update Vercel environment variable
- Redeploy frontend in Vercel

### CORS Errors
**Already configured!** Backend has CORS setup:
- Allows requests from your frontend URL
- Configured in `backend/src/index.js`
- Make sure `CLIENT_URL` env variable matches your frontend URL

### Service Stopped
**Reason:**
- Free credit ran out for the month
- Resets at start of next month

**Solution:**
- Wait for monthly reset
- Or add credit card for paid tier
- Monitor usage in Railway dashboard

---

## 💡 Pro Tips

### Keep Your Backend Active
Railway doesn't spin down on free tier, but to ensure it stays healthy:

1. Monitor usage in dashboard
2. Optimize API calls
3. Use caching where possible

### Optimize Costs
- Remove unused dependencies
- Optimize build process
- Monitor credit usage
- Use Railway's metrics

### Development Workflow
```bash
# Local development
cd backend
npm run dev

# Push to GitHub (auto-deploys to Railway)
git add .
git commit -m "Add feature"
git push origin main

# Railway deploys automatically!
```

---

## 🎯 Post-Deployment Checklist

After deploying to Railway:

- [ ] Backend deployed successfully on Railway
- [ ] All 4 environment variables added
- [ ] Public domain generated
- [ ] Backend responds to `/health` endpoint
- [ ] `VITE_API_URL` added to Vercel
- [ ] Frontend redeployed
- [ ] Activity feed works
- [ ] Challenges page loads
- [ ] Leaderboard displays
- [ ] Real-time features work
- [ ] No console errors

---

## 📚 Additional Resources

**Railway Documentation:**
- Getting Started: https://docs.railway.app/getting-started
- Deployments: https://docs.railway.app/deploy/deployments
- Environment Variables: https://docs.railway.app/develop/variables

**Support:**
- Railway Discord: https://discord.gg/railway
- Railway Help: https://help.railway.app/

---

## 🎉 Success!

Your RunTrack Pro is now fully deployed:

- ✅ **Frontend** → Vercel (PWA)
- ✅ **Backend** → Railway (API + Socket.io)
- ✅ **Database** → Supabase (PostgreSQL)
- ✅ **Storage** → Supabase (Avatars)

**100% Free Hosting!**

---

## 🔄 Next Steps

### Monitor Your App
- Check Railway dashboard daily
- Monitor credit usage
- Watch for errors in logs

### Optimize Performance
- Add caching
- Optimize queries
- Reduce API calls

### Add Features
- Push notifications
- More achievements
- Advanced analytics

### Scale Up (When Ready)
- Add credit card to Railway
- Upgrade to paid tier
- Get more resources

---

**Live URLs:**
- Frontend: `https://runtrackpro-frontend.vercel.app`
- Backend: `https://your-backend.up.railway.app`
- Supabase: `https://app.supabase.com`

**Congratulations!** Your full-stack PWA is now live and accessible worldwide! 🌍🎉

---

*Last Updated: June 13, 2026*
*Deployment Platform: Railway.app*
