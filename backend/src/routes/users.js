import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/me
 * Get current user profile with stats
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // If profile doesn't exist, create it (fallback if trigger didn't fire)
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating one for user:', userId);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: req.user.email?.split('@')[0] || 'User',
          bio: '',
          city: '',
          preferred_activity: 'Running',
          fitness_goal_km: 50,
          units: 'metric'
        })
        .select()
        .single();

      if (createError) throw createError;
      profile = newProfile;
    } else if (profileError) {
      throw profileError;
    }

    // Get activity stats
    const { data: activities } = await supabase
      .from('activities')
      .select('distance, calories, duration_seconds')
      .eq('user_id', userId);

    const stats = {
      totalDistance: activities?.reduce((sum, a) => sum + parseFloat(a.distance), 0).toFixed(2) || '0',
      totalActivities: activities?.length || 0,
      totalCalories: activities?.reduce((sum, a) => sum + parseInt(a.calories), 0) || 0,
      totalDuration: activities?.reduce((sum, a) => sum + parseInt(a.duration_seconds), 0) || 0,
    };

    res.json({
      ...profile,
      stats
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PATCH /api/users/me
 * Update current user profile
 */
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, city, avatar_url, preferred_activity, fitness_goal_km, units,
            age, weight_kg, height_cm, gender, activity_level, weight_goal, daily_steps_goal } = req.body;

    // First, check if profile exists, create if not
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      console.log('Profile not found during update, creating one for user:', userId);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: full_name || req.user.email?.split('@')[0] || 'User',
          bio: bio || '',
          city: city || '',
          preferred_activity: preferred_activity || 'Running',
          fitness_goal_km: fitness_goal_km ? parseFloat(fitness_goal_km) : 50,
          units: units || 'metric'
        })
        .select()
        .single();

      if (createError) throw createError;
      return res.json(newProfile);
    }

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (city !== undefined) updates.city = city;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (preferred_activity !== undefined) updates.preferred_activity = preferred_activity;
    if (fitness_goal_km !== undefined) updates.fitness_goal_km = parseFloat(fitness_goal_km);
    if (units !== undefined) updates.units = units;
    if (age !== undefined) updates.age = age ? parseInt(age) : null;
    if (weight_kg !== undefined) updates.weight_kg = weight_kg ? parseFloat(weight_kg) : null;
    if (height_cm !== undefined) updates.height_cm = height_cm ? parseFloat(height_cm) : null;
    if (gender !== undefined) updates.gender = gender;
    if (activity_level !== undefined) updates.activity_level = activity_level;
    if (weight_goal !== undefined) updates.weight_goal = weight_goal;
    if (daily_steps_goal !== undefined) updates.daily_steps_goal = parseInt(daily_steps_goal);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/users/me/today-steps
 * Get today's step count from actual activities (not estimates)
 */
router.get('/me/today-steps', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's height for accurate stride calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('height_cm')
      .eq('id', userId)
      .single();

    const heightCm = profile?.height_cm ? parseFloat(profile.height_cm) : null;

    // Today's date range (UTC)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: activities } = await supabase
      .from('activities')
      .select('distance, type, duration_seconds')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (!activities || activities.length === 0) {
      return res.json({ steps: 0, activities: 0 });
    }

    // Calculate steps per activity using height-adjusted stride
    const stepsPerKmByType = (type) => {
      if (type === 'Cycling') return 0;
      if (!heightCm) {
        return { Walking: 1400, Running: 1200, Hiking: 1350 }[type] ?? 1300;
      }
      const heightM = heightCm / 100;
      const stride = type === 'Running' ? heightM * 0.478
                   : type === 'Hiking'  ? heightM * 0.400
                   :                      heightM * 0.413;
      return Math.round(1000 / stride);
    };

    const steps = activities.reduce((sum, a) => {
      const km = parseFloat(a.distance) || 0;
      return sum + Math.round(km * stepsPerKmByType(a.type));
    }, 0);

    res.json({
      steps,
      activities: activities.length,
      breakdown: activities.map(a => ({
        type: a.type,
        distance: parseFloat(a.distance),
        steps: Math.round((parseFloat(a.distance) || 0) * stepsPerKmByType(a.type)),
      })),
    });
  } catch (error) {
    console.error('Today steps error:', error);
    res.status(500).json({ error: 'Failed to fetch today steps' });
  }
});

/**
 * GET /api/users/me/achievements
 * Get user's earned achievements
 */
