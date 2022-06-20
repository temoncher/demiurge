import { MeshProps } from '@react-three/fiber';

export default function Tile({ color, wireframe, ...props }: { color: string; wireframe: boolean } & MeshProps) {
  return (
    <mesh {...props}>
      <boxBufferGeometry attach="geometry" args={[0.8, 0.1, 0.8]} />
      <meshLambertMaterial wireframe={wireframe} attach="material" color={color} />
    </mesh>
  );
}
