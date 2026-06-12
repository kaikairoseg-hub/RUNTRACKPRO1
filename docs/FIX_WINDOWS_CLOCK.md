# 🕐 Fix Windows Clock Showing Wrong Year (2026)

## Your Problem:
Your Windows is showing 6/11/2026 instead of the current date. This causes authentication to fail.

---

## Method 1: Turn OFF then ON Automatic Time

1. **Windows + I** → Time & Language → Date & Time
2. Turn **OFF** "Set time automatically"
3. Wait 5 seconds
4. Turn **ON** "Set time automatically"
5. Click **"Sync now"**
6. Wait 10 seconds and check if the date is correct

---

## Method 2: Change Time Server (BEST)

Your computer is syncing with `time.windows.com` but getting wrong time.

### Step-by-Step:

1. **Right-click the clock** in taskbar (bottom right)
2. Click **"Adjust date and time"**
3. Scroll down and click **"Additional clocks"** or **"Change date and time"**
4. Click **"Internet Time"** tab
5. Click **"Change settings"**
6. Change server from `time.windows.com` to:
   ```
   time.google.com
   ```
   Or try these alternatives:
   ```
   time.nist.gov
   pool.ntp.org
   time.cloudflare.com
   ```
7. Click **"Update now"**
8. Click **"OK"**

---

## Method 3: Command Line Fix (Quick)

1. Open **Command Prompt as Administrator**:
   - Press **Windows + X**
   - Click **"Command Prompt (Admin)"** or **"PowerShell (Admin)"**

2. Run these commands one by one:
   ```cmd
   net stop w32time
   w32tm /unregister
   w32tm /register
   net start w32time
   w32tm /config /syncfromflags:manual /manualpeerlist:"time.google.com"
   w32tm /config /update
   w32tm /resync
   ```

3. Check the current time:
   ```cmd
   w32tm /query /status
   ```

---

## Method 4: Manual Time Set (Temporary)

If automatic sync isn't working:

1. **Windows + I** → Time & Language → Date & Time
2. Turn **OFF** "Set time automatically"
3. Click **"Change"** under "Set the date and time manually"
4. Set to current date: **December 2024** (or whatever the actual current date is)
5. Click **"Change"**

---

## After Fixing the Clock:

1. **Close ALL browser windows**
2. **Restart your browser**
3. Go to: http://localhost:5173
4. **Clear cache**: Press **Ctrl+Shift+Delete**
   - Select "All time"
   - Check "Cookies" and "Cached files"
   - Click "Clear data"
5. Go to: http://localhost:5173 again
6. Try signing in

---

## Verify It's Fixed:

Open browser console (F12) and run:
```javascript
console.log('Current timestamp:', Date.now());
console.log('Current date:', new Date().toISOString());
```

**Expected:** Should show December 2024, NOT 2026

---

## If Nothing Works:

Your CMOS battery might be dead. This is the small battery on your motherboard that keeps time when the computer is off.

**Short-term fix:** I've disabled the automatic logout, so you can use the app even with wrong clock. Just know that some features might behave strangely.

**Long-term fix:** Replace CMOS battery or use an external time server.

---

**Try Method 2 (Change Time Server) first - it usually works!** 🚀
