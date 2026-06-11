# Requirements Document

## Introduction

RunTrackPro is a full-stack mobile-first fitness tracking application for runners, cyclists, walkers, and hikers. A working scaffold already exists: React 18 + Vite + Tailwind CSS on the frontend, Express + Socket.io on the backend, and a PostgreSQL schema deployed on Supabase with Row Level Security on all tables.

This document covers the **phased roadmap** of work needed to complete the application. It is divided into four phases:

- **Phase 1** — Core auth & activity completeness (Google OAuth, manual log, real dashboard charts, streaks)
- **Phase 2** — GPS tracking quality (throttling, pace unit logic, elevation capture)
- **Phase 3** — Social & engagement (feed pagination, comments loading, challenge progress sync, real-time leaderboard push)
- **Phase 4** — Platform enhancements (PWA, weather stamping, AI Coach)

Each requirement section notes whether the underlying infrastructure already exists and what net-new work is required.

---

## Glossary

- **App**: The RunTrackPro full-stack application (frontend + backend together).
- **Auth_Service**: The Supabase Authentication service, which issues JWTs used by both the frontend and backend.
- **Activity**: A persisted fitness session record stored in the `activities` table with fields: `id`, `user_id`, `title`, `type`, `distance`, `duration_seconds`, `calories`, `route_geojson`, `created_at`.
- **Activity_Type**: One of the four allowed values: `Running`, `Cycling`, `Walking`, `Hiking`.
- **GPS_Tracker**: The `useGPS` hook on the frontend combined with the `tracking.js` Socket.io handler on the backend that captures, filters, and persists GPS sessions.
- **Manual_Log_Form**: A frontend UI form that allows a user to record an activity by typing in distance and duration without using GPS.
- **Dashboard**: The `Dashboard.jsx` page that displays stat cards, a 7-day bar chart, a 6-month area chart, and personal records.
- **Analytics_Endpoint**: The `/api/users/me/analytics` backend route (to be created) that returns weekly and monthly distance aggregations per authenticated user.
- **Streak**: A consecutive-days counter incremented each day a user logs at least one activity, stored in `profiles` as `current_streak` and `longest_streak` (columns to be added).
- **Feed**: The `Feed.jsx` page displaying a paginated list of activities with like and comment interactions.
- **Comment_Loader**: The backend route `GET /api/activities/:id/comments` (to be created) that returns existing comments for an activity.
- **Challenge**: A time-bounded fitness goal stored in the `challenges` table. A user's progress is tracked in `challenge_participants.current_value`.
- **Challenge_Sync**: Server-side logic (database trigger or post-insert hook) that updates `challenge_participants.current_value` whenever an activity is saved.
- **Leaderboard**: The ranked list of users by total distance for a period (weekly, monthly, all-time), served by `GET /api/leaderboard`.
- **Weather_Service**: The OpenWeatherMap Current Weather API called at activity-stop time to stamp weather metadata onto a saved activity.
- **AI_Coach**: A backend endpoint (`/api/users/me/coach`) that calls an OpenAI-compatible LLM with the authenticated user's weekly stats and returns a personalised training advice string.
- **PWA**: Progressive Web App — the App enhanced with a `manifest.json` and a service worker so it is installable on mobile home screens.
- **JWT**: JSON Web Token issued by Auth_Service and verified by the backend `requireAuth` middleware.
- **RLS**: Row Level Security policies enforced by Supabase PostgreSQL on every user-data table.
- **Haversine_Formula**: The spherical distance formula used in `useGPS` to calculate distance between two GPS coordinates.
- **GeoJSON_LineString**: The route geometry format stored in `activities.route_geojson` as a GeoJSON Feature with a LineString geometry.
- **Elevation**: The altitude in metres above sea level captured from the browser Geolocation API's `coords.altitude` field and stored alongside each GPS point.
- **Pace**: Expressed as minutes:seconds per kilometre (min/km) for Running, Walking, and Hiking; expressed as kilometres per hour (km/h) for Cycling.

---

## Requirements

---

### Requirement 1: Email / Password Authentication (Already Implemented — Baseline)

