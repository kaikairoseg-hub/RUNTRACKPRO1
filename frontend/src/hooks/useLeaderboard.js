import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

// Module-level stale flag: set to true when a leaderboard:updated event
// arrives while the component is not mounted (user not on Leaderboard page).
let isStale = false;

export function useLeaderboard(period = "weekly") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(false);
  const debounceTimerRef = useRef(null);

  const fetchLeaderboard = useCallback(() => {
    setLoading(true);
    api.get(`/api/leaderboard?period=${period}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [period]);

  // Mount/unmount lifecycle: track mount state and handle stale flag.
  useEffect(() => {
    isMountedRef.current = true;

    if (isStale) {
      isStale = false;
      fetchLeaderboard();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchLeaderboard]);

  // Initial fetch on period change.
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Socket listener with 2-second debounce.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleLeaderboardUpdated = () => {
      // Cancel any pending debounce timer.
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (isMountedRef.current) {
        // Component is mounted — schedule a debounced re-fetch.
        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          fetchLeaderboard();
        }, 2000);
      } else {
        // Component is not mounted — mark as stale for next visit.
        isStale = true;
      }
    };

    socket.on("leaderboard:updated", handleLeaderboardUpdated);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      socket.off("leaderboard:updated", handleLeaderboardUpdated);
    };
  }, [fetchLeaderboard]);

  return { data, loading, error };
}
