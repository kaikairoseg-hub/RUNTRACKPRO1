# 🚀 RunTrack Pro - Quick Start Guide

## TL;DR

RunTrack Pro is **complete and ready to deploy**. This guide will get you running in 15 minutes.

---

## 🎯 What You Have

A full-stack GPS fitness tracking app with:
- ✅ Real-time GPS tracking with maps
- ✅ Social activity feed with likes & comments
- ✅ Challenges and leaderboards
- ✅ User profiles and achievements
- ✅ PWA support for mobile
- ✅ Complete backend API
- ✅ Complete frontend UI

---

## ⚡ Fast Track to Local Development

### 1. Prerequisites

```bash
node --version  # Should be v20 or higher
npm --version   # Should be v9 or higher
```

### 2. Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project to provision
3. Go to SQL Editor → New Query
4. Copy and paste entire contents of `backend/supabase_schema.sql`
5. Click "Run"
6. Go to Storage → Create new bucket → Name: `avatars` → Public: ON
7. Copy the following from Settings → API:
   - Project URL
   - `anon public` key
   - `service_role` key (secret)

### 3. Configure Backend (2 minutes)

Create `backend/.env`:
```bash
PORT=4000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 4. Configure Frontend (2 minutes)

Create `frontend/.env.local`:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_API_URL=http://localhost:4000
```

### 5. Install & Run (3 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 6. Open & Test (1 minute)

1. Open http://localhost:5173
2. Sign up with email
3. Start tracking an activity
4. Check it out! 🎉

---

## 🌐 Deploy to Production

### Option A: Use the Detailed Guide

Follow `DEPLOYMENT_CHECKLIST.md` for comprehensive step-by-step instructions.

### Option B: Fast Deploy

**Backend → Render**
1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from step 3 above (update CLIENT_URL to your Vercel URL)
7. Deploy

**Frontend → Vercel**
1. Import project on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Framework preset: Vite
4. Add environment variables from step 4 above (update VITE_API_URL to your Render URL)
5. Deploy

Done! 🚀

---

## 📚 Full Documentation

- **README.md** - Architecture overview
- **IMPLEMENTATION_SUMMARY.md** - Complete feature list
- **DEPLOYMENT_CHECKLIST.md** - Detailed deployment guide
- **FINAL_REVIEW.md** - Project completion report

---

## 🆘 Troubleshooting

### Backend won't start
- Check `.env` file exists in `backend/`
- Verify Supabase credentials are correct
- Check port 4000 isn't already in use

### Frontend won't connect
- Verify backend is running on port 4000
- Check browser console for errors
- Verify `.env.local` file exists in `frontend/`
- Ensure CORS allows localhost:5173

### Database errors
- Verify `supabase_schema.sql` ran completely
- Check RLS policies are enabled
- Verify service role key is correct

### GPS not working
- Use HTTPS (required for geolocation API)
- Grant location permissions in browser
- Check device has GPS enabled

---

## 💡 Quick Tips

**Development**
- Backend runs on http://localhost:4000
- Frontend runs on http://localhost:5173
- Frontend proxies API calls to backend automatically

**Testing**
- Create multiple test accounts to see social features
- Use desktop browser for initial testing
- Test GPS on mobile device for real tracking

**Deployment**
- Backend needs 512MB+ RAM
- Frontend builds to static files
- Database should be in same region as backend

---

## 🎯 What to Test First

1. **Sign up** with email
2. **Track activity** with GPS
3. **View activity** in feed
4. **Like** your own activity
5. **Join challenge**
6. **Check leaderboard**
7. **Update profile** with avatar
8. **Log manual activity**

---

## 🎉 You're Ready!

The app is **fully functional** with all features implemented. Start with local development, then deploy to production when ready.

For questions or issues, check the documentation files listed above.

**Happy tracking!** 🏃‍♂️🚴‍♀️
