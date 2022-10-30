import { a, AnimatedProps } from '@react-spring/three';
import { MeshProps } from '@react-three/fiber';

type TileProps = AnimatedProps<MeshProps> & {
  spacing: number;
  color: string;
  wireframe: boolean;
};

export function Tile({ spacing, color, wireframe, ...props }: TileProps) {
  return (
    <a.mesh {...props}>
      <boxBufferGeometry attach="geometry" args={[1 - spacing, 0.1, 1 - spacing]} />
      <meshLambertMaterial attach="material" wireframe={wireframe} color={color} />
    </a.mesh>
  );
}
