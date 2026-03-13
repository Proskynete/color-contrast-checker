CREATE TABLE IF NOT EXISTS ai_rate_limits (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  call_count   INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
);
