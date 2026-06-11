# Implementation Plan: RunTrackPro Phased Roadmap

## Overview

This plan implements the four-phase RunTrackPro roadmap on top of the existing React 18 + Vite + Tailwind frontend, Express + Socket.io backend, and Supabase/PostgreSQL stack. Tasks progress phase-by-phase to keep the app in a releasable state at each checkpoint: Phase 1 (auth, analytics, streaks, tie-breaking), Phase 2 (GPS quality), Phase 3 (social/real-time), Phase 4 (PWA, weather, AI Coach). Property-based tests (fast-check + Vitest) and unit tests are included as optional sub-tasks for each component.

---

## Tasks

---

### Phase 1 — Core Auth & Activity Completeness

- [x] 1. Apply Phase 1 database migrations
  - [x] 1.1 Add streak columns to `public.profiles` and elevation column to `public.activities`
    - Run `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0;` in `backend/supabase_schema.sql` and Supabase SQL editor
    - Run `ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS elevation_gain_m numeric(7,1) NOT NULL DEFAULT 0;` (Phase 2 column added here to keep migrations together)
    - Update `backend/supabase_schema.sql` to include both `ALTER` statements so the file stays the source of truth
    - _Requirements: 5.1, 8.1_

- [x] 2. Implement Google OAuth Sign-In
  - [x] 2.1 Add `signInWithGoogle` to `AuthContext.jsx` and wire the existing Google button in `Auth.jsx`
    - Add `signInWithGoogle()` to `AuthContext` using `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: \`${window.location.origin}/auth/callback\` } })`
    - Expose `signInWithGoogle` via the context value
    - Replace the placeholder Google button `onClick` in `Auth.jsx` to call `signInWithGoogle`, catch errors and display them using the `Toast` component
    - _Requirements: 2.1_
  - [x] 2.2 Create `AuthCallback.jsx` page to handle the OAuth redirect
    - Create `frontend/src/pages/AuthCallback.jsx`
    - On mount, call `supabase.auth.exchangeCodeForSession(window.location.href)`; on success navigate to `/`; on failure navigate to `/auth?error=<message>`
    - Display a loading spinner while the exchange is in progress
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 2.3 Register `/auth/callback` route in `App.jsx`
    - Add `<Route path="/auth/callback" element={<AuthCallback />} />` inside the router in `App.jsx`
    - _Requirements: 2.6_
  - [ ]* 2.4 Write unit tests for the OAuth callback flow
    - Test: success path navigates to `/` with a valid session
    - Test: failure path navigates to `/auth` and shows error from query param
    - _Requirements: 2.5, 2.6_

- [x] 3. Implement Manual Activity Logging
  - [x] 3.1 Create `ManualLogForm` component
    - Create `frontend/src/components/ManualLogForm.jsx`
    - Fields: title (text), activity type (select: Running/Cycling/Walking/Hiking), distance in km (number), hours (number) and minutes (number) converted to `duration_seconds`, optional calories (number)
    - Client-side validation: distance must be > 0 and ≤ 1000; `hours * 3600 + minutes * 60` must be > 0; show inline error messages on violation and prevent submission
    - On submit call `api.post("/api/activities", { title, type, distance, duration_seconds, calories, route_geojson: null })`
    - On success: show a success toast and reset all form fields; on error: show an error toast
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [x] 3.2 Add tabbed UI to `Track.jsx` for GPS Track vs Manual Log
    - Add a two-tab toggle (GPS Track / Manual Log) at the top of `Track.jsx`
    - Render existing GPS tracking UI under the GPS Track tab; render `<ManualLogForm />` under the Manual Log tab
    - _Requirements: 3.1_
  - [ ]* 3.3 Write unit tests for `ManualLogForm` validation
    - Test: distance = 0 shows error, does not submit
    - Test: duration = 0 shows error, does not submit
    - Test: distance > 1000 shows error, does not submit
    - Test: valid inputs call `api.post` once and reset form on success
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 4. Implement Dashboard Analytics endpoint and wire charts
  - [x] 4.1 Add `GET /api/users/me/analytics` route to `backend/src/routes/users.js`
    - Query activities for `user_id = req.user.id AND created_at >= now() - interval '7 days'`, group by `DATE(created_at AT TIME ZONE 'UTC')`, sum `distance`, round to 1 decimal
    - Build a `weekly` array of exactly 7 objects `{ day: "Mon", distance_km: <number> }` for the past 7 calendar days; fill missing days with 0
    - Query activities for the past 6 calendar months, group by year+month, build a `monthly` array of exactly 6 objects `{ month: "Jan", distance_km: <number> }`; fill missing months with 0
    - Protect with `requireAuth`; use only `req.user.id` as filter — no user-supplied override accepted
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 17.8_
  - [x] 4.2 Update `Dashboard.jsx` to call analytics endpoint and populate charts
    - Add a `useEffect` in `Dashboard.jsx` that calls `api.get("/api/users/me/analytics")`
    - Feed `weekly` into the weekly `BarChart` (keyed by `day`, value `distance_km`) and `monthly` into the monthly `AreaChart` (keyed by `month`, value `distance_km`)
    - Replace the zero-filled placeholder data that `buildCharts` currently generates
    - _Requirements: 4.2_
  - [ ]* 4.3 Write unit tests for the analytics endpoint
    - Test: endpoint returns correct structure with 7 weekly and 6 monthly entries
    - Test: days/months with no activities return `distance_km: 0`
    - Test: distances are rounded to 1 decimal place
    - _Requirements: 4.1, 4.4, 4.5, 4.7_