**User Story:** As a visitor, I want to sign up and sign in with my email and password, so that my data is private and tied to my account.

> **Status:** Fully implemented. `Auth.jsx` handles sign-up and sign-in via `supabase.auth.signInWithPassword` and `supabase.auth.signUp`. The `on_auth_user_created` trigger auto-creates a `profiles` row. Documented here as baseline context for Requirement 2.

#### Acceptance Criteria

1. WHEN a visitor submits a valid email and password on the sign-up form, THE Auth_Service SHALL create a new user account and return a JWT.
2. WHEN the `on_auth_user_created` trigger fires, THE App SHALL insert a corresponding row in `public.profiles` with the new user's `id`.
3. WHEN a registered user submits correct credentials on the sign-in form, THE Auth_Service SHALL return a valid JWT to the frontend.
4. IF a visitor submits an email address that does not conform to RFC 5321 format, THEN THE Auth_Service SHALL return a 400-level error without creating an account.
5. IF a visitor submits a password shorter than 6 characters, THEN THE Auth_Service SHALL return a 400-level error without creating an account.
6. WHILE a user is authenticated, THE App SHALL attach the JWT as a Bearer token in the `Authorization` header of every API request to the backend.

---

### Requirement 2: Google OAuth Sign-In (Phase 1 — New)

**User Story:** As a visitor, I want to sign in with my Google account, so that I can authenticate without creating a separate password.

> **Status:** Not implemented. `Auth.jsx` has a placeholder Google button. Supabase Google provider is not yet configured. The callback handling route and PKCE redirect are missing.

#### Acceptance Criteria

1. WHEN a visitor clicks the "Sign in with Google" button, THE Auth_Service SHALL redirect the browser to Google's OAuth 2.0 authorisation endpoint using the Supabase Google provider.
2. WHEN Google redirects back to the App with a valid authorisation code, THE Auth_Service SHALL exchange the code for a session and return a JWT to the frontend.
3. WHEN a Google OAuth sign-in completes for a first-time user, THE App SHALL create a `profiles` row for that user via the `on_auth_user_created` trigger, using the `full_name` from `raw_user_meta_data`.
4. WHEN a Google OAuth sign-in completes for a returning user, THE App SHALL restore the existing session without creating a duplicate `profiles` row.
5. IF the Google OAuth exchange fails or the user denies consent, THEN THE Auth_Service SHALL redirect back to the sign-in page and THE App SHALL display a descriptive error message.
6. THE App SHALL handle the OAuth callback at a dedicated redirect URL (e.g. `/auth/callback`) and redirect the authenticated user to the Dashboard upon success.

---

### Requirement 3: Manual Activity Logging (Phase 1 — New)

**User Story:** As a user, I want to manually log a past activity by entering distance and duration, so that I can record workouts that I did not track with GPS.

> **Status:** Not implemented. No UI form exists for manual entry. The `POST /api/activities` endpoint exists and accepts `title`, `type`, `distance`, `duration_seconds`, and `calories` without requiring `route_geojson`.

#### Acceptance Criteria

1. THE App SHALL provide a Manual_Log_Form accessible from the Track page that accepts: activity title, Activity_Type, distance (km), duration (hours and minutes), and optional calorie count.
2. WHEN a user submits the Manual_Log_Form with all required fields, THE App SHALL call `POST /api/activities` with `route_geojson` set to `null`.
3. THE App SHALL store distance values in kilometres and duration values in seconds in the database, regardless of what unit the form displays.
4. WHEN the backend receives a valid manual activity payload, THE App SHALL persist the record and return HTTP 201 with the saved activity object.
5. IF a user submits the Manual_Log_Form with distance equal to 0 or duration equal to 0 seconds, THEN THE App SHALL display a validation error and SHALL NOT submit the request to the backend.
6. IF a user submits the Manual_Log_Form with a distance value greater than 1000 km, THEN THE App SHALL display a validation error and SHALL NOT submit the request to the backend.
7. WHEN a manual activity is saved successfully, THE App SHALL display a confirmation message and clear the form.

---

### Requirement 4: Dashboard Analytics — Weekly and Monthly Charts (Phase 1 — New)

