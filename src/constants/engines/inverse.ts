import type { EngineDefinition, Direction } from '@/types/engine';

/**
 * Inverse direction mapping - directions are reversed from standard
 * 
 * Inverse mapping:
 * - 6, 7: Up (optional: 7 = Stay, 6 = Up)
 * - 8, 9: Up-Right
 * - 10, 11: Down-Right
 * - 12: Down
 * - 2, 3: Down-Left
 * - 4, 5: Up-Left
 * 
 * Note: Some engines may treat 7 as "Stay" instead of "Up" -
 * this is handled as an engine option.
 */
const INVERSE_DIRECTIONS: Record<number, Direction> = {
  2: 'downLeft',
  3: 'downLeft',
  4: 'upLeft',
  5: 'upLeft',
  6: 'up',
  7: 'up',
  8: 'upRight',
  9: 'upRight',
  10: 'downRight',
  11: 'downRight',
  12: 'down',
};

/**
 * Inverse Hex Flower Engine
 * 
 * Same layout as Standard, but with inverted direction mapping.
 * This creates opposite tendencies - instead of drifting up, 
 * the token tends to drift down.
 */
export const INVERSE_ENGINE: EngineDefinition = {
  name: 'Inverse',
  description: 'A hex flower with reversed direction mapping. High rolls move down, low rolls move up. Creates opposite drift patterns from the standard engine.',
  icon: 'arrow-down-up',
  roll: '2d6',
  directions: INVERSE_DIRECTIONS,
  start: 10,
  nodes: [
    // Row 9 (bottom): 1
    {
      id: 1,
      label: '1',
      description: 'Bottom of the hex flower',
      map: {
        up: 5,
        upRight: 3,
        downRight: 3,  // Wrap to top-left
        down: 1,       // Stay (single hex row)
        downLeft: 2,
        upLeft: 2,
      },
    },
    // Row 8: 2, 3
    {
      id: 2,
      label: '2',
      map: {
        up: 7,
        upRight: 5,
        downRight: 1,
        down: 17,      // Wrap to top
        downLeft: 11,  // Wrap to top-right
        upLeft: 4,
      },
    },
    {
      id: 3,
      label: '3',
      map: {
        up: 8,
        upRight: 6,
        downRight: 9,  // Wrap to top-left
        down: 18,      // Wrap to top
        downLeft: 1,
        upLeft: 5,
      },
    },
    // Row 7: 4, 5, 6
    {
      id: 4,
      label: '4',
      map: {
        up: 9,
        upRight: 7,
        downRight: 2,
        down: 14,      // Wrap to top
        downLeft: 16,  // Wrap to top-right
        upLeft: 1,     // Wrap to bottom (corner)
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
        up: 11,
        upRight: 1,    // Wrap to bottom (corner)
        downRight: 14, // Wrap to top-left
        down: 16,      // Wrap to top
        downLeft: 3,
        upLeft: 8,
      },
    },
    // Row 6: 7, 8
    {
      id: 7,
      label: '7',
      map: {
        up: 12,
        upRight: 10,
        downRight: 5,
        down: 2,
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
        down: 3,
        downLeft: 5,
        upLeft: 10,
      },
    },
    // Row 5: 9, 10, 11
    {
      id: 9,
      label: '9',
      map: {
        up: 14,
        upRight: 12,
        downRight: 7,
        down: 4,
        downLeft: 18,  // Wrap to right edge
        upLeft: 3,     // Wrap to right edge
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
        up: 16,
        upRight: 2,    // Wrap to left edge
        downRight: 17, // Wrap to left edge
        down: 6,
        downLeft: 8,
        upLeft: 13,
      },
    },
    // Row 4: 12, 13
    {
      id: 12,
      label: '12',
      map: {
        up: 17,
        upRight: 15,
        downRight: 10,
        down: 7,
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
        down: 8,
        downLeft: 10,
        upLeft: 15,
      },
    },
    // Row 3: 14, 15, 16
    {
      id: 14,
      label: '14',
      map: {
        up: 4,         // Wrap to bottom
        upRight: 17,
        downRight: 12,
        down: 9,
        downLeft: 19,  // Wrap to top (corner)
        upLeft: 6,     // Wrap to bottom-right
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
        up: 6,         // Wrap to bottom
        upRight: 4,    // Wrap to bottom-left
        downRight: 19, // Wrap to top (corner)
        down: 11,
        downLeft: 13,
        upLeft: 18,
      },
    },
    // Row 2: 17, 18
    {
      id: 17,
      label: '17',
      map: {
        up: 2,         // Wrap to bottom
        upRight: 19,   // Wrap to top (corner)
        downRight: 15,
        down: 12,
        downLeft: 14,
        upLeft: 11,    // Wrap to right edge
      },
    },
    {
      id: 18,
      label: '18',
      map: {
        up: 3,         // Wrap to bottom
        upRight: 9,    // Wrap to left edge
        downRight: 16,
        down: 13,
        downLeft: 15,
        upLeft: 19,    // Wrap to top (corner)
      },
    },
    // Row 1 (top): 19
    {
      id: 19,
      label: '19',
      description: 'Top of the hex flower',
      map: {
        up: 19,        // Stay (top edge)
        upRight: 19,   // Stay (top edge)
        downRight: 18,
        down: 15,
        downLeft: 17,
        upLeft: 19,    // Stay (top edge)
      },
    },
  ],
};
