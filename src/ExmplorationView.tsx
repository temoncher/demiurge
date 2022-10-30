import { a, AnimatedProps } from '@react-spring/three';
import { GroupProps } from '@react-three/fiber';
import React from 'react';
import { Group } from 'three';

import { Tile } from './Tile';
import { TerrainType, terrainTypeToColorMap } from './types';

type ExplorationInnerProps = AnimatedProps<GroupProps> & {
  terrainType: TerrainType;
  wireframe: boolean;
  mask: unknown[][];
  errorMatrix: boolean[][] | null;
};

function ExplorationInner({ wireframe, terrainType, mask, errorMatrix, ...props }: ExplorationInnerProps, ref: React.Ref<Group>) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <a.group ref={ref} {...props}>
      {mask.map((row, x) =>
        row.map((hasTile, z) => {
          if (hasTile === 0) return null;

          const hasError = errorMatrix?.[x]?.[z];

          return (
            <Tile
              key={`(${x},${z})`}
              spacing={0.1}
              wireframe={wireframe}
              color={hasError ? 'red' : terrainTypeToColorMap[terrainType]}
              position={[x, 0.1, z]}
            />
          );
        })
      )}
    </a.group>
  );
}

export const ExplorationView = React.forwardRef(ExplorationInner);