**User Story:** As a user, I want the Dashboard to show real distance charts for the past 7 days and past 6 months, so that I can visualise my training progress.

> **Status:** Partially implemented. `Dashboard.jsx` renders Recharts bar and area charts but populates them with zeros. `GET /api/users/me` returns all-time totals only; no time-bucketed aggregation endpoint exists.

#### Acceptance Criteria

1. THE App SHALL expose a `GET /api/users/me/analytics` endpoint that returns, for the authenticated user: a `weekly` array of exactly 7 objects `{ day: "Mon", distance_km: <number> }` covering the most recent 7 calendar days, and a `monthly` array of exactly 6 objects `{ month: "Jan", distance_km: <number> }` covering the most recent 6 calendar months. The requirement is satisfied only if the endpoint returns both arrays with the correct structure; a partial or missing array does not satisfy this requirement.
2. WHEN the Dashboard mounts, THE Dashboard SHALL call `GET /api/users/me/analytics` and populate the weekly bar chart and the monthly area chart with the returned data.
3. THE Analytics_Endpoint SHALL aggregate distance by summing `activities.distance` grouped by calendar day (weekly) and calendar month (monthly), filtered to `user_id = authenticated user`.
4. IF a day in the 7-day window has no activities, THEN THE Analytics_Endpoint SHALL include that day in the response with `distance_km: 0`.
5. IF a month in the 6-month window has no activities, THEN THE Analytics_Endpoint SHALL include that month in the response with `distance_km: 0`.
6. THE Analytics_Endpoint SHALL return only data belonging to the authenticated user; it SHALL NOT aggregate activities from other users.
7. THE Analytics_Endpoint SHALL return distances rounded to one decimal place.

---

### Requirement 5: Activity Streak Tracking (Phase 1 — New)

**User Story:** As a user, I want to see my current and longest consecutive-day activity streak, so that I stay motivated to exercise daily.

> **Status:** Not implemented. The Dashboard shows "— days / Coming soon". No streak columns exist in the `profiles` table. The stat card is rendered but hardcoded.

#### Acceptance Criteria

1. THE App SHALL add `current_streak integer not null default 0` and `longest_streak integer not null default 0` columns to the `public.profiles` table.
2. WHEN an activity is saved (via GPS stop or manual log), THE App SHALL recalculate `current_streak` for the owning user as the number of consecutive calendar days ending today on which the user logged at least one activity.
3. WHEN `current_streak` is recalculated and exceeds `longest_streak`, THE App SHALL update `longest_streak` to equal `current_streak`.
4. THE `GET /api/users/me` endpoint SHALL include `current_streak` and `longest_streak` in its response payload.
5. THE Dashboard SHALL display the authenticated user's `current_streak` value in the Streak stat card.
6. IF a user logs no activity on a given calendar day, THEN THE App SHALL reset `current_streak` to 0 for that user on their next login or activity save, evaluating the gap since the last activity. The reset SHALL occur first, then the new activity (if any) SHALL be evaluated to determine the new streak value starting from 1.
7. THE streak recalculation SHALL be based on the server's UTC calendar date, not the client's local time zone.
8. THE App SHALL allow `current_streak` to diverge temporarily from the true consecutive-days count during processing; the value SHALL be reconciled to the correct count by the time the recalculation transaction completes.

---

### Requirement 6: GPS Capture Throttling (Phase 2 — New)

**User Story:** As a user, I want the GPS tracking to consume less battery, so that I can track long activities without draining my phone.

> **Status:** Not implemented. `useGPS` calls `navigator.geolocation.watchPosition` and emits a `location:update` socket event on every position callback, which can fire multiple times per second.

#### Acceptance Criteria

1. WHILE tracking is active, THE GPS_Tracker SHALL capture and emit a GPS point at most once every 3 seconds, ignoring intermediate position callbacks that arrive within the 3-second window.
2. THE GPS_Tracker SHALL still evaluate the Haversine_Formula and accumulate distance only for points that pass the throttle window check.
3. THE GPS_Tracker SHALL still filter out GPS jumps greater than 500 metres between consecutive accepted points regardless of throttle timing.
4. WHERE the device's GPS sampling rate is slower than 3 seconds, THE GPS_Tracker SHALL accept every available point without artificial delay and SHALL still apply all other filters including the 500-metre jump filter.
5. THE throttle interval SHALL be configurable as a constant in `useGPS.js` with a default value of 3000 milliseconds.

