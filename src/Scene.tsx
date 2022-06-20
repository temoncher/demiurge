import { softShadows, OrthographicCamera, RoundedBox, useContextBridge } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3, Mesh, Material, DirectionalLight, BufferGeometry, DoubleSide, Vector3Tuple, Vector2Tuple, AxesHelper } from 'three';

import ExplorationHub from './ExplorationHub';
import { MainGridContext } from './MainGridContext';
import Tile from './Tile';
import { applyExploration } from './domain';
import { Exploration, TerrainType, terrainTypeToColorMap } from './types';
import useOrientation from './useOrientation';

softShadows();

const TIME_LIMIT = 6 + 7 + 8 + 8;

type GameContext = {
  tiles: (TerrainType | undefined)[][];
  timeLeft: number;
};

const emptyRows: (TerrainType | undefined)[][] = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => undefined));

type LogEntry = {
  exploration: Exploration;
  at: Vector2Tuple;
};

export default function Scene() {
  const ContextBridge = useContextBridge(MainGridContext);
  const [gridIsVisible, setGridVisibility] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const gameContext = useMemo(
    () =>
      log.reduce<GameContext>(
        (ctx, entry) => ({
          timeLeft: ctx.timeLeft - entry.exploration.time - 12,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          tiles: applyExploration(entry.at, entry.exploration, ctx.tiles) as any,
        }),
        { tiles: emptyRows, timeLeft: TIME_LIMIT }
      ),
    [log]
  );
  const { isLandscape } = useOrientation();
  const gridCenter = isLandscape ? new Vector3(9, 0, 1) : new Vector3(18, 0, 18);
  const explorationHubCenter = isLandscape ? new Vector3(10, 0.4, -5) : new Vector3(15, 0.4, 15);

  return (
    <>
      <button
        style={{ position: 'absolute', padding: '0.5rem 1rem', zIndex: 10 }}
        onClick={() => {
          setGridVisibility(!gridIsVisible);
        }}
      >
        Toggle grid
      </button>
      <div style={{ position: 'absolute', zIndex: 10, right: 0 }}>{gameContext.timeLeft < 0 ? 0 : gameContext.timeLeft}</div>
      {gameContext.timeLeft <= 0 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2>GAME OVER</h2>
          <button
            style={{
              padding: '0.5rem 1rem',
            }}
            onClick={() => {
              setLog([]);
            }}
          >
            RESTART
          </button>
        </div>
      )}
      <Canvas style={{ touchAction: 'none' }}>
        <ContextBridge>
          {/* <primitive object={new AxesHelper(15)} /> */}
          <Camera />
          <Lights />
          <MainGrid gridIsEnabled={gridIsVisible} rows={gameContext.tiles} position={gridCenter.toArray()} />
          <ExplorationHub
            position={explorationHubCenter.toArray()}
            gridCenter={gridCenter}
            tiles={gameContext.tiles}
            onGridDrop={(at, exploration) => {
              setLog([...log, { at, exploration }]);
            }}
          />
        </ContextBridge>
      </Canvas>
    </>
  );
}

const LANDSCAPE_FRACTION = 35;
const PORTRAIT_FRACTION = 20;

function Camera() {
  const { isLandscape } = useOrientation();

  useThree(({ camera }) => {
    const vec = new Vector3(100, 100, 100);

    camera.position.lerp(vec, 0.1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  useFrame(({ camera }) => {
    camera.zoom = isLandscape ? window.innerWidth / LANDSCAPE_FRACTION : window.innerWidth / PORTRAIT_FRACTION;
  });

  return <OrthographicCamera makeDefault />;
}

type MainGridProps = {
  gridIsEnabled: boolean;
  rows: (TerrainType | undefined)[][];
  position: Vector3Tuple;
};

const GRID_MARGIN = 4;

function MainGrid(props: MainGridProps) {
  const gridRef = useRef<Mesh<BufferGeometry, Material>>(null);
  const { setRef } = useContext(MainGridContext);

  useEffect(() => {
    setRef(gridRef.current!);
  }, [gridRef.current]);

  const [gridX, gridY, gridZ] = props.position;
  const halfGridSize = Math.floor(props.rows.length / 2);
  const gridCenterPos: Vector3Tuple = [halfGridSize - gridX, gridY, halfGridSize - gridZ];

  return (
    <group position={gridCenterPos}>
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <planeBufferGeometry attach="geometry" args={[props.rows.length + GRID_MARGIN, props.rows.length + GRID_MARGIN]} />
        <meshBasicMaterial attach="material" side={DoubleSide} visible={false} />
      </mesh>
      {props.gridIsEnabled && (
        <gridHelper args={[props.rows.length + GRID_MARGIN, props.rows.length + GRID_MARGIN, 'blue', 'blue']} position={[0, 0.3, 0]} />
      )}

      {props.rows.map((row, x) =>
        row.map((terrainType, z) =>
          terrainType === undefined ? null : (
            <Tile
              key={`(${x},${z})`}
              wireframe={false}
              color={terrainTypeToColorMap[terrainType]}
              position={[x - halfGridSize, 0.3, z - halfGridSize]}
            />
          )
        )
      )}

      <RoundedBox args={[props.rows.length, 0.5, props.rows.length]} radius={0.1}>
        <meshLambertMaterial color="grey" />
      </RoundedBox>
    </group>
  );
}

function Lights() {
  // const spotLightRef = useRef<SpotLight>(null);
  const directionalLightRef = useRef<DirectionalLight>(null);

  // useHelper(spotLightRef, SpotLightHelper, 'hotpink');
  // useHelper(directionalLightRef, DirectionalLightHelper, 0.5, 'teal');

  return (
    <>
      <ambientLight intensity={0.5} position={[0, 0, 0]} />
      {/* <spotLight ref={spotLightRef} position={[10, 15, 5]} angle={0.3} /> */}
      <directionalLight ref={directionalLightRef} position={[20, 10, 0]} intensity={1} />
    </>
  );
}
