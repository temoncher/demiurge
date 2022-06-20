import { useSpring, config, a } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import { useContext, useState, useEffect, useRef } from 'react';
import { Plane, Vector3, Vector3Tuple, Vector2Tuple, Ray, Box3, DoubleSide, Group } from 'three';

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
  const explorationGridRef = useRef<Group>(null);
  const [wireframe, setWireframe] = useState(false);
  const [explorationsLeft, setExplorationsLeft] = useState(() => explorations);
  const [error, setError] = useState<WrongPositioningError | null>(null);
  const [currentExploration, setCurrentExploration] = useState<Exploration>(() => getRandomElement(explorationsLeft));

  const [springPos, api] = useSpring(() => ({ position: [0, 0, 0] }));
  const bind = useDrag<{ ray: Ray }>(({ down, event }) => {
    const groupOffsetVector = explorationGridRef.current!.parent!.getWorldPosition(new Vector3());
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
          position: new Vector3().addVectors(gridIntersection, groupOffsetVector.negate()).round().setY(0).toArray(),
          config: config.stiff,
        });
      } else {
        const horizontalPlaneIntesection = adjustedRay.intersectPlane(horizontalPlane, new Vector3())!;

        setError(null);
        api.start({
          position: new Vector3().addVectors(horizontalPlaneIntesection, groupOffsetVector.negate()).setY(0).toArray(),
        });
      }
    } else {
      setWireframe(false);
      setError(null);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().round(), props.gridCenter);
        const updatedTiles = applyExploration([sum.x, sum.z], currentExploration, props.tiles);

        if (updatedTiles instanceof WrongPositioningError) {
          api.start({ position: [0, 0, 0] });
        } else {
          props.onGridDrop([sum.x, sum.z], currentExploration);
          setExplorationsLeft(explorationsLeft.filter((ex) => ex.name !== currentExploration.name));
        }
      } else {
        api.start({ position: [0, 0, 0] });
      }
    }
  });

  useEffect(() => {
    api.start({ immediate: true, position: [0, 0, 0] });
  }, [props.position]);

  useEffect(() => {
    api.start({ immediate: true, position: [0, 0, 0] });
  }, [currentExploration]);

  useEffect(() => {
    setCurrentExploration({ ...getRandomElement(explorationsLeft) });
  }, [explorationsLeft]);

  const halfGridSize = Math.floor(currentExploration.mask.length / 2);

  return (
    <group position={props.position}>
      {/* @ts-expect-error bind type mismatch */}
      <a.group ref={explorationGridRef} {...springPos} {...bind()}>
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
    </group>
  );
}
