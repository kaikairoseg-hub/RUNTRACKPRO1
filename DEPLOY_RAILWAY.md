# 🚀 Quick Railway Deployment Checklist

**Time Required:** 10 minutes  
**Cost:** FREE ($5/month credit, no credit card needed)

---

## ✅ Pre-Deployment Checklist

Before you start:
- [ ] All code changes committed and pushed to GitHub
- [ ] Have GitHub account ready
- [ ] Have Supabase credentials ready (from backend/.env)

---

## 📋 Step-by-Step (Copy/Paste Friendly)

### 1. Sign Up for Railway
🔗 **Go to:** https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Create Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository: **RUNTRACKPRO**

### 3. Configure Service
Click on the deployed service → **Settings** tab:

**Root Directory:**
```
backend
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

### 4. Add Environment Variables
Go to **Variables** tab, add these one by one:

#### Variable 1: PORT
```
PORT
4000
```

#### Variable 2: CLIENT_URL
```
CLIENT_URL
https://runtrackpro-frontend.vercel.app
```

#### Variable 3: SUPABASE_URL
```
SUPABASE_URL
https://sdshhwunbgwjbdflhswh.supabase.co
```

#### Variable 4: SUPABASE_SERVICE_ROLE_KEY
```
SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1MTIzNSwiZXhwIjoyMDk2NzI3MjM1fQ.N0g5W_jIbFRQHnmRGoTum7fh3KE495eCjPPJtT8EAGo
```

### 5. Generate Domain
**Settings** tab → **Networking** section:
- Click "Generate Domain"
- Copy the URL (e.g., `https://runtrackpro-production-xxxx.up.railway.app`)
- Save it! You'll need this

### 6. Wait for Deployment
**Deployments** tab:
- Watch the logs
- Wait for "SUCCESS" status (1-3 minutes)

### 7. Test Backend
Open in browser:
```
https://your-railway-url.up.railway.app/health
```

Should see:
```json
{"status":"ok","timestamp":"..."}
```

### 8. Update Frontend (Vercel)
Go to: https://vercel.com/dashboard
- Click your project: **runtrackpro-frontend**
- **Settings** → **Environment Variables**
- Add new variable:
  - Name: `VITE_API_URL`
  - Value: `https://your-railway-url.up.railway.app`
- Click "Save"

### 9. Redeploy Frontend
**Deployments** tab in Vercel:
- Click "..." on latest deployment
- Click "Redeploy"
- Wait for completion

### 10. Test Full App
Open: https://runtrackpro-frontend.vercel.app
- Login
- Check Feed page (should work now!)
- Test Challenges
- Test Leaderboard
- Test activity tracking

---

## 🎯 Quick Test Commands

### Test Backend Health:
```bash
curl https://your-railway-url.up.railway.app/health
```

### Test API Endpoint (after login):
```bash
curl https://your-railway-url.up.railway.app/api/users
```

---

## ⚠️ Important Notes

### Railway Free Tier
- **$5 credit per month** (resets monthly)
- **No credit card required**
- Service uses ~$3-4/month
- Monitors credit in dashboard

### If Deployment Fails
1. Check Railway logs in **Deployments** tab
2. Verify all 4 environment variables are correct
3. Ensure root directory is set to `backend`
4. Check GitHub repo has latest code

### CORS Issues
Backend is already configured for CORS. Ensure:
- `CLIENT_URL` in Railway = your Vercel frontend URL
- `VITE_API_URL` in Vercel = your Railway backend URL

---

## 📊 After Deployment

### Monitor Your App
- Railway Dashboard → See usage, logs, metrics
- Check credit usage regularly
- Watch for errors in logs

### URLs to Save
```
Frontend: https://runtrackpro-frontend.vercel.app
Backend: https://your-railway-url.up.railway.app
Database: https://sdshhwunbgwjbdflhswh.supabase.co
```

### Auto-Deploy Setup
Railway automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
# Railway auto-deploys!
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check root directory = `backend` |
| 500 error | Verify environment variables |
| CORS error | Check CLIENT_URL matches frontend |
| Can't connect | Check domain was generated |
| Service stopped | Free credit exhausted (resets monthly) |

---

## ✅ Success Checklist

After completing deployment:
- [ ] Railway backend shows "SUCCESS" status
- [ ] `/health` endpoint returns 200 OK
- [ ] All 4 environment variables set
- [ ] Domain generated
- [ ] Vercel `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] App works without "Backend Unavailable" error
- [ ] Activity feed loads
- [ ] Challenges page works
- [ ] Leaderboard displays

---

## 🎉 You're Done!

Your RunTrack Pro is now fully deployed on free hosting:
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Database on Supabase

**Total Cost: $0** 💰

Access your app anytime, anywhere:
**https://runtrackpro-frontend.vercel.app**

---

**Need detailed help?** See `docs/RAILWAY_DEPLOYMENT.md`

*Last Updated: June 13, 2026*