router.get('/me/achievements', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * GET /api/users/me/analytics
 * Returns daily (last 7 days), weekly (last 4 weeks), monthly (last 6 months) data
 * Plus activity type breakdown for demographics
 */
router.get('/me/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user height for step calculation
    const { data: profileData } = await supabase
      .from('profiles')
      .select('height_cm')
      .eq('id', userId)
      .single();
    const heightCm = profileData?.height_cm ? parseFloat(profileData.height_cm) : null;

    // Get all activities for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: activities } = await supabase
      .from('activities')
      .select('distance, duration_seconds, calories, type, created_at, elevation_gain_m')
      .eq('user_id', userId)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    const allData = activities || [];

    // ── Helper: steps per km by type ──────────────────────────────────────
    const stepsPerKm = (type) => {
      if (type === 'Cycling') return 0;
      if (!heightCm) return { Walking: 1400, Running: 1200, Hiking: 1350 }[type] ?? 1300;
      const h = heightCm / 100;
      const stride = type === 'Running' ? h * 0.478 : type === 'Hiking' ? h * 0.400 : h * 0.413;
      return Math.round(1000 / stride);
    };

    // ── DAILY: last 7 days ─────────────────────────────────────────────────
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayActs = allData.filter(a => {
        const d = new Date(a.created_at);
        return d >= date && d < nextDate;
      });

      const distance_km = parseFloat(dayActs.reduce((s, a) => s + parseFloat(a.distance || 0), 0).toFixed(2));
      const calories = dayActs.reduce((s, a) => s + parseInt(a.calories || 0), 0);
      const steps = dayActs.reduce((s, a) => s + Math.round((parseFloat(a.distance) || 0) * stepsPerKm(a.type)), 0);
      const duration_min = Math.round(dayActs.reduce((s, a) => s + parseInt(a.duration_seconds || 0), 0) / 60);

      dailyData.push({
        day: dayNames[date.getDay()],
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        distance_km,
        calories,
        steps,
        duration_min,
        count: dayActs.length,
      });
    }

    // ── WEEKLY: last 4 weeks ───────────────────────────────────────────────
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekActs = allData.filter(a => {
        const d = new Date(a.created_at);
        return d >= weekStart && d < weekEnd;
      });

      const distance_km = parseFloat(weekActs.reduce((s, a) => s + parseFloat(a.distance || 0), 0).toFixed(2));
      const calories = weekActs.reduce((s, a) => s + parseInt(a.calories || 0), 0);
      const steps = weekActs.reduce((s, a) => s + Math.round((parseFloat(a.distance) || 0) * stepsPerKm(a.type)), 0);

      weeklyData.push({
        week: `W${4 - i}`,
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        distance_km,
        calories,
        steps,
        count: weekActs.length,
      });
    }

    // ── MONTHLY: last 6 months ─────────────────────────────────────────────
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthActs = allData.filter(a => {
        const d = new Date(a.created_at);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const distance_km = parseFloat(monthActs.reduce((s, a) => s + parseFloat(a.distance || 0), 0).toFixed(2));
      const calories = monthActs.reduce((s, a) => s + parseInt(a.calories || 0), 0);
      const steps = monthActs.reduce((s, a) => s + Math.round((parseFloat(a.distance) || 0) * stepsPerKm(a.type)), 0);

      monthlyData.push({
        month: monthNames[month],
        distance_km,
        calories,
        steps,
        count: monthActs.length,
      });
    }

    // ── DEMOGRAPHICS: activity type breakdown ──────────────────────────────
    const typeCounts = { Running: 0, Cycling: 0, Walking: 0, Hiking: 0 };
    const typeDistance = { Running: 0, Cycling: 0, Walking: 0, Hiking: 0 };
    const typeCalories = { Running: 0, Cycling: 0, Walking: 0, Hiking: 0 };

    allData.forEach(a => {
      const t = a.type;
      if (typeCounts[t] !== undefined) {
        typeCounts[t]++;
        typeDistance[t] += parseFloat(a.distance || 0);
        typeCalories[t] += parseInt(a.calories || 0);
      }
    });

    const totalCount = allData.length || 1;
    const demographics = Object.keys(typeCounts).map(type => ({
      type,
      count: typeCounts[type],
      distance_km: parseFloat(typeDistance[type].toFixed(2)),
      calories: typeCalories[type],
      percent: Math.round((typeCounts[type] / totalCount) * 100),
    })).filter(d => d.count > 0);

    // ── PERSONAL RECORDS ──────────────────────────────────────────────────
    // Fetch ALL activities (not just 6 months) for PRs
    const { data: allActivities } = await supabase
      .from('activities')
      .select('distance, duration_seconds, type, elevation_gain_m')
      .eq('user_id', userId);

    const prData = allActivities || [];

    const longestActivity = prData.reduce((best, a) =>
      parseFloat(a.distance) > parseFloat(best?.distance ?? 0) ? a : best, null);

    const bestPaceForType = (type, minKm = 0.5) => {
      const acts = prData.filter(a => a.type === type && parseFloat(a.distance) >= minKm && a.duration_seconds > 0);
      let best = null;
      acts.forEach(a => {
        const secPerKm = a.duration_seconds / parseFloat(a.distance);
        if (best === null || secPerKm < best) best = secPerKm;
      });
      return best;
    };

    const fiveKActivities = prData.filter(a => a.type === 'Running' && parseFloat(a.distance) >= 5 && a.duration_seconds > 0);
    let fastest5kSec = null;
    fiveKActivities.forEach(a => {
      const t = (a.duration_seconds / parseFloat(a.distance)) * 5;
      if (fastest5kSec === null || t < fastest5kSec) fastest5kSec = t;
    });

    const runPace = bestPaceForType('Running', 1);
    const cyclingPace = bestPaceForType('Cycling', 1);
    const walkingPace = bestPaceForType('Walking', 0.5);
    const hikingPace = bestPaceForType('Hiking', 0.5);

    const longestPerType = {};
    ['Running','Cycling','Walking','Hiking'].forEach(type => {
      const acts = prData.filter(a => a.type === type);
      const max = acts.reduce((best, a) => parseFloat(a.distance) > parseFloat(best?.distance ?? 0) ? a : best, null);
      longestPerType[type] = max ? parseFloat(parseFloat(max.distance).toFixed(2)) : null;
    });

    const maxElev = Math.max(...(prData.map(a => parseFloat(a.elevation_gain_m) || 0)), 0);

    const fmtTime = (secs) => {
      if (!secs) return null;
      const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.round(secs % 60);
      return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    const fmtPace = (secPerKm) => {
      if (!secPerKm) return null;
      const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60);
      return `${m}:${String(s).padStart(2,'0')}/km`;
    };
    const fmtSpeed = (secPerKm) => secPerKm ? `${(3600 / secPerKm).toFixed(1)} km/h` : null;

    res.json({
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      demographics,
      max_elevation_gain_m: Math.round(maxElev),
      personalRecords: {
        fastest_5k: fastest5kSec ? fmtTime(fastest5kSec) : null,
        longest_km: longestActivity ? parseFloat(parseFloat(longestActivity.distance).toFixed(2)) : null,
        longest_per_type: longestPerType,
        best_run_pace: runPace ? fmtPace(runPace) : null,
        best_cycle_speed: cyclingPace ? fmtSpeed(cyclingPace) : null,
        best_walk_pace: walkingPace ? fmtPace(walkingPace) : null,
        best_hike_pace: hikingPace ? fmtPace(hikingPace) : null,
        max_elevation_gain_m: Math.round(maxElev),
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/users/me/coach
 * Get AI coach advice (mock implementation)
 */
router.get('/me/coach', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent activities
    const { data: activities } = await supabase
      .from('activities')
      .select('distance, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Simple rule-based advice
    let advice = "Keep up the great work! Stay consistent with your training.";

    if (!activities || activities.length === 0) {
      advice = "Ready to start your fitness journey? Begin with a short run or walk to build momentum.";
    } else if (activities.length < 3) {
      advice = "Great start! Try to maintain consistency by exercising at least 3 times per week.";
    } else {
      const totalDistance = activities.reduce((sum, a) => sum + parseFloat(a.distance), 0);
      const avgDistance = totalDistance / activities.length;

      if (avgDistance < 3) {
        advice = "You're building a solid foundation! Consider gradually increasing your distance by 10% each week.";
      } else if (avgDistance < 8) {
        advice = "Excellent progress! Mix in some interval training to improve your speed and endurance.";
      } else {
        advice = "Outstanding performance! Remember to include rest days and cross-training to prevent injuries.";
      }
    }

    res.json({ advice });
  } catch (error) {
    console.error('Get coach advice error:', error);
    res.status(500).json({ error: 'Failed to fetch coach advice' });
  }
});

export default router;
