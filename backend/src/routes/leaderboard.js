import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/leaderboard
 * Get ranked distance leaderboard
 * Query params: period=weekly|monthly|alltime
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { period = 'alltime' } = req.query;

    let startDate = null;
    
    if (period === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get all activities in the period
    let query = supabase
      .from('activities')
      .select('user_id, distance');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: activities, error } = await query;

    if (error) throw error;

    // Aggregate by user
    const userDistances = {};
    activities.forEach(activity => {
      const userId = activity.user_id;
      if (!userDistances[userId]) {
        userDistances[userId] = 0;
      }
      userDistances[userId] += parseFloat(activity.distance);
    });

    // Get user profiles
    const userIds = Object.keys(userDistances);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, city')
      .in('id', userIds);

    // Build leaderboard
    const leaderboard = profiles.map(profile => ({
      user_id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      city: profile.city,
      total_distance: parseFloat(userDistances[profile.id].toFixed(2))
    }));

    // Sort by distance descending
    leaderboard.sort((a, b) => b.total_distance - a.total_distance);

    // Add rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
