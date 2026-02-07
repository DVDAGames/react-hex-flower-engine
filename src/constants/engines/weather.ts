import type { EngineDefinition } from '@/types/engine';
import { DEFAULT_2D6_DIRECTIONS } from './shared';

export const WEATHER_ENGINE: EngineDefinition = {
  name: 'Weather',
  description: 'Generate dynamic weather conditions for your tabletop adventures. Features weather progression with modifiers for exhaustion and visibility.',
  icon: 'cloud-sun',
  roll: '2d6',
  directions: DEFAULT_2D6_DIRECTIONS,
  start: 1,
  nodes: [
    {
      id: 1,
      label: 'Sunny; pleasant',
      style: {
        backgroundColor: '#ddddde',
        icon: 'sun',
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
      label: 'Bright and breezy; light clouds',
      style: {
        backgroundColor: '#ddddde',
        icon: 'cloud-sun',
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
      label: 'Partly cloudy',
      style: {
        backgroundColor: '#ddddde',
        icon: 'cloud',
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
      label: 'Cloudy and breezy; chance of light showers',
      style: {
        backgroundColor: '#ddddde',
        icon: 'wind',
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
      label: 'Partly sunny',
      style: {
        backgroundColor: '#ddddde',
        icon: 'sun',
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
      label: 'Dark; overcast',
      style: {
        backgroundColor: '#ddddde',
        icon: 'cloud-fog',
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
      label: 'Steady breezes; quite windy',
      style: {
        backgroundColor: '#ddddde',
        icon: 'wind',
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
      label: 'Heavy clouds',
      style: {
        backgroundColor: '#ddddde',
        icon: 'cloud',
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
      label: 'Oppressive sun',
      style: {
        backgroundColor: '#eabcd5',
        icon: 'sun',
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
      label: 'No Change in Weather',
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
      label: 'Lightning and sunshine; roll for rainbow',
      style: {
        backgroundColor: '#77bc77',
        icon: 'cloud-lightning',
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
      label: 'Relentless sun',
      style: {
        backgroundColor: '#eabcd5',
        icon: 'sun',
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
      label: 'Heavy constant rain; reduced visibility',
      modifiers: [
        { key: 'Stealth', value: '+1' },
        { key: 'Perception', value: '-1' },
      ],
      style: {
        backgroundColor: '#77bc77',
        icon: 'cloud-rain',
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
      label: 'Severe heat; chance of exhaustion',
      modifiers: [
        { key: 'Exhaustion', value: 'DC 5 CON Save' },
      ],
      style: {
        backgroundColor: '#eabcd5',
        icon: 'thermometer-sun',
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
      label: 'Severe lightning; high winds; exposure is dangerous',
      style: {
        backgroundColor: '#ffcf77',
        icon: 'cloud-lightning',
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
      label: 'Dark thunder storms; low visibility',
      style: {
        backgroundColor: '#77bc77',
        icon: 'cloud-lightning',
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
      label: 'Severe lightning; high winds; exposure is dangerous',
      style: {
        backgroundColor: '#ffcf77',
        icon: 'cloud-lightning',
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
      label: 'Severe lightning; high winds; exposure is dangerous',
      style: {
        backgroundColor: '#ffcf77',
        icon: 'cloud-lightning',
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
      label: 'Disaster! Zero visibility',
      modifiers: [
        { key: 'Exhaustion', value: 'DC 10 CON Save' },
        { key: 'Vision', value: 'Heavily Obscured' },
      ],
      style: {
        backgroundColor: '#ff7777',
        icon: 'tornado',
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
