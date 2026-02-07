import type { Direction } from '@/types/engine';

/**
 * Default 2d6 direction mapping used by most hex flowers
 * Maps roll results (2-12) to directions
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
