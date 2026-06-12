# 📱 Access RunTrack Pro on Your Phone

## Your Network Configuration

**Computer IP Address:** `192.168.1.105`

**Access URLs:**
- Frontend: `http://192.168.1.105:5173`
- Backend: `http://192.168.1.105:4000`

---

## ✅ Already Done

I've already configured:
- ✅ Frontend `.env` updated to use `192.168.1.105:4000`
- ✅ Backend `.env` updated to allow `192.168.1.105:5173`
- ✅ IP address detected automatically

---

## 🔥 Step 1: Allow Through Windows Firewall

You need to allow ports 4000 and 5173 through Windows Firewall:

### Option A: Using Command (Recommended)

Run these commands in **Administrator PowerShell**:

```powershell
# Allow port 5173 (Frontend)
New-NetFirewallRule -DisplayName "RunTrack Pro Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# Allow port 4000 (Backend)
New-NetFirewallRule -DisplayName "RunTrack Pro Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

### Option B: Using Windows Firewall GUI

1. Open **Windows Defender Firewall**
2. Click **"Advanced settings"**
3. Click **"Inbound Rules"** → **"New Rule"**
4. Select **"Port"** → Click **"Next"**
5. Select **"TCP"**
6. Enter port: **5173**
7. Select **"Allow the connection"**
8. Check all profiles (Domain, Private, Public)
9. Name it: **"RunTrack Pro Frontend"**
10. Click **"Finish"**
11. **Repeat** for port **4000** (Backend)

---

## 🔄 Step 2: Restart Both Servers

After updating firewall, restart your servers:

### Stop Current Servers
Press `Ctrl + C` in both terminals (frontend and backend)

### Start Backend
```bash
cd d:\RUNTRACKPRO\backend
npm start
```

Wait for: "Running on port 4000"

### Start Frontend
```bash
cd d:\RUNTRACKPRO\frontend
npm run dev
```

Wait for: "Local: http://192.168.1.105:5173"

---

## 📱 Step 3: Connect Your Phone

### Requirements:
- ✅ Phone connected to **same WiFi** as your computer
- ✅ Computer and phone on **same network** (not guest network)

### On Your Phone:

1. **Open browser** (Chrome, Safari, etc.)
2. **Type this URL:**
   ```
   http://192.168.1.105:5173
   ```
3. **Press Enter**
4. **App should load!** 🎉

### If It Doesn't Load:

**Check 1: Same WiFi?**
- Make sure phone is on same WiFi as computer
- Not on mobile data
- Not on guest network

**Check 2: Firewall**
- Run the firewall commands above
- Or temporarily disable Windows Firewall to test

**Check 3: Servers Running?**
- Backend shows "Running on port 4000"
- Frontend shows "Local: http://192.168.1.105:5173"

**Check 4: Test from Computer First**
- Open `http://192.168.1.105:5173` on your computer
- Should work before trying phone

---

## 🎯 Install as PWA on Phone

Once it loads on your phone:

### Android (Chrome):
1. Tap **menu** (3 dots)
2. Tap **"Install app"** or **"Add to Home screen"**
3. App installs like native app!

### iOS (Safari):
1. Tap **Share** button
2. Tap **"Add to Home Screen"**
3. Name it "RunTrack Pro"
4. Tap **"Add"**
5. App appears on home screen!

---

## 🔧 Troubleshooting

### "This site can't be reached"
**Solution:**
- Check firewall is disabled or ports are allowed
- Verify IP address hasn't changed: `ipconfig`
- Make sure servers are running

### "Connection refused"
**Solution:**
- Backend not running - start it first
- Firewall blocking - allow ports 4000 and 5173

### "Mixed content" or "HTTPS required"
**Solution:**
- Some features (GPS, camera) require HTTPS
- Local network uses HTTP - some features may not work
- For full PWA features, need proper hosting with HTTPS

### App loads but API errors
**Solution:**
- Check backend is running
- Check `VITE_API_URL` in frontend/.env
- Should be `http://192.168.1.105:4000`

### Phone can't connect but computer can
**Solution:**
- **Different networks:** Phone might be on guest WiFi
- **Firewall:** Windows Firewall blocking external connections
- **VPN:** Disable VPN on computer
- **Antivirus:** May block network access

---

## 💡 Pro Tips

### Keep Computer Awake
- Go to **Settings** → **System** → **Power**
- Set **"Screen"** and **"Sleep"** to **"Never"**
- Prevents server from stopping

### Find Your IP Again
If IP changes, run:
```powershell
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

### Access from Multiple Devices
- Any device on same WiFi can access
- Use same URL: `http://192.168.1.105:5173`
- Test on tablets, other phones, etc.

### Create Desktop Shortcut
On computer:
1. Right-click desktop
2. New → Shortcut
3. URL: `http://192.168.1.105:5173`
4. Name: RunTrack Pro

---

## 📊 What Works on Phone

### ✅ Should Work:
- Login/Signup
- Dashboard
- Profile
- Activity Feed
- Challenges
- Leaderboard
- Settings
- Theme toggle

### ⚠️ May Not Work (HTTP limitation):
- GPS tracking (needs HTTPS)
- Camera access (needs HTTPS)
- Push notifications (needs HTTPS)
- Full offline mode (needs HTTPS)

### 💡 For Full Features:
- Need HTTPS (requires proper hosting)
- Or use Android Chrome's "Override HTTPS" in dev settings

---

## 🎉 Success Checklist

- [ ] Windows Firewall ports allowed (4000, 5173)
- [ ] Backend running (port 4000)
- [ ] Frontend running (port 5173)
- [ ] Phone on same WiFi as computer
- [ ] Can access `http://192.168.1.105:5173` on computer
- [ ] Can access `http://192.168.1.105:5173` on phone
- [ ] App loads and works on phone
- [ ] Installed as PWA on phone home screen

---

## 🔄 Quick Start Commands

```bash
# Get IP address
ipconfig

# Allow firewall (Admin PowerShell)
New-NetFirewallRule -DisplayName "RunTrack Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "RunTrack Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow

# Start backend
cd d:\RUNTRACKPRO\backend
npm start

# Start frontend (new terminal)
cd d:\RUNTRACKPRO\frontend
npm run dev

# Access on phone
# http://192.168.1.105:5173
```

---

**Your Phone URL:** `http://192.168.1.105:5173`

**Need Help?** Make sure:
1. Firewall allows the ports
2. Both servers are running
3. Phone is on same WiFi
4. Try on computer browser first

---

*Last Updated: June 13, 2026*
*Your IP: 192.168.1.105*
