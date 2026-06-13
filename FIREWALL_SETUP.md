# 🔥 Windows Firewall Setup for Phone Access

Your phone can't connect because Windows Firewall is blocking the ports. Here's how to fix it:

---

## ⚡ Quick Fix (Easiest Method)

### Step 1: Run the Firewall Script
1. Go to `D:\RUNTRACKPRO`
2. **Right-click** on `configure-firewall.bat`
3. Select **"Run as administrator"**
4. Click "Yes" on the User Account Control prompt
5. Press any key to continue
6. Wait for completion message

✅ Done! Try accessing from your phone: `http://192.168.1.105:5173`

---

## 🔧 Manual Method (If Script Doesn't Work)

### Option 1: Windows Firewall GUI

**For Port 5173 (Frontend):**
1. Press `Win + R` and type `wf.msc`, press Enter
2. Click **"Inbound Rules"** in left panel
3. Click **"New Rule..."** in right panel
4. Select **"Port"** → Click Next
5. Select **"TCP"** and type `5173` → Click Next
6. Select **"Allow the connection"** → Click Next
7. Check all boxes (Domain, Private, Public) → Click Next
8. Name: `RunTrack Frontend` → Click Finish

**For Port 4000 (Backend):**
1. Repeat steps above
2. Use port `4000` instead
3. Name: `RunTrack Backend`

### Option 2: Command Line (PowerShell as Admin)

1. Right-click Start menu → **"Windows PowerShell (Admin)"**
2. Run these commands:

```powershell
# Allow Backend (Port 4000)
New-NetFirewallRule -DisplayName "RunTrack Backend" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow

# Allow Frontend (Port 5173)
New-NetFirewallRule -DisplayName "RunTrack Frontend" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
```

3. Close PowerShell

### Option 3: Using netsh (Command Prompt as Admin)

1. Right-click Start menu → **"Command Prompt (Admin)"**
2. Run these commands:

```batch
netsh advfirewall firewall add rule name="RunTrack Backend" dir=in action=allow protocol=TCP localport=4000

netsh advfirewall firewall add rule name="RunTrack Frontend" dir=in action=allow protocol=TCP localport=5173
```

3. Close Command Prompt

---

## 🔍 Verify Firewall Rules

### Check if rules were added:
1. Press `Win + R` and type `wf.msc`
2. Click **"Inbound Rules"**
3. Look for:
   - ✅ "RunTrack Backend" (Port 4000)
   - ✅ "RunTrack Frontend" (Port 5173)

### Test from Command Prompt:
```batch
netsh advfirewall firewall show rule name="RunTrack Backend"
netsh advfirewall firewall show rule name="RunTrack Frontend"
```

---

## 📱 After Configuring Firewall

### Test on Phone:
1. Make sure phone is on **same WiFi** as laptop
2. Open browser on phone
3. Go to: `http://192.168.1.105:5173`
4. App should load! 🎉

### If Still Not Working:

**Check Computer IP Address:**
```batch
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter. If it's not `192.168.1.105`, update:
- `frontend/.env` → `VITE_API_URL=http://[NEW_IP]:4000`
- `backend/.env` → `CLIENT_URL=http://[NEW_IP]:5173`
- Restart servers

**Check WiFi Network:**
- Laptop and phone must be on **same WiFi network**
- Not on guest WiFi or different network
- Not using VPN on either device

**Check Servers Running:**
```batch
netstat -ano | findstr :4000
netstat -ano | findstr :5173
```
Both should show "LISTENING"

**Try Disabling Firewall Temporarily (Testing Only):**
1. Windows Security → Firewall & network protection
2. Click your active network (Private/Public)
3. Turn OFF Microsoft Defender Firewall
4. Test on phone
5. **IMPORTANT:** Turn firewall back ON after testing!

---

## 🗑️ Remove Firewall Rules (If Needed)

### Using GUI:
1. Press `Win + R` → type `wf.msc`
2. Click "Inbound Rules"
3. Find "RunTrack Backend" and "RunTrack Frontend"
4. Right-click → Delete

### Using Command:
```powershell
# PowerShell as Admin
Remove-NetFirewallRule -DisplayName "RunTrack Backend"
Remove-NetFirewallRule -DisplayName "RunTrack Frontend"
```

Or:
```batch
# Command Prompt as Admin
netsh advfirewall firewall delete rule name="RunTrack Backend"
netsh advfirewall firewall delete rule name="RunTrack Frontend"
```

---

## 🔒 Security Note

Opening these ports allows devices on your local network to access your app. This is safe for home WiFi, but:
- ❌ Don't use on public WiFi
- ❌ Don't forward these ports on your router
- ✅ Only for local network testing
- ✅ Deploy to cloud (Fly.io) for production use

---

## ✅ Quick Checklist

Before accessing from phone:
- [ ] Firewall rules added for ports 4000 and 5173
- [ ] Backend server running (check port 4000)
- [ ] Frontend server running (check port 5173)
- [ ] Phone on same WiFi as laptop
- [ ] Using correct IP: `http://192.168.1.105:5173`
- [ ] Laptop not in sleep mode

---

**Need Help?** Check `PHONE_ACCESS_GUIDE.md` for more troubleshooting steps.
