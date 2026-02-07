import type { Direction } from '@/types/engine';

/**
 * Default 2d6 direction mapping used by most hex flowers
 * Maps roll results (2-12) to directions
 * 
 * Standard mapping:
 * - 12: Up
 * - 2, 3: Up-Right
 * - 4, 5: Down-Right
 * - 6, 7: Down (optional: 7 = Stay, 6 = Down)
 * - 8, 9: Down-Left
 * - 10, 11: Up-Left
 * 
 * Note: Some engines may treat 7 as "Stay" instead of "Down" -
 * this is handled as an engine option.
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
