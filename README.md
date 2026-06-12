# 🏃 RunTrack Pro

A full-stack GPS fitness tracking Progressive Web App (PWA) with real-time location sharing, social activity feeds, challenges, and leaderboards.

**✨ Features:**
- 📍 Real-time GPS tracking with interactive maps
- 📊 Activity analytics and statistics
- 🏆 Challenges and achievements
- 📈 Global leaderboards
- 👥 Social feed with likes and comments
- 📱 Progressive Web App (installable on mobile)
- 🌙 Light/Dark mode
- ✨ Glassmorphism UI design

---

## 🚀 Quick Deploy (5 Minutes)

Deploy RunTrack Pro as a PWA to Vercel for free:

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Deploy RunTrack Pro"
git remote add origin https://github.com/YOUR_USERNAME/runtrack-pro.git
git push -u origin main

# 2. Deploy to Vercel
# Visit vercel.com → Import Project → Select Repository
# Add environment variables (see below)
# Deploy!
```

**📖 Detailed guides:**
- [Quick Deploy Guide](./DEPLOY.md) - 5-minute setup
- [Full Deployment Guide](./docs/VERCEL_DEPLOYMENT.md) - Complete instructions
- [PWA Explanation](./docs/PWA_EXPLAINED.md) - What is a PWA?
- [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

---

## 📱 Progressive Web App (PWA)

RunTrack Pro is a **Progressive Web App** that:
- ✅ Installs like a native app (no App Store needed)
- ✅ Works offline with cached content
- ✅ Opens in full-screen standalone mode
- ✅ Has app icon on home screen
- ✅ Updates automatically
- ✅ Works on iOS, Android, and Desktop

**Installation:**
- **Mobile:** Visit URL → "Add to Home Screen"
- **Desktop:** Visit URL → Click install icon in address bar

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| PWA | Vite PWA Plugin, Service Worker |
| Maps | Leaflet 1.9 + react-leaflet 4 |
| Charts | Recharts 2 |
| Icons | Bootstrap Icons 1.13 |
| Auth | Supabase Auth |
| Realtime | Socket.io 4 |
| Backend | Node.js, Express 4 |
| Database | Supabase (PostgreSQL + PostGIS) |
| Storage | Supabase Storage |
| Hosting | Vercel (frontend), Render/Railway (backend) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (PWA)  ·  React + Vite + Tailwind  (Vercel)          │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Leaflet Maps        │  │  Recharts Analytics              │  │
│  │  GPS Tracking        │  │  Service Worker (Offline)        │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │  HTTPS + WebSocket
┌───────────────────────────────▼─────────────────────────────────┐
│  BACKEND  ·  Node.js + Express  (Render / Railway)              │
│  ┌───────────────────┐  ┌──────────────────────────────────────┐ │
│  │  Auth Middleware  │  │  Socket.io Real-time GPS             │ │
│  │  REST API         │  │  Activity Tracking                   │ │
│  └───────────────────┘  └──────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  DATA & STORAGE  ·  Supabase                                    │
│  ┌──────────────────────────┐  ┌────────────────────────────┐   │
│  │  PostgreSQL + PostGIS    │  │  Storage (Avatars)         │   │
│  │  Row Level Security      │  │  Public CDN                │   │
│  └──────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
RUNTRACKPRO/
├── frontend/                    # React PWA Application
│   ├── public/
│   │   ├── icons/              # PWA app icons (192px, 512px)
│   │   ├── logo.svg            # App logo
│   │   └── background.jpg      # Background image
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context (Auth)
│   │   ├── hooks/              # Custom hooks (GPS, API)
│   │   ├── lib/                # API clients, utilities
│   │   ├── pages/              # Page components
│   │   ├── App.jsx             # Main app shell
│   │   └── index.css           # Global styles + theme
│   ├── vite.config.js          # Vite + PWA configuration
│   └── package.json
│
├── backend/                     # Node.js API Server
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── sockets/            # Socket.io handlers
│   │   ├── middleware/         # Auth middleware
│   │   └── index.js            # Express server
│   └── supabase_schema.sql     # Database schema
│
├── docs/                        # Documentation
│   ├── VERCEL_DEPLOYMENT.md    # Detailed deployment guide
│   ├── PWA_EXPLAINED.md        # PWA concepts explained
│   ├── DEPLOYMENT_CHECKLIST.md # Deployment checklist
│   └── *.md                    # Other docs
│
├── sql/                         # SQL scripts
│   ├── setup/                  # Initial schema
│   └── fixes/                  # Bug fixes
│
├── DEPLOY.md                    # Quick deployment guide
├── PROJECT_STRUCTURE.md         # File organization
└── README.md                    # This file
```

---

## 🚦 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/runtrack-pro.git
cd runtrack-pro
```

### 2. Setup Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run `backend/supabase_schema.sql` in SQL Editor
3. Create `avatars` storage bucket (public)
4. Get API keys from Settings → API

### 3. Configure Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:4000
```

