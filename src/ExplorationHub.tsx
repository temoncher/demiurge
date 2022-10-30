import { useSpring, config, a } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import { useContext, useState, useEffect, useRef } from 'react';
import { Plane, Vector3, Vector3Tuple, Vector2Tuple, Ray, Box3, DoubleSide, Group } from 'three';

import { ExplorationView } from './ExmplorationView';
import { MainGridContext } from './MainGridContext';
import { explorations } from './explorations';
import { Exploration } from './types';
import { getRandomElement, isTouchDevice } from './utils';

const rotate = <T,>(matrix: T[][]) => matrix[0]!.map((col, c) => matrix.map((row, r) => matrix[r]![c]!).reverse());
const rotateNTimes = <T,>(matrix: T[][], numberOfTimes: number) => {
  let res = matrix;

  Array.from({ length: numberOfTimes }).forEach(() => {
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
  computeErrorsMatrix: (at: Vector2Tuple, explorationMask: Exploration['mask']) => boolean[][] | null;
  onGridDrop: (at: Vector2Tuple, exploration: Exploration) => void;
};

const defaultDragGroupSpringValues = { position: [0, 0, 0], scale: 2 };

// eslint-disable-next-line complexity
export function ExplorationHub(props: ExplorationHubProps) {
  const { mainGridRef } = useContext(MainGridContext);
  const dragGroupRef = useRef<Group>(null);
  const rotationGroupRef = useRef<Group>(null);

  const [isDragged, setIsDragged] = useState(false);
  const [explorationsLeft, setExplorationsLeft] = useState(() => explorations);
  const [errorMatrix, setErrorMatrix] = useState<boolean[][] | null>(null);
  const [currentExploration, setCurrentExploration] = useState<Exploration>(() => getRandomElement(explorationsLeft));
  const [rotations, setRotations] = useState(0);

  const adjustedNumber = rotations % 4;
  const croppedRotation = adjustedNumber < 0 ? adjustedNumber + 4 : adjustedNumber;
  const rotatedErrorMatrix = errorMatrix ? rotateNTimes(errorMatrix, 4 - croppedRotation) : null;
  const rotatedMask = rotateNTimes(currentExploration.mask, croppedRotation);

  const [dragGroupSpring, dragGroupSpringApi] = useSpring(() => defaultDragGroupSpringValues);
  const currentRotationEulerTuple = [0, (Math.PI / 2) * rotations, 0];
  const rotationGroupX = croppedRotation === 2 || croppedRotation === 3 ? 0 : 1 - rotatedMask.length;
  const rotationGroupZ = croppedRotation === 2 || croppedRotation === 1 ? 0 : 1 - rotatedMask[0]!.length;
  const defaultRotationGroupPosition = [rotationGroupX, 0, rotationGroupZ];
  const [rotationGroupSpring, rotationGroupSpringApi] = useSpring(() => ({
    rotation: [0, 0, 0],
    position: defaultRotationGroupPosition,
  }));

  // eslint-disable-next-line complexity
  const bindDrag = useDrag<{ ray: Ray }>(({ down, event }) => {
    rotationGroupSpringApi.start({ position: defaultRotationGroupPosition });

    const hubGroup = dragGroupRef.current!.parent!;
    const adjustedRay = adjustRayOriginForMobile(event.ray);

    // We can't use `intersectPlane`, because planes are infinite
    const gridIntersection = adjustedRay.intersectBox(new Box3().setFromObject(mainGridRef), new Vector3());

    setIsDragged(down);

    if (!down) setErrorMatrix(null);

    if (!gridIntersection && !down) {
      dragGroupSpringApi.start(defaultDragGroupSpringValues);
    }

    if (!gridIntersection && down) {
      const horizontalPlaneIntesection = adjustedRay.intersectPlane(horizontalPlane, new Vector3())!;

      setErrorMatrix(null);
      dragGroupSpringApi.start({
        position: hubGroup.worldToLocal(horizontalPlaneIntesection).setY(0).toArray(),
        scale: 1,
      });
    }

    if (gridIntersection) {
      const sum = new Vector3().addVectors(gridIntersection, props.gridCenter).round();
      const newErrorMatrix = props.computeErrorsMatrix([sum.x, sum.z], rotatedMask);

      if (down) {
        setErrorMatrix(newErrorMatrix);
        dragGroupSpringApi.start({
          position: hubGroup.worldToLocal(gridIntersection).round().setY(0).toArray(),
          scale: 1,
          config: config.stiff,
        });
      }

      if (!down) {
        if (newErrorMatrix) {
          dragGroupSpringApi.start(defaultDragGroupSpringValues);
        } else {
          props.onGridDrop([sum.x, sum.z], { ...currentExploration, mask: rotatedMask });
          setExplorationsLeft(explorationsLeft.filter((ex) => ex.name !== currentExploration.name));
        }
      }
    }
  });

  useEffect(() => {
    dragGroupSpringApi.start({ immediate: true, ...defaultDragGroupSpringValues });
    rotationGroupSpringApi.start({
      immediate: true,
      rotation: currentRotationEulerTuple,
      position: defaultRotationGroupPosition,
    });
  }, [props.position]);

  useEffect(() => {
    dragGroupSpringApi.start({ immediate: true, ...defaultDragGroupSpringValues });
    rotationGroupSpringApi.start({
      immediate: true,
      rotation: currentRotationEulerTuple,
      position: defaultRotationGroupPosition,
    });
  }, [currentExploration]);

  useEffect(() => {
    setRotations(0);
    setCurrentExploration(getRandomElement(explorationsLeft));
  }, [explorationsLeft]);

  useEffect(() => {
    rotationGroupSpringApi.start({
      rotation: currentRotationEulerTuple,
      position: defaultRotationGroupPosition,
    });
  }, [croppedRotation]);

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
      <a.group ref={dragGroupRef} {...dragGroupSpring} {...bindDrag()}>
        {/* @ts-expect-error bind type mismatch */}
        <ExplorationView
          ref={rotationGroupRef}
          terrainType={currentExploration.type}
          mask={currentExploration.mask}
          errorMatrix={rotatedErrorMatrix}
          wireframe={isDragged}
          {...rotationGroupSpring}
        />
      </a.group>
    </group>
  );
}
