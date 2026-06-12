# RunTrack Pro - Project Structure

## 📁 Root Directory Structure

```
RUNTRACKPRO/
├── 📂 frontend/          # React + Vite frontend application
├── 📂 backend/           # Node.js + Express backend API
├── 📂 docs/              # Documentation files
├── 📂 sql/               # SQL scripts and database setup
│   ├── setup/            # Initial database setup scripts
│   └── fixes/            # Bug fixes and migration scripts
├── 📂 node_modules/      # Root dependencies
├── 📄 package.json       # Root package config
└── 📄 README.md          # Project overview

```

---

## 📂 Frontend (`frontend/`)

```
frontend/
├── 📂 public/
│   ├── background.jpg    # App background image
│   ├── logo.png          # App logo
│   ├── favicon.svg       # Browser favicon
│   └── icons/            # PWA icons
├── 📂 src/
│   ├── 📂 components/    # Reusable UI components
│   │   ├── ActivityCard.jsx
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── ManualLogForm.jsx
│   │   ├── OfflineBanner.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── StatCard.jsx
│   │   ├── Toast.jsx
│   │   └── UpdateBanner.jsx
│   ├── 📂 context/       # React Context providers
│   │   └── AuthContext.jsx
│   ├── 📂 hooks/         # Custom React hooks
│   │   ├── useActivities.js
│   │   ├── useChallenges.js
│   │   ├── useGPS.js
│   │   ├── useLeaderboard.js
│   │   └── useServiceWorker.js
│   ├── 📂 lib/           # Utilities and configurations
│   │   ├── api.js        # API client
│   │   ├── socket.js     # Socket.IO client
│   │   └── supabase.js   # Supabase client
│   ├── 📂 pages/         # Main application pages
│   │   ├── Auth.jsx      # Login/Signup page
│   │   ├── AuthCallback.jsx
│   │   ├── Challenges.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Feed.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── Profile.jsx
│   │   └── Track.jsx     # GPS tracking page
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── 📄 .env               # Environment variables (Supabase keys)
├── 📄 index.html         # HTML template
├── 📄 package.json       # Dependencies
├── 📄 vite.config.js     # Vite configuration
└── 📄 tailwind.config.js # Tailwind CSS config

```

---

## 📂 Backend (`backend/`)

```
backend/
├── 📂 src/
│   ├── 📂 routes/        # API route handlers
│   │   ├── activities.js # Activity CRUD + achievements
│   │   ├── challenges.js # Challenge participation
│   │   ├── leaderboard.js
│   │   └── users.js      # User profile + analytics
│   ├── 📂 sockets/       # Socket.IO handlers
│   │   └── tracking.js   # Real-time GPS tracking
│   ├── 📂 middleware/    # Express middleware
│   │   └── auth.js       # JWT authentication
│   ├── 📂 lib/           # Utilities
│   │   └── supabase.js   # Supabase client (service key)
│   └── index.js          # Express server entry point
├── 📄 .env               # Environment variables
├── 📄 package.json       # Dependencies
└── 📄 supabase_schema.sql # Database schema

```

---

## 📂 Documentation (`docs/`)

### Setup & Getting Started
- `QUICK_START.md` - Quick start guide
- `START_SERVERS.md` - How to run the app
- `DEPLOYMENT_CHECKLIST.md` - Production deployment

### Features Documentation
- `HOW_GPS_MAP_WORKS.md` - GPS tracking system
- `HOW_ACHIEVEMENTS_WORK.md` - Achievement system
- `IMPLEMENTATION_SUMMARY.md` - All features overview

### Troubleshooting Guides
- `SIGNUP_FIX.md` - Fix signup issues
- `SIGNUP_TROUBLESHOOTING.md` - Common signup problems
- `FIX_PROFILE_ISSUE.md` - Profile creation issues
- `HOW_TO_FIX_NOW.md` - Quick fixes
- `FIX_WINDOWS_CLOCK.md` - Windows time sync issues

### Design Documentation
- `GLASSMORPHISM_COMPLETE.md` - Glassmorphism implementation
- `GLASS_THEME_SUMMARY.md` - Theme design guide
- `BOOTSTRAP_ICONS_MIGRATION.md` - Icon system

### Integration Guides
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup
- `APPLY_SCHEMA_INSTRUCTIONS.md` - Database setup
- `CREATE_USER_MANUALLY.md` - Manual user creation

### Review Documents
- `FINAL_REVIEW.md` - Final project review

