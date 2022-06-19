import { useSpring, a, AnimatedProps, config } from '@react-spring/three';
import { softShadows, OrthographicCamera, RoundedBox } from '@react-three/drei';
import { Canvas, MeshProps, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import React, { useEffect, useRef, useState } from 'react';
import { Vector3, Plane, Ray, Mesh, Material, DirectionalLight, Box3, BufferGeometry, DoubleSide, Vector3Tuple, Vector2Tuple } from 'three';

import { explorations } from './explorations';
import { Exploration, TerrainType, terrainTypeToColorMap } from './types';
import { getRandomElement, isTouchDevice } from './utils';

softShadows();

class WrongPositioningError extends Error {
  constructor(public readonly coords: Vector2Tuple[]) {
    super();
  }
}

// eslint-disable-next-line complexity
function applyExploration([rowIndex, columnIndex]: Vector2Tuple, exploration: Exploration, tileRows: (TerrainType | undefined)[][]) {
  const updatedTileRows = tileRows.map((row) => [...row]);

  const halfRowSize = Math.floor(exploration.mask.length / 2);

  const errorCoors: Vector2Tuple[] = [];

  for (let currentRowIndex = 0; currentRowIndex < exploration.mask.length; currentRowIndex++) {
    const maskRow = exploration.mask[currentRowIndex]!;
    const halfColumnSize = Math.floor(maskRow.length / 2);

    for (let currentColumnIndex = 0; currentColumnIndex < maskRow.length; currentColumnIndex++) {
      const maskColumn = maskRow[currentColumnIndex]!;

      if (!maskColumn) continue;

      const tileRowIndex = currentRowIndex + rowIndex - halfRowSize;
      const tileColumnIndex = currentColumnIndex + columnIndex - halfColumnSize;

      const row = updatedTileRows[tileRowIndex];

      if (
        tileRowIndex >= updatedTileRows.length ||
        (row && tileColumnIndex >= row.length) ||
        tileRowIndex < 0 ||
        tileColumnIndex < 0 ||
        (row && row[tileColumnIndex] !== undefined)
      ) {
        errorCoors.push([currentRowIndex, currentColumnIndex]);
        continue;
      }

      row![tileColumnIndex] = exploration.type;
    }
  }

  return errorCoors.length > 0 ? new WrongPositioningError(errorCoors) : updatedTileRows;
}

const MOBILE_TOUCH_OFFSET = 2;

function adjustRayOriginForMobile(ray: Ray) {
  const newRay = ray.clone();

  if (isTouchDevice()) {
    newRay.origin.x = newRay.origin.x - MOBILE_TOUCH_OFFSET;
    newRay.origin.z = newRay.origin.z - MOBILE_TOUCH_OFFSET;
  }

  return newRay;
}

const emptyRows: (TerrainType | undefined)[][] = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => undefined));

const gridCenter = new Vector3(9, 0, 1);

export default function Scene() {
  const [gridIsVisible, setGridVisibility] = useState(false);
  const [tileRows, setTileRows] = useState(() => emptyRows);
  const gridRef = useRef<Mesh<BufferGeometry, Material>>(null);

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
      <Canvas style={{ touchAction: 'none' }}>
        {/* <primitive object={new AxesHelper(15)} /> */}
        <Camera />
        <Lights />
        <Grid gridIsEnabled={gridIsVisible} gridRef={gridRef} rows={tileRows} position={gridCenter.clone().setY(0.2).toArray()} />
        <Ground size={tileRows.length} position={gridCenter.toArray()} />
        <ExplorationHub tiles={tileRows} gridRef={gridRef} onGridDrop={setTileRows} />
      </Canvas>
    </>
  );
}

