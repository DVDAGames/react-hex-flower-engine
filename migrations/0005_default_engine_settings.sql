-- Make the standard engine the default editor and nav engine
-- SQLite requires recreating the table to add a default value to an existing column

-- Step 1: Create new profiles table with default_engine_id default
CREATE TABLE profiles_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  default_engine_id TEXT DEFAULT 'sys-standard' REFERENCES engines(id) ON DELETE SET NULL,
  default_editor_engine_id TEXT DEFAULT NULL REFERENCES engines(id) ON DELETE SET NULL,
  accept_terms BOOLEAN NOT NULL DEFAULT FALSE,
  hex_newsletter_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  dvda_newsletter_opt_in BOOLEAN NOT NULL DEFAULT FALSE
);

-- Step 2: Copy data from old table, setting NULL default_engine_id to 'sys-standard'
INSERT INTO profiles_new (id, email, display_name, avatar_url, is_admin, created_at, updated_at, default_engine_id, accept_terms, hex_newsletter_opt_in, dvda_newsletter_opt_in)
SELECT id, email, display_name, avatar_url, is_admin, created_at, updated_at, COALESCE(default_engine_id, 'sys-standard'), accept_terms, hex_newsletter_opt_in, dvda_newsletter_opt_in
FROM profiles;

-- Step 3: Drop old table
DROP TABLE profiles;

-- Step 4: Rename new table
ALTER TABLE profiles_new RENAME TO profiles;

-- Step 5: Recreate index
CREATE INDEX idx_profiles_email ON profiles(email);