-- Add status tracking to feedback
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'reviewed'));

-- Staff (customer_care, moderator, admin) can read all feedback
CREATE POLICY "Staff can read feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('customer_care', 'moderator', 'admin')
    )
  );

-- Staff can mark feedback as reviewed
CREATE POLICY "Staff can update feedback status"
  ON feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('customer_care', 'moderator', 'admin')
    )
  )
  WITH CHECK (true);
