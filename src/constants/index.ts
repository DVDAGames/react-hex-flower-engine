import type { EngineDefinition, Direction } from '@/types/engine';

// Re-export types for convenience
export type { EngineDefinition, HexNode, Direction, Modifier } from '@/types/engine';
export { DEFAULT_2D6_DIRECTIONS } from '@/types/engine';

// Import built-in engines
import { STANDARD_ENGINE } from './engines/standard';
import { WEATHER_ENGINE } from './engines/weather';
import { INVERSE_ENGINE } from './engines/inverse';

/**
 * Built-in engines that ship with the application
 */
export const BUILTIN_ENGINES: EngineDefinition[] = [
  STANDARD_ENGINE,
  WEATHER_ENGINE,
  INVERSE_ENGINE,
];

/**
 * LocalStorage namespace
 */
export const LOCAL_STORAGE_NAMESPACE = 'HEX_FLOWER_ENGINE';

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  CURRENT_ENGINE: `${LOCAL_STORAGE_NAMESPACE}__CURRENT_ENGINE`,
  ENGINE_STATE: `${LOCAL_STORAGE_NAMESPACE}__ENGINE_STATE`,
  SYNC_QUEUE: `${LOCAL_STORAGE_NAMESPACE}__SYNC_QUEUE`,
  PREFERENCES: `${LOCAL_STORAGE_NAMESPACE}__PREFERENCES`,
  CACHED_ENGINES: `${LOCAL_STORAGE_NAMESPACE}__CACHED_ENGINES`,
} as const;

/**
 * Action types for the engine
 */
export const ACTIONS = {
  RUN: 'RUN_ENGINE',
  RANDOM: 'RANDOM_HEX',
} as const;

export type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];

/**
 * Default roll expressions
 */
export const DEFAULT_ROLL = '2d6';
export const RANDOM_HEX_ROLL = '1d19';

/**
 * Delay before hiding roll result display (ms)
 */
export const ROLL_DELAY = 1000;

/**
 * Direction order for display (clockwise from 2 o'clock)
 */
export const DIRECTION_ORDER: Direction[] = [
  'upRight',
  'downRight',
  'down',
  'downLeft',
  'upLeft',
  'up',
];

/**
 * Human-readable direction labels
 */
export const DIRECTION_LABELS: Record<Direction, string> = {
  up: 'Up (12 o\'clock)',
  upRight: 'Up-Right (2 o\'clock)',
  downRight: 'Down-Right (4 o\'clock)',
  down: 'Down (6 o\'clock)',
  downLeft: 'Down-Left (8 o\'clock)',
  upLeft: 'Up-Left (10 o\'clock)',
};
