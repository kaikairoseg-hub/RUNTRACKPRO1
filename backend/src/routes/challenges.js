import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/challenges
 * Get all active challenges with user participation status
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all challenges that haven't passed their deadline
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participants(user_id, current_value)
      `)
      .gte('deadline', new Date().toISOString())
      .order('deadline', { ascending: true });

    if (error) throw error;

    // Transform to include participation info
    const enriched = challenges.map(challenge => {
      const userParticipation = challenge.participants?.find(p => p.user_id === userId);
      
      return {
        ...challenge,
        participant_count: challenge.participants?.length || 0,
        is_participating: !!userParticipation,
        user_progress: userParticipation?.current_value || 0,
        participants: undefined // Remove raw participants array
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

/**
 * POST /api/challenges/:id/join
 * Join a challenge
 */
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if challenge exists and is still active
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .gte('deadline', new Date().toISOString())
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'Challenge not found or expired' });
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already participating in this challenge' });
    }

    // Join challenge
    const { data, error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: id,
        user_id: userId,
        current_value: 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

/**
 * DELETE /api/challenges/:id/join
 * Leave a challenge
 */
router.delete('/:id/join', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('challenge_participants')
      .delete()
      .eq('challenge_id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Leave challenge error:', error);
    res.status(500).json({ error: 'Failed to leave challenge' });
  }
});

/**
 * Update challenge progress based on user activities
 * This is called internally when activities are created
 */
export async function updateChallengeProgress(userId, activity) {
  try {
    // Get user's active challenge participations
    const { data: participations } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        challenge:challenges(*)
      `)
      .eq('user_id', userId);

    if (!participations || participations.length === 0) return;

    for (const participation of participations) {
      const challenge = participation.challenge;
      
      // Skip if challenge expired
      if (new Date(challenge.deadline) < new Date()) continue;

      let increment = 0;

      // Calculate progress based on challenge category
      if (challenge.category === 'Distance' && challenge.unit === 'km') {
        increment = parseFloat(activity.distance);
      } else if (challenge.category === 'Time' && challenge.unit === 'min') {
        increment = parseInt(activity.duration_seconds) / 60;
      }

      if (increment > 0) {
        const newValue = parseFloat(participation.current_value) + increment;
        
        await supabase
          .from('challenge_participants')
          .update({ current_value: newValue })
          .eq('id', participation.id);
      }
    }
  } catch (error) {
    console.error('Update challenge progress error:', error);
  }
}

export default router;
