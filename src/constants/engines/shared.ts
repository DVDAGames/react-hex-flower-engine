import type { Direction } from '@/types/engine';

/**
 * Default 2d6 direction mapping used by most hex flowers
 * Maps roll results (2-12) to directions
 * 
 * Standard mapping (with 7 = Up, not Stay):
 * - 2, 12: Down (toward hex 1)
 * - 3: Lower-Left (diagonal down-left)
 * - 4, 5: Upper-Left (diagonal up-left)
 * - 6, 7, 8: Up (toward hex 19)
 * - 9, 10: Upper-Right (diagonal up-right)
 * - 11: Lower-Right (diagonal down-right)
 * 
 * Note: Some engines may treat 7 as "Stay" instead - this is handled
 * as an engine option, not in the default directions.
 */
export const DEFAULT_2D6_DIRECTIONS: Record<number, Direction> = {
  2: 'down',
  3: 'downLeft',
  4: 'upLeft',
  5: 'upLeft',
  6: 'up',
  7: 'up',
  8: 'up',
  9: 'upRight',
  10: 'upRight',
  11: 'downRight',
  12: 'down',
};
