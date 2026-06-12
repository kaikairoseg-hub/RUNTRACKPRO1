# Deploy Backend to Glitch.com

## 🎨 Free Forever Hosting (No Credit Card, No Trial)

Glitch.com offers **free hosting forever** with no credit card required - perfect for students and developers!

---

## 🚀 Quick Deploy (3 Minutes)

### Step 1: Go to Glitch
Open: **https://glitch.com**

### Step 2: Sign In
- Click **"Sign in"**
- Choose **"Sign in with GitHub"**
- Authorize Glitch

### Step 3: Import from GitHub
1. Click **"New Project"** button
2. Select **"Import from GitHub"**
3. Paste repository URL: `https://github.com/kaikairos-web/RUNTRACKPRO`
4. Click **"Import"**
5. Wait for import (1-2 minutes)

### Step 4: Configure Project
1. Click on project name to rename: `runtrackpro-backend`
2. Click **"Tools"** at bottom → **"Logs"** to see build progress

### Step 5: Add Environment Variables
1. Click **".env"** file in left sidebar
2. Replace contents with:

```env
PORT=3000
CLIENT_URL=https://runtrackpro-frontend.vercel.app
SUPABASE_URL=https://sdshhwunbgwjbdflhswh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc2hod3VuYmd3amJkZmxoc3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1MTIzNSwiZXhwIjoyMDk2NzI3MjM1fQ.N0g5W_jIbFRQHnmRGoTum7fh3KE495eCjPPJtT8EAGo
```

### Step 6: Update package.json
1. Click **"backend/package.json"** in left sidebar
2. Make sure it has a "start" script:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js"
  }
}
```

### Step 7: Get Your URL
Your Glitch URL will be:
```
https://runtrackpro-backend.glitch.me
```

Copy this URL!

### Step 8: Update Frontend in Vercel
1. Go to https://vercel.com/dashboard
2. Click **"runtrackpro-frontend"** project
3. **Settings** → **Environment Variables**
4. Add:
   - Name: `VITE_API_URL`
   - Value: `https://runtrackpro-backend.glitch.me`
5. **Save** and **Redeploy**

### Step 9: Keep Backend Awake (Optional)
Glitch sleeps after 5 min of inactivity. To keep it awake:

Use **UptimeRobot** (free):
1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add new monitor
4. Type: HTTP(s)
5. URL: `https://runtrackpro-backend.glitch.me/health`
6. Interval: Every 5 minutes
7. Pings your backend to keep it awake!

---

## ✅ What You Get Free

**Glitch Free Tier:**
- ✅ **Free forever** (not a trial!)
- ✅ **No credit card** required
- ✅ **4000 hours/month** (enough for always-on with monitoring)
- ✅ **HTTPS included**
- ✅ **Auto-deploy** from code changes
- ✅ **Built-in editor**
- ✅ **Logs viewer**
- ✅ **Community support**

**Limitations:**
- ⚠️ Sleeps after 5 minutes of inactivity
- ⚠️ Takes ~10 seconds to wake up
- ⚠️ 512MB memory
- ⚠️ 200MB disk space

**Solution:** Use UptimeRobot (free) to ping every 5 minutes = always awake!

---

## 🎯 Testing Your Backend

Visit these URLs to test:

**Health Check:**
```
https://runtrackpro-backend.glitch.me/health
```

**API Endpoint:**
```
https://runtrackpro-backend.glitch.me/api/activities
```

Both should respond (may take 10s if asleep)!

---

## 🔧 Troubleshooting

### Build Fails
**Check:**
- Logs in Glitch editor (Tools → Logs)
- package.json has correct start script
- All dependencies in package.json

**Solution:**
- Fix errors shown in logs
- Glitch auto-restarts on file save

### Environment Variables Not Working
**Check:**
- `.env` file exists in project root
- All 4 variables are set
- No extra spaces or quotes

**Solution:**
- Re-check `.env` file
- Save file (Glitch auto-restarts)

### Backend Sleeps Too Much
**Solution:**
- Set up UptimeRobot (free)
- Pings every 5 minutes
- Keeps backend always awake

### CORS Errors
**Already configured!** Backend allows:
- Your frontend URL from `CLIENT_URL`
- Configured in backend code

---

## 💡 Pro Tips

### 1. Edit Code Directly in Glitch
- Click any file to edit
- Changes save automatically
- App restarts automatically

### 2. View Real-Time Logs
- Click "Tools" → "Logs"
- See all console output
- Debug errors easily

### 3. Share with Others
- Glitch projects are shareable
- Can invite collaborators
- Great for team projects

### 4. Remix for Testing
- Glitch allows "remixing" (forking)
- Test changes without affecting main project
- Useful for debugging

---

## 📊 Glitch vs Other Platforms

| Feature | Glitch | Railway | Render |
|---------|--------|---------|--------|
| **Credit Card** | ❌ Not needed | ❌ Not needed | ✅ Required |
| **Trial Period** | ❌ None | ✅ Expires | ❌ None |
| **Free Forever** | ✅ Yes | ⚠️ $5 credit | ✅ Yes |
| **Sleeps** | ✅ Yes (5 min) | ❌ No | ✅ Yes (15 min) |
| **Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Best For** | Students | Paid apps | Production |

**Winner: Glitch** for students without credit cards!

---

## 🎉 Success!

Your app is now deployed:
- ✅ Frontend: Vercel
- ✅ Backend: Glitch
- ✅ Database: Supabase
- ✅ 100% Free!

---

## 🔄 Auto-Deploy from GitHub

To enable auto-deploy:
1. In Glitch, click "Tools" → "Import and Export"
2. Click "Import from GitHub"
3. Your project will update from GitHub automatically!

---

**Need help?** Check Glitch docs: https://glitch.com/help/

*Last Updated: June 13, 2026*
