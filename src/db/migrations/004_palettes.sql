CREATE TABLE IF NOT EXISTS palettes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  colors     JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT palettes_single_owner CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS palettes_user_id_idx ON palettes (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS palettes_team_id_idx ON palettes (team_id) WHERE team_id IS NOT NULL;
