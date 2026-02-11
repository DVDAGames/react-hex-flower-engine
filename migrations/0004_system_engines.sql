-- D1 Migration: System Engines Support
-- Adds support for system-provided default engines and editor default preference

-- Add system engine flag to engines table
ALTER TABLE engines ADD COLUMN is_system_default INTEGER DEFAULT 0;

-- Add fork count tracking to engines table
ALTER TABLE engines ADD COLUMN fork_count INTEGER DEFAULT 0;

-- Add unpublished timestamp for admin unpublish action
ALTER TABLE engines ADD COLUMN unpublished_at TEXT;

-- Add default editor engine preference to profiles
ALTER TABLE profiles ADD COLUMN default_editor_engine_id TEXT REFERENCES engines(id) ON DELETE SET NULL;

-- Create index for efficient system engine queries
CREATE INDEX IF NOT EXISTS idx_engines_system ON engines(is_system_default);

-- Update public engines index to prioritize system engines
DROP INDEX IF EXISTS idx_engines_public;
CREATE INDEX idx_engines_public ON engines(visibility, is_system_default DESC, use_count DESC);

-- Create index for forked_from queries (to find all forks of an engine)
CREATE INDEX IF NOT EXISTS idx_engines_forked_from ON engines(forked_from);
