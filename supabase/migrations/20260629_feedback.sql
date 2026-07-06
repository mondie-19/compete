-- Feedback / suggestions table
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category    TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Admins only, no RLS needed for inserts via service role
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
