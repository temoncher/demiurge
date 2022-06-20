import { Exploration, TerrainType } from './types';

// eslint-disable-next-line import/prefer-default-export
export const explorations: Exploration[] = [
  {
    time: 1,
    name: 'Land',
    type: TerrainType.FIELDS,
    mask: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    time: 1,
    name: 'Forgotten forest',
    type: TerrainType.FOREST,
    mask: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  },
  {
    time: 2,
    name: 'Farm',
    type: TerrainType.FIELDS,
    mask: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
  },
  {
    time: 1,
    name: 'Town',
    type: TerrainType.SETTLEMENT,
    mask: [
      [1, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    time: 2,
    name: 'Finshing village',
    type: TerrainType.SETTLEMENT,
    mask: [[1, 1, 1, 1]],
  },
  {
    time: 2,
    name: 'River in the fields',
    type: TerrainType.WATER,
    mask: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
  },
  {
    time: 2,
    name: 'Swamp',
    type: TerrainType.WATER,
    mask: [
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
  },
];
