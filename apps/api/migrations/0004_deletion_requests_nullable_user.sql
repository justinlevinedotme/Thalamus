-- Make user_id nullable so deletion requests persist after user deletion
-- SQLite doesn't support ALTER COLUMN, so we recreate the table

-- Create new table with nullable user_id and ON DELETE SET NULL
CREATE TABLE account_deletion_requests_new (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES ba_user(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  processed_at INTEGER
);

-- Copy data from old table
INSERT INTO account_deletion_requests_new (id, user_id, email, reason, status, created_at, processed_at)
SELECT id, user_id, email, reason, status, created_at, processed_at
FROM account_deletion_requests;

-- Drop old table
DROP TABLE account_deletion_requests;

-- Rename new table
ALTER TABLE account_deletion_requests_new RENAME TO account_deletion_requests;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON account_deletion_requests(status);
