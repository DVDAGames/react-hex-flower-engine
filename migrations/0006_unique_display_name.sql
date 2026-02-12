-- Add unique constraint to display_name
-- This ensures each user has a unique display name

-- Create unique index on display_name (case-insensitive)
-- SQLite's UNIQUE index is case-sensitive by default, but we use COLLATE NOCASE for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_name_unique
ON profiles(display_name COLLATE NOCASE)
WHERE display_name IS NOT NULL;
