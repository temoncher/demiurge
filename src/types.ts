type ValueOf<T extends Record<string, unknown>> = T[keyof T];

export const TerrainType = {
  TREES: 'TREES',
  FIELDS: 'FIELDS',
  SETTLEMENT: 'SETTLEMENT',
  WATER: 'WATER',
  MOUNTAIN: 'MOUNTAIN',
  CAVERN: 'CAVERN',
} as const;

export const tt = {
  T: TerrainType.TREES,
  F: TerrainType.FIELDS,
  S: TerrainType.SETTLEMENT,
  W: TerrainType.WATER,
  M: TerrainType.MOUNTAIN,
  C: TerrainType.CAVERN,
  e: null,
} as const;

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
  [TerrainType.TREES]: 'forestgreen',
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

export type GameContext = {
  tiles: (TerrainType | null)[][];
  timeLeft: number;
};

export type Challenge = {
  name: string;
  text: string;
  calculatePoints: (ctx: GameContext) => number;
};
