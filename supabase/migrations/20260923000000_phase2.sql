-- Phase 2 migration: daily challenges, streaks, new games
-- Apply in the Supabase SQL editor or via `supabase db push`.
-- All timestamps are UTC; daily dates use the UTC calendar date.

-- ─── Streak fields on profiles ────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS streak_current integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_best    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_date date;

-- ─── Daily-challenge fields on existing score tables ─────────────────────────
ALTER TABLE game_pi
  ADD COLUMN IF NOT EXISTS is_daily   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daily_date date;

ALTER TABLE game_flags
  ADD COLUMN IF NOT EXISTS is_daily   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daily_date date;

-- Enforce one daily score per user per day on existing tables
CREATE UNIQUE INDEX IF NOT EXISTS game_pi_daily_user_date
  ON game_pi (user_id, daily_date)
  WHERE is_daily = true;

CREATE UNIQUE INDEX IF NOT EXISTS game_flags_daily_user_date
  ON game_flags (user_id, daily_date)
  WHERE is_daily = true;

-- ─── game_capitals ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_capitals (
  id         bigserial PRIMARY KEY,
  user_id    uuid        NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  score      integer     NOT NULL DEFAULT 0,
  played_at  timestamptz NOT NULL DEFAULT now(),
  is_daily   boolean     NOT NULL DEFAULT false,
  daily_date date
);

ALTER TABLE game_capitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "capitals: users insert own rows"
  ON game_capitals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- USING (true) mirrors game_pi / game_flags so the friends leaderboard query
-- (which reads followed users' scores) can see rows it doesn't own.
CREATE POLICY "capitals: authenticated users read all rows"
  ON game_capitals FOR SELECT TO authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS game_capitals_daily_user_date
  ON game_capitals (user_id, daily_date)
  WHERE is_daily = true;

-- ─── game_elements ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_elements (
  id         bigserial PRIMARY KEY,
  user_id    uuid        NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  score      integer     NOT NULL DEFAULT 0,
  played_at  timestamptz NOT NULL DEFAULT now(),
  is_daily   boolean     NOT NULL DEFAULT false,
  daily_date date
);

ALTER TABLE game_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elements: users insert own rows"
  ON game_elements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- USING (true) mirrors game_pi / game_flags so the friends leaderboard query
-- (which reads followed users' scores) can see rows it doesn't own.
CREATE POLICY "elements: authenticated users read all rows"
  ON game_elements FOR SELECT TO authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS game_elements_daily_user_date
  ON game_elements (user_id, daily_date)
  WHERE is_daily = true;

-- ─── game_stats rows for new games (seed with empty data) ────────────────────
-- game_stats stores global score-distribution histograms used by GameStats.
-- Rows are populated by Supabase scheduled functions; insert empty rows so
-- the existing count_scores() function can be called without errors.
INSERT INTO game_stats (game, data)
VALUES ('capitals', '{}'), ('elements', '{}')
ON CONFLICT (game) DO NOTHING;