---

### Requirement 7: Activity-Type-Aware Pace Display (Phase 2 — New)

**User Story:** As a cyclist, I want to see my speed in km/h instead of min/km, so that the metric is meaningful for my activity type.

> **Status:** Not implemented. `useGPS` always computes `pace` as `min/km` regardless of `activityType`. The Track page renders the label "Pace" for all types.

#### Acceptance Criteria

1. WHILE an activity of type `Running`, `Walking`, or `Hiking` is being tracked, THE GPS_Tracker SHALL compute and display pace as minutes:seconds per kilometre (min/km).
2. WHILE an activity of type `Cycling` is being tracked, THE GPS_Tracker SHALL compute and display speed as kilometres per hour (km/h) rounded to one decimal place.
3. THE Track page SHALL render the label "Pace" when Activity_Type is `Running`, `Walking`, or `Hiking`, and SHALL render the label "Speed" when Activity_Type is `Cycling`.
4. WHEN Activity_Type changes before a session starts, THE GPS_Tracker SHALL immediately recalculate the displayed metric using the new type.
5. IF elapsed time is less than 10 seconds or distance is less than 0.05 km, THEN THE GPS_Tracker SHALL display "—" for both pace and speed until sufficient data is available. WHEN elapsed time is exactly 10 seconds and distance is exactly 0.05 km (or greater in either dimension), THE GPS_Tracker SHALL display the calculated metric value.

---

### Requirement 8: Elevation Capture and Storage (Phase 2 — New)

**User Story:** As a hiker or runner, I want my elevation gain to be recorded, so that I can see how much climbing my routes include.

> **Status:** Not implemented. The `activities` schema has no elevation columns. `useGPS` reads `pos.coords` but does not extract `altitude`. The Dashboard "Max Elevation" personal record is hardcoded to "—".

#### Acceptance Criteria

1. THE App SHALL add an `elevation_gain_m numeric(7,1) not null default 0` column to the `public.activities` table to store total ascent in metres for GPS-tracked activities.
2. WHILE GPS tracking is active, THE GPS_Tracker SHALL read `coords.altitude` from each accepted (throttled) position fix and accumulate positive altitude gains only (ascent), ignoring descents and null altitude readings.
3. WHEN an activity is stopped and saved via Socket.io `activity:stop`, THE GPS_Tracker SHALL include `elevation_gain_m` in the payload sent to the backend.
4. WHEN the backend persists the activity, THE App SHALL store the received `elevation_gain_m` value in the `activities` table.
5. THE `GET /api/activities` and `GET /api/activities/:id` endpoints SHALL include `elevation_gain_m` in their response payloads.
6. THE Dashboard "Max Elevation" personal record SHALL display the highest `elevation_gain_m` value across all of the authenticated user's activities.
7. IF `coords.altitude` is `null` for all points in a session (device does not provide altitude), THEN THE App SHALL store `elevation_gain_m` as `0` for that activity without error.
8. Manual activities created via Manual_Log_Form SHALL have `elevation_gain_m` set to `0` by default.

---

### Requirement 9: Activity Feed Pagination (Phase 3 — New)

**User Story:** As a user, I want to scroll through older activities in the feed without reloading the page, so that I can browse the community's history.

> **Status:** Partially implemented. `GET /api/activities` already accepts `limit` and `offset` query parameters and the backend query uses `.range()`. The frontend `useActivities` hook fetches a single page of 20 items and has no mechanism to load more.

#### Acceptance Criteria

