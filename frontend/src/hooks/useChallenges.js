import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function useChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/challenges");
      setChallenges(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const toggleJoin = async (challengeId, currentlyJoined) => {
    // Optimistic
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, joined: !currentlyJoined } : c))
    );
    try {
      if (currentlyJoined) {
        await api.delete(`/api/challenges/${challengeId}/join`);
      } else {
        await api.post(`/api/challenges/${challengeId}/join`, {});
      }
    } catch {
      fetch(); // revert
    }
  };

  return { challenges, loading, error, toggleJoin, refresh: fetch };
}
