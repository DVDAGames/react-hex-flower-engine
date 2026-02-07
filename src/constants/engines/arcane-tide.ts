import type { EngineDefinition } from '@/types/engine';
import { DEFAULT_2D6_DIRECTIONS } from './shared';

/**
 * Arcane Tide Hex Flower Engine
 * 
 * Tracks the ebb and flow of magical energy in a fantasy setting.
 * The Void (hex 1) represents magic at its lowest, while 
 * Surge (hex 19) represents peak magical power.
 * 
 * Layout follows standard hex flower with hex 10 as center ("Normal").
 */
export const ARCANE_TIDE_ENGINE: EngineDefinition = {
  name: 'Arcane Tide',
  description: 'Track the ebb and flow of magical energy. Perfect for campaigns where magic waxes and wanes, affecting spellcasters and magical effects.',
  icon: 'sparkles',
  roll: '2d6',
  directions: DEFAULT_2D6_DIRECTIONS,
  start: 10,
  nodes: [
    {
      id: 1,
      label: 'The Void',
      description: 'Magic is at its absolute lowest. Spells may fail or have reduced effects.',
      modifiers: [
        { key: 'Spell DC', value: '-2' },
        { key: 'Spell Slots', value: 'Expend extra slot on cast' },
      ],
      style: {
        backgroundColor: '#1a1a2e',
        icon: 'circle-off',
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
      label: 'Deep Ebb',
      description: 'The magical tide has nearly vanished.',
      modifiers: [
        { key: 'Spell DC', value: '-1' },
      ],
      style: {
        backgroundColor: '#2d2d44',
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
      label: 'Deep Ebb',
      description: 'The magical tide has nearly vanished.',
      modifiers: [
        { key: 'Spell DC', value: '-1' },
      ],
      style: {
        backgroundColor: '#2d2d44',
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
      label: 'Low Tide',
      description: 'Magical energy is weak but stable.',
      style: {
        backgroundColor: '#404060',
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
      label: 'Ebbing',
      description: 'The magical tide is receding.',
      style: {
        backgroundColor: '#505070',
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
        backgroundColor: '#404060',
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
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#606080',
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
      label: 'Normal',
      description: 'Magic flows at its expected strength.',
      style: {
        backgroundColor: '#606080',
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
      label: 'Calm Waters',
      description: 'Magic is stable and predictable.',
      style: {
        backgroundColor: '#7070a0',
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
      label: 'Balanced',
      description: 'The arcane tide is perfectly balanced. Magic flows normally.',
      style: {
        backgroundColor: '#7777ff',
        icon: 'scale',
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
      label: 'Calm Waters',
      description: 'Magic is stable and predictable.',
      style: {
        backgroundColor: '#7070a0',
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
      label: 'Rising',
      description: 'The magical tide is building.',
      style: {
        backgroundColor: '#9090c0',
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
      label: 'Rising',
      description: 'The magical tide is building.',
      style: {
        backgroundColor: '#9090c0',
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
      label: 'High Tide',
      description: 'Magical energy is strong. Spells are empowered.',
      modifiers: [
        { key: 'Spell DC', value: '+1' },
      ],
      style: {
        backgroundColor: '#b0b0e0',
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
      label: 'Swelling',
      description: 'The arcane tide swells with power.',
      modifiers: [
        { key: 'Spell DC', value: '+1' },
      ],
      style: {
        backgroundColor: '#c0c0ff',
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
      label: 'High Tide',
      description: 'Magical energy is strong. Spells are empowered.',
      modifiers: [
        { key: 'Spell DC', value: '+1' },
      ],
      style: {
        backgroundColor: '#b0b0e0',
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
      label: 'Cresting',
      description: 'The tide approaches its peak. Magic crackles in the air.',
      modifiers: [
        { key: 'Spell DC', value: '+1' },
        { key: 'Wild Magic', value: 'Chance on any spell' },
      ],
      style: {
        backgroundColor: '#d4d4ff',
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
      label: 'Cresting',
      description: 'The tide approaches its peak. Magic crackles in the air.',
      modifiers: [
        { key: 'Spell DC', value: '+1' },
        { key: 'Wild Magic', value: 'Chance on any spell' },
      ],
      style: {
        backgroundColor: '#d4d4ff',
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
      label: 'SURGE!',
      description: 'The arcane tide reaches its peak! Magic is at its most potent and most dangerous.',
      modifiers: [
        { key: 'Spell DC', value: '+2' },
        { key: 'Bonus', value: 'Regain lowest expended spell slot (max 3rd)' },
        { key: 'Or', value: 'Cast one spell as if one level higher' },
        { key: 'Wild Magic', value: 'Roll on Wild Magic table for every spell' },
      ],
      style: {
        backgroundColor: '#ff77ff',
        icon: 'sparkles',
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
