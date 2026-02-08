-- D1 Migration: Add default engine to profiles
-- Adds default_engine_id column for user's preferred default engine

ALTER TABLE profiles ADD COLUMN default_engine_id TEXT REFERENCES engines(id) ON DELETE SET NULL;
