# How Achievements Work in RunTrack Pro

## Overview
Achievements are automatic rewards that users earn when they reach specific milestones in their fitness journey. They are checked and awarded automatically after each activity is saved.

---

## Database Structure

### 1. **achievements** table (Pre-defined achievements)
Contains all available achievements with:
- `title` - Achievement name (e.g., "First Steps")
- `description` - What the achievement is for
- `icon` - Bootstrap icon class (e.g., "bi bi-flag-fill") or emoji
- `metric` - What is being measured
- `required_value` - Threshold to earn the achievement

### 2. **user_achievements** table (Earned achievements)
Records when a user earns an achievement:
- `user_id` - Who earned it
- `achievement_id` - Which achievement
- `earned_at` - When they earned it

---

## Default Achievements

The system comes with 6 pre-seeded achievements:

1. **First Steps** 👟
   - Metric: `total_activities`
   - Required: 1 activity
   - Description: "Complete your first activity"

2. **10K Club** 🎯
   - Metric: `single_run_km`
   - Required: 10 km in one run
   - Description: "Run 10km in one session"

3. **50km Milestone** 🏆
   - Metric: `total_distance`
   - Required: 50 km total
   - Description: "Log a total of 50km"

4. **Marathon Runner** 🥇
   - Metric: `single_run_km`
   - Required: 42.195 km in one run
   - Description: "Complete a marathon distance"

5. **Century Cyclist** 🚴
   - Metric: `single_cycle_km`
   - Required: 100 km in one ride
   - Description: "Cycle 100km in one ride"

6. **Iron Will** 💪
   - Metric: `streak_days`
   - Required: 30 days streak
   - Description: "Maintain a 30-day streak"

---

## How Achievement Checking Works

### Automatic Checking
Every time a user saves an activity, the `checkAchievements()` function runs automatically:

1. **Calculate User Stats**
   - Total activities count
   - Total distance across all activities
   - Current streak from profile
   - Current activity distance and type

2. **Get Available Achievements**
   - Fetches all achievements from database
   - Filters out already earned achievements

3. **Check Each Metric**
   - `total_activities`: Checks if user has reached the activity count
   - `total_distance`: Checks if cumulative distance meets threshold
   - `single_run_km`: Checks if current run distance meets requirement (Running only)
   - `single_cycle_km`: Checks if current ride distance meets requirement (Cycling only)
   - `streak_days`: Checks if current streak meets threshold

4. **Award Achievement**
   - If criteria met, creates a record in `user_achievements`
   - Achievement now appears on user's profile
   - User is never awarded the same achievement twice

---

## Frontend Display

### Profile Page
Achievements are displayed in a 3-column grid:

**Unearned (Placeholder):**
- Grayed out with low opacity
- Shows placeholder achievements (First Steps, 10K Club, 50km Milestone)
- Users see what they can work towards

**Earned:**
- Gold gradient background (`.glass-gold`)
- Icon in gold color
- Shows earned date
- Fetched from `/api/users/me/achievements` endpoint

---

## API Endpoints

### Get User Achievements
```
GET /api/users/me/achievements
```

Returns:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "achievement_id": "uuid",
    "earned_at": "2026-06-13T10:30:00Z",
    "achievements": {
      "title": "First Steps",
      "description": "Complete your first activity",
      "icon": "bi bi-flag-fill",
      "metric": "total_activities",
      "required_value": 1
    }
  }
]
```

---

## Adding New Achievements

### Step 1: Insert into Database
```sql
INSERT INTO public.achievements (title, description, icon, metric, required_value)
VALUES ('Speed Demon', 'Complete a 5K under 20 minutes', 'bi bi-lightning-fill', 'single_run_5k_time', 1200);
```

### Step 2: Update Backend Logic (if new metric)
If you create a new metric type (like `single_run_5k_time`), add it to the switch statement in `backend/src/routes/activities.js`:

```javascript
case 'single_run_5k_time':
  if (activity.type === 'Running' && 
      parseFloat(activity.distance) >= 5 && 
      activity.duration_seconds <= 1200) {
    shouldAward = true;
  }
  break;
```

---

## Current Supported Metrics

1. **total_activities** - Count of all activities
2. **total_distance** - Sum of all distances (km)
3. **single_run_km** - Distance of current run
4. **single_cycle_km** - Distance of current cycle ride
5. **streak_days** - Current consecutive day streak

---

## How to Earn Achievements

As a user:

1. **Complete Activities** - Track runs, rides, walks
2. **Save Activities** - Achievements check automatically on save
3. **Maintain Streaks** - Activity on consecutive days
4. **Push Limits** - Longer distances, more activities
5. **Check Profile** - View earned achievements in your profile

---

## Technical Flow

```
User saves activity
    ↓
POST /api/activities
    ↓
Activity saved to database
    ↓
checkAchievements(userId, activity)
    ↓
Calculate user stats
    ↓
Compare against all achievements
    ↓
Award qualifying achievements
    ↓
Insert into user_achievements table
    ↓
Return success to frontend
```

---

## Tips for Users

- **Start Small**: "First Steps" is automatic on your first activity
- **Track Regularly**: Maintain streaks for "Iron Will" 
- **Go the Distance**: Build up to "50km Milestone"
- **Challenge Yourself**: Push for "10K Club" and "Marathon Runner"
- **Mix Activities**: Different achievement types for running vs cycling

---

## Future Enhancements

Potential new achievement types:
- Social achievements (friend count, likes received)
- Speed achievements (pace-based)
- Challenge completion achievements
- Monthly/yearly milestones
- Elevation-based achievements
- Weather warrior (activities in different conditions)
