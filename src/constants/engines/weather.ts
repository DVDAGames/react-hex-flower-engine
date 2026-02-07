import type { EngineDefinition } from '@/types/engine';
import { DEFAULT_2D6_DIRECTIONS } from './shared';

/**
 * Weather Hex Flower Engine
 * 
 * Generates dynamic weather conditions for tabletop adventures.
 * Weather patterns flow naturally - good weather at bottom, 
 * extreme weather at top, with disasters at hex 19.
 * 
 * Layout follows standard hex flower with hex 10 as center ("No Change").
 */
export const WEATHER_ENGINE: EngineDefinition = {
  name: 'Weather',
  description: 'Generate dynamic weather conditions for your tabletop adventures. Features weather progression with modifiers for exhaustion and visibility.',
  icon: 'cloud-sun',
  roll: '2d6',
  directions: DEFAULT_2D6_DIRECTIONS,
  start: 10,
  nodes: [
    {
      id: 1,
      label: 'Sunny; pleasant',
      description: 'Perfect weather - clear skies and comfortable temperatures.',
      style: {
        backgroundColor: '#87CEEB',
        icon: 'sun',
      },
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
      label: 'Bright and breezy',
      description: 'Light clouds with a pleasant breeze.',
      style: {
        backgroundColor: '#ADD8E6',
        icon: 'cloud-sun',
      },
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
      label: 'Partly cloudy',
      description: 'Scattered clouds but mostly clear.',
      style: {
        backgroundColor: '#B0C4DE',
        icon: 'cloud',
      },
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
      label: 'Cloudy and breezy',
      description: 'Overcast with steady winds. Chance of light showers.',
      style: {
        backgroundColor: '#A9A9A9',
        icon: 'wind',
      },
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
      label: 'Partly sunny',
      description: 'Sun peeking through clouds.',
      style: {
        backgroundColor: '#F0E68C',
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
      description: 'Heavy cloud cover blocks most light.',
      style: {
        backgroundColor: '#696969',
        icon: 'cloud-fog',
      },
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
      label: 'Steady breezes; quite windy',
      description: 'Strong winds make travel difficult.',
      style: {
        backgroundColor: '#B8B8B8',
        icon: 'wind',
      },
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
      label: 'Heavy clouds',
      description: 'Thick cloud cover, rain likely.',
      style: {
        backgroundColor: '#778899',
        icon: 'cloud',
      },
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
      label: 'Oppressive sun',
      description: 'Intense heat with little relief.',
      modifiers: [
        { key: 'Heat', value: 'Uncomfortable' },
      ],
      style: {
        backgroundColor: '#FFD700',
        icon: 'sun',
      },
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
      label: 'No change in weather',
      description: 'Weather remains stable. Roll again on the next interval.',
      style: {
        backgroundColor: '#7777ff',
        icon: 'circle-dot',
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
      label: 'Lightning and sunshine',
      description: 'Sun shower with lightning. Roll d6: on 6, a rainbow appears!',
      style: {
        backgroundColor: '#77bc77',
        icon: 'cloud-lightning',
      },
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
      label: 'Relentless sun',
      description: 'Scorching heat with no cloud cover.',
      modifiers: [
        { key: 'Exhaustion', value: 'DC 5 CON Save per hour' },
      ],
      style: {
        backgroundColor: '#FFA500',
        icon: 'sun',
      },
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
      label: 'Heavy constant rain',
      description: 'Downpour reduces visibility significantly.',
      modifiers: [
        { key: 'Stealth', value: '+1' },
        { key: 'Perception', value: '-1' },
        { key: 'Vision', value: 'Lightly Obscured' },
      ],
      style: {
        backgroundColor: '#4682B4',
        icon: 'cloud-rain',
      },
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
      label: 'Severe heat',
      description: 'Dangerous heat levels. Seek shelter or risk exhaustion.',
      modifiers: [
        { key: 'Exhaustion', value: 'DC 10 CON Save per hour' },
      ],
      style: {
        backgroundColor: '#FF6347',
        icon: 'thermometer-sun',
      },
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
      label: 'Severe storm',
      description: 'Lightning and high winds. Exposure is dangerous.',
      modifiers: [
        { key: 'Lightning', value: 'd20: on 1, struck for 2d10 damage' },
      ],
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
      label: 'Dark thunderstorms',
      description: 'Near-zero visibility with constant lightning.',
      modifiers: [
        { key: 'Vision', value: 'Heavily Obscured' },
        { key: 'Perception', value: '-2' },
      ],
      style: {
        backgroundColor: '#2F4F4F',
        icon: 'cloud-lightning',
      },
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
      label: 'Dangerous winds',
      description: 'Gale-force winds. Flying is impossible, walking is difficult.',
      modifiers: [
        { key: 'Movement', value: 'Half speed' },
        { key: 'Ranged Attacks', value: 'Disadvantage' },
      ],
      style: {
        backgroundColor: '#DAA520',
        icon: 'wind',
      },
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
      label: 'Torrential rain',
      description: 'Flash flood conditions. Rivers and streams overflow.',
      modifiers: [
        { key: 'Vision', value: 'Heavily Obscured' },
        { key: 'Terrain', value: 'Difficult' },
      ],
      style: {
        backgroundColor: '#1E90FF',
        icon: 'cloud-rain',
      },
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
      label: 'DISASTER!',
      description: 'Tornado, hurricane, or catastrophic event. Seek immediate shelter!',
      modifiers: [
        { key: 'Exhaustion', value: 'DC 15 CON Save per hour' },
        { key: 'Vision', value: 'Heavily Obscured' },
        { key: 'Damage', value: '1d6 per round outdoors' },
      ],
      style: {
        backgroundColor: '#ff7777',
        icon: 'tornado',
      },
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
