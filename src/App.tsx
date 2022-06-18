import { useEffect } from 'react';

import ReloadPrompt from './ReloadPrompt';
import Scene from './Scene';

export default function App() {
  useEffect(() => {
    console.log('v', __APP_VERSION__);
    console.log('date', '__BUILD_DATE__');
  }, []);

  return (
    <>
      <Scene />
      <ReloadPrompt />
    </>
  );
}
