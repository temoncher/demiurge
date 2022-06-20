import React, { useState } from 'react';
import { Mesh, BufferGeometry, Material } from 'three';

export const MainGridContext = React.createContext<{
  mainGridRef: Mesh<BufferGeometry, Material>;
  setRef: (ref: Mesh<BufferGeometry, Material>) => void;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
}>(null as any);

export function MainGridContextProvider(props: { children: React.ReactNode | React.ReactNode[] }) {
  const [gridRef, setGridRef] = useState<Mesh<BufferGeometry, Material> | null>(null);

  return <MainGridContext.Provider value={{ mainGridRef: gridRef!, setRef: setGridRef }}>{props.children}</MainGridContext.Provider>;
}