- [x] 5. Implement Streak Tracking
  - [x] 5.1 Create `backend/src/lib/streak.js` helper module
    - Export `async function recalculateStreak(supabase, userId)`:
      1. Query distinct UTC calendar dates (via `DATE(created_at AT TIME ZONE 'UTC')`) for the user, ordered descending
      2. Starting from today's UTC date (or yesterday if today has no activity), count consecutive days in the descending list
      3. `UPDATE profiles SET current_streak = N, longest_streak = GREATEST(longest_streak, N) WHERE id = userId`
    - Streak resets to 0 if the gap from the most recent activity date to today is ≥ 2 days
    - New activity on today counts as streak day 1 or extends existing streak
    - _Requirements: 5.2, 5.3, 5.6, 5.7, 5.8_
  - [x] 5.2 Call `recalculateStreak` after every activity save in REST and Socket.io paths
    - In `backend/src/routes/activities.js` `POST /api/activities`, after a successful insert, call `recalculateStreak(supabase, req.user.id)` (non-blocking — log error but don't fail the request)
    - In `backend/src/sockets/tracking.js` `activity:stop` handler, after the Supabase insert succeeds, call `recalculateStreak(supabase, userId)` (non-blocking)
    - _Requirements: 5.2, 5.3_
  - [x] 5.3 Update `Dashboard.jsx` Streak stat card to display `current_streak`
    - The `GET /api/users/me` endpoint already spreads `profileRes.data`; once the columns exist the value flows through automatically
    - Replace the hardcoded `"— days"` with `profile?.current_streak ?? 0` and update the sub-label to "Current streak"
    - _Requirements: 5.4, 5.5_
  - [ ]* 5.4 Write unit tests for streak recalculation logic
    - Test: consecutive 5 days → `current_streak = 5`
    - Test: gap of 1 day (yesterday + today) still increments streak
    - Test: gap of 2+ days resets streak then re-evaluates
    - Test: new `current_streak > longest_streak` → `longest_streak` updated
    - _Requirements: 5.2, 5.3, 5.6_

- [x] 6. Fix Leaderboard Deterministic Tie-Breaking
  - [x] 6.1 Update `GET /api/leaderboard` to track `latest_activity_at` and apply deterministic sort
    - In `backend/src/routes/leaderboard.js`, add `created_at` to the Supabase query select fields
    - In the aggregation loop, track `latest_activity_at: row.created_at` (max per user — keep only the most recent)
    - Replace the single-key sort with the three-key sort: primary `total_distance` desc, secondary `latest_activity_at` desc, tertiary `user_id` asc (using `localeCompare`)
    - Include `latest_activity_at` in each ranked entry object
    - _Requirements: 13.1, 13.2, 13.3_
  - [ ]* 6.2 Write property test for leaderboard tie-breaking sort stability
    - **Property 9: Leaderboard Tie-Breaking Sort Stability**
    - For any set of users with equal `total_distance`, verify the user with the later `latest_activity_at` gets a strictly lower rank number; where timestamps are also equal, the user with the lexicographically smaller `user_id` gets the lower rank; the combined sort is totally ordered (no two entries share a rank)
    - **Validates: Requirements 13.1, 13.2, 20.4, 20.5**
    - _Requirements: 13.1, 13.2_
  - [ ]* 6.3 Write property test for leaderboard size cap
    - **Property 10: Leaderboard Size Cap**
    - For any number of users with qualifying activities, the response contains at most 20 entries
    - **Validates: Requirements 20.6**
    - _Requirements: 13.3_
  - [ ]* 6.4 Write property test for `is_me` flag correctness
    - **Property 11: `is_me` Flag Correctness**
    - For any leaderboard response, exactly 0 or 1 entry has `is_me = true`, and that entry's `user_id` equals the JWT subject
    - **Validates: Requirements 20.7**
    - _Requirements: 13.3_

- [x] 7. Phase 1 Checkpoint
  - Ensure all Phase 1 tests pass. Run `npx vitest --run` from the workspace root. Verify: Google OAuth button visible in `Auth.jsx`, manual log form accessible in `Track.jsx`, weekly/monthly charts show real data on Dashboard, streak stat card shows numeric value, leaderboard endpoint returns deterministically sorted results. Ask the user if any clarifications are needed before proceeding to Phase 2.

---

### Phase 2 — GPS Tracking Quality

- [x] 8. Implement GPS Capture Throttling in `useGPS.js`
  - [x] 8.1 Add `THROTTLE_MS` constant and throttle logic to `useGPS.js`
    - Add `const THROTTLE_MS = 3000;` at the top of `frontend/src/hooks/useGPS.js`
    - Add a `lastAcceptedTimestampRef = useRef(0)` ref
    - Inside the `watchPosition` callback, before processing a point, check `Date.now() - lastAcceptedTimestampRef.current >= THROTTLE_MS`; if the check fails, return early (drop the point — no distance accumulation, no socket emit, no route append)
    - On accepting a point, update `lastAcceptedTimestampRef.current = Date.now()`
    - The existing 500 m jump filter remains in place and is applied only on accepted (non-throttled) points
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 8.2 Write unit tests for GPS throttle behaviour
    - Test: two callbacks 1 second apart → only first point accepted
    - Test: two callbacks 3 seconds apart → both points accepted
    - Test: device sampling slower than 3 s → every available point accepted
    - _Requirements: 6.1, 6.4_

- [x] 9. Implement Activity-Type-Aware Pace/Speed Display
  - [x] 9.1 Replace `pace` with `metric` computed value in `useGPS.js`
    - Remove the existing `pace` string computation
    - Add a `metric` value computed with `useMemo`:
      - If `elapsed < 10` or `distance < 0.05`: return `{ value: "—", label: "Pace" }`
      - If `activityType === "Cycling"`: return `{ value: \`${((distance / elapsed) * 3600).toFixed(1)} km/h\`, label: "Speed" }`
      - Otherwise (Running/Walking/Hiking): compute `min:sec/km` and return `{ value: "M:SS/km", label: "Pace" }`
    - Export `metric` from the hook instead of `pace`
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  - [x] 9.2 Update `Track.jsx` to render `metric.label` and `metric.value`
    - Replace the destructured `pace` with `metric` from `useGPS()`
    - Update the stats grid to use `metric.label` as the label and `metric.value` as the value for the pace/speed cell
    - _Requirements: 7.3, 7.4_
  - [ ]* 9.3 Write unit tests for metric computation
    - Test: Cycling with sufficient data → label "Speed", value ends in "km/h"
    - Test: Running with sufficient data → label "Pace", value ends in "/km"
    - Test: elapsed < 10 or distance < 0.05 → value "—"
    - _Requirements: 7.1, 7.2, 7.5_

- [x] 10. Implement Elevation Capture
  - [x] 10.1 Add elevation accumulation to `useGPS.js`
    - Add `const [elevationGain, setElevationGain] = useState(0)` and `const lastAltitudeRef = useRef(null)`
    - Reset both in `start()` alongside the other state resets
    - Inside the throttle-accepted position callback, read `pos.coords.altitude`; if non-null and `lastAltitudeRef.current` is non-null and `altitude - lastAltitudeRef.current > 0`, accumulate the delta into `elevationGain`; update `lastAltitudeRef.current = pos.coords.altitude` on every non-null reading
    - Export `elevationGain` from the hook
    - _Requirements: 8.2_
  - [x] 10.2 Include `elevation_gain_m` in the `activity:stop` socket payload from `useGPS.js`
    - In `useGPS.js` `stop()`, add `elevation_gain_m: elevationGain` to the `socket.emit("activity:stop", { ... })` payload
    - _Requirements: 8.3_
  - [x] 10.3 Persist `elevation_gain_m` in `tracking.js` socket handler and `activities.js` REST route
    - In `backend/src/sockets/tracking.js` `activity:stop` handler, destructure `elevation_gain_m` from the payload and include it in the Supabase insert
    - In `backend/src/routes/activities.js` `POST /api/activities`, accept `elevation_gain_m` from `req.body` and include it in the insert (default 0 when absent)
    - Update the `GET /api/activities` and `GET /api/activities/:id` select queries to explicitly include `elevation_gain_m` if they currently use wildcard; confirm both return the new field
    - _Requirements: 8.4, 8.5, 8.7, 8.8_
  - [x] 10.4 Update Dashboard "Max Elevation" personal record in `Dashboard.jsx`
    - In the `useEffect` that fetches `/api/users/me`, also fetch `/api/activities?filter=mine&limit=1000` (or add a new analytics field) to find `Math.max(...activities.map(a => a.elevation_gain_m ?? 0))`
    - Alternatively, add `max_elevation_gain_m` to the `/api/users/me/analytics` response in the backend and use that value
    - Display the max value (in metres, e.g. "87.3 m") in the Max Elevation record card; display "0 m" when no activities exist
    - _Requirements: 8.6_
  - [ ]* 10.5 Write property test for GPS distance accumulation integrity
    - **Property 2: GPS Distance Accumulation Integrity**
    - For any sequence of GPS coordinates, total accumulated distance SHALL equal the sum of Haversine distances (radius 6371 km) for all consecutive non-discarded pairs; a point is discarded iff its Haversine distance from the previous accepted point exceeds 500 m
    - **Validates: Requirements 18.1, 18.2, 18.4**
  - [ ]* 10.6 Write property test for GPS filtering and route correctness
    - **Property 3: GPS Filtering and Route Correctness**
    - For any GPS sequence, the resulting GeoJSON LineString SHALL contain exactly the accepted points in reception order as `[lng, lat]` pairs and SHALL contain no discarded points
    - **Validates: Requirements 18.2, 18.5**

- [x] 11. Phase 2 Checkpoint
  - Ensure all Phase 1 and Phase 2 tests pass (`npx vitest --run`). Verify in the browser: Track page throttles GPS emissions to at most once per 3 seconds (check socket events in DevTools), Cycling activities show "Speed" label in km/h, Running shows "Pace" in min/km, elevation is accumulated and sent in `activity:stop` payload. Ask the user if anything looks off before Phase 3.

---

### Phase 3 — Social & Engagement

- [x] 12. Implement Feed Pagination
  - [x] 12.1 Refactor `useActivities.js` to support infinite pagination
    - Add `offset` state (starts at 0), `hasMore` state (starts at `true`), and change `activities` to an array that grows with each page
    - Rename the internal `fetch` to `fetchPage(pageOffset)` — it fetches `?filter=X&limit=20&offset=pageOffset` and appends results to `activities`; if the result length < 20, set `hasMore = false`
    - Export `loadMore` function that increments `offset` by 20 and calls `fetchPage`
    - When `filter` changes, reset `activities = []`, `offset = 0`, `hasMore = true` and re-fetch the first page
    - On fetch error, preserve existing `activities` (do not clear) and expose a `retry` callback
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  - [x] 12.2 Update `Feed.jsx` to render pagination controls
    - Below the activity list, render a "Load more" button when `hasMore && !loading` — clicking calls `loadMore()`
    - Show a loading spinner when `loading && activities.length > 0` (subsequent page loading)
    - Show "All caught up 🎉" message when `!hasMore && activities.length > 0`
    - On error with existing activities, show a "Retry" button that calls `retry()` without clearing the list
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  - [ ]* 12.3 Write unit tests for pagination logic
    - Test: first page of 20 items → `hasMore = true`
    - Test: page returns < 20 items → `hasMore = false`, "All caught up" message rendered
    - Test: filter change resets list to first page
    - Test: error preserves existing activities and shows retry
    - _Requirements: 9.4, 9.5, 9.6_

- [x] 13. Implement Activity Comments Loading
  - [x] 13.1 Add `GET /api/activities/:id/comments` endpoint to `backend/src/routes/activities.js`
    - Query `activity_comments` joined with `profiles` on `user_id`, filtered to `activity_id = req.params.id`, ordered by `created_at` ascending
    - Return array of `{ id, body, created_at, full_name, avatar_url }`
    - Protect with `requireAuth`; consistent with existing `comments: public read` RLS policy
    - Return 404 if the activity does not exist (verify with a prior activity lookup)
    - _Requirements: 10.1, 10.6_
  - [x] 13.2 Update the comments panel in `ActivityCard.jsx` (or wherever comments UI lives) to load existing comments on open
    - When the comments panel opens, immediately render any cached comments and concurrently call `GET /api/activities/:id/comments`
    - Display a loading skeleton (e.g., 2–3 grey placeholder rows) while the request is in flight
    - Replace skeleton with fetched comments once the request resolves
    - Show "No comments yet — be the first!" when the response array is empty
    - When a new comment is posted successfully (via `postComment`), append it locally without re-fetching
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  - [ ]* 13.3 Write unit tests for comments loading
    - Test: endpoint returns comments ordered by `created_at` ascending with correct fields
    - Test: panel shows loading skeleton then renders comments
    - Test: empty comments returns placeholder message
    - _Requirements: 10.1, 10.3, 10.4_

- [x] 14. Implement Challenge Progress Auto-Sync
  - [x] 14.1 Create `backend/src/lib/challengeSync.js` module
    - Export `async function syncChallengeProgress(supabase, userId)`:
      1. Fetch `challenge_participants` joined with `challenges` for `user_id = userId` where `challenges.deadline > now()`
      2. For each participant row, fetch qualifying activities (`user_id = userId AND created_at >= joined_at AND created_at < deadline`)
      3. Compute `current_value`: for `category = 'Distance'` sum `distance`; for `category = 'Time'` sum `ROUND(duration_seconds / 60.0, 2)`
      4. Upsert `current_value` for each participant row in a single batch operation
    - Overshoot (value > target) is valid — do not cap
    - If the user has joined no active challenges, return early without error
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6_
  - [x] 14.2 Call `syncChallengeProgress` after every activity save
    - In `backend/src/routes/activities.js` `POST /api/activities`, after successful insert, call `syncChallengeProgress(supabase, req.user.id)` (non-blocking — log error, don't fail the request)
    - In `backend/src/sockets/tracking.js` `activity:stop` handler, after successful insert, call `syncChallengeProgress(supabase, userId)` (non-blocking)
    - _Requirements: 11.5_
  - [x] 14.3 Verify `GET /api/challenges` returns up-to-date `current_value`
    - Inspect `backend/src/routes/challenges.js` — confirm the challenges endpoint joins `challenge_participants` and returns `current_value` for the authenticated user; if it doesn't, update the query to include the participant's `current_value`
    - _Requirements: 11.7_
  - [ ]* 14.4 Write property test for challenge progress distance accuracy
    - **Property 4: Challenge Progress — Distance Accuracy**
    - For any user, any Distance challenge with a `joined_at` and `deadline`, and any set of activities, the computed `current_value` SHALL equal the sum of `distance` for activities where `created_at >= joined_at AND created_at < deadline`, rounded to 2 decimal places
    - **Validates: Requirements 19.1**
  - [ ]* 14.5 Write property test for challenge progress time accuracy
    - **Property 5: Challenge Progress — Time Accuracy**
    - For any Time challenge, `current_value` SHALL equal the sum of `ROUND(duration_seconds / 60.0, 2)` for qualifying activities in the same time window
    - **Validates: Requirements 19.2**
  - [ ]* 14.6 Write property test for challenge progress idempotence
    - **Property 6: Challenge Progress Idempotence**
    - Calling `syncChallengeProgress(userId, challengeId)` once then calling it again immediately SHALL produce the same `current_value` with no observable difference in DB state
    - **Validates: Requirements 19.3**

- [x] 15. Implement Real-Time Leaderboard Push
  - [x] 15.1 Make the Socket.io `io` instance available to REST routes via `app.set("io", io)` in `backend/src/index.js`
    - Locate where `io` is created and the Express app is set up in `backend/src/index.js`
    - Add `app.set("io", io)` after `io` is initialised
    - _Requirements: 12.1_
  - [x] 15.2 Emit `leaderboard:updated` after every activity save in REST and Socket.io paths
    - In `backend/src/routes/activities.js` `POST /api/activities`, after successful insert, retrieve `io` via `req.app.get("io")` and emit `io.emit("leaderboard:updated", { period: "weekly" })`
    - In `backend/src/sockets/tracking.js` `activity:stop` handler, emit `io.emit("leaderboard:updated", { period: "weekly" })` after successful insert
    - _Requirements: 12.1, 12.4_
  - [x] 15.3 Add `leaderboard:updated` listener with debounce and stale flag to `useLeaderboard.js`
    - Import `getSocket` from `frontend/src/lib/socket.js`
    - In `frontend/src/hooks/useLeaderboard.js`, add a `useEffect` that subscribes to `leaderboard:updated` on the socket
    - Debounce the re-fetch by 2 seconds using `setTimeout` (cancel pending timeout on each new event before scheduling the next)
    - When the component is not mounted (user not on Leaderboard page), set a module-level or ref-based `isStale` flag to `true` instead of fetching
    - On component mount, check `isStale`; if true, refresh immediately and reset the flag
    - _Requirements: 12.2, 12.3, 12.5_
  - [ ]* 15.4 Write unit tests for real-time leaderboard push
    - Test: `activity:stop` socket event triggers `leaderboard:updated` emit
    - Test: `POST /api/activities` triggers `leaderboard:updated` emit
    - Test: `useLeaderboard` debounces re-fetches (multiple events in 2 s = 1 fetch)
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 16. Phase 3 Checkpoint
  - Ensure all Phase 1, 2, and 3 tests pass (`npx vitest --run`). Verify: Feed "Load more" button appears and appends new activities, comments panel shows existing comments and loading skeleton, challenge progress updates when a new activity is saved, and the Leaderboard refreshes within 2 seconds of a new activity being created. Ask the user before proceeding to Phase 4.

---

### Phase 4 — Platform Enhancements

- [x] 17. Implement Progressive Web App (PWA)
  - [x] 17.1 Install `vite-plugin-pwa` and add PWA icons
    - Run `npm install -D vite-plugin-pwa` in the `frontend/` directory
    - Create `frontend/public/icons/` directory and add `icon-192.png` (192×192) and `icon-512.png` (512×512) PNG icons using the RunTrackPro brand colour `#FC4C02` and a running-figure or "RTP" logo
    - _Requirements: 14.1_
  - [x] 17.2 Configure `vite-plugin-pwa` in `frontend/vite.config.js`
    - Import and add `VitePWA({ registerType: "prompt", strategies: "generateSW", workbox: { navigateFallback: "/index.html", runtimeCaching: [{ urlPattern: /^https?:\/\/.*\/api\//, handler: "NetworkFirst", options: { cacheName: "api-cache", networkTimeoutSeconds: 5 } }] }, manifest: { name: "RunTrackPro", short_name: "RunTrackPro", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#FC4C02", icons: [...] } })`
    - Ensure app-shell assets (HTML, CSS, JS bundles) are precached using cache-first strategy (workbox default `generateSW` behaviour)
    - _Requirements: 14.1, 14.2, 14.5_
  - [x] 17.3 Create `useServiceWorker` hook for update detection
    - Create `frontend/src/hooks/useServiceWorker.js`
    - On mount, listen to `navigator.serviceWorker.ready` for a `waiting` SW; when detected, expose a `updateAvailable` boolean and an `applyUpdate()` function that posts `{ type: "SKIP_WAITING" }` then calls `window.location.reload()`
    - _Requirements: 14.4_
  - [x] 17.4 Create `UpdateBanner` component and wire to `useServiceWorker`
    - Create `frontend/src/components/UpdateBanner.jsx` that renders a non-blocking toast/banner: "Update available — tap to reload" with a Reload button when `updateAvailable` is true
    - Mount `<UpdateBanner />` in `App.jsx` at the root level
    - Tapping "Reload" calls `applyUpdate()` — the new SW only activates after this user action; automatic activation is explicitly not done
    - _Requirements: 14.4_
  - [x] 17.5 Create `OfflineBanner` component
    - Create `frontend/src/components/OfflineBanner.jsx` that subscribes to `window` `"online"`/`"offline"` events
    - Render a sticky amber banner "You're offline — some features may be unavailable" when offline; hide on `"online"`
    - Mount `<OfflineBanner />` in `App.jsx` at the root level
    - _Requirements: 14.6_
  - [ ]* 17.6 Write unit tests for `useServiceWorker` hook
    - Test: detecting a waiting SW sets `updateAvailable = true`
    - Test: `applyUpdate()` posts `SKIP_WAITING` message
    - _Requirements: 14.4_

- [x] 18. Implement Phase 4 Database Migrations for Weather
  - [x] 18.1 Add weather columns to `public.activities`
    - Add to `backend/supabase_schema.sql`: `ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS weather_condition text, ADD COLUMN IF NOT EXISTS temperature_celsius numeric(4,1), ADD COLUMN IF NOT EXISTS wind_speed_kmh numeric(5,1);`
    - Run the migration in Supabase SQL editor
    - _Requirements: 15.1_

- [x] 19. Implement Weather Stamping on GPS Activity Save
  - [x] 19.1 Create `backend/src/lib/weather.js` helper module
    - Export `async function fetchWeather(lat, lng)` that calls `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}` with a 5-second `AbortController` timeout
    - Return `{ weather_condition, temperature_celsius, wind_speed_kmh }` on success (convert `wind.speed` m/s → km/h by multiplying by 3.6)
    - On any error (network, timeout, bad response, missing coords), log the error and return `null`
    - _Requirements: 15.2, 15.4, 15.5_
  - [x] 19.2 Call `fetchWeather` in `tracking.js` after GPS activity insert and update the row
    - In `backend/src/sockets/tracking.js` `activity:stop` handler, after the activity is inserted, extract the last GPS point's `lat` and `lng` from `points`
    - If `points.length > 0`, call `fetchWeather(lastPoint.lat, lastPoint.lng)`; if it returns non-null, call `supabase.from("activities").update({ weather_condition, temperature_celsius, wind_speed_kmh }).eq("id", data.id)`
    - If `fetchWeather` returns null or `points` is empty, skip the update — activity is already saved without weather data
    - Manual activities (REST path) skip weather entirely since `route_geojson` is null — no change to `POST /api/activities`
    - _Requirements: 15.2, 15.3, 15.5, 15.6_
  - [x] 19.3 Update `GET /api/activities` and `GET /api/activities/:id` to return weather fields
    - Confirm (or update) the select queries in `backend/src/routes/activities.js` to include `weather_condition, temperature_celsius, wind_speed_kmh` — these are returned automatically if the queries use `select("*")`; otherwise add them explicitly
    - _Requirements: 15.7_
  - [x] 19.4 Update `ActivityCard.jsx` to display weather chip
    - When `activity.weather_condition` and `activity.temperature_celsius` are both non-null, render a small weather chip (e.g. "☀️ 18°C") inside the activity card
    - Map common `weather_condition` values (Clear, Clouds, Rain, etc.) to emojis; fall back to 🌡️ for unknown values
    - _Requirements: 15.8_
  - [ ]* 19.5 Write unit tests for `weather.js`
    - Test: successful API response returns correctly structured object with km/h conversion
    - Test: API throws (network error) → returns `null` without rethrowing
    - Test: 5-second timeout fires → returns `null`
    - _Requirements: 15.5_

- [x] 20. Implement AI Coach Weekly Advice
  - [x] 20.1 Add `GET /api/users/me/coach` endpoint to `backend/src/routes/users.js`
    - Fetch the authenticated user's activities for the past 7 days (`user_id = req.user.id AND created_at >= now() - interval '7 days'`)
    - If zero activities, immediately return `{ advice: "Keep it up! Log more activities this week to unlock personalised tips." }` without calling the LLM
    - Build a stats-only prompt: total distance (km, 1 dp), total duration (minutes), activity count, unique activity types — DO NOT include name, email, or any PII
    - POST to OpenAI-compatible API (`process.env.OPENAI_API_KEY`) with a 10-second `AbortController` timeout; return `{ advice: response.choices[0].message.content }`
    - On any error or timeout, return the fallback message with HTTP 200
    - Use `req.user.id` exclusively as the filter — no user-supplied ID accepted
    - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6, 16.7, 17.7_
  - [x] 20.2 Add "AI Coach" card to `Dashboard.jsx`
    - Add a `useEffect` in `Dashboard.jsx` that calls `api.get("/api/users/me/coach")` on mount
    - Render an "AI Coach 🤖" card below the personal records section showing the advice string
    - Display a loading skeleton while the request is in flight; show the advice or fallback message on resolve
    - _Requirements: 16.4_
  - [ ]* 20.3 Write unit tests for the AI Coach endpoint
    - Test: zero activities returns fallback without calling LLM
    - Test: LLM timeout returns fallback with HTTP 200
    - Test: prompt does not contain user name, email, or UUID
    - Test: returns `{ advice: "<string>" }` on success
    - _Requirements: 16.5, 16.6, 16.7_
  - [ ]* 20.4 Write property test for JWT isolation on analytics and coach endpoints
    - **Property 1: JWT Isolation on Protected Endpoints**
    - For any JWT subject `jwtUserId` and any other `attemptedId` in query/body, the analytics and coach endpoints SHALL query the DB using only `jwtUserId`, producing results identical to requests without an `attemptedId` override
    - **Validates: Requirements 17.7, 17.8**

- [x] 21. Final Checkpoint — All Phases
  - Ensure all tests pass: `npx vitest --run`. Verify the full build compiles without errors: `npm run build` in `frontend/`. Confirm PWA manifest is present in `dist/`, service worker registers in Chrome DevTools → Application → Service Workers, "Add to Home Screen" prompt appears on mobile, offline banner shows when network is disabled, weather chip appears on GPS activity cards, and AI Coach card renders on Dashboard. Ask the user to sign off on all four phases before marking the spec complete.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery; however, property tests are strongly recommended for correctness-critical components (leaderboard, challenge sync, GPS filtering)
- All phase migrations are additive (nullable columns or columns with defaults) — no breaking changes to existing data
- The `recalculateStreak` and `syncChallengeProgress` calls are non-fatal side effects; activity saves succeed even if they throw
- Property-based tests use [fast-check](https://fast-check.io/) with Vitest as the runner; install with `npm install -D fast-check` in the `backend/` directory
- External API keys (`OPENWEATHER_API_KEY`, `OPENAI_API_KEY`) must be added to `backend/.env` before Phase 4 tasks run
- Each task references specific requirements for full traceability; the complete requirements document is at `.kiro/specs/runtrackpro-phased-roadmap/requirements.md`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1", "6.1", "8.1", "9.1", "10.1", "13.1", "14.1", "15.1", "18.1", "19.1", "20.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "5.2", "6.2", "8.2", "9.2", "10.2", "12.1", "14.2", "15.2", "17.1", "19.2", "20.2"] },
    { "id": 3, "tasks": ["2.3", "3.3", "4.3", "5.3", "6.3", "9.3", "10.3", "12.2", "13.2", "14.3", "15.3", "17.2", "19.3", "20.3"] },
    { "id": 4, "tasks": ["2.4", "5.4", "6.4", "10.4", "10.5", "10.6", "12.3", "13.3", "14.4", "14.5", "14.6", "15.4", "17.3", "19.4", "20.4"] },
    { "id": 5, "tasks": ["17.4", "17.5", "19.5"] },
    { "id": 6, "tasks": ["17.6"] }
  ]
}
```
