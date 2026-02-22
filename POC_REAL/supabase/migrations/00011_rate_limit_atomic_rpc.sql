-- Atomic rate limit counter
-- Replaces the SELECT-then-UPDATE race condition in rate-limit.ts with a
-- single SQL statement that inserts or increments atomically.
-- Requires: UNIQUE (key, window_start) on beta_rate_limits (added in 00003).

BEGIN;

CREATE OR REPLACE FUNCTION upsert_rate_limit_count(
  p_key        TEXT,
  p_window_start TIMESTAMPTZ
) RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO beta_rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = beta_rate_limits.count + 1
  RETURNING count;
$$;

COMMIT;
