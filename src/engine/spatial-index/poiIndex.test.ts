import test from 'node:test';
import assert from 'node:assert/strict';
import { searchPOIs } from './poiIndex.ts';
import type { POI } from '../../types/index.ts';

const SAMPLE_POIS: POI[] = [
  {
    id: 'poi-conf',
    name: 'Executive Conference Room',
    category: 'conference',
    description: 'High-tech boardroom with video wall and seating for 16.',
    position: { x: 8, y: 0, z: -4 },
    floor: 1,
    source: 'demo_seed',
    tags: ['meeting', 'presentation', 'boardroom'],
    aliases: ['Boardroom', 'Main Conf'],
    accessible: true,
  },
  {
    id: 'poi-pantry',
    name: 'Pantry & Cafeteria',
    category: 'pantry',
    description: 'Espresso machine, refrigerator, hot snacks, and water station.',
    position: { x: -6, y: 0, z: 8 },
    floor: 1,
    source: 'demo_seed',
    tags: ['kitchen', 'tea', 'coffee', 'snacks'],
    aliases: ['Chai Point', 'Kitchenette'],
    accessible: true,
  },
  {
    id: 'poi-lab',
    name: 'Prototype Laboratory',
    category: 'lab',
    description: 'Hardware workbench, 3D printers, and soldering stations.',
    position: { x: 10, y: 0, z: 6 },
    floor: 1,
    source: 'demo_seed',
    tags: ['electronics', 'hardware', 'makerspace'],
    aliases: ['Maker Lab', 'Hardware Bay'],
    accessible: true,
  },
  {
    id: 'poi-exit',
    name: 'Emergency Exit Staircase',
    category: 'emergency',
    description: 'Fire exit with crash bar door directly to ground level.',
    position: { x: -12, y: 0, z: -10 },
    floor: 1,
    source: 'demo_seed',
    tags: ['evacuation', 'fire', 'safety'],
    aliases: ['Fire Exit', 'Stairwell B'],
    accessible: false,
  },
];

test('searchPOIs matches exact and partial names', () => {
  const confMatches = searchPOIs(SAMPLE_POIS, 'Conference Room');
  assert.ok(confMatches.length > 0);
  assert.equal(confMatches[0].poi.id, 'poi-conf');
});

test('searchPOIs handles synonyms like tea/coffee for Pantry', () => {
  const teaMatches = searchPOIs(SAMPLE_POIS, 'tea');
  assert.ok(teaMatches.length > 0);
  assert.equal(teaMatches[0].poi.id, 'poi-pantry');

  const chaiMatches = searchPOIs(SAMPLE_POIS, 'chai');
  assert.ok(chaiMatches.length > 0);
  assert.equal(chaiMatches[0].poi.id, 'poi-pantry');
});

test('searchPOIs handles lab abbreviations and aliases', () => {
  const labMatches = searchPOIs(SAMPLE_POIS, 'lab');
  assert.ok(labMatches.length > 0);
  assert.equal(labMatches[0].poi.id, 'poi-lab');
});

test('searchPOIs filters by category correctly', () => {
  const pantryOnly = searchPOIs(SAMPLE_POIS, '', undefined, 'pantry');
  assert.equal(pantryOnly.length, 1);
  assert.equal(pantryOnly[0].poi.id, 'poi-pantry');
});
