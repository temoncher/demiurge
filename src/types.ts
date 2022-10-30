type ValueOf<T extends Record<string, unknown>> = T[keyof T];

export const TerrainType = {
  FOREST: 'FOREST',
  FIELDS: 'FIELDS',
  SETTLEMENT: 'SETTLEMENT',
  WATER: 'WATER',
  MOUNTAIN: 'MOUNTAIN',
  CAVERN: 'CAVERN',
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TerrainType = ValueOf<typeof TerrainType>;

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
