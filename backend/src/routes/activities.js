import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/activities
 * Fetch activity feed with filters
 * Query params: filter=everyone|friends|mine
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { filter = 'everyone' } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('activities')
      .select(`
        *,
        profile:profiles!activities_user_id_fkey(id, full_name, avatar_url),
        likes:activity_likes(user_id),
        comments:activity_comments(id, user_id, body, created_at, profile:profiles!activity_comments_user_id_fkey(full_name, avatar_url))
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'mine') {
      query = query.eq('user_id', userId);
    } else if (filter === 'friends') {
      // Get user's accepted friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => f.friend_id) || [];
      
      if (friendIds.length === 0) {
        return res.json([]);
      }

      query = query.in('user_id', friendIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to include like/comment counts and user's like status
    const activities = data.map(activity => ({
      ...activity,
      // Normalize profile field
      profile: activity.profile,
      profiles: undefined, // Remove if exists
      likes_count: activity.likes?.length || 0,
      comments_count: activity.comments?.length || 0,
      liked_by_me: activity.likes?.some(like => like.user_id === userId) || false,
      liked: activity.likes?.some(like => like.user_id === userId) || false,
      like_count: activity.likes?.length || 0,
      comment_count: activity.comments?.length || 0,
      likes: undefined, // Remove raw likes array
    }));

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * POST /api/activities
 * Create a new activity
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, distance, duration_seconds, calories, route_geojson, elevation_gain_m, location_name, weather_condition, temperature_celsius, wind_speed_kmh } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !type || distance === undefined || duration_seconds === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        title,
        type,
        distance: parseFloat(distance),
        duration_seconds: parseInt(duration_seconds),
        calories: parseInt(calories) || 0,
        route_geojson,
        elevation_gain_m: elevation_gain_m ? parseFloat(elevation_gain_m) : 0,
        location_name: location_name ?? null,
        weather_condition,
        temperature_celsius: temperature_celsius ? parseFloat(temperature_celsius) : null,
        wind_speed_kmh: wind_speed_kmh ? parseFloat(wind_speed_kmh) : null,
      })
      .select(`
        *,
        profile:profiles!activities_user_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Check and award achievements
    await checkAchievements(userId, data);

    // Update user's streak
    await updateStreak(userId);

    res.status(201).json(data);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

/**
 * DELETE /api/activities/:id
 * Delete own activity
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

/**
 * POST /api/activities/:id/like
 * Toggle like on an activity
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const { data: existing } = await supabase
      .from('activity_likes')
      .select('id')
      .eq('activity_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('activity_likes')
        .delete()
        .eq('id', existing.id);
      
      res.json({ liked: false });
    } else {
      // Like
      await supabase
        .from('activity_likes')
        .insert({ activity_id: id, user_id: userId });
      
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

/**
 * GET /api/activities/:id/comments
 * Get comments for an activity
 */
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('activity_comments')
      .select(`
        id,
        body,
        created_at,
        user_id,
        profile:profiles!activity_comments_user_id_fkey(full_name, avatar_url)
      `)
      .eq('activity_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Flatten the nested profile structure
    const comments = data.map(comment => ({
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      user_id: comment.user_id,
      full_name: comment.profile?.full_name,
      avatar_url: comment.profile?.avatar_url
    }));

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * POST /api/activities/:id/comments
 * Add a comment to an activity
 */
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const userId = req.user.id;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const { data, error } = await supabase
      .from('activity_comments')
      .insert({
        activity_id: id,
        user_id: userId,
        body: body.trim()
      })
      .select(`
        *,
        profile:profiles!activity_comments_user_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Helper: Check and award achievements
async function checkAchievements(userId, activity) {
  try {
    // Get user's total stats
    const { data: activities } = await supabase
      .from('activities')
      .select('distance, type')
      .eq('user_id', userId);

    const totalDistance = activities.reduce((sum, a) => sum + parseFloat(a.distance), 0);
    const totalActivities = activities.length;

    // Get user's current streak
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', userId)
      .single();

    // Get all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    // Get already earned achievements
    const { data: earned } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = new Set(earned?.map(e => e.achievement_id) || []);

    // Check each achievement
    for (const ach of achievements) {
      if (earnedIds.has(ach.id)) continue;

      let shouldAward = false;

      switch (ach.metric) {
        case 'total_activities':
          shouldAward = totalActivities >= ach.required_value;
          break;
        case 'total_distance':
          shouldAward = totalDistance >= ach.required_value;
          break;
        case 'single_run_km':
          if (activity.type === 'Running') {
            shouldAward = parseFloat(activity.distance) >= ach.required_value;
          }
          break;
        case 'single_cycle_km':
          if (activity.type === 'Cycling') {
            shouldAward = parseFloat(activity.distance) >= ach.required_value;
          }
          break;
        case 'streak_days':
          shouldAward = profile.current_streak >= ach.required_value;
          break;
      }

      if (shouldAward) {
        await supabase
          .from('user_achievements')
          .insert({ user_id: userId, achievement_id: ach.id });
      }
    }
  } catch (error) {
    console.error('Check achievements error:', error);
  }
}

// Helper: Update user's streak
async function updateStreak(userId) {
  try {
    const { data: activities } = await supabase
      .from('activities')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!activities || activities.length === 0) return;

    // Calculate streak
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = activities.map(a => {
      const d = new Date(a.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = (uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    // Update profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('longest_streak')
      .eq('id', userId)
      .single();

    const longestStreak = Math.max(streak, profile?.longest_streak || 0);

    await supabase
      .from('profiles')
      .update({
        current_streak: streak,
        longest_streak: longestStreak,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Update streak error:', error);
  }
}

export default router;
