CREATE TABLE IF NOT EXISTS checks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  text_color       TEXT NOT NULL,
  bg_color         TEXT NOT NULL,
  ratio            NUMERIC(5, 2) NOT NULL,
  text_type        TEXT NOT NULL DEFAULT 'small' CHECK (text_type IN ('small', 'large')),
  wcag_level       TEXT CHECK (wcag_level IN ('AAA', 'AA', 'A', 'fail')),
  ai_assisted      BOOLEAN NOT NULL DEFAULT false,
  share_token      TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checks_user_id_idx ON checks (user_id);
CREATE INDEX IF NOT EXISTS checks_share_token_idx ON checks (share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS checks_created_at_idx ON checks (user_id, created_at DESC);
