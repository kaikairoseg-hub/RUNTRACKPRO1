# RunTrack Pro - Quick Reference Card

## 🚀 Deploy in 3 Steps

### 1. GitHub
```bash
git init
git add .
git commit -m "Deploy RunTrack Pro"
git remote add origin https://github.com/USERNAME/runtrack-pro.git
git push -u origin main
```

### 2. Vercel
- Visit [vercel.com](https://vercel.com)
- Import `runtrack-pro` repository
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Click Deploy

### 3. Share
- URL: `https://your-app.vercel.app`
- Users install as PWA from browser

---

## 📱 Install App

| Device | Steps |
|--------|-------|
| **Android** | Menu → Install app |
| **iOS** | Share → Add to Home Screen |
| **Desktop** | Click install icon in address bar |

---

## 🔑 Environment Variables

### Frontend (Vercel)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://backend.onrender.com (optional)
```

### Backend (Render - Optional)
```
PORT=4000
CLIENT_URL=https://your-app.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| `frontend/vite.config.js` | PWA configuration |
| `frontend/.env` | Frontend environment variables |
| `backend/.env` | Backend environment variables |
| `frontend/public/icons/` | PWA app icons |
| `backend/supabase_schema.sql` | Database schema |

---

## 🛠️ Local Development

```bash
# Install all
npm run install:all

# Run both (frontend + backend)
npm run dev

# Or separately
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:4000

# Build for production
cd frontend && npm run build

# Preview production build
npm run preview
```

---

## 🌐 URLs After Deployment

| Service | URL Pattern |
|---------|-------------|
| **Live App** | `https://your-app.vercel.app` |
| **Vercel Dashboard** | `https://vercel.com/dashboard` |
| **Supabase** | `https://app.supabase.com` |
| **Backend** (optional) | `https://your-backend.onrender.com` |

---

## ✅ Quick Test Checklist

After deployment:
- [ ] App loads at Vercel URL
- [ ] Login/signup works
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Opens in standalone mode
- [ ] Offline mode works

---

## 🔧 Quick Fixes

### Build Fails
```bash
# Check build locally
cd frontend
npm run build
```

### Can't Install PWA
- Use HTTPS (Vercel has it)
- Clear browser cache
- Try incognito mode

### Environment Variables Not Working
- Must start with `VITE_` for frontend
- Redeploy after changing in Vercel

### Backend Not Connecting
- Check `VITE_API_URL` in Vercel
- Verify backend is deployed
- Check CORS settings

---

## 📊 PWA Features

| Feature | Status |
|---------|--------|
| Installable | ✅ |
| Offline Mode | ✅ |
| Push Notifications | ⚠️ Limited iOS |
| Background Sync | ✅ |
| Add to Home Screen | ✅ |
| Standalone Display | ✅ |
| App Icons | ✅ |
| Splash Screen | ✅ |

---

## 🎯 What You Get

✅ **Live web app** - Works in any browser  
✅ **Installable PWA** - Like a native app  
✅ **Offline support** - Cached content  
✅ **Auto updates** - Push to main = deploy  
✅ **Free hosting** - Vercel free tier  
✅ **HTTPS** - Secure by default  
✅ **Global CDN** - Fast worldwide  

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Overview & getting started |
| `DEPLOY.md` | Quick 5-minute deploy guide |
| `docs/VERCEL_DEPLOYMENT.md` | Detailed deployment |
| `docs/PWA_EXPLAINED.md` | What is PWA? |
| `docs/DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `PROJECT_STRUCTURE.md` | File organization |

---

## 💡 Pro Tips

- Push to `main` = auto-deploy
- Create branch for preview URL
- Monitor builds in Vercel dashboard
- Test PWA with Lighthouse
- Check DevTools → Application tab
- Service worker updates on reload

---

## 🆘 Need Help?

1. Check `docs/` folder for guides
2. Review deployment checklist
3. Check Vercel build logs
4. Look at browser console
5. Test in incognito mode

---

## 🔄 Update App

```bash
# Make changes
git add .
git commit -m "Add feature"
git push origin main

# Vercel auto-deploys! ✨
# Users get update automatically
```

---

**Your App URLs:**
- Live: `https://________________.vercel.app`
- GitHub: `https://github.com/_______/runtrack-pro`
- Supabase: `https://app.supabase.com/project/_______`

---

*Keep this card handy for quick reference!*
