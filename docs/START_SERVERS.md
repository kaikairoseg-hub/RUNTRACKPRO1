# 🚀 How to Start RunTrack Pro

## ⚠️ Important: Navigate to Correct Directory

You need to be in the `C:\RUNTRACKPRO\RUNTRACKPRO` directory, not just `C:\RUNTRACKPRO`!

---

## Option 1: Start Both Servers (Recommended)

### Using Git Bash / Terminal

```bash
# Navigate to the project root
cd C:/RUNTRACKPRO/RUNTRACKPRO

# Start backend (Terminal 1)
cd backend
npm run dev

# In a NEW terminal, start frontend (Terminal 2)
cd C:/RUNTRACKPRO/RUNTRACKPRO/frontend
npm run dev
```

---

## Option 2: Use Workspace Scripts

From `C:\RUNTRACKPRO\RUNTRACKPRO` directory:

```bash
# Start both at once (doesn't work well on Windows)
npm run dev

# OR start individually:
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2 (new terminal)
```

---

## Your Current Issue

You ran `npm run dev` from `C:\RUNTRACKPRO` instead of `C:\RUNTRACKPRO\RUNTRACKPRO`.

### Fix:
```bash
cd RUNTRACKPRO
npm run dev:backend
```

Then in a new terminal:
```bash
cd C:/RUNTRACKPRO/RUNTRACKPRO
npm run dev:frontend
```

---

## ✅ Verify Servers Are Running

### Backend
- URL: http://localhost:4000
- Test: http://localhost:4000/health
- Should show: `{"status":"ok","timestamp":"..."}`

### Frontend
- URL: http://localhost:5173
- Should show: RunTrack Pro login page

---

## 🎯 Quick Start Commands

**Copy and paste these in order:**

### Terminal 1 (Backend):
```bash
cd C:/RUNTRACKPRO/RUNTRACKPRO/backend
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd C:/RUNTRACKPRO/RUNTRACKPRO/frontend
npm run dev
```

---

## 🔍 Troubleshooting

**"Cannot find module" error:**
```bash
# In backend directory
npm install

# In frontend directory  
npm install
```

**Port already in use:**
```bash
# Windows: Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F

# For port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

**Dependencies not installed:**
```bash
cd C:/RUNTRACKPRO/RUNTRACKPRO/backend
npm install

cd C:/RUNTRACKPRO/RUNTRACKPRO/frontend
npm install
```

---

## 📂 Correct Directory Structure

```
C:\RUNTRACKPRO\
└── RUNTRACKPRO\           ← You need to be HERE
    ├── backend\
    │   ├── src\
    │   ├── package.json   ← Backend package
    │   └── .env
    ├── frontend\
    │   ├── src\
    │   ├── package.json   ← Frontend package
    │   └── .env
    └── package.json       ← Root workspace package
```

---

## ✨ After Starting

1. Backend should show:
   ```
   🚀 RunTrack Pro backend running on port 4000
   📡 Socket.io enabled for real-time tracking
   🔗 Client URL: http://localhost:5173
   ```

2. Frontend should show:
   ```
   VITE v5.x.x  ready in XXXms
   ➜  Local:   http://localhost:5173/
   ```

3. Open browser: http://localhost:5173
4. Sign up and start tracking! 🏃‍♂️

---

## 🆘 Still Having Issues?

Make sure you're in the right directory:
```bash
pwd  # Should show: C:/RUNTRACKPRO/RUNTRACKPRO
```

Or use Windows Command Prompt:
```cmd
cd C:\RUNTRACKPRO\RUNTRACKPRO\backend
npm run dev
```

Then new command prompt:
```cmd
cd C:\RUNTRACKPRO\RUNTRACKPRO\frontend  
npm run dev
```
