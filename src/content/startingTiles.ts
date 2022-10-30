import { TerrainType, tt } from '../types';

const { M, C, e } = tt;

export const startingTilesA: (TerrainType | null)[][] = [
  [e, e, e, e, e, e, e, e, e, e, e],
  [e, e, e, M, e, e, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, M, e, e],
  [e, e, e, e, e, e, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, e, e, e],
  [e, e, e, e, e, M, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, e, e, e],
  [e, e, M, e, e, e, e, e, e, e, e],
  [e, e, e, e, e, e, e, M, e, e, e],
  [e, e, e, e, e, e, e, e, e, e, e],
];

export const startingTilesB: (TerrainType | null)[][] = [
  [e, e, e, e, e, e, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, M, e, e],
  [e, e, e, M, e, e, e, e, e, e, e],
  [e, e, e, e, e, C, e, e, e, e, e],
  [e, e, e, e, C, C, e, e, e, e, e],
  [e, e, e, e, C, C, C, e, e, e, e],
  [e, e, e, e, e, C, e, e, e, e, e],
  [e, e, e, e, e, M, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, e, M, e],
  [e, e, M, e, e, e, e, e, e, e, e],
  [e, e, e, e, e, e, e, e, e, e, e],
];