---

## 📂 SQL Scripts (`sql/`)

### Setup Scripts (`sql/setup/`)
- `supabase_schema.sql` - Complete database schema
  - Tables: profiles, activities, challenges, achievements
  - RLS policies
  - Triggers (auto-create profile)
  - Seed data

### Fix Scripts (`sql/fixes/`)
- `FIX_PROFILE_RLS.sql` - Profile RLS policies
- `FIX_AVATAR_STORAGE.sql` - Avatar storage policies (strict)
- `FIX_AVATAR_STORAGE_SIMPLE.sql` - Avatar storage (simple)
- `UPDATE_AVATAR_POLICIES.sql` - Update existing avatar policies
- `CHECK_AVATAR_POLICIES.sql` - Verify avatar policies
- `QUICK_FIX.sql` - Quick profile creation

---

## 🔑 Environment Variables

### Frontend `.env`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend `.env`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=4000
```

---

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### Production Mode
See `docs/DEPLOYMENT_CHECKLIST.md`

---

## 🗄️ Database Setup

### Initial Setup
1. Create Supabase project
2. Run `sql/setup/supabase_schema.sql`
3. Configure RLS policies
4. Create storage bucket for avatars
5. Run `sql/fixes/UPDATE_AVATAR_POLICIES.sql`

### Common Fixes
- Profile issues: `sql/fixes/FIX_PROFILE_RLS.sql`
- Avatar upload: `sql/fixes/UPDATE_AVATAR_POLICIES.sql`
- Manual user: `docs/CREATE_USER_MANUALLY.md`

---

## 📦 Key Dependencies

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Maps
- **Recharts** - Charts
- **Socket.IO Client** - Real-time
- **Supabase JS** - Backend

### Backend
- **Express** - Web framework
- **Socket.IO** - Real-time
- **Supabase JS** - Database
- **CORS** - Cross-origin

---

## 🎨 Styling System

- **Theme**: Dark/Light mode (localStorage)
- **Colors**: Black, Grey, Gold (#D4AF37)
- **Effects**: Glassmorphism with transparency
- **Font**: IBM Plex Sans Condensed
- **Icons**: Bootstrap Icons
- **Animations**: Page transitions (slide, fade, pop)

---

## 🔐 Authentication Flow

1. User signs up/signs in (Supabase Auth)
2. Profile auto-created (database trigger)
3. JWT token stored in session
4. Socket connection with token
5. API requests with Authorization header

---

## 📡 Real-Time Features

### Socket.IO Events
- `activity:start` - Start GPS tracking
- `location:update` - GPS point update
- `activity:stop` - Save activity
- `activity:saved` - Broadcast to user

---

## 🏆 Key Features

1. **GPS Tracking** - Real-time route recording
2. **Activities** - Create, view, share fitness activities
3. **Achievements** - Automatic milestone rewards
4. **Challenges** - Community fitness goals
5. **Leaderboard** - Rankings and competition
6. **Social Feed** - Activity sharing
7. **Profile** - Stats, achievements, settings
8. **Dark/Light Mode** - Theme toggle

---

## 📱 Mobile Support

- Responsive design (max-width: 680px)
- Touch-optimized interactions
- GPS tracking via device
- PWA ready (service worker)

---

## 🧪 Testing

### Manual Testing
1. Create account
2. Start GPS tracking
3. Save activity
4. Check achievements
5. View leaderboard
6. Toggle theme

### Browser Console
- Check for errors
- Monitor API calls
- View socket events

---

## 🐛 Common Issues

### Signup not working
→ See `docs/SIGNUP_FIX.md`

### Profile missing
→ Run `sql/fixes/FIX_PROFILE_RLS.sql`

### Avatar upload fails
→ Run `sql/fixes/UPDATE_AVATAR_POLICIES.sql`

### GPS not working
→ Enable location permissions

### Map not loading
→ Check internet connection

---

## 📞 Support

For issues, check the documentation in `docs/` folder:
- Start with `QUICK_START.md`
- Troubleshooting in `SIGNUP_TROUBLESHOOTING.md`
- Feature docs: `HOW_*_WORKS.md` files

---

## 📝 Notes

- Backend uses service role key (bypasses RLS)
- Frontend uses anon key (enforces RLS)
- GPS throttled to 3-second intervals
- Achievements checked on activity save
- Theme persisted to localStorage
- All times in UTC (database)

---

Last Updated: June 13, 2026
