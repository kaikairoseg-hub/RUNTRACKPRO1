# Deploy Backend to Fly.io

## 🚀 Free Forever Hosting (No Credit Card Required!)

Fly.io offers **3 free VMs** with 256MB RAM each - perfect for your backend!

---

## 📋 Prerequisites

1. **Install Fly.io CLI**

**For Windows:**
```powershell
# Using PowerShell
iwr https://fly.io/install.ps1 -useb | iex
```

Or download from: https://fly.io/docs/hands-on/install-flyctl/

2. **Verify Installation**
```bash
fly version
```

---

## 🚀 Deploy in 5 Steps

### Step 1: Login to Fly.io
```bash
fly auth login
```

This opens browser - sign in with GitHub (no credit card needed!)

### Step 2: Launch Your App
```bash
cd d:\RUNTRACKPRO
fly launch
```

**Questions it will ask:**

1. **"Choose an app name"**
   - Type: `runtrackpro-backend` (or any unique name)
   - Or press Enter for auto-generated name

2. **"Choose a region"**
   - Select: **Singapore (sin)** - closest to Philippines
   - Or any region you prefer

3. **"Would you like to set up a Postgresql database?"**
   - Answer: **No** (we're using Supabase)

4. **"Would you like to set up an Upstash Redis database?"**
   - Answer: **No**

5. **"Would you like to deploy now?"**
   - Answer: **No** (we need to add secrets first)

### Step 3: Add Environment Variables (Secrets)
```bash
fly secrets set PORT=8080
fly secrets set CLIENT_URL=https://runtrackpro-frontend.vercel.app
fly secrets set SUPABASE_URL=https://sdshhwunbgwjbdflhswh.supabase.co
fly secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1MTIzNSwiZXhwIjoyMDk2NzI3MjM1fQ.N0g5W_jIbFRQHnmRGoTum7fh3KE495eCjPPJtT8EAGo
```

### Step 4: Deploy!
```bash
fly deploy
```

Wait 2-3 minutes for deployment...

### Step 5: Get Your URL
```bash
fly status
```

Your backend URL will be:
```
https://runtrackpro-backend.fly.dev
```

---

## 🔧 Update Frontend

### Update Vercel Environment Variable:

1. Go to https://vercel.com/dashboard
2. Click **runtrackpro-frontend** project
3. **Settings** → **Environment Variables**
4. Add or update:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://runtrackpro-backend.fly.dev`
5. **Save**
6. **Redeploy** frontend

---

## ✅ Verify Deployment

**Test your backend:**
```bash
# Health check
curl https://runtrackpro-backend.fly.dev/health

# Or open in browser
https://runtrackpro-backend.fly.dev/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## 🎁 Fly.io Free Tier

**What You Get Free:**
- ✅ **3 shared-cpu-1x VMs** with 256MB RAM each
- ✅ **160GB outbound data transfer**
- ✅ **No credit card required**
- ✅ **No sleep/spin down** (always active!)
- ✅ **HTTPS included** (automatic SSL)
- ✅ **Global locations**
- ✅ **Auto-scaling** (within free limits)

**Perfect for:**
- Development projects
- Portfolio apps
- Small-scale production apps
- Learning and testing

---

## 📍 Available Regions

**Closest to Philippines:**
- **sin** - Singapore (⭐ Best choice)
- **hkg** - Hong Kong
- **nrt** - Tokyo

**Other regions:**
- **iad** - Virginia, USA
- **lhr** - London, UK
- And many more...

---

## 🔄 Common Commands

```bash
# Deploy updates
fly deploy

# View logs
fly logs

# Check status
fly status

# Open app dashboard
fly dashboard

# SSH into your app
fly ssh console

# Scale (if needed, uses free hours)
fly scale count 1

# View secrets
fly secrets list

# Update a secret
fly secrets set KEY=value

# Destroy app (if needed)
fly apps destroy runtrackpro-backend
```

---

## 📊 Monitor Your App

**View Logs in Real-Time:**
```bash
fly logs
```

**Check Metrics:**
```bash
fly dashboard
```

Opens web dashboard showing:
- CPU usage
- Memory usage
- Request metrics
- Deployment history

---

## 🛠️ Troubleshooting

### Build Fails

**Check:**
- Dockerfile syntax
- Node version compatible
- All dependencies in package.json

**Solution:**
```bash
# View build logs
fly logs

# Try deploy again
fly deploy
```

### Environment Variables Not Working

**Check:**
```bash
# List all secrets
fly secrets list

# Unset and reset
fly secrets unset KEY
fly secrets set KEY=newvalue
```

### Port Issues

**Important:** Fly.io requires port **8080** internally (already configured in fly.toml)

Your backend code should read from `process.env.PORT` (already does!)

### CORS Errors

**Backend already configured!** But verify:
- `CLIENT_URL` secret matches your frontend URL exactly
- No trailing slash in URL

### App Crashed

**Check logs:**
```bash
fly logs
```

**Restart:**
```bash
fly apps restart runtrackpro-backend
```

---

## 🎯 Deployment Checklist

- [ ] Fly CLI installed
- [ ] Logged in: `fly auth login`
- [ ] App launched: `fly launch`
- [ ] Secrets added (4 variables)
- [ ] Deployed: `fly deploy`
- [ ] Health check works: `/health` endpoint
- [ ] Frontend updated with Fly.io URL
- [ ] Frontend redeployed on Vercel
- [ ] Test activity feed on frontend
- [ ] Test challenges page
- [ ] Test leaderboard

---

## 💰 Cost Breakdown

**Free tier includes:**
- 3 VMs (256MB each) = **Free**
- 160GB transfer/month = **Free**
- Your app uses ~1 VM = **$0/month**

**If you exceed:**
- Extra VMs: ~$2/month per VM
- Extra transfer: ~$0.02/GB

**Monitoring:**
- Dashboard shows current usage
- Get alerts before charges
- Can set spending limits

---

## 🌏 Best for Philippines

**Singapore region (sin):**
- Latency: ~50-100ms from Philippines
- Fastest option for Filipino users
- Part of free tier
- No extra cost

---

## 🔄 Auto-Deploy from GitHub (Optional)

Set up GitHub Actions to auto-deploy:

1. Get Fly.io token:
```bash
fly tokens create deploy
```

2. Add to GitHub Secrets:
- Go to GitHub repo → Settings → Secrets
- Add: `FLY_API_TOKEN` = (your token)

3. Create `.github/workflows/fly.yml`:
```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Now every push to main = auto-deploy! 🚀

---

## 🎉 Success!

Your backend is now:
- ✅ Deployed to Fly.io
- ✅ Always active (no spin down)
- ✅ Global HTTPS URL
- ✅ Free forever!

**Test your full app:**
- Frontend: `https://runtrackpro-frontend.vercel.app`
- Backend: `https://runtrackpro-backend.fly.dev`
- All features working! 🎊

---

## 📚 Resources

- **Fly.io Docs:** https://fly.io/docs/
- **Fly.io Dashboard:** https://fly.io/dashboard
- **Pricing:** https://fly.io/docs/about/pricing/
- **Support:** https://community.fly.io/

---

**Your Backend URL:** `https://runtrackpro-backend.fly.dev`

**Ready to deploy?** Run `fly auth login` to get started!

---

*Last Updated: June 13, 2026*
*Platform: Fly.io*
