-- Email preferences for unsubscribe functionality
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES ba_user(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  -- Email categories that can be unsubscribed from
  marketing_emails BOOLEAN NOT NULL DEFAULT true,
  product_updates BOOLEAN NOT NULL DEFAULT true,
  -- Transactional emails (password reset, etc.) cannot be unsubscribed
  -- but we track the preference for future reference
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index for quick lookups by email
CREATE INDEX IF NOT EXISTS idx_email_preferences_email ON email_preferences(email);

-- RLS policies
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own preferences
DROP POLICY IF EXISTS "Users can view own email preferences" ON email_preferences;
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "Users can update own email preferences" ON email_preferences;
CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_preferences_updated_at ON email_preferences;
CREATE TRIGGER email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();