1. THE Feed SHALL initially load the 20 most recent activities ordered by `created_at` descending.
2. WHEN the user clicks a "Load more" button or scrolls to the bottom of the Feed, THE App SHALL request the next page by incrementing the `offset` parameter by 20 and appending the results to the existing list.
3. THE App SHALL display a loading indicator while a pagination request is in flight.
4. WHEN the backend returns fewer than 20 items for a given `offset`, THE App SHALL hide the "Load more" button and display an "All caught up" message. WHEN the backend returns exactly 20 items, THE App SHALL keep the "Load more" button visible on the assumption that more pages may exist.
5. IF the fetch fails, THEN THE App SHALL display a retry option without clearing the already-loaded activities.
6. THE pagination SHALL respect the current filter (`everyone`, `friends`, `mine`) so that offset-based navigation stays within the same filtered result set.

---

### Requirement 10: Activity Comments Loading (Phase 3 — New)

**User Story:** As a user, I want to see existing comments on an activity when I open the comments panel, so that I can read the conversation before replying.

> **Status:** Partially implemented. `POST /api/activities/:id/comments` exists and persists new comments. `GET /api/activities/:id/comments` does not exist. The frontend comments panel posts new comments but does not load existing ones.

#### Acceptance Criteria

1. THE App SHALL implement a `GET /api/activities/:id/comments` endpoint that returns all comments for the specified activity ordered by `created_at` ascending, with each comment including: `id`, `body`, `created_at`, and the commenter's `full_name` and `avatar_url`.
2. WHEN a user opens the comments panel for an activity, THE App SHALL immediately render any cached comments already in memory and concurrently call `GET /api/activities/:id/comments` to fetch fresh data; THE App SHALL update the displayed list when the fresh data arrives.
3. THE App SHALL display a loading skeleton while comments are being fetched.
4. IF an activity has no comments, THEN THE App SHALL display a "No comments yet — be the first!" placeholder.
5. WHEN a user successfully posts a new comment, THE App SHALL append the new comment to the displayed list without re-fetching all comments.
6. THE `GET /api/activities/:id/comments` endpoint SHALL be accessible to any authenticated user, consistent with the existing `comments: public read` RLS policy.

---

### Requirement 11: Challenge Progress Auto-Sync (Phase 3 — New)

**User Story:** As a user, I want my challenge progress to update automatically when I save a new activity, so that I don't have to manually track my contribution.

> **Status:** Not implemented. `challenge_participants.current_value` is set to 0 at join time and is never updated. No trigger or server-side logic exists to update it after an activity is saved.

#### Acceptance Criteria

1. WHEN an activity is persisted (via GPS stop or manual log), THE App SHALL identify all challenges the user has joined where `challenges.deadline > now()`.
2. FOR each such challenge with `category = 'Distance'`, THE App SHALL update `challenge_participants.current_value` to equal the sum of `activities.distance` for that user for all activities created on or after the challenge's `joined_at` timestamp and before the challenge's `deadline`.
3. FOR each such challenge with `category = 'Time'`, THE App SHALL update `challenge_participants.current_value` to equal the sum of `activities.duration_seconds` (converted to minutes) for that user for qualifying activities within the same time window.
4. THE challenge progress update SHALL be atomic: if computing progress for multiple challenges in one transaction fails, THE App SHALL roll back to the previous values and log the error without corrupting any participant record.
5. THE challenge progress recalculation SHALL be triggered server-side (not client-side) to ensure it fires for all activity creation paths (GPS stop socket event and `POST /api/activities` REST endpoint).
6. IF a user has not joined any active challenges, THEN THE App SHALL skip the recalculation without error.
7. THE `GET /api/challenges` endpoint SHALL return the up-to-date `current_value` for each challenge the user has joined, reflecting all activities saved since they joined.

---

### Requirement 12: Real-Time Leaderboard Push (Phase 3 — New)

**User Story:** As a user, I want the leaderboard to update automatically when someone saves a new activity, so that I always see live rankings.

> **Status:** Partially implemented. The backend aggregates leaderboard data correctly on demand. The frontend `Leaderboard.jsx` fetches rankings once on mount. No Socket.io event is emitted when an activity is saved that would prompt clients to refresh.

#### Acceptance Criteria