function Camera() {
  useThree(({ camera }) => {
    const vec = new Vector3(100, 100, 100);

    camera.position.lerp(vec, 0.1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  return <OrthographicCamera makeDefault zoom={25} />;
}

type GridProps = {
  gridIsEnabled: boolean;
  rows: (TerrainType | undefined)[][];
  position: Vector3Tuple;
  gridRef: React.RefObject<Mesh<BufferGeometry, Material>>;
};

function Grid(props: GridProps) {
  const [gridX, gridY, gridZ] = props.position;
  const halfGridSize = Math.floor(props.rows.length / 2);
  const gridCenterPos: Vector3Tuple = [halfGridSize - gridX, gridY, halfGridSize - gridZ];

  return (
    <group position={gridCenterPos}>
      <mesh ref={props.gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeBufferGeometry attach="geometry" args={[props.rows.length, props.rows.length]} />
        <meshBasicMaterial attach="material" side={DoubleSide} visible={false} />
      </mesh>
      {props.gridIsEnabled && <gridHelper args={[props.rows.length, props.rows.length, 'blue', 'blue']} position={[0, 0.1, 0]} />}

      {props.rows.map((row, x) =>
        row.map((terrainType, z) =>
          terrainType === undefined ? null : (
            <Tile
              key={`(${x},${z})`}
              wireframe={false}
              color={terrainTypeToColorMap[terrainType]}
              position={[x - halfGridSize, 0.1, z - halfGridSize]}
            />
          )
        )
      )}
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

const defaultExplorationTilePosition = new Vector3(10, 0.4, -5);

const horizontalPlane = new Plane(new Vector3(0, 1, 0));

type ExplorationHubProps = {
  tiles: (TerrainType | undefined)[][];
  gridRef: React.RefObject<Mesh<BufferGeometry, Material>>;
  onGridDrop: (tiles: (TerrainType | undefined)[][]) => void;
};

function ExplorationHub(props: ExplorationHubProps) {
  const [wireframe, setWireframe] = useState(false);
  const [error, setError] = useState<WrongPositioningError | null>(null);
  const [currentExploration, setCurrentExploration] = useState<Exploration>(() => getRandomElement(explorations));
  const [springPos, api] = useSpring(() => ({ position: defaultExplorationTilePosition.toArray() }));
  const bind = useDrag<{ ray: Ray }>(({ down, event }) => {
    const adjustedRay = adjustRayOriginForMobile(event.ray);

    const box = new Box3().setFromObject(props.gridRef.current!);
    // We can't use `intersectPlane`, because planes are infinite
    const gridIntersection = adjustedRay.intersectBox(box, new Vector3());

    if (down) {
      setWireframe(true);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().round(), gridCenter);
        const updatedTiles = applyExploration([sum.x, sum.z], currentExploration, props.tiles);

        setError(updatedTiles instanceof WrongPositioningError ? updatedTiles : null);
        api.start({
          position: gridIntersection.clone().round().setY(defaultExplorationTilePosition.y).toArray(),
          config: config.stiff,
        });
      } else {
        const horizontalPlaneIntesection = adjustedRay.intersectPlane(horizontalPlane, new Vector3())!;

        setError(null);
        api.start({
          position: horizontalPlaneIntesection.clone().setY(defaultExplorationTilePosition.y).toArray(),
        });
      }
    } else {
      setWireframe(false);
      setError(null);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().round(), gridCenter);
        const updatedTiles = applyExploration([sum.x, sum.z], currentExploration, props.tiles);

        if (updatedTiles instanceof WrongPositioningError) {
          api.start({ position: defaultExplorationTilePosition.toArray() });
        } else {
          props.onGridDrop(updatedTiles);
          setCurrentExploration({ ...getRandomElement(explorations) });
        }
      } else {
        api.start({ position: defaultExplorationTilePosition.toArray() });
      }
    }
  });

  useEffect(() => {
    api.start({ immediate: true, position: defaultExplorationTilePosition.toArray() });
  }, [currentExploration]);

  const halfGridSize = Math.floor(currentExploration.mask.length / 2);

  return (
    <a.group {...springPos} {...bind()}>
      <mesh ref={props.gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeBufferGeometry attach="geometry" args={[currentExploration.mask.length, currentExploration.mask.length]} />
        <meshBasicMaterial attach="material" side={DoubleSide} visible={false} />
      </mesh>
      {currentExploration.mask.map((row, x) =>
        row.map((hasTile, z) => {
          if (hasTile === 0) return null;

          const hasError = error?.coords.some(([errX, errZ]) => errX === x && errZ === z);

          return (
            <Tile
              key={`(${x},${z})`}
              wireframe={wireframe}
              color={hasError ? 'red' : terrainTypeToColorMap[currentExploration.type]}
              position={[x - halfGridSize, 0.1, z - halfGridSize]}
            />
          );
        })
      )}
    </a.group>
  );
}

function Tile({ color, wireframe, ...props }: { color: string; wireframe: boolean } & AnimatedProps<MeshProps>) {
  return (
    <a.mesh {...props}>
      <boxBufferGeometry attach="geometry" args={[0.8, 0.1, 0.8]} />
      <meshLambertMaterial wireframe={wireframe} attach="material" color={color} />
    </a.mesh>
  );
}

function Ground(props: { size: number; position: [number, number, number] }) {
  const [gridX, gridY, gridZ] = props.position;
  const gridCenterPos: [number, number, number] = [Math.floor(props.size / 2) - gridX, gridY, Math.floor(props.size / 2) - gridZ];

  return (
    <RoundedBox args={[props.size, 0.5, props.size]} radius={0.1} position={gridCenterPos}>
      <meshLambertMaterial color="grey" />
    </RoundedBox>
  );
}
