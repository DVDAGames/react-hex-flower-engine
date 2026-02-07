/**
 * Movement direction type representing the 6 possible directions on a hex grid
 */
export type Direction = 'up' | 'upRight' | 'downRight' | 'down' | 'downLeft' | 'upLeft';

/**
 * Roll result direction - can be a movement direction or 'stay' (no movement)
 */
export type RollDirection = Direction | 'stay';

/**
 * All valid movement directions
 */
export const DIRECTIONS: Direction[] = ['up', 'upRight', 'downRight', 'down', 'downLeft', 'upLeft'];

/**
 * All valid roll result directions (including stay)
 */
export const ROLL_DIRECTIONS: RollDirection[] = ['up', 'upRight', 'downRight', 'down', 'downLeft', 'upLeft', 'stay'];

/**
 * A modifier is a key-value pair that provides additional game information
 * for a hex node (e.g., skill checks, effects, conditions)
 */
export interface Modifier {
  key: string;
  value: string;
}

/**
 * Style configuration for a hex node
 */
export interface NodeStyle {
  /** Background color in hex format (e.g., "#ff7777") */
  backgroundColor?: string;
  /** Text color in hex format (e.g., "#000000") */
  textColor?: string;
  /** Lucide icon name (e.g., "sun", "cloud", "zap") */
  icon?: string;
}

/**
 * A single hex node in the engine
 */
export interface HexNode {
  /** Unique identifier for this node (1-19 for standard hex flower) */
  id: number;
  /** Display label for the node */
  label?: string;
  /** Longer description shown in detail view */
  description?: string;
  /** Array of modifier key-value pairs */
  modifiers?: Modifier[];
  /** Visual styling */
  style?: NodeStyle;
  /** 
   * Navigation map: direction -> target node ID
   * A node can reference itself to indicate "stay in place"
   */
  map: Record<Direction, number>;
}

/**
 * Complete engine definition stored as JSONB in the database
 */
export interface EngineDefinition {
  /** Display name of the engine */
  name: string;
  /** Description shown in gallery and detail views */
  description?: string;
  /** Lucide icon name for gallery thumbnail */
  icon?: string;
  /** 
   * Dice notation string (e.g., "2d6", "1d12", "1d20")
   * Parsed by @dvdagames/js-die-roller
   */
  roll: string;
  /** 
   * Default mapping of roll results to directions
   * Can be overridden per-node via the node's map property
   * 'stay' means the token does not move
   */
  directions: Record<number, RollDirection>;
  /** Starting node ID */
  start: number;
  /** Array of hex nodes (typically 19 for a standard hex flower) */
  nodes: HexNode[];
}

/**
 * Visibility states for engines
 */
export type EngineVisibility = 'private' | 'shared' | 'pending_review' | 'public';

/**
 * Full engine record as stored in the database
 */
export interface Engine {
  id: string;
  owner_id: string;
  definition: EngineDefinition;
  version: string;
  visibility: EngineVisibility;
  use_count: number;
  forked_from?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/**
 * Engine version snapshot for history
 */
export interface EngineVersion {
  id: string;
  engine_id: string;
  version: string;
  definition: EngineDefinition;
  changelog?: string;
  created_at: string;
}

/**
 * Shared link record
 */
export interface SharedLink {
  id: string;
  engine_id: string;
  engine_version: string;
  token: string;
  active_hex: number;
  expires_at?: string;
  created_at: string;
}

/**
 * User's state for a specific engine (for cross-device sync)
 */
export interface EngineState {
  id: string;
  user_id: string;
  engine_id: string;
  /** Null means use latest version */
  pinned_version?: string;
  active_hex: number;
  synced_at: string;
}

/**
 * Default 2d6 direction mapping used by most hex flowers
 */
export const DEFAULT_2D6_DIRECTIONS: Record<number, Direction> = {
  2: 'upRight',
  3: 'upRight',
  4: 'downRight',
  5: 'downRight',
  6: 'down',
  7: 'down',
  8: 'downLeft',
  9: 'downLeft',
  10: 'upLeft',
  11: 'upLeft',
  12: 'up',
};
