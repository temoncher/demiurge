import { useSpring, a, AnimatedProps, config } from '@react-spring/three';
import { softShadows, OrthographicCamera, useHelper, RoundedBox } from '@react-three/drei';
import { Canvas, MeshProps, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  DirectionalLightHelper,
  SpotLightHelper,
  AxesHelper,
  Vector3,
  Plane,
  Ray,
  Mesh,
  Material,
  SpotLight,
  DirectionalLight,
  Box3,
  BufferGeometry,
  DoubleSide,
  Vector3Tuple,
  Intersection,
  Vector2Tuple,
} from 'three';

softShadows();

enum TerrainType {
  WOODS = 'WOODS',
  FIELDS = 'FIELDS',
}
type Exploration = {
  type: TerrainType;
};

const terrainTypeToColorMap = {
  [TerrainType.FIELDS]: 'yellow',
  [TerrainType.WOODS]: 'green',
};

function getRandomEnumMember<T extends string | number, TEnumValue extends string>(enumVariable: { [key in T]: TEnumValue }) {
  const enumValues = Object.values(enumVariable);

  return enumValues[Math.floor(Math.random() * enumValues.length)] as TEnumValue;
}

function isTouchDevice() {
  return window.ontouchstart !== undefined;
}

function applyExploration([rowIndex, columnIndex]: Vector2Tuple, exploration: Exploration) {
  return (tileRows: (TerrainType | undefined)[][]) => {
    const updatedTileRows = [...tileRows];

    updatedTileRows[rowIndex]![columnIndex] = exploration.type;

    return updatedTileRows;
  };
}

function adjustRayOriginForMobile(ray: Ray) {
  const newRay = ray.clone();

  if (isTouchDevice()) {
    newRay.origin.x = newRay.origin.x - MOBILE_TOUCH_OFFSET * 2;
    newRay.origin.x = newRay.origin.x + MOBILE_TOUCH_OFFSET;
  }

  return newRay;
}

const emptyRows: (TerrainType | undefined)[][] = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => undefined));

const gridCenter = new Vector3(9, 0, 1);

export default function Scene() {
  const [tileRows, setTileRows] = useState(() => emptyRows);
  const gridRef = useRef<Mesh<BufferGeometry, Material>>(null);

  return (
    <Canvas style={{ touchAction: 'none' }}>
      {/* <primitive object={new AxesHelper(15)} /> */}
      <Camera />
      <Lights />
      <Grid gridRef={gridRef} rows={tileRows} position={gridCenter.clone().setY(0.2).toArray()} />
      <Ground size={tileRows.length} position={gridCenter.toArray()} />
      <ExplorationHub
        gridRef={gridRef}
        onGridDrop={(insertAt, exploration) => {
          setTileRows(applyExploration(insertAt, exploration));
        }}
      />
    </Canvas>
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

function Grid(props: { rows: (TerrainType | undefined)[][]; position: Vector3Tuple; gridRef: React.RefObject<Mesh<BufferGeometry, Material>> }) {
  const [gridX, gridY, gridZ] = props.position;
  const halfGridSize = Math.floor(props.rows.length / 2);
  const gridCenterPos: Vector3Tuple = [halfGridSize - gridX, gridY, halfGridSize - gridZ];

  return (
    <group position={gridCenterPos}>
      <mesh ref={props.gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeBufferGeometry attach="geometry" args={[props.rows.length, props.rows.length]} />
        <meshBasicMaterial attach="material" side={DoubleSide} visible={false} />
      </mesh>
      {/* <gridHelper args={[props.rows.length, props.rows.length, 'blue', 'blue']} position={[0, 0.1, 0]} /> */}

      {props.rows.map((row, x) =>
        row.map((terrainType, z) =>
          terrainType === undefined ? null : (
            <Tile key={`(${x},${z})`} color={terrainTypeToColorMap[terrainType]} position={[x - halfGridSize, 0.1, z - halfGridSize]} />
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
const MOBILE_TOUCH_OFFSET = 2;

const horizontalPlane = new Plane(new Vector3(0, 1, 0));

type ExplorationHubProps = {
  gridRef: React.RefObject<Mesh<BufferGeometry, Material>>;
  onGridDrop: (insertAt: Vector2Tuple, exploration: Exploration) => void;
};

function ExplorationHub(props: ExplorationHubProps) {
  const [currentExploration, setCurrentExploration] = useState<Exploration>(() => ({ type: TerrainType.WOODS }));
  const [springPos, api] = useSpring(() => ({ position: defaultExplorationTilePosition.toArray(), visible: true }));
  const bind = useDrag(({ down, event }) => {
    const adjustedRay = adjustRayOriginForMobile((event as unknown as { intersections: Intersection[] }).ray);

    const box = new Box3().setFromObject(props.gridRef.current!);
    // We can't use `intersectPlane`, because planes are infinite
    const gridIntersection = adjustedRay.intersectBox(box, new Vector3());

    if (down) {
      if (gridIntersection) {
        api.start({
          position: gridIntersection.clone().round().setY(defaultExplorationTilePosition.y).toArray(),
          config: config.stiff,
        });
      } else {
        const horizontalPlaneIntesection = adjustedRay.intersectPlane(horizontalPlane, new Vector3())!;

        api.start({
          position: horizontalPlaneIntesection.clone().setY(defaultExplorationTilePosition.y).toArray(),
        });
      }
    } else {
      if (gridIntersection) {
        api.start({ visible: false });

        const sum = new Vector3().addVectors(gridIntersection.clone().round(), gridCenter);

        props.onGridDrop([sum.x, sum.z], currentExploration);
        setCurrentExploration({
          type: getRandomEnumMember(TerrainType),
        });
      } else {
        api.start({ position: defaultExplorationTilePosition.toArray() });
      }
    }
  });

  useEffect(() => {
    api.start({ immediate: true, visible: true, position: defaultExplorationTilePosition.toArray() });
  }, [currentExploration]);

  return (
    <>
      {/* @ts-expect-error bind type mismatch */}
      <Tile {...springPos} {...bind()} color={terrainTypeToColorMap[currentExploration.type]} />
    </>
  );
}

function Tile({ color, ...props }: { color: string } & AnimatedProps<MeshProps>) {
  return (
    <a.mesh {...props}>
      <boxBufferGeometry attach="geometry" args={[0.8, 0.1, 0.8]} />
      <meshLambertMaterial attach="material" color={color} />
    </a.mesh>
  );
}

const Ground = React.forwardRef(
  (props: { size: number; position: [number, number, number] }, ref: React.Ref<Mesh<BufferGeometry, Material | Material[]>>) => {
    // @ts-expect-error ref types mismatch
    // useHelper(ref, BoxHelper, 'red');

    const [gridX, gridY, gridZ] = props.position;
    const gridCenterPos: [number, number, number] = [Math.floor(props.size / 2) - gridX, gridY, Math.floor(props.size / 2) - gridZ];

    return (
      <RoundedBox ref={ref} args={[props.size, 0.5, props.size]} radius={0.1} position={gridCenterPos}>
        <meshLambertMaterial color="grey" />
      </RoundedBox>
    );
  }
);

Ground.displayName = 'Ground';