1. WHEN an activity is saved by any user (via GPS stop socket event or `POST /api/activities`), THE App SHALL emit a `leaderboard:updated` Socket.io event to all connected clients.
2. WHEN a client receives the `leaderboard:updated` event, THE Leaderboard page SHALL automatically re-fetch `GET /api/leaderboard` with the current period parameter.
3. THE re-fetch triggered by `leaderboard:updated` SHALL be debounced by at least 2 seconds to prevent stampedes when multiple activities are saved in quick succession.
4. THE `leaderboard:updated` event payload SHALL include at minimum the `period` hint (`"weekly"`, `"monthly"`, or `"alltime"`) so clients can decide whether to refresh the currently visible period.
5. WHERE a user is not on the Leaderboard page when `leaderboard:updated` is received, THE App SHALL mark the leaderboard as stale and refresh it the next time the user navigates to that page, including navigating to the page while already on it (e.g., tapping the nav link again).

---

### Requirement 13: Leaderboard Deterministic Tie-Breaking (Phase 1 — Correctness Fix)

**User Story:** As a user, I want ties in the leaderboard to be broken consistently, so that rankings do not change unexpectedly between page loads.

> **Status:** Bug. The current `leaderboard.js` sorts by `total_distance` descending only. Equal-distance users are ranked in non-deterministic order depending on DB retrieval order.

#### Acceptance Criteria

1. WHEN two or more users have identical `total_distance` values for a given period, THE Leaderboard SHALL rank the user with the most recent `created_at` activity timestamp higher.
2. WHEN two users have identical `total_distance` and identical most-recent activity timestamps (practically impossible but logically possible), THE Leaderboard SHALL break the tie by `user_id` ascending to ensure a stable, deterministic order.
3. THE tie-breaking logic SHALL be applied server-side in `GET /api/leaderboard` before assigning rank numbers.

---

### Requirement 14: Progressive Web App (Phase 4 — New)

**User Story:** As a mobile user, I want to install RunTrackPro on my home screen, so that it launches like a native app without needing a browser address bar.

> **Status:** Not implemented. No `manifest.json` exists in `frontend/public/`. No service worker is registered. The app is not installable.

#### Acceptance Criteria

1. THE App SHALL include a `manifest.json` in the `frontend/public/` directory with at minimum: `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`, and an icon set of 192×192 and 512×512 PNG images.
2. THE App SHALL register a service worker that caches the application shell (HTML, CSS, JS bundles) using a cache-first strategy so that the App launches offline.
3. WHEN a user visits the App in a supported mobile browser and the PWA install criteria are met, THE browser SHALL display an "Add to Home Screen" prompt.
4. WHEN the service worker is updated (new build deployed), THE App SHALL display a non-blocking "Update available — tap to reload" notification. THE new service worker SHALL only be activated after the user confirms via this notification; automatic activation without the notification is not permitted.
5. THE service worker SHALL use a network-first strategy for API requests (`/api/*`) so that online API calls always return fresh data, falling back to a cached response only when the network is unavailable.
6. WHILE offline, THE App SHALL display a clear offline indicator and prevent API calls from silently failing without user feedback.

---

### Requirement 15: Weather Stamping on Activity Save (Phase 4 — New)

**User Story:** As a user, I want the weather conditions to be automatically recorded with each activity, so that I can see what the weather was like during my runs.

> **Status:** Not implemented. The `activities` table has no weather columns. No call to the OpenWeatherMap API is made anywhere in the codebase.

#### Acceptance Criteria