**Backend** (`backend/.env`):
```env
PORT=4000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Install & Run

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:4000
```

Open `http://localhost:5173` in your browser!

---

## 🌐 Deployment

### Option 1: Vercel (Recommended - Free)

**Frontend as PWA:**
1. Push code to GitHub
2. Import project to Vercel
3. Configure build settings (auto-detected)
4. Add environment variables
5. Deploy!

**Result:** `https://your-app.vercel.app` - Installable PWA

See [DEPLOY.md](./DEPLOY.md) for step-by-step guide.

### Option 2: Render/Railway

**Backend API (Optional):**
- Deploy Node.js backend separately
- Update `VITE_API_URL` in Vercel
- Enable real-time features

**Note:** App works with Supabase directly (backend optional)

---

## 📱 Install as Mobile App

### Android (Chrome):
1. Visit your Vercel URL
2. Tap menu → "Install app" or "Add to Home screen"
3. App appears on home screen
4. Opens in full-screen mode

### iOS (Safari):
1. Visit your Vercel URL
2. Tap Share button
3. Select "Add to Home Screen"
4. App appears on home screen
5. Opens without browser UI

### Desktop (Chrome/Edge):
1. Visit your Vercel URL
2. Click install icon in address bar
3. App opens in separate window
4. Added to taskbar/dock

---

## 🎯 Features

### ✅ Implemented
- 🔐 Authentication (Email + Google OAuth)
- 📍 Real-time GPS tracking with maps
- 📊 Dashboard with analytics
- 🏃 Activity logging (manual & GPS)
- 📱 Activity feed with social features
- 💬 Comments and likes
- 🏆 Challenges system
- 📈 Global leaderboards
- 👤 User profiles with avatars
- ⚙️ Settings (theme, units, goals)
- 🎨 Light/Dark mode
- ✨ Glassmorphism design
- 📱 PWA support (offline, installable)
- 🔔 Update notifications
- 🌐 Offline mode

### 🚧 Coming Soon
- 🔔 Push notifications
- 🔄 Background sync
- 📊 Advanced statistics
- 👥 Friend system
- 🗺️ Route history
- 📸 Activity photos
- 🏅 More achievements

---

## 🎨 Design Features

- **Glassmorphism UI** - Modern frosted glass effect
- **Gold Accent Theme** (#D4AF37) - Premium look
- **Dark/Light Mode** - User preference
- **Responsive Design** - Mobile-first approach
- **IBM Plex Sans Condensed** - Custom typography
- **Bootstrap Icons** - Consistent icon set
- **Wave Animations** - Dynamic auth page
- **Smooth Transitions** - Page navigation effects

---

## 📖 API Documentation

See [docs/README.md](./docs/README.md) for complete API reference.

### Key Endpoints:
- `GET /api/activities` - Get activity feed
- `POST /api/activities` - Save new activity
- `GET /api/users/me` - Get user profile
- `GET /api/challenges` - Get active challenges
- `GET /api/leaderboard` - Get rankings

### Socket Events:
- `activity:start` - Start tracking
- `location:update` - Send GPS coordinates
- `activity:stop` - Stop tracking and save

---

## 🔒 Security

- ✅ HTTPS required (Vercel provides)
- ✅ JWT authentication
- ✅ Row Level Security (Supabase)
- ✅ Environment variables (not committed)
- ✅ Service worker scope limited
- ✅ CORS configured
- ✅ Input validation
- ✅ Secure storage policies

---

## 🧪 Testing

### Local Testing:
```bash
cd frontend
npm run build
npm run preview
```

### PWA Testing:
- Lighthouse audit: https://pagespeed.web.dev/
- PWA checklist: https://web.dev/pwa-checklist/

### Browser Compatibility:
- ✅ Chrome (Desktop/Android)
- ✅ Safari (iOS/macOS)
- ✅ Edge (Desktop)
- ⚠️ Firefox (Limited PWA support)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

**Documentation:**
- [Quick Deploy](./DEPLOY.md)
- [Full Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)
- [PWA Explanation](./docs/PWA_EXPLAINED.md)
- [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)

**Issues:**
- Create an issue on GitHub
- Include error messages and screenshots

**Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Supabase Docs](https://supabase.com/docs)

---

## 🎉 Credits

Built with:
- React + Vite
- Tailwind CSS
- Supabase
- Leaflet
- Socket.io
- And many other amazing open-source projects

---

**⚡ Ready to deploy?** Follow [DEPLOY.md](./DEPLOY.md) to get your app live in 5 minutes!

**📱 Want to understand PWA?** Read [docs/PWA_EXPLAINED.md](./docs/PWA_EXPLAINED.md) for complete explanation.

---

*Last Updated: June 13, 2026*
