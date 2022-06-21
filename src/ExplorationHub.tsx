import { useSpring, config, a } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Plane, Vector3, Vector3Tuple, Vector2Tuple, Ray, Box3, DoubleSide, Group } from 'three';

import { MainGridContext } from './MainGridContext';
import Tile from './Tile';
import { applyExploration } from './domain';
import { explorations } from './explorations';
import { TerrainType, Exploration, terrainTypeToColorMap, WrongPositioningError } from './types';
import { getRandomElement, isTouchDevice } from './utils';

const isEven = (num: number) => num % 2 === 0;

const rotate = <T,>(matrix: T[][]) => matrix[0]!.map((col, c) => matrix.map((row, r) => matrix[r]![c]!).reverse());
const rotateNTimes = <T,>(matrix: T[][], numberOfTimes = 1) => {
  const croppedNumber = numberOfTimes % 4;
  const adjustedNumber = croppedNumber < 0 ? croppedNumber + 4 : croppedNumber;

  let res = matrix;

  Array.from({ length: adjustedNumber }).forEach(() => {
    res = rotate(res);
  });

  return res;
};
const MOBILE_TOUCH_OFFSET = 5;

function adjustRayOriginForMobile(ray: Ray) {
  const newRay = ray.clone();

  if (isTouchDevice()) {
    newRay.origin.x = newRay.origin.x - MOBILE_TOUCH_OFFSET * 1.5;
    newRay.origin.z = newRay.origin.z - MOBILE_TOUCH_OFFSET;
  }

  return newRay;
}

const horizontalPlane = new Plane(new Vector3(0, 1, 0));

type ExplorationHubProps = {
  position: Vector3Tuple;
  gridCenter: Vector3;
  tiles: (TerrainType | null)[][];
  onGridDrop: (at: Vector2Tuple, exploration: Exploration) => void;
};

const defaultExplorationSpring = { position: [0, 0, 0], scale: 2, rotation: [0, 0, 0] };
export default function ExplorationHub(props: ExplorationHubProps) {
  const { mainGridRef } = useContext(MainGridContext);
  const explorationGridRef = useRef<Group>(null);

  const [isDragged, setIsDragged] = useState(false);
  const [explorationsLeft, setExplorationsLeft] = useState(() => explorations);
  const [errorMatrix, setErrorMatrix] = useState<boolean[][] | null>(null);
  const [currentExploration, setCurrentExploration] = useState<Exploration>(() => getRandomElement(explorationsLeft));
  const [rotations, setRotations] = useState(0);
  const currentRotationEulerTuple = [0, (Math.PI / 2) * rotations, 0];
  const rotatedErrorMatrix = useMemo(() => (errorMatrix ? rotateNTimes(errorMatrix, rotations * -1) : null), [errorMatrix, rotations]);
  const rotatedMask = useMemo(() => rotateNTimes(currentExploration.mask, rotations), [currentExploration.mask, rotations]);

  const [explorationSpring, explorationSpringApi] = useSpring(() => defaultExplorationSpring);
  const bind = useDrag<{ ray: Ray }>(({ down, event }) => {
    const groupOffsetVector = explorationGridRef.current!.parent!.getWorldPosition(new Vector3());
    const adjustedRay = adjustRayOriginForMobile(event.ray);

    const box = new Box3().setFromObject(mainGridRef);
    // We can't use `intersectPlane`, because planes are infinite
    const gridIntersection = adjustedRay.intersectBox(box, new Vector3());

    if (down) {
      setIsDragged(true);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().floor(), props.gridCenter);

        const updatedTiles = applyExploration([sum.x, sum.z], rotatedMask, currentExploration.type, props.tiles);

        setErrorMatrix(updatedTiles instanceof WrongPositioningError ? updatedTiles.matrix : null);
        explorationSpringApi.start({
          position: new Vector3().addVectors(gridIntersection, groupOffsetVector.negate()).floor().setY(0).toArray(),
          scale: 1,
          config: config.stiff,
        });
      } else {
        const horizontalPlaneIntesection = adjustedRay.intersectPlane(horizontalPlane, new Vector3())!;

        setErrorMatrix(null);
        explorationSpringApi.start({
          position: new Vector3().addVectors(horizontalPlaneIntesection, groupOffsetVector.negate()).setY(0).toArray(),
          scale: 1,
        });
      }
    } else {
      setIsDragged(false);
      setErrorMatrix(null);

      if (gridIntersection) {
        const sum = new Vector3().addVectors(gridIntersection.clone().floor(), props.gridCenter);
        const updatedTiles = applyExploration([sum.x, sum.z], rotatedMask, currentExploration.type, props.tiles);

        if (updatedTiles instanceof WrongPositioningError) {
          explorationSpringApi.start({ ...defaultExplorationSpring, rotation: currentRotationEulerTuple });
        } else {
          props.onGridDrop([sum.x, sum.z], { ...currentExploration, mask: rotatedMask });
          setExplorationsLeft(explorationsLeft.filter((ex) => ex.name !== currentExploration.name));
        }
      } else {
        explorationSpringApi.start({ ...defaultExplorationSpring, rotation: currentRotationEulerTuple });
      }
    }
  });

  useEffect(() => {
    explorationSpringApi.start({ immediate: true, ...defaultExplorationSpring });
  }, [props.position]);

  useEffect(() => {
    explorationSpringApi.start({ immediate: true, ...defaultExplorationSpring });
  }, [currentExploration]);

  useEffect(() => {
    setRotations(0);
    setCurrentExploration(getRandomElement(explorationsLeft));
  }, [explorationsLeft]);

  useEffect(() => {
    explorationSpringApi.start({ rotation: currentRotationEulerTuple });
  }, [rotations]);

  const halfMaskRowSize = Math.floor(currentExploration.mask.length / 2) - (isEven(currentExploration.mask.length) && !isDragged ? 0.5 : 0);
  const halfMaskColSize = Math.floor(currentExploration.mask[0]!.length / 2) - (isEven(currentExploration.mask[0]!.length) && !isDragged ? 0.5 : 0);

  return (
    <group position={props.position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[10, 0.1, 4]}
        onClick={() => {
          setRotations((prevRotations) => prevRotations + 1);
        }}
      >
        <planeBufferGeometry attach="geometry" args={[4, 4]} />
        <meshBasicMaterial attach="material" side={DoubleSide} color="coral" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[4, 0.1, 10]}
        onClick={() => {
          setRotations((prevRotations) => prevRotations - 1);
        }}
      >
        <planeBufferGeometry attach="geometry" args={[4, 4]} />
        <meshBasicMaterial attach="material" side={DoubleSide} color="lime" />
      </mesh>

      {/* @ts-expect-error bind type mismatch */}
      <a.group ref={explorationGridRef} {...explorationSpring} {...bind()}>
        {currentExploration.mask.map((row, x) =>
          row.map((hasTile, z) => {
            if (hasTile === 0) return null;

            const hasError = rotatedErrorMatrix?.[x]?.[z];

            return (
              <Tile
                key={`(${x},${z})`}
                spacing={0.1}
                wireframe={isDragged}
                color={hasError ? 'red' : terrainTypeToColorMap[currentExploration.type]}
                position={[x - halfMaskRowSize, 0.1, z - halfMaskColSize]}
              />
            );
          })
        )}
      </a.group>
    </group>
  );
}