1. THE App SHALL add three nullable columns to `public.activities`: `weather_condition text`, `temperature_celsius numeric(4,1)`, `wind_speed_kmh numeric(5,1)`.
2. WHEN an activity is stopped and saved via the GPS stop flow, THE App SHALL call the Weather_Service using the last known GPS coordinate (latitude and longitude of the final GPS point) and the OpenWeatherMap Current Weather API.
3. WHEN the Weather_Service responds successfully, THE App SHALL persist `weather_condition`, `temperature_celsius`, and `wind_speed_kmh` alongside the activity record in the same database insert or update operation.
4. THE Weather_Service call SHALL be made server-side using the backend's `OPENWEATHER_API_KEY` environment variable; the API key SHALL NOT be exposed to the frontend.
5. IF the Weather_Service call fails, times out after 5 seconds, or the last GPS coordinate is unavailable, THEN THE App SHALL save the activity without weather data (all three columns set to `null`) and SHALL NOT block or fail the activity save.
6. Manual activities created via Manual_Log_Form SHALL have all three weather columns set to `null` because no GPS coordinate is available.
7. THE `GET /api/activities` and `GET /api/activities/:id` endpoints SHALL include `weather_condition`, `temperature_celsius`, and `wind_speed_kmh` in their response payloads.
8. THE Activity_Card in the Feed SHALL display the weather emoji and temperature when `weather_condition` and `temperature_celsius` are non-null.

---

### Requirement 16: AI Coach Weekly Advice (Phase 4 — New)

**User Story:** As a user, I want to receive personalised weekly training advice based on my own recent activity data, so that I can improve my fitness with guidance tailored to my progress.

> **Status:** Not implemented. No AI Coach endpoint exists. No LLM integration is present in the codebase.

#### Acceptance Criteria

1. THE App SHALL implement a `GET /api/users/me/coach` endpoint that builds a prompt from the authenticated user's own statistics for the past 7 days: total distance, total duration, number of activities, and Activity_Types performed.
2. WHEN the AI Coach endpoint is called, THE App SHALL submit the constructed prompt to an OpenAI-compatible LLM API using the backend's `OPENAI_API_KEY` environment variable and return the LLM's response as a JSON object `{ advice: "<string>" }`.
3. THE AI Coach endpoint SHALL only use data from the authenticated user's own `activities` records; it SHALL NOT include any other user's data in the prompt or context.
4. THE Dashboard SHALL display the AI Coach advice string in a dedicated card, fetching it from `GET /api/users/me/coach` on mount.
5. IF the LLM API call fails or times out after 10 seconds, THEN THE App SHALL return a fallback message `{ advice: "Keep it up! Log more activities this week to unlock personalised tips." }` and SHALL NOT expose the raw error to the client.
6. WHERE the authenticated user has logged zero activities in the past 7 days, THE App SHALL return the fallback message without making an LLM API call.
7. THE LLM prompt SHALL NOT include the user's name, email, or any personally identifiable information — only aggregated numeric stats and activity types.

---

### Requirement 17: Ownership and Access Control (Cross-Phase Correctness)

**User Story:** As a user, I want my private data to be protected from modification by other users, so that my activities and profile remain under my control.

> **Status:** Partially enforced by RLS. The backend `requireAuth` middleware verifies JWTs. RLS policies enforce ownership on `activities` (insert/delete) and `profiles` (update), but there is no `UPDATE` RLS policy on `activities` and no backend route currently performs activity updates. This requirement formalises all ownership invariants.

#### Acceptance Criteria

1. THE App SHALL enforce that a user can only insert activities with `user_id = auth.uid()` via the `activities: owner insert` RLS policy.
2. THE App SHALL enforce that a user can only delete activities with `user_id = auth.uid()` via the `activities: owner delete` RLS policy.
3. THE App SHALL enforce that a user can only update their own `profiles` row via the `profiles: owner update` RLS policy.
4. THE App SHALL enforce that a user can only insert `challenge_participants` rows with `user_id = auth.uid()` via the `participants: owner insert` RLS policy.
5. THE App SHALL enforce that a user can only delete their own `challenge_participants` rows via the existing delete-cascade RLS behaviour.
6. THE App SHALL enforce that a user can only read their own `user_achievements` rows via the `user_achievements: read` RLS policy.
7. THE `GET /api/users/me/coach` endpoint SHALL use `req.user.id` (extracted from the verified JWT) as the sole filter when querying activities; it SHALL NOT accept a `user_id` parameter from the request body or query string. IF JWT extraction fails or the user is unauthenticated, THEN THE App SHALL immediately return HTTP 401 without querying activities or calling the LLM.
8. THE `GET /api/users/me/analytics` endpoint SHALL use `req.user.id` as the sole filter when aggregating activity data. IF JWT extraction fails or the user is unauthenticated, THEN THE App SHALL immediately return HTTP 401.

