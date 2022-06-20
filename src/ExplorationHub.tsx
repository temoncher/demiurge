import { useSpring, config, a } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import { useContext, useState, useEffect } from 'react';
import { Plane, Vector3, Vector3Tuple, Vector2Tuple, Ray, Box3, DoubleSide } from 'three';

import { MainGridContext } from './MainGridContext';
import Tile from './Tile';
import { applyExploration } from './domain';
import { explorations } from './explorations';
import { TerrainType, Exploration, terrainTypeToColorMap, WrongPositioningError } from './types';
import { getRandomElement, isTouchDevice } from './utils';

const MOBILE_TOUCH_OFFSET = 2;

function adjustRayOriginForMobile(ray: Ray) {
  const newRay = ray.clone();

  if (isTouchDevice()) {
    newRay.origin.x = newRay.origin.x - MOBILE_TOUCH_OFFSET;
    newRay.origin.z = newRay.origin.z - MOBILE_TOUCH_OFFSET;
  }

  return newRay;
}

const horizontalPlane = new Plane(new Vector3(0, 1, 0));

type ExplorationHubProps = {
  position: Vector3Tuple;
  gridCenter: Vector3;
  tiles: (TerrainType | undefined)[][];
  onGridDrop: (at: Vector2Tuple, exploration: Exploration) => void;
};

export default function ExplorationHub(props: ExplorationHubProps) {
  const { mainGridRef } = useContext(MainGridContext);
  const [wireframe, setWireframe] = useState(false);
  const [error, setError] = useState<WrongPositioningError | null>(null);
  const [currentExploration, setCurrentExploration] = useState<Exploration>(() => getRandomElement(explorations));
  const [springPos, api] = useSpring(() => ({ position: props.position }));
  const bind = useDrag<{ ray: Ray }>(({ down, event }) => {
    const adjustedRay = adjustRayOriginForMobile(event.ray);

    const box = new Box3().setFromObject(mainGridRef);
    // We can't use `intersectPlane`, because planes are infinite
    const gridIntersection = adjustedRay.intersectBox(box, new Vector3());

    if (down) {
      setWireframe(true);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().round(), props.gridCenter);
        const updatedTiles = applyExploration([sum.x, sum.z], currentExploration, props.tiles);

        setError(updatedTiles instanceof WrongPositioningError ? updatedTiles : null);
        api.start({
          position: gridIntersection.clone().round().setY(props.position[1]).toArray(),
          config: config.stiff,
        });
      } else {
        const horizontalPlaneIntesection = adjustedRay.intersectPlane(horizontalPlane, new Vector3())!;

        setError(null);
        api.start({
          position: horizontalPlaneIntesection.clone().setY(props.position[1]).toArray(),
        });
      }
    } else {
      setWireframe(false);
      setError(null);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().round(), props.gridCenter);
        const updatedTiles = applyExploration([sum.x, sum.z], currentExploration, props.tiles);

        if (updatedTiles instanceof WrongPositioningError) {
          api.start({ position: props.position });
        } else {
          props.onGridDrop([sum.x, sum.z], currentExploration);
          setCurrentExploration({ ...getRandomElement(explorations) });
        }
      } else {
        api.start({ position: props.position });
      }
    }
  });

  useEffect(() => {
    api.start({ immediate: true, position: props.position });
  }, [props.position]);

  useEffect(() => {
    api.start({ immediate: true, position: props.position });
  }, [currentExploration]);

  const halfGridSize = Math.floor(currentExploration.mask.length / 2);

  return (
    <a.group {...springPos} {...bind()}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
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
