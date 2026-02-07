import type { EngineDefinition } from '@/types/engine';
import { DEFAULT_2D6_DIRECTIONS } from './shared';

/**
 * Standard Hex Flower Engine
 * 
 * Layout (hex 10 is center, hex 1 at bottom, hex 19 at top):
 * 
 *           19
 *        17    18
 *     14    15    16
 *        12    13
 *      9    10    11
 *         7     8
 *      4     5     6
 *         2     3
 *            1
 * 
 * Movement follows the 2d6 table:
 * - 2, 12: Down (toward hex 1)
 * - 3: Lower-Left
 * - 4, 5: Upper-Left
 * - 6, 7, 8: Up (toward hex 19)
 * - 9, 10: Upper-Right
 * - 11: Lower-Right
 * 
 * Edge wrapping: left edge wraps to right edge (4↔6, 9↔11, 14↔16)
 * Top/bottom don't wrap - movement off edge stays in place.
 */
export const STANDARD_ENGINE: EngineDefinition = {
  name: 'Standard',
  description: 'A basic numbered hex flower for testing and learning the system. Start at hex 10 (center) and navigate using 2d6 rolls.',
  icon: 'hexagon',
  roll: '2d6',
  directions: DEFAULT_2D6_DIRECTIONS,
  start: 10,
  nodes: [
    {
      id: 1,
      label: '1',
      description: 'Bottom of the hex flower',
      map: {
        up: 5,
        upRight: 3,
        downRight: 1, // Stay (bottom edge)
        down: 1,      // Stay (bottom edge)
        downLeft: 1,  // Stay (bottom edge)
        upLeft: 2,
      },
    },
    {
      id: 2,
      label: '2',
      map: {
        up: 7,
        upRight: 5,
        downRight: 1,
        down: 1,
        downLeft: 1,  // Stay (bottom-left corner)
        upLeft: 4,
      },
    },
    {
      id: 3,
      label: '3',
      map: {
        up: 8,
        upRight: 6,
        downRight: 1, // Stay (bottom-right corner)
        down: 1,
        downLeft: 1,
        upLeft: 5,
      },
    },
    {
      id: 4,
      label: '4',
      map: {
        up: 12,
        upRight: 7,
        downRight: 2,
        down: 2,
        downLeft: 6,  // Wrap to right edge
        upLeft: 9,
      },
    },
    {
      id: 5,
      label: '5',
      map: {
        up: 10,
        upRight: 8,
        downRight: 3,
        down: 1,
        downLeft: 2,
        upLeft: 7,
      },
    },
    {
      id: 6,
      label: '6',
      map: {
        up: 13,
        upRight: 11,
        downRight: 4,  // Wrap to left edge
        down: 3,
        downLeft: 3,
        upLeft: 8,
      },
    },
    {
      id: 7,
      label: '7',
      map: {
        up: 12,
        upRight: 10,
        downRight: 5,
        down: 5,
        downLeft: 4,
        upLeft: 9,
      },
    },
    {
      id: 8,
      label: '8',
      map: {
        up: 13,
        upRight: 11,
        downRight: 6,
        down: 5,
        downLeft: 5,
        upLeft: 10,
      },
    },
    {
      id: 9,
      label: '9',
      map: {
        up: 17,
        upRight: 12,
        downRight: 7,
        down: 7,
        downLeft: 11, // Wrap to right edge
        upLeft: 14,
      },
    },
    {
      id: 10,
      label: '10',
      description: 'Center of the hex flower - starting position',
      style: {
        backgroundColor: '#7777ff',
        icon: 'home',
      },
      map: {
        up: 15,
        upRight: 13,
        downRight: 8,
        down: 5,
        downLeft: 7,
        upLeft: 12,
      },
    },
    {
      id: 11,
      label: '11',
      map: {
        up: 18,
        upRight: 16,
        downRight: 9,  // Wrap to left edge
        down: 8,
        downLeft: 8,
        upLeft: 13,
      },
    },
    {
      id: 12,
      label: '12',
      map: {
        up: 17,
        upRight: 15,
        downRight: 10,
        down: 10,
        downLeft: 9,
        upLeft: 14,
      },
    },
    {
      id: 13,
      label: '13',
      map: {
        up: 18,
        upRight: 16,
        downRight: 11,
        down: 10,
        downLeft: 10,
        upLeft: 15,
      },
    },
    {
      id: 14,
      label: '14',
      map: {
        up: 19,
        upRight: 17,
        downRight: 12,
        down: 12,
        downLeft: 16, // Wrap to right edge
        upLeft: 16,   // Wrap to right edge
      },
    },
    {
      id: 15,
      label: '15',
      map: {
        up: 19,
        upRight: 18,
        downRight: 13,
        down: 10,
        downLeft: 12,
        upLeft: 17,
      },
    },
    {
      id: 16,
      label: '16',
      map: {
        up: 19,
        upRight: 14,  // Wrap to left edge
        downRight: 14, // Wrap to left edge
        down: 13,
        downLeft: 13,
        upLeft: 18,
      },
    },
    {
      id: 17,
      label: '17',
      map: {
        up: 19,
        upRight: 19,
        downRight: 15,
        down: 15,
        downLeft: 14,
        upLeft: 18,   // Wrap around top
      },
    },
    {
      id: 18,
      label: '18',
      map: {
        up: 19,
        upRight: 17,  // Wrap around top
        downRight: 16,
        down: 15,
        downLeft: 15,
        upLeft: 17,
      },
    },
    {
      id: 19,
      label: '19',
      description: 'Top of the hex flower',
      map: {
        up: 19,       // Stay (top edge)
        upRight: 18,
        downRight: 18,
        down: 15,
        downLeft: 17,
        upLeft: 17,
      },
    },
  ],
};
