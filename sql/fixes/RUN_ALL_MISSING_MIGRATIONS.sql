-- ============================================================
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- It adds all missing columns safely (IF NOT EXISTS)
-- ============================================================

-- Activities: elevation, weather, location
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS elevation_gain_m    numeric(7,1)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weather_condition   text,
  ADD COLUMN IF NOT EXISTS temperature_celsius numeric(4,1),
  ADD COLUMN IF NOT EXISTS wind_speed_kmh      numeric(5,1),
  ADD COLUMN IF NOT EXISTS location_name       text;

-- Profiles: streak + body stats
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak      integer       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak      integer       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS age                 integer,
  ADD COLUMN IF NOT EXISTS weight_kg           numeric(5,1),
  ADD COLUMN IF NOT EXISTS height_cm           numeric(5,1),
  ADD COLUMN IF NOT EXISTS gender              text CHECK (gender IN ('male','female','other')),
  ADD COLUMN IF NOT EXISTS activity_level      text NOT NULL DEFAULT 'moderate'
    CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  ADD COLUMN IF NOT EXISTS weight_goal         text NOT NULL DEFAULT 'maintain'
    CHECK (weight_goal IN ('lose','maintain','gain')),
  ADD COLUMN IF NOT EXISTS daily_steps_goal    integer NOT NULL DEFAULT 8000;

-- Verify: check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activities' 
  AND column_name IN ('elevation_gain_m','location_name','weather_condition')
ORDER BY column_name;
