# How GPS Map Tracking Works in RunTrack Pro

## Overview
RunTrack Pro uses real-time GPS tracking with Leaflet maps and OpenStreetMap to track your running, cycling, walking, and hiking activities. The system records your route, calculates distance, tracks time, and estimates calories burned.

---

## Technology Stack

### Frontend Libraries
1. **React Leaflet** - React wrapper for Leaflet maps
2. **Leaflet** - Open-source JavaScript library for interactive maps
3. **OpenStreetMap** - Free map tiles (no API key required)
4. **Browser Geolocation API** - Native GPS access

### Backend
- **Socket.IO** - Real-time communication between client and server
- **Supabase/PostgreSQL** - Stores activities with GeoJSON routes
- **PostGIS** - PostgreSQL extension for geographic data

---

## How It Works: Step-by-Step

### 1. **Starting an Activity**

When you click "Start Activity":

```javascript
start()
  ↓
Request GPS permission from browser
  ↓
Start GPS watchPosition (continuous tracking)
  ↓
Start timer (increments every second)
  ↓
Emit "activity:start" to server via Socket.IO
```

**GPS Options:**
- `enableHighAccuracy: true` - Uses GPS chip for better accuracy
- `maximumAge: 2000` - Cached position max 2 seconds old
- `timeout: 10000` - Wait up to 10 seconds for position

### 2. **Tracking GPS Points**

Every 3 seconds (throttled), the system:

```javascript
Get GPS coordinates (latitude, longitude, altitude, accuracy)
  ↓
Check if 3 seconds passed since last point (throttling)
  ↓
Validate point (filter GPS noise > 500m jumps)
  ↓
Add point to route array
  ↓
Calculate distance using Haversine formula
  ↓
Update elevation gain if climbing
  ↓
Emit "location:update" to server
  ↓
Update map display (auto-center on current position)
```

**Throttling (3 seconds):**
- Prevents too many points (saves battery, reduces noise)
- GPS typically updates every 1 second
- We only accept 1 point every 3 seconds

**Noise Filtering:**
- GPS can "jump" due to signal loss
- Filters out jumps > 500 meters
- Prevents unrealistic distance calculations

### 3. **Map Rendering**

The map shows:

**Tiles:**
- OpenStreetMap base layer
- Free, no API key required
- Shows streets, buildings, landmarks

**Route Line (Polyline):**
- Gold color (`#D4AF37`)
- 4px thick
- Connects all GPS points
- Updates in real-time as you move

**Markers:**
- **Start Marker** (Green dot) - First GPS point
- **Current Marker** (Gold dot with pulse) - Latest position

**Auto-Follow:**
- Map automatically centers on your current position
- Smooth animation (0.5s duration)
- Keeps you in view as you move

### 4. **Distance Calculation**

Uses **Haversine formula** to calculate great-circle distance between two points on Earth:

```javascript
function haversine([lat1, lng1], [lat2, lng2]) {
  // Convert degrees to radians
  // Calculate difference in coordinates
  // Apply haversine formula
  // Return distance in kilometers
}
```

**Why Haversine?**
- Earth is a sphere, not flat
- Accurate for GPS distances
- Accounts for Earth's curvature

**Example:**
- Point A: [14.5995, 120.9842] (Manila)
- Point B: [14.6001, 120.9850]
- Distance: ~0.095 km (95 meters)

### 5. **Metrics Calculation**

**Pace (Running/Walking):**
```javascript
pace = totalSeconds / 60 / distanceKm
// Result: minutes per kilometer
// Example: 5:30/km
```

**Speed (Cycling):**
```javascript
speed = (distanceKm / totalSeconds) * 3600
// Result: kilometers per hour
// Example: 25.5 km/h
```

**Calories (Estimate):**
```javascript
calories = distanceKm * 70
// Rough estimate: 70 calories per km
```

**Elevation Gain:**
```javascript
if (currentAltitude > previousAltitude) {
  gain += (currentAltitude - previousAltitude)
}
// Only counts uphill (positive change)
```

### 6. **Stopping an Activity**

When you click "Stop Activity":

```javascript
Stop GPS watch
  ↓
Stop timer
  ↓
Show save modal (enter title)
  ↓
User clicks "Save"
  ↓
Emit "activity:stop" to server with data
  ↓
Server saves to database as GeoJSON
  ↓
Clear tracking state
  ↓
Show success message
```

### 7. **Data Storage**

Activity saved to database with:

```javascript
{
  id: "uuid",
  user_id: "uuid",
  title: "Morning Run",
  type: "Running",
  distance: 5.23,              // kilometers
  duration_seconds: 1800,      // 30 minutes
  calories: 366,               // estimated
  elevation_gain_m: 42.5,      // meters
  route_geojson: {             // GeoJSON LineString
    type: "LineString",
    coordinates: [
      [120.9842, 14.5995],     // [lng, lat] format
      [120.9850, 14.6001],
      // ... more points
    ]
  },
  created_at: "2026-06-13T10:30:00Z"
}
```

**GeoJSON Format:**
- Standard format for geographic data
- Can be visualized on any map
- Supported by PostGIS for queries

---

## Real-Time Features (Socket.IO)

### Events Emitted (Client → Server):

1. **activity:start**
   ```javascript
   { type: "Running" }
   ```

2. **location:update**
   ```javascript
   { lat: 14.5995, lng: 120.9842, accuracy: 10, timestamp: 1686648600000 }
   ```

