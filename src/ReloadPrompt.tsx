import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import './ReloadPrompt.css';

// `__BUILD_DATE__` is replaced with stringified Date on build
const buildDate = '__BUILD_DATE__';
// @ts-expect-error `__RELOAD_SW__` is replaced with 'true' or 'false' on build
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const reloadSW = '__RELOAD_SW__' === 'true';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (reloadSW) {
        if (!registration) throw new Error('Missing registration');

        setInterval(() => {
          console.log('Checking for sw update');
          void registration.update();
        }, 20 * 1000 /* 20s for testing purposes */);
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        console.log('SW Registered: ' + registration);
      }
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="ReloadPrompt-container">
      {(offlineReady || needRefresh) && (
        <div className="ReloadPrompt-toast">
          <div className="ReloadPrompt-message">
            {offlineReady ? <span>App ready to work offline</span> : <span>New content available, click on reload button to update.</span>}
          </div>
          {needRefresh && (
            <button
              className="ReloadPrompt-toast-button"
              onClick={() => {
                void updateServiceWorker(true);
              }}
            >
              Reload
            </button>
          )}
          <button
            className="ReloadPrompt-toast-button"
            onClick={() => {
              close();
            }}
          >
            Close
          </button>
        </div>
      )}
      <div className="ReloadPrompt-date">{buildDate}</div>
    </div>
  );
}
