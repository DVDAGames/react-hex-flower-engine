import type { EngineDefinition } from '@/types/engine';
import { DEFAULT_2D6_DIRECTIONS } from './shared';

export const ARCANE_TIDE_ENGINE: EngineDefinition = {
  name: 'Arcane Tide',
  description: 'Track the ebb and flow of magical energy. Perfect for campaigns where magic waxes and wanes, affecting spellcasters and magical effects.',
  icon: 'sparkles',
  roll: '2d6',
  directions: DEFAULT_2D6_DIRECTIONS,
  start: 1,
  nodes: [
    {
      id: 1,
      label: 'The Void',
      description: 'Magic is at its absolute lowest. Spells may fail or have reduced effects.',
      style: {
        backgroundColor: '#323232',
      },
      map: {
        up: 5,
        upRight: 3,
        downRight: 3,
        down: 1,
        downLeft: 2,
        upLeft: 2,
      },
    },
    {
      id: 2,
      label: 'Ebbing',
      description: 'The magical tide is receding.',
      style: {
        backgroundColor: '#666666',
      },
      map: {
        up: 7,
        upRight: 5,
        downRight: 1,
        down: 17,
        downLeft: 11,
        upLeft: 4,
      },
    },
    {
      id: 3,
      label: 'Ebbing',
      description: 'The magical tide is receding.',
      style: {
        backgroundColor: '#666666',
      },
      map: {
        up: 8,
        upRight: 6,
        downRight: 9,
        down: 18,
        downLeft: 1,
        upLeft: 5,
      },
    },
    {
      id: 4,
      label: 'Low Tide',
      description: 'Magical energy is weak but stable.',
      style: {
        backgroundColor: '#999999',
      },
      map: {
        up: 9,
        upRight: 7,
        downRight: 2,
        down: 14,
        downLeft: 16,
        upLeft: 1,
      },
    },
    {
      id: 5,
      label: 'Ebbing',
      description: 'The magical tide is receding.',
      style: {
        backgroundColor: '#666666',
      },
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
      label: 'Low Tide',
      description: 'Magical energy is weak but stable.',
      style: {
        backgroundColor: '#999999',
      },
      map: {
        up: 11,
        upRight: 1,
        downRight: 14,
        down: 16,
        downLeft: 3,
        upLeft: 8,
      },
    },
    {
      id: 7,
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
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
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
      map: {
        up: 13,
        upRight: 11,
        downRight: 6,
        down: 3,
        downLeft: 5,
        upLeft: 10,
      },
    },
    {
      id: 9,
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
      map: {
        up: 14,
        upRight: 12,
        downRight: 7,
        down: 4,
        downLeft: 18,
        upLeft: 3,
      },
    },
    {
      id: 10,
      label: 'Normal',
      description: 'Magic flows at its expected strength. The tide is stable.',
      style: {
        backgroundColor: '#7777ff',
        icon: 'rotate-cw',
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
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
      map: {
        up: 16,
        upRight: 2,
        downRight: 17,
        down: 6,
        downLeft: 8,
        upLeft: 13,
      },
    },
    {
      id: 12,
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
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
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
      map: {
        up: 18,
        upRight: 16,
        downRight: 11,
        down: 8,
        downLeft: 10,
        upLeft: 15,
      },
    },
    {
      id: 14,
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
      map: {
        up: 4,
        upRight: 17,
        downRight: 12,
        down: 9,
        downLeft: 19,
        upLeft: 6,
      },
    },
    {
      id: 15,
      label: 'High Tide',
      description: 'Magical energy is strong and building.',
      style: {
        backgroundColor: '#ffcf77',
      },
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
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#cccccc',
      },
      map: {
        up: 6,
        upRight: 4,
        downRight: 19,
        down: 11,
        downLeft: 13,
        upLeft: 18,
      },
    },
    {
      id: 17,
      label: 'High Tide',
      description: 'Magical energy is strong and building.',
      style: {
        backgroundColor: '#ffcf77',
      },
      map: {
        up: 2,
        upRight: 19,
        downRight: 15,
        down: 12,
        downLeft: 14,
        upLeft: 11,
      },
    },
    {
      id: 18,
      label: 'High Tide',
      description: 'Magical energy is strong and building.',
      style: {
        backgroundColor: '#ffcf77',
      },
      map: {
        up: 3,
        upRight: 9,
        downRight: 16,
        down: 13,
        downLeft: 15,
        upLeft: 19,
      },
    },
    {
      id: 19,
      label: 'Surge',
      description: 'The arcane tide reaches its peak! Magic is at its most potent.',
      modifiers: [
        { key: 'Either', value: 'Regain lowest spell slot (up to 3rd level)' },
        { key: 'Or', value: 'Cast spell as if it were one level higher' },
      ],
      style: {
        backgroundColor: '#ff7777',
        icon: 'sparkles',
      },
      map: {
        up: 19,
        upRight: 19,
        downRight: 18,
        down: 15,
        downLeft: 17,
        upLeft: 19,
      },
    },
  ],
};