3. **activity:stop**
   ```javascript
   {
     title: "Morning Run",
     distance: 5.23,
     duration_seconds: 1800,
     calories: 366,
     elevation_gain_m: 42.5
   }
   ```

### Events Received (Server → Client):

1. **activity:saved**
   ```javascript
   { id: "uuid", title: "Morning Run", ... }
   ```
   - Shows success message
   - Triggers achievement check

---

## UI Components

### Track Page Structure:

```
┌─────────────────────────────────────┐
│ Activity Type Buttons (Running...)  │
├─────────────────────────────────────┤
│                                     │
│         Leaflet Map (280px)         │
│  • Shows current location           │
│  • Draws route in real-time         │
│  • Markers for start/current        │
│                                     │
├─────────────────────────────────────┤
│ LIVE badge (when tracking)          │
├─────────────────────────────────────┤
│ Stats Cards:                        │
│  Distance | Duration | Pace/Speed   │
├─────────────────────────────────────┤
│ [Start Activity] / [Stop Activity]  │
└─────────────────────────────────────┘
```

### Map Features:

**Zoom:**
- Default: Zoom level 15 (neighborhood view)
- Zoom controls hidden (cleaner UI)
- Can be added with `zoomControl={true}`

**Styling:**
- Rounded corners (`rounded-2xl`)
- Border with glassmorphism
- Fixed height: 280px
- Responsive width

---

## Permissions

### Browser GPS Permission:

**First Use:**
1. Browser prompts: "Allow location access?"
2. User must click "Allow"
3. Permission saved for future visits

**Permission Denied:**
- Shows error: "GPS error: User denied Geolocation"
- Cannot track without permission
- User must enable in browser settings

**Required for:**
- `navigator.geolocation.watchPosition()`
- Continuous tracking
- Background tracking (if supported)

---

## Accuracy & Limitations

### GPS Accuracy:

**Good conditions (10-20m accuracy):**
- ✅ Outdoors with clear sky
- ✅ Away from tall buildings
- ✅ Good satellite signal

**Poor conditions (50-100m+ accuracy):**
- ❌ Indoors
- ❌ Urban canyons (tall buildings)
- ❌ Heavy cloud cover
- ❌ Underground/tunnels

### Battery Impact:

**High Accuracy Mode:**
- Uses GPS chip directly
- Higher battery drain
- Better accuracy
- Recommended for fitness tracking

**Low Accuracy Mode:**
- Uses WiFi/cell towers
- Lower battery drain
- Less accurate (not recommended)

### Data Usage:

**Map Tiles:**
- Downloads map images as you move
- ~1-2 MB per activity
- Cached by browser

**Real-time Updates:**
- Minimal data (few KB)
- Socket.IO connection
- ~1 point every 3 seconds

---

## Advanced Features

### Elevation Tracking:

```javascript
if (altitude != null && lastAltitude != null) {
  const delta = altitude - lastAltitude;
  if (delta > 0) {  // Only count uphill
    elevationGain += delta;
  }
}
```

**Use Cases:**
- Hill training
- Mountain hiking
- Elevation challenges
- Training zones

### Route Replay:

Saved GeoJSON can be:
- Replayed on map
- Compared with other routes
- Shared with friends
- Used for route recommendations

---

## Future Enhancements

Potential features:
- **Offline maps** - Download map tiles for offline use
- **Auto-pause** - Detect when stopped (traffic lights)
- **Split times** - Lap tracking
- **Route planning** - Plan route before starting
- **Heatmaps** - Show popular routes
- **3D terrain** - Visualize elevation
- **Weather overlay** - Show weather on map
- **Live sharing** - Friends see your location in real-time

---

## Troubleshooting

### "GPS error: User denied Geolocation"
**Solution:** Enable location permissions in browser settings

### Map not showing
**Solution:** 
- Check internet connection (map tiles require download)
- Verify Leaflet CSS is loaded
- Clear browser cache

### Distance seems wrong
**Solution:**
- Check GPS accuracy (should be < 20m)
- Ensure clear view of sky
- Wait for GPS signal to stabilize before starting

### Route jumps around
**Solution:**
- GPS signal is poor
- Move to open area
- System filters jumps > 500m automatically

---

## Testing Locally

### Without Moving:

**Option 1: Browser DevTools**
1. Open Chrome DevTools (F12)
2. Click "..." → More tools → Sensors
3. Select "Custom location"
4. Enter coordinates and click "Manage"

**Option 2: GPS Simulator**
- Use browser extensions
- Simulate movement along route
- Test route tracking

### With Real GPS:

1. Go outside (clear sky)
2. Wait for GPS signal (10-20 seconds)
3. Click "Start Activity"
4. Walk/run/cycle as normal
5. Watch route appear on map in real-time

---

## Summary

The GPS map tracking system:
- ✅ Works entirely in the browser (no server-side GPS)
- ✅ Uses free OpenStreetMap tiles
- ✅ Real-time route visualization
- ✅ Accurate distance calculation (Haversine)
- ✅ Throttled GPS sampling (battery efficient)
- ✅ Noise filtering (ignores GPS jumps)
- ✅ Stores routes as GeoJSON
- ✅ Real-time sync via Socket.IO
- ✅ Works on mobile and desktop

The system is production-ready and provides accurate tracking for fitness activities! 🗺️🏃‍♂️✨
