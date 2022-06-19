import { useSpring, a, AnimatedProps, config } from '@react-spring/three';
import { softShadows, OrthographicCamera, useHelper, RoundedBox } from '@react-three/drei';
import { Canvas, MeshProps, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import React, { useRef, useState } from 'react';
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
} from 'three';

softShadows();

function isTouchDevice() {
  return window.ontouchstart !== undefined;
}

function adjustRayOriginForMobile(ray: Ray) {
  const newRay = ray.clone();

  if (isTouchDevice()) {
    newRay.origin.x = newRay.origin.x - MOBILE_TOUCH_OFFSET * 2;
    newRay.origin.x = newRay.origin.x + MOBILE_TOUCH_OFFSET;
  }

  return newRay;
}

const emptyRows: (string | undefined)[][] = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => undefined));

const gridCenter = new Vector3(9, 0, 1);

export default function Scene() {
  const [tileRows, setTileRows] = useState(() => emptyRows);
  const gridRef = useRef<Mesh<BufferGeometry, Material>>(null);

  return (
    <Canvas style={{ touchAction: 'none' }}>
      <primitive object={new AxesHelper(15)} />
      <Camera />
      <Lights />
      <Grid gridRef={gridRef} rows={tileRows} position={gridCenter.clone().setY(0.2).toArray()} />
      <Ground size={tileRows.length} position={gridCenter.toArray()} />
      <Exploration
        gridRef={gridRef}
        onGridDrop={(intersectionPoint) => {
          const sum = new Vector3().addVectors(intersectionPoint.clone().round(), gridCenter);

          console.log(sum);

          const updatedTileRows = [...tileRows];

          updatedTileRows[sum.x]![sum.z] = 'green';

          setTileRows(updatedTileRows);
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

function Grid(props: { rows: (string | undefined)[][]; position: Vector3Tuple; gridRef: React.RefObject<Mesh<BufferGeometry, Material>> }) {
  const [gridX, gridY, gridZ] = props.position;
  const halfGridSize = Math.floor(props.rows.length / 2);
  const gridCenterPos: Vector3Tuple = [halfGridSize - gridX, gridY, halfGridSize - gridZ];

  return (
    <group position={gridCenterPos}>
      <mesh ref={props.gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeBufferGeometry attach="geometry" args={[props.rows.length, props.rows.length]} />
        <meshBasicMaterial attach="material" side={DoubleSide} visible={false} />
      </mesh>
      <gridHelper args={[props.rows.length, props.rows.length, 'blue', 'blue']} position={[0, 0.1, 0]} />

      {props.rows.map((row, x) =>
        row.map((tileColor, z) =>
          tileColor === undefined ? null : <Tile key={`(${x},${z})`} color={tileColor} position={[x - halfGridSize, 0.1, z - halfGridSize]} />
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

function Exploration(props: { gridRef: React.RefObject<Mesh<BufferGeometry, Material>>; onGridDrop: (intersectionPoint: Vector3) => void }) {
  // const { raycaster, camera, mouse, scene } = useThree();
  const [springPos, api] = useSpring(() => ({ position: defaultExplorationTilePosition.toArray(), visible: true }));
  const bind = useDrag(({ down, event }) => {
    // raycaster.setFromCamera(isTouchDevice() ? mouse.clone().addScalar(MOBILE_TOUCH_OFFSET) : mouse, camera);
    // const intersects = raycaster.intersectObject(props.gridRef.current!);
    // console.log(event);

    const adjustedRay = adjustRayOriginForMobile((event as unknown as { intersections: Intersection[] }).ray);

    const normal = new Vector3().set(0, 0, 1).applyQuaternion(props.gridRef.current!.quaternion);
    const gridPlane = new Plane().setFromNormalAndCoplanarPoint(normal, new Vector3().copy(props.gridRef.current!.position));

    const gridIntersection = adjustedRay.intersectPlane(gridPlane, new Vector3());

    // console.log(adjustedRay);

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
        props.onGridDrop(gridIntersection);
      } else {
        api.start({ position: defaultExplorationTilePosition.toArray() });
      }
    }
  });

  return (
    <>
      {/* @ts-expect-error bind type mismatch */}
      <Tile {...springPos} {...bind()} color="green" />
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
