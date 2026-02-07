import type { EngineDefinition, Direction } from '@/types/engine';

/**
 * Inverse direction mapping - directions are reversed from standard
 * 
 * Standard: low rolls go down, high rolls go up-right
 * Inverse: low rolls go up, high rolls go down
 * 
 * Mapping:
 * - 2: Up (was Down)
 * - 3: Upper-Right (was Lower-Left)
 * - 4, 5: Lower-Right (was Upper-Left)
 * - 6, 7, 8: Down (was Up)
 * - 9, 10: Lower-Left (was Upper-Right)
 * - 11: Upper-Left (was Lower-Right)
 * - 12: Up (was Down)
 */
const INVERSE_DIRECTIONS: Record<number, Direction> = {
  2: 'up',
  3: 'upRight',
  4: 'downRight',
  5: 'downRight',
  6: 'down',
  7: 'down',
  8: 'down',
  9: 'downLeft',
  10: 'downLeft',
  11: 'upLeft',
  12: 'up',
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
    {
      id: 1,
      label: '1',
      description: 'Bottom of the hex flower',
      map: {
        up: 5,
        upRight: 3,
        downRight: 1,
        down: 1,
        downLeft: 1,
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
        downLeft: 1,
        upLeft: 4,
      },
    },
    {
      id: 3,
      label: '3',
      map: {
        up: 8,
        upRight: 6,
        downRight: 1,
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
        downLeft: 6,
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
        downRight: 4,
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
        downLeft: 11,
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
        downRight: 9,
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
        downLeft: 16,
        upLeft: 16,
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
        upRight: 14,
        downRight: 14,
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
        upLeft: 18,
      },
    },
    {
      id: 18,
      label: '18',
      map: {
        up: 19,
        upRight: 17,
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
        up: 19,
        upRight: 18,
        downRight: 18,
        down: 15,
        downLeft: 17,
        upLeft: 17,
      },
    },
  ],
};
