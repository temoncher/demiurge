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
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    time: 2,
    name: 'Farm',
    type: TerrainType.FIELDS,
    mask: [
      [0, 1, 0],
      [1, 1, 1],
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
    type: TerrainType.FIELDS,
    mask: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
  },
  {
    time: 2,
    name: 'Swamp',
    type: TerrainType.FOREST,
    mask: [
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
  },
  {
    time: 0,
    name: 'Anomaly',
    type: TerrainType.FIELDS,
    mask: [[1]],
  },
  {
    time: 1,
    name: 'Town',
    type: TerrainType.SETTLEMENT,
    mask: [
      [1, 0],
      [1, 1],
    ],
  },
  {
    time: 1,
    name: 'Great river',
    type: TerrainType.WATER,
    mask: [
      [0, 0, 1],
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    time: 2,
    name: 'Garden',
    type: TerrainType.FOREST,
    mask: [
      [1, 1, 1],
      [0, 0, 1],
    ],
  },
  {
    time: 2,
    name: 'Forest huts',
    type: TerrainType.SETTLEMENT,
    mask: [
      [0, 0, 1, 1],
      [1, 1, 1, 0],
    ],
  },
];
