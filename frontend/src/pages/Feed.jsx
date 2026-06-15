import { useState, useEffect, useRef } from "react";
import { ActivityCard } from "../components/ActivityCard";
import { useActivities } from "../hooks/useActivities";
import { useAuth } from "../context/AuthContext";

const FILTERS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
  { value: "mine", label: "My Activities" },
];

export default function Feed({ refreshSignal = 0 }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("everyone");
  const {
    activities,
    loading,
    error,
    hasMore,
    loadMore,
    retry,
    toggleLike,
    postComment,
    deleteActivity,
    hiddenIds,
    hideActivity,
    unhideActivity,
    refresh,
  } = useActivities(filter);

  const isInitialLoad = loading && activities.length === 0;
  const hiddenCount = activities.filter((a) => hiddenIds.has(a.id) && a.user_id === user?.id).length;

  // Refresh feed whenever refreshSignal is > 0
  useEffect(() => {
    if (refreshSignal > 0) {
      refresh();
    }
  }, [refreshSignal]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-white">Activity Feed</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
            className="p-2 rounded-lg glass-light border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh feed"
          >
            <i className="bi bi-arrow-clockwise text-base"></i>
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm glass-light border border-white/10 rounded-lg px-2.5 py-1.5 text-white bg-transparent outline-none focus:border-gold"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value} className="bg-black text-white">{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hidden count notice */}
      {hiddenCount > 0 && (
        <div className="glass-light border border-white/10 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-1.5">
          <i className="bi bi-eye-slash text-gray-400 text-sm"></i>
          <p className="text-xs text-gray-400">
            {hiddenCount} of your {hiddenCount === 1 ? "post is" : "posts are"} hidden — tap ⋮ to unhide
          </p>
        </div>
      )}

      {/* Initial load skeleton */}
      {isInitialLoad && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error on first load */}
      {error && activities.length === 0 && (
        <div className="glass-light border border-yellow-400/30 rounded-xl p-5 text-center">
          <i className="bi bi-exclamation-triangle text-3xl text-yellow-400 mb-3 block"></i>
          <p className="text-sm text-yellow-400 font-semibold mb-2">Backend Unavailable</p>
          <p className="text-xs text-gray-400 mb-3">{error}</p>
          <p className="text-xs text-gray-500">
            The activity feed requires the backend server to be running.
            For now, you can still track activities using the Track page.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="bi bi-person-running text-4xl mb-3 block"></i>
          <p className="font-medium text-white">No activities yet</p>
          <p className="text-sm">Start tracking to see runs here</p>
        </div>
      )}

      {/* Activity list */}
      {activities.map((a) => {
        const isOwn = a.user_id === user?.id;
        const isHidden = hiddenIds.has(a.id);

        // Hidden own posts: show a collapsed stub with Unhide option
        if (isHidden && isOwn) {
          return (
            <div key={a.id} className="glass rounded-2xl mb-3 border border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 min-w-0">
                <i className="bi bi-eye-slash text-sm flex-shrink-0"></i>
                <span className="text-xs truncate">{a.title} — hidden from feed</span>
              </div>
              <button
                onClick={() => unhideActivity(a.id)}
                className="flex-shrink-0 ml-3 text-xs text-gold hover:underline font-medium flex items-center gap-1"
              >
                <i className="bi bi-eye text-xs"></i>
                Unhide
              </button>
            </div>
          );
        }

        // Hidden other users' posts: skip entirely
        if (isHidden) return null;

        return (
          <ActivityCard
            key={a.id}
            activity={a}
            onLike={toggleLike}
            onComment={postComment}
            onDelete={deleteActivity}
            onHide={hideActivity}
            onUnhide={unhideActivity}
            isHidden={isHidden}
            currentUserId={user?.id}
          />
        );
      })}

      {/* Pagination controls */}
      {activities.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="animate-spin h-4 w-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading more…
            </div>
          )}

          {hasMore && !loading && !error && (
            <button
              onClick={loadMore}
              className="px-5 py-2 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold-dark active:scale-95 transition-all"
            >
              Load more
            </button>
          )}

          {!hasMore && !loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <i className="bi bi-check-circle-fill text-green-400"></i>
              All caught up
            </div>
          )}

          {error && activities.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-red-400">Failed to load more activities.</p>
              <button
                onClick={retry}
                className="px-4 py-1.5 rounded-lg glass-light border border-red-400/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
