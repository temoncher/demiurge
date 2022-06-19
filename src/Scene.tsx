import { useSpring, a, AnimatedProps } from '@react-spring/three';
import { softShadows, OrthographicCamera, useHelper, RoundedBox } from '@react-three/drei';
import { Canvas, MeshProps, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import React, { useRef } from 'react';
import {
  DirectionalLightHelper,
  SpotLightHelper,
  AxesHelper,
  Vector3,
  Plane,
  Ray,
  BufferGeometry,
  Mesh,
  Material,
  BoxHelper,
  SpotLight,
  DirectionalLight,
  Box3,
} from 'three';

softShadows();

const tileRows = Array.from({ length: 11 }, () => Array.from({ length: 11 }));

export default function Scene() {
  const groundRef = useRef<Mesh<BufferGeometry, Material>>(null);

  return (
    <Canvas>
      <primitive object={new AxesHelper(15)} />
      <Camera />
      <Grid rows={tileRows} offsetTop={5} offsetLeft={4} />
      <Ground ref={groundRef} size={11} offsetTop={5} offsetLeft={4} />
      <Exploration groundRef={groundRef} />
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

  return <OrthographicCamera makeDefault zoom={30} />;
}

function Grid(props: { rows: unknown[][]; offsetTop: number; offsetLeft: number }) {
  return (
    <>
      <Lights />
      {props.rows.map((row, x) =>
        row.map((und, z) => <Tile key={`(${x},${z})`} x={x} z={z} offsetTop={props.offsetTop} offsetLeft={props.offsetLeft} />)
      )}
    </>
  );
}

function Lights() {
  const spotLightRef = useRef<SpotLight>(null);
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

const defaultExplorationTilePosition = [10, 0.6, -5];

function getNewCoords(groundMesh: Mesh<BufferGeometry, Material>, ray: Ray) {
  const groundBox = new Box3().setFromObject(groundMesh);

  if (ray.intersectsBox(groundBox)) {
    const groundIntersectionVector = new Vector3();

    ray.intersectBox(groundBox, groundIntersectionVector);

    const [x, y, z] = groundIntersectionVector.toArray();

    return { x: Math.round(x), z: Math.round(z) };
  }

  const planeIntesectionVector = new Vector3();

  ray.intersectPlane(new Plane(new Vector3(0, 1, 0)), planeIntesectionVector);

  const [x, y, z] = planeIntesectionVector.toArray();

  return { x, z };
}

function Exploration({ groundRef }: { groundRef: React.MutableRefObject<Mesh<BufferGeometry, Material> | null> }) {
  const [springPos, api] = useSpring(() => ({ position: defaultExplorationTilePosition }));

  const bind = useDrag<{ ray: Ray }>(({ down, event }) => {
    const { x, z } = getNewCoords(groundRef.current!, event.ray);

    api.start({ immediate: down, position: down ? [x, 0.6, z] : defaultExplorationTilePosition });
  });

  return (
    <>
      {/* @ts-expect-error bind type mismatch */}
      <a.mesh {...springPos} {...bind()}>
        <boxBufferGeometry attach="geometry" args={[0.8, 0.1, 0.8]} />
        <meshLambertMaterial attach="material" color="green" />
      </a.mesh>
    </>
  );
}

function Tile(props: { x: number; z: number; offsetTop: number; offsetLeft: number } & Omit<AnimatedProps<MeshProps>, 'position'>) {
  const posX = props.x - props.offsetTop - props.offsetLeft;
  const posY = 0.5;
  const posZ = props.z - props.offsetTop + props.offsetLeft;

  return (
    <a.mesh position={[posX, posY, posZ]}>
      <boxBufferGeometry attach="geometry" args={[0.8, 0.1, 0.8]} />
      <meshLambertMaterial attach="material" color="hotpink" />
    </a.mesh>
  );
}

const Ground = React.forwardRef(
  (props: { size: number; offsetTop: number; offsetLeft: number }, ref: React.Ref<Mesh<BufferGeometry, Material | Material[]>>) => {
    // @ts-expect-error ref types mismatch
    useHelper(ref, BoxHelper, 'red');

    const posX = Math.floor(props.size / 2) - props.offsetTop - props.offsetLeft;
    const posY = 0;
    const posZ = Math.floor(props.size / 2) - props.offsetTop + props.offsetLeft;

    return (
      <RoundedBox ref={ref} args={[props.size, 0.5, props.size]} radius={0.1} position={[posX, posY, posZ]}>
        <meshLambertMaterial color="grey" />
      </RoundedBox>
    );
  }
);

Ground.displayName = 'Ground';
