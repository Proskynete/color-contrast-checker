CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id            TEXT UNIQUE NOT NULL,
  email               TEXT NOT NULL,
  plan                TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams')),
  ai_credits_used     INT NOT NULL DEFAULT 0,
  ai_credits_reset_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id);
