# 🏃 RunTrack Pro

A full-stack GPS fitness tracking app with real-time location sharing, social activity feeds, challenges, and leaderboards.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND  ·  React 18 + Vite + Tailwind CSS  (Vercel)          │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  Leaflet / react-    │  │  Recharts (Bar, Area, Line)      │  │
│  │  leaflet (GPS map)   │  │  useGPS hook → browser GPS API   │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │  HTTPS + WebSocket (Socket.io)
┌───────────────────────────────▼─────────────────────────────────┐
│  BACKEND  ·  Node.js + Express  (Render / Railway)              │
│  ┌───────────────────┐  ┌──────────────────────────────────────┐ │
│  │  Supabase Auth    │  │  Socket.io  –  real-time GPS rooms   │ │
│  │  JWT middleware   │  │  activity:start / location:update /  │ │
│  └───────────────────┘  │  activity:stop → saves to DB         │ │
│                         └──────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  DATA & STORAGE  ·  Supabase                                    │
│  ┌──────────────────────────┐  ┌────────────────────────────┐   │
│  │  PostgreSQL + PostGIS    │  │  Storage Buckets           │   │
│  │  profiles / activities   │  │  avatars/  (public)        │   │
│  │  likes / comments        │  └────────────────────────────┘   │
│  │  challenges / leaderboard│                                    │
│  └──────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
RUNTRACKPRO/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx          # Root shell with auth gate + nav
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Supabase auth + socket connect
│   │   ├── hooks/
│   │   │   ├── useGPS.js         # Browser Geolocation + socket emit
│   │   │   ├── useActivities.js  # Feed data + optimistic like/comment
│   │   │   ├── useChallenges.js  # Challenges + join/leave
│   │   │   └── useLeaderboard.js # Ranked distance data
│   │   ├── lib/
│   │   │   ├── supabase.js  # Supabase anon client
│   │   │   ├── api.js       # fetch wrapper with auto-auth header
│   │   │   └── socket.js    # Socket.io singleton
│   │   ├── components/      # Avatar, Badge, StatCard, Toast, etc.
│   │   └── pages/           # Dashboard, Track, Feed, Challenges,
│   │                        #   Leaderboard, Profile, Auth
│   ├── vite.config.js       # Dev proxy → backend, code splitting
│   └── tailwind.config.js
│
├── backend/                # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── index.js         # Express app + Socket.io server
│   │   ├── lib/supabase.js  # Service-role Supabase client
│   │   ├── middleware/auth.js   # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── activities.js    # CRUD + likes + comments
│   │   │   ├── users.js         # Profile + achievements
│   │   │   ├── challenges.js    # Join/leave challenges
│   │   │   └── leaderboard.js   # Aggregated distance rankings
│   │   └── sockets/tracking.js  # Real-time GPS event handlers
│   └── supabase_schema.sql  # Full DB schema + RLS + seed data
│
└── README.md
```

---

## Quick Start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. In **SQL Editor**, paste and run `backend/supabase_schema.sql`
3. In **Storage**, create a bucket named `avatars` with **Public** toggled on
4. Run the storage policy SQL at the bottom of `supabase_schema.sql`
5. Note your **Project URL** and both keys (anon + service role) from **Settings → API**

### 2. Configure environment variables

```bash
# backend/.env  (copy from backend/.env.example)
PORT=4000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# frontend/.env.local  (copy from frontend/.env.example)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:4000
```

### 3. Install dependencies

```bash
# From repo root
cd frontend && npm install
cd ../backend && npm install
```

### 4. Run in development

Open **two terminals**:

```bash
# Terminal 1 — backend
cd backend
npm run dev
# → Running on http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm run dev
# → Running on http://localhost:5173
```

Open `http://localhost:5173` in your browser, sign up, and start tracking.

---

## API Reference

All endpoints require `Authorization: Bearer <supabase_jwt>` except `/health`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/activities` | Feed (`?filter=everyone\|friends\|mine`) |
| POST | `/api/activities` | Save completed activity |
| POST | `/api/activities/:id/like` | Toggle like |
| POST | `/api/activities/:id/comments` | Post comment |
| DELETE | `/api/activities/:id` | Delete own activity |
| GET | `/api/users/me` | Current user profile + stats |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/me/achievements` | Earned achievements |
| GET | `/api/challenges` | All active challenges |
| POST | `/api/challenges/:id/join` | Join a challenge |
| DELETE | `/api/challenges/:id/join` | Leave a challenge |
| GET | `/api/leaderboard` | Rankings (`?period=weekly\|monthly\|alltime`) |

## Socket.io Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `activity:start` | `{ type }` |
| Client → Server | `location:update` | `{ lat, lng, accuracy, timestamp }` |
| Client → Server | `activity:stop` | `{ title, distance, duration_seconds, calories }` |
| Client → Server | `watch:user` | `{ targetUserId }` |
| Server → Client | `activity:saved` | Saved activity object |
| Server → Client | `friend:location` | `{ userId, lat, lng }` |
| Server → Client | `friend:activity:start` | `{ userId, type }` |
| Server → Client | `friend:activity:stop` | `{ userId }` |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build          # outputs to frontend/dist/
# Deploy dist/ to Vercel, set VITE_* env vars in project settings
```

### Backend → Render / Railway

- Set root directory to `backend/`
- Start command: `npm start`
- Add environment variables: `PORT`, `CLIENT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Maps | Leaflet 1.9 + react-leaflet 4 |
| Charts | Recharts 2 |
| Auth | Supabase Auth (email + Google OAuth) |
| Realtime | Socket.io 4 |
| Backend | Node.js 20+, Express 4 |
| Database | Supabase (PostgreSQL + PostGIS) |
| Storage | Supabase Storage (avatars bucket) |
| Hosting | Vercel (frontend), Render/Railway (backend) |