---

### Requirement 18: GPS Point Integrity (Cross-Phase Correctness)

**User Story:** As a user, I want the GPS route and distance to reflect only real movement, so that teleportation errors and signal glitches don't inflate my stats.

> **Status:** Partially implemented. `useGPS` already filters jumps `>= 0.5 km` using Haversine. This requirement formalises and extends the filtering contract.

#### Acceptance Criteria

1. WHEN consecutive accepted GPS points are received, THE GPS_Tracker SHALL compute the distance between them using the Haversine_Formula with Earth radius 6371 km.
2. IF the Haversine distance between two consecutive accepted points exceeds 500 metres, THEN THE GPS_Tracker SHALL discard the new point and SHALL NOT add it to the route or accumulate its distance.
3. IF the Haversine distance between two consecutive accepted points is 0 metres (duplicate coordinate), THEN THE GPS_Tracker SHALL still append the point to the route polyline for continuity but SHALL NOT add 0 km to the accumulated distance.
4. THE total accumulated `distance` value sent in the `activity:stop` payload SHALL equal the sum of Haversine distances for all non-discarded consecutive point pairs recorded during the session.
5. THE GeoJSON_LineString stored in `route_geojson` SHALL contain only accepted (non-discarded) GPS coordinates in the order they were received, formatted as `[longitude, latitude]` pairs per the GeoJSON specification.

---

### Requirement 19: Challenge Progress Correctness (Cross-Phase Correctness)

**User Story:** As a challenge participant, I want my progress value to exactly reflect my qualifying activity contributions, so that I trust the leaderboard and challenge standings.

> **Status:** Not implemented. Formalises the correctness contract for Requirement 11.

#### Acceptance Criteria

1. THE `challenge_participants.current_value` for a user in a Distance challenge SHALL equal the sum of `activities.distance` for all activities where `activities.user_id = user_id`, `activities.created_at >= challenge_participants.joined_at`, and `activities.created_at < challenges.deadline`.
2. THE `challenge_participants.current_value` for a user in a Time challenge SHALL equal the sum of `ROUND(activities.duration_seconds / 60.0, 2)` for all qualifying activities in the same time window.
3. THE Challenge_Sync recalculation SHALL produce the same `current_value` whether triggered once after one activity or multiple times after multiple activities (idempotent with respect to the full qualifying set).
4. WHEN a qualifying activity is deleted by its owner, THE App SHALL decrement `challenge_participants.current_value` by the deleted activity's contribution for all active challenges the user participates in.
5. IF `challenge_participants.current_value` would exceed `challenges.target`, THE App SHALL allow the value to exceed the target (overshoot is valid; it means the challenge is completed) and SHALL NOT cap it at the target.

---

### Requirement 20: Leaderboard Ranking Correctness (Cross-Phase Correctness)

**User Story:** As a competitive user, I want the leaderboard rankings to be accurate and consistent, so that I can trust where I stand relative to other runners.

> **Status:** Partially implemented. Distance aggregation is correct. Tie-breaking is not deterministic (see Requirement 13). This requirement consolidates ranking correctness properties.

#### Acceptance Criteria

1. THE Leaderboard SHALL aggregate `total_distance` as the sum of `activities.distance` for each user, filtered to activities with `created_at >= period_start` for weekly and monthly periods, and no filter for all-time.
2. THE weekly period start SHALL be calculated as the most recent Monday at 00:00:00 UTC.
3. THE monthly period start SHALL be calculated as the first day of the current calendar month at 00:00:00 UTC.
4. WHEN two users have equal `total_distance`, THE Leaderboard SHALL rank the user whose most recent activity `created_at` is later as higher (lower rank number).
5. WHEN two users have equal `total_distance` and equal most-recent activity `created_at`, THE Leaderboard SHALL rank by `user_id` ascending to produce a stable order.
6. THE Leaderboard response SHALL include no more than 20 ranked entries per period.
7. THE `is_me` flag in each leaderboard entry SHALL be `true` if and only if `user_id` equals `req.user.id` from the verified JWT.
