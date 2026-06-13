import { supabase } from '../lib/supabase.js';
import { updateChallengeProgress } from '../routes/challenges.js';

/**
 * Initialize Socket.io tracking handlers
 */
export function initializeTracking(io) {
  // Store active tracking sessions
  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const userId = socket.handshake.auth.userId;
    
    if (!userId) {
      console.error('No userId in socket auth');
      socket.disconnect();
      return;
    }

    console.log(`User authenticated: ${userId}`);

    /**
     * START ACTIVITY
     * Client emits when starting GPS tracking
     */
    socket.on('activity:start', ({ type }) => {
      console.log(`User ${userId} started ${type} activity`);

      activeSessions.set(socket.id, {
        userId,
        type,
        points: [],
        startTime: Date.now()
      });

      // Notify friends
      socket.broadcast.emit('friend:activity:start', {
        userId,
        type
      });
    });

    /**
     * LOCATION UPDATE
     * Client emits periodically during tracking
     */
    socket.on('location:update', ({ lat, lng, accuracy, timestamp }) => {
      const session = activeSessions.get(socket.id);
      
      if (!session) return;

      // Store point
      session.points.push({ lat, lng, accuracy, timestamp });

      // Broadcast to friends watching this user
      socket.broadcast.emit('friend:location', {
        userId,
        lat,
        lng
      });
    });

    /**
     * STOP ACTIVITY
     * Client emits when finishing tracking
     */
    socket.on('activity:stop', async ({ title, distance, duration_seconds, calories, elevation_gain_m }) => {
      const session = activeSessions.get(socket.id);
      
      if (!session) {
        socket.emit('error', { message: 'No active session' });
        return;
      }

      try {
        // Build GeoJSON from collected points
        const coordinates = session.points.map(p => [p.lng, p.lat]);
        const routeGeoJSON = coordinates.length >= 2 ? {
          type: 'LineString',
          coordinates
        } : null;

        // Save activity to database
        const { data: activity, error } = await supabase
          .from('activities')
          .insert({
            user_id: userId,
            title,
            type: session.type,
            distance: parseFloat(distance),
            duration_seconds: parseInt(duration_seconds),
            calories: parseInt(calories) || 0,
            elevation_gain_m: elevation_gain_m ? parseFloat(elevation_gain_m) : 0,
            route_geojson: routeGeoJSON
          })
          .select(`
            *,
            profile:profiles!activities_user_id_fkey(id, full_name, avatar_url)
          `)
          .single();

        if (error) throw error;

        // Update challenge progress
        await updateChallengeProgress(userId, activity);

        // Emit success
        socket.emit('activity:saved', activity);

        // Notify friends
        socket.broadcast.emit('friend:activity:stop', { userId });

        // Clean up session
        activeSessions.delete(socket.id);

        console.log(`Activity saved for user ${userId}: ${title}`);
      } catch (error) {
        console.error('Save activity error:', error);
        socket.emit('error', { message: 'Failed to save activity' });
      }
    });

    /**
     * WATCH USER
     * Client requests to watch a friend's live activity
     */
    socket.on('watch:user', ({ targetUserId }) => {
      socket.join(`user:${targetUserId}`);
      console.log(`User ${userId} watching ${targetUserId}`);
    });

    /**
     * DISCONNECT
     */
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Clean up session if active
      const session = activeSessions.get(socket.id);
      if (session) {
        socket.broadcast.emit('friend:activity:stop', { userId: session.userId });
        activeSessions.delete(socket.id);
      }
    });
  });
}
