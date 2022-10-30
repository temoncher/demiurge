export enum TerrainType {
  FOREST = 'FOREST',
  FIELDS = 'FIELDS',
  SETTLEMENT = 'SETTLEMENT',
  WATER = 'WATER',
  MOUNTAIN = 'MOUNTAIN',
  CAVERN = 'CAVERN',
}

export type Exploration = {
  time: number;
  name: string;
  type: TerrainType;
  mask: (0 | 1)[][];
};

export const terrainTypeToColorMap = {
  [TerrainType.FIELDS]: 'gold',
  [TerrainType.FOREST]: 'forestgreen',
  [TerrainType.SETTLEMENT]: 'maroon',
  [TerrainType.WATER]: 'royalblue',
  [TerrainType.MOUNTAIN]: 'brown',
  [TerrainType.CAVERN]: 'black',
};

export class WrongPositioningError extends Error {
  constructor(public readonly matrix: boolean[][]) {
    super();
  }
}
