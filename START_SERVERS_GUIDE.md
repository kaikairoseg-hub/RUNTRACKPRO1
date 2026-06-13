# 🚀 RunTrack Pro - Server Startup Guide

Quick guide for starting and stopping your RunTrack Pro servers.

---

## 📋 Quick Start

### Option 1: Double-Click Startup Script (Easiest)
1. Navigate to `D:\RUNTRACKPRO`
2. Double-click `start-servers.bat`
3. Two command windows will open (Backend & Frontend)
4. Wait 10 seconds for servers to start
5. Access app at `http://192.168.1.105:5173`

### Option 2: Manual Start from IDE (Kiro)
Backend and Frontend are already running in Kiro background processes!
- Check running processes in Kiro status bar
- Servers auto-start when you open the project

---

## 🛑 Stopping Servers

### Option 1: Double-Click Stop Script
1. Navigate to `D:\RUNTRACKPRO`
2. Double-click `stop-servers.bat`
3. All servers will be terminated

### Option 2: Close Command Windows
- Close the "RunTrack Backend" window
- Close the "RunTrack Frontend" window

### Option 3: Manual Kill
```batch
REM Stop Backend (Port 4000)
netstat -ano | findstr :4000
taskkill /F /PID [PID_NUMBER]

REM Stop Frontend (Port 5173)
netstat -ano | findstr :5173
taskkill /F /PID [PID_NUMBER]
```

---

## 🔍 Checking if Servers are Running

### Check Ports:
```batch
netstat -ano | findstr :4000
netstat -ano | findstr :5173
```

### Access URLs:
- **Backend API**: http://localhost:4000/api/health (should return 200 OK)
- **Frontend**: http://localhost:5173 (should load login page)
- **Phone Access**: http://192.168.1.105:5173

---

## 🔧 Troubleshooting

### Problem: "Port already in use" error

**Solution:**
1. Run `stop-servers.bat` to kill all processes
2. Wait 5 seconds
3. Run `start-servers.bat` again

### Problem: Can't access from phone

**Checklist:**
- ✅ Both servers running (check task manager or netstat)
- ✅ Phone on same WiFi as laptop
- ✅ Computer IP address is `192.168.1.105` (check with `ipconfig`)
- ✅ Windows Firewall allows ports 4000 and 5173
- ✅ Laptop is not in sleep mode

**Fix Firewall:**
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "RunTrack Backend" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
New-NetFirewallRule -DisplayName "RunTrack Frontend" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
```

### Problem: Servers crash or stop unexpectedly

**Solution:**
1. Check backend logs in command window for errors
2. Check frontend logs for errors
3. Verify `.env` files have correct configuration
4. Ensure Node.js is updated (v18+ required)

---

## 🌐 IP Address Changed?

If your computer IP address changes (different WiFi network):

1. **Find new IP:**
   ```batch
   ipconfig
   ```
   Look for "IPv4 Address" under your WiFi adapter

2. **Update configuration:**
   - Edit `frontend/.env`: Change `VITE_API_URL=http://[NEW_IP]:4000`
   - Edit `backend/.env`: Change `CLIENT_URL=http://[NEW_IP]:5173`

3. **Restart servers:**
   - Run `stop-servers.bat`
   - Run `start-servers.bat`

---

## 📱 Access URLs Summary

| Location | URL | Notes |
|----------|-----|-------|
| **Computer Browser** | http://localhost:5173 | Full features |
| **Phone (Same WiFi)** | http://192.168.1.105:5173 | Full features, requires servers running |
| **Phone (Anywhere)** | https://runtrackpro-frontend.vercel.app | Limited features (no backend) |

---

## 💡 Tips

### Keep Servers Running 24/7:
1. **Disable Sleep Mode:**
   - Settings → System → Power & sleep
   - Set "When plugged in, PC goes to sleep after" to "Never"

2. **Keep Laptop Charging:**
   - Always plugged into power outlet

3. **Don't Close Server Windows:**
   - Minimize them instead of closing

### Auto-Start on Windows Startup:
1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Create shortcut to `start-servers.bat` in this folder
4. Servers will auto-start when Windows boots

---

## 📞 Need Help?

Check these files:
- `PHONE_ACCESS_GUIDE.md` - Phone access troubleshooting
- `FUTURE_DEPLOYMENT_GUIDE.md` - Deploy backend to cloud (requires credit card)
- `README.md` - Complete project documentation

---

**Last Updated:** June 13, 2026
