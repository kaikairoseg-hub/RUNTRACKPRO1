# RunTrack Pro - Vercel Deployment Guide

## 📋 Overview
This guide will help you deploy RunTrack Pro as a Progressive Web App (PWA) on Vercel.

---

## 🚀 Step 1: Prepare Your GitHub Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - RunTrack Pro"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `runtrack-pro`
3. Don't initialize with README (we already have files)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/runtrack-pro.git
git branch -M main
git push -u origin main
```

---

## ☁️ Step 2: Deploy to Vercel

### 2.1 Sign Up/Login to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your `runtrack-pro` repository
3. Click **"Import"**

### 2.3 Configure Build Settings
Vercel will auto-detect settings, but verify:

**Framework Preset:** Vite
**Root Directory:** `./` (leave as is)
**Build Command:** `cd frontend && npm install && npm run build`
**Output Directory:** `frontend/dist`
**Install Command:** `npm install`

### 2.4 Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_SUPABASE_URL` | `https://sdshhwunbgwjbdflhswh.supabase.co` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Your Supabase anon key |
| `VITE_API_URL` | `https://your-backend-url.onrender.com` | Backend URL (if deployed) |

**For development/testing:**
- Leave `VITE_API_URL` empty or point to localhost (won't work on deployed site)

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Get your live URL: `https://runtrack-pro.vercel.app` (or similar)

---

## 📱 Step 3: Test PWA Features

### 3.1 Desktop Testing (Chrome/Edge)
1. Visit your Vercel URL
2. Look for **install icon** (⊕) in address bar
3. Click to install as desktop app
4. App opens in standalone window

### 3.2 Mobile Testing (iOS Safari)
1. Open your Vercel URL in Safari
2. Tap **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. App appears on home screen like native app

### 3.3 Mobile Testing (Android Chrome)
1. Open your Vercel URL in Chrome
2. Tap **menu** (three dots)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Confirm installation
5. App appears on home screen

---

## 🎯 Step 4: Verify PWA Functionality

### Check PWA Features:
✅ **Offline Support** - Works without internet (cached pages)
✅ **Add to Home Screen** - Installable on mobile devices
✅ **Standalone Display** - No browser UI when launched
✅ **App Icons** - Gold runner logo shows on home screen
✅ **Splash Screen** - Shows when app launches
✅ **Push Notifications** - Ready for implementation

### Test Checklist:
- [ ] App loads on Vercel URL
- [ ] Login/Signup works
- [ ] Supabase connection works
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Installed app opens without browser UI
- [ ] Offline mode works (try airplane mode)

---

## 🔧 Step 5: Backend Deployment (Optional)

Your backend needs separate hosting. Options:

### Option A: Render.com (Recommended)
1. Go to [Render](https://render.com)
2. Create **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Add `.env` variables
5. Deploy and get URL
6. Update `VITE_API_URL` in Vercel

### Option B: Railway.app
Similar process to Render

### Option C: Heroku
Traditional option but requires credit card

**Important:** Update backend URL in Vercel environment variables after deployment!

---

## 📊 Browser Compatibility

| Browser | PWA Install | Offline | Notifications |
|---------|-------------|---------|---------------|
| Chrome (Desktop) | ✅ | ✅ | ✅ |
| Chrome (Android) | ✅ | ✅ | ✅ |
| Safari (iOS) | ✅ | ✅ | ⚠️ Limited |
| Safari (macOS) | ✅ | ✅ | ⚠️ Limited |
| Edge | ✅ | ✅ | ✅ |
| Firefox | ⚠️ Limited | ✅ | ✅ |

---

## 🆚 PWA vs Native App

### What PWA Can Do:
✅ Install on home screen
✅ Work offline
✅ Full-screen experience
✅ Access GPS/location
✅ Access camera
✅ Local storage
✅ Background sync
✅ Push notifications (limited on iOS)

### What PWA Cannot Do:
❌ Not in App Store/Play Store
❌ Limited background processing
❌ No access to all native APIs
❌ iOS notification limitations
❌ Cannot access contacts/calendar directly
❌ No in-app purchases via store

### Advantages of PWA:
- **No App Store approval** needed
- **Instant updates** (no user action required)
- **Smaller size** (no download, runs in browser)
- **Cross-platform** (one codebase for all devices)
- **Shareable** via URL
- **Free hosting** (Vercel free tier)

### When to Build Native App:
- Need all native device features
- Want App Store presence
- Require complex background processing
- Need iOS push notifications
- Building for smartwatches/TV

---

## 🔄 Continuous Deployment

### Automatic Deployments:
Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Build your app
3. Deploy automatically
4. Update live URL

### Preview Deployments:
Create a branch for testing:
```bash
git checkout -b feature-new-ui
# make changes
git push origin feature-new-ui
```
Vercel creates a preview URL for testing!

---

## 🛠️ Troubleshooting

### Issue: Build Fails
**Solution:** Check build logs in Vercel dashboard
- Verify environment variables are set
- Check for missing dependencies
- Ensure `vercel.json` is correct

### Issue: App Won't Install
**Solution:**
- Must use HTTPS (Vercel provides this)
- Check manifest.json is accessible
- Verify icons exist
- Try incognito/private mode

### Issue: Backend Not Working
**Solution:**
- Verify `VITE_API_URL` environment variable
- Check CORS settings in backend
- Deploy backend separately
- Use Supabase directly (skip backend)

### Issue: iOS Install Not Showing
**Solution:**
- iOS requires Safari browser
- Use Share → Add to Home Screen manually
- No automatic install prompt on iOS

### Issue: Offline Mode Not Working
**Solution:**
- Clear browser cache
- Uninstall and reinstall PWA
- Check service worker registration
- Verify network tab in DevTools

---

## 📈 Performance Optimization

### Implemented Optimizations:
✅ Code splitting (manual chunks)
✅ Service worker caching
✅ Lazy loading routes
✅ Asset optimization
✅ CDN delivery via Vercel

### Lighthouse Score Goals:
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 90+
- **PWA:** 100

Test at: https://pagespeed.web.dev/

---

## 🔐 Security Considerations

### Important:
- ⚠️ Never commit `.env` files to GitHub
- ⚠️ Use environment variables in Vercel
- ✅ Supabase handles authentication
- ✅ RLS policies protect database
- ✅ HTTPS required for PWA (Vercel provides)

### Best Practices:
- Keep Supabase keys in Vercel environment variables
- Use Row Level Security in Supabase
- Implement rate limiting in backend
- Use secure cookies for sessions

---

## 📝 Post-Deployment Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] All pages work (Dashboard, Track, Feed, etc.)
- [ ] Login/Signup functional
- [ ] Profile images upload correctly
- [ ] GPS tracking works (on HTTPS)
- [ ] App installable on desktop
- [ ] App installable on mobile (iOS & Android)
- [ ] Offline mode works
- [ ] Updates prompt when available
- [ ] Service worker registered
- [ ] Manifest.json accessible
- [ ] Icons display correctly
- [ ] Theme color appears in status bar

---

## 🎉 Success!

Your RunTrack Pro app is now:
✅ **Live** on the web
✅ **Installable** as a PWA
✅ **Works offline**
✅ **No App Store** required
✅ **Auto-updates** on every push

Share your app: `https://your-app.vercel.app`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Supabase Documentation](https://supabase.com/docs)
- [Web.dev PWA Guide](https://web.dev/learn/pwa/)

---

## 💡 Next Steps

1. **Custom Domain** - Add your own domain in Vercel
2. **Analytics** - Add Vercel Analytics or Google Analytics
3. **Error Tracking** - Integrate Sentry
4. **Backend Deployment** - Deploy Node.js backend to Render
5. **Push Notifications** - Implement web push notifications
6. **App Store** - Convert to Capacitor for native apps (optional)

---

**Need Help?**
- Vercel Support: https://vercel.com/support
- GitHub Issues: Create issue in your repository
- Documentation: Refer to docs/ folder

---

*Last Updated: June 13, 2026*
