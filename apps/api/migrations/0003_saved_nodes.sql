-- Saved nodes table for user-created node templates
CREATE TABLE IF NOT EXISTS saved_nodes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES ba_user(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create indexes for querying by user and sorting by updated_at
CREATE INDEX IF NOT EXISTS idx_saved_nodes_user_id ON saved_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_nodes_updated_at ON saved_nodes(updated_at);
