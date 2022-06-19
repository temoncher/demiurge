import { Exploration, TerrainType } from './types';

export const explorations: Exploration[] = [
  {
    name: 'Land',
    type: TerrainType.FIELDS,
    mask: [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Forgotten forest',
    type: TerrainType.FOREST,
    mask: [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Farm',
    type: TerrainType.FIELDS,
    mask: [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Town',
    type: TerrainType.SETTLEMENT,
    mask: [
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Finshing village',
    type: TerrainType.SETTLEMENT,
    mask: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'River in the fields',
    type: TerrainType.WATER,
    mask: [
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Swamp',
    type: TerrainType.WATER,
    mask: [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
];
