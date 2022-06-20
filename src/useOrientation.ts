import pick from 'lodash/pick';
import { useState, useEffect } from 'react';

type Orientation = 'landscape' | 'portrait';
type OrientationType = `${Orientation}-${'primary' | 'secondary'}`;

interface OrientationState {
  angle: number;
  type: OrientationType;
  isLandscape: boolean;
}

const defaultState: Pick<OrientationState, 'angle' | 'type'> = {
  angle: 0,
  type: 'landscape-primary',
};

export default function useOrientation(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let mounted = true;

    const updateState = () => {
      if (!mounted) return;

      const { orientation } = window.screen;

      if (!orientation) setState(initialState);

      setState(pick(orientation, ['angle', 'type']));
    };

    window.addEventListener('orientationchange', updateState);
    updateState();

    return () => {
      mounted = false;
      window.addEventListener('orientationchange', updateState);
    };
  }, [0]);

  const isLandscape = state.type === 'landscape-primary' || state.type === 'landscape-secondary';

  return { ...state, isLandscape };
}
