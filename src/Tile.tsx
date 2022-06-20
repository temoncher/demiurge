import { MeshProps } from '@react-three/fiber';

export default function Tile({ spacing, color, wireframe, ...props }: { spacing: number; color: string; wireframe: boolean } & MeshProps) {
  return (
    <mesh {...props}>
      <boxBufferGeometry attach="geometry" args={[1 - spacing, 0.1, 1 - spacing]} />
      <meshLambertMaterial wireframe={wireframe} attach="material" color={color} />
    </mesh>
  );
}
