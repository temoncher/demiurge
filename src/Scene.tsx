import { softShadows, OrthographicCamera, useHelper } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { DirectionalLightHelper, SpotLightHelper, AxesHelper, Vector3 } from 'three';

softShadows();

export default function Scene() {
  return (
    <Canvas>
      {/* <primitive object={new AxesHelper(5)} /> */}
      <OrthographicCamera makeDefault zoom={40} />
      <Lights />
      <Box />
      <Plane />
    </Canvas>
  );
}

let output: any;

function Lights() {
  const spotLight = useRef<any>();
  const directionalLight = useRef<any>();

  // useHelper(spotLight, SpotLightHelper, 'hotpink');
  // useHelper(directionalLight, DirectionalLightHelper, 0.5, 'teal');

  useFrame(({ camera, scene }) => {
    const vec = new Vector3(5, 5, 5);

    camera.position.lerp(vec, 0.1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (!output) {
      output = 'ko';
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight ref={spotLight} position={[10, 15, 10]} angle={0.3} />
      <directionalLight ref={directionalLight} position={[10, 5, 0]} color="red" intensity={1} />
    </>
  );
}

function Box() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxBufferGeometry attach="geometry" />
      <meshLambertMaterial attach="material" color="hotpink" />
    </mesh>
  );
}

function Plane() {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <planeBufferGeometry attach="geometry" args={[5, 5]} />
      <meshLambertMaterial attach="material" color="lightblue" />
    </mesh>
  );
}
