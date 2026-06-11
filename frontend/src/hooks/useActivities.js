import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api";

const PAGE_SIZE = 20;

export function useActivities(filter = "everyone") {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Track the current filter in a ref so fetchPage closures can detect stale calls
  const filterRef = useRef(filter);

  const fetchPage = useCallback(
    async (pageOffset) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(
          `/api/activities?filter=${filter}&limit=${PAGE_SIZE}&offset=${pageOffset}`
        );

        // Discard result if filter changed while request was in flight
        if (filterRef.current !== filter) return;

        setActivities((prev) =>
          pageOffset === 0 ? data : [...prev, ...data]
        );

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (err) {
        // Preserve existing activities on error; expose retry
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  // When filter changes: reset pagination state and fetch the first page
  useEffect(() => {
    filterRef.current = filter;
    setActivities([]);
    setOffset(0);
    setHasMore(true);
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadMore = useCallback(() => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchPage(nextOffset);
  }, [offset, fetchPage]);

  const retry = useCallback(() => {
    fetchPage(offset);
  }, [offset, fetchPage]);

  const toggleLike = async (activityId) => {
    // Optimistic update
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;
        const liked = !a.liked;
        return { ...a, liked, like_count: (a.like_count ?? 0) + (liked ? 1 : -1) };
      })
    );
    try {
      await api.post(`/api/activities/${activityId}/like`, {});
    } catch {
      // Revert on error by re-fetching the current first page
      fetchPage(0);
    }
  };

  const postComment = async (activityId, body) => {
    const comment = await api.post(`/api/activities/${activityId}/comments`, { body });
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? { ...a, comment_count: (a.comment_count ?? 0) + 1 }
          : a
      )
    );
    return comment;
  };

  return {
    activities,
    loading,
    error,
    hasMore,
    offset,
    loadMore,
    retry,
    refresh: () => {
      setActivities([]);
      setOffset(0);
      setHasMore(true);
      fetchPage(0);
    },
    toggleLike,
    postComment,
  };
}
