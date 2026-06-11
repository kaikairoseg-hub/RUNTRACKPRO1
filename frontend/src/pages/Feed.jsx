import { useState } from "react";
import { ActivityCard } from "../components/ActivityCard";
import { useActivities } from "../hooks/useActivities";

const FILTERS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
  { value: "mine", label: "My Activities" },
];

export default function Feed() {
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
  } = useActivities(filter);

  // True only on the very first load (no activities yet and loading)
  const isInitialLoad = loading && activities.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-gray-900">Activity Feed</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white outline-none"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Initial load skeleton */}
      {isInitialLoad && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error on first load (no activities loaded yet) */}
      {error && activities.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          Could not load feed: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏃</p>
          <p className="font-medium">No activities yet</p>
          <p className="text-sm">Start tracking to see runs here</p>
        </div>
      )}

      {/* Activity list */}
      {activities.map((a) => (
        <ActivityCard
          key={a.id}
          activity={a}
          onLike={toggleLike}
          onComment={postComment}
        />
      ))}

      {/* Pagination controls — only shown when there are already some activities */}
      {activities.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* Subsequent page loading spinner */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="animate-spin h-4 w-4 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Loading more…
            </div>
          )}

          {/* Load more button */}
          {hasMore && !loading && !error && (
            <button
              onClick={loadMore}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Load more
            </button>
          )}

          {/* All caught up message */}
          {!hasMore && !loading && (
            <p className="text-sm text-gray-400 font-medium">All caught up 🎉</p>
          )}

          {/* Retry button on error when activities are already present */}
          {error && activities.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-red-500">Failed to load more activities.</p>
              <button
                onClick={retry}
                className="px-4 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
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
