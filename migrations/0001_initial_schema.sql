-- D1 Migration: Initial Schema
-- SQLite-compatible schema for Cloudflare D1

-- ============================================
-- Users / Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- Auth Tokens (for magic link authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_email ON auth_tokens(email);

-- ============================================
-- Sessions (JWT refresh tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_used_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_refresh ON sessions(refresh_token);

-- ============================================
-- Engines
-- ============================================
CREATE TABLE IF NOT EXISTS engines (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Engine definition stored as JSON text
  definition TEXT NOT NULL,
  
  -- Versioning
  version TEXT NOT NULL DEFAULT '1.0.0',
  
  -- Visibility: 'private', 'shared', 'pending_review', 'public'
  visibility TEXT NOT NULL DEFAULT 'private',
  use_count INTEGER NOT NULL DEFAULT 0,
  
  -- Forking support
  forked_from TEXT REFERENCES engines(id) ON DELETE SET NULL,
  
  -- Admin review fields
  submitted_for_review_at TEXT,
  reviewed_by TEXT REFERENCES profiles(id),
  reviewed_at TEXT,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE INDEX idx_engines_owner ON engines(owner_id);
CREATE INDEX idx_engines_visibility ON engines(visibility);
CREATE INDEX idx_engines_public ON engines(visibility, use_count DESC);

-- ============================================
-- Engine Versions (version history)
-- ============================================
CREATE TABLE IF NOT EXISTS engine_versions (
  id TEXT PRIMARY KEY,
  engine_id TEXT NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  
  -- Version info
  version TEXT NOT NULL,
  definition TEXT NOT NULL,
  changelog TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  
  -- Ensure unique versions per engine
  UNIQUE(engine_id, version)
);

CREATE INDEX idx_engine_versions_engine ON engine_versions(engine_id);

-- ============================================
-- Shared Links
-- ============================================
CREATE TABLE IF NOT EXISTS shared_links (
  id TEXT PRIMARY KEY,
  engine_id TEXT NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Unique share token (8 chars)
  token TEXT UNIQUE NOT NULL,
  
  -- Pinned to specific version (null = latest)
  engine_version TEXT,
  
  -- Shared state snapshot
  active_hex INTEGER,
  
  -- Link settings
  is_active INTEGER DEFAULT 1,
  expires_at TEXT,
  
  -- Analytics
  access_count INTEGER DEFAULT 0,
  last_accessed_at TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_engine ON shared_links(engine_id);
CREATE INDEX idx_shared_links_owner ON shared_links(owner_id);

-- ============================================
-- Engine States (user state per engine for sync)
-- ============================================
CREATE TABLE IF NOT EXISTS engine_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  engine_id TEXT NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  
  -- State
  active_hex INTEGER NOT NULL,
  
  -- Version pinning (null = always use latest)
  pinned_version TEXT,
  
  -- Sync metadata
  synced_at TEXT DEFAULT (datetime('now')),
  
  -- Unique constraint: one state per user per engine
  UNIQUE(user_id, engine_id)
);

CREATE INDEX idx_engine_states_user ON engine_states(user_id);
CREATE INDEX idx_engine_states_engine ON engine_states(engine_id);
