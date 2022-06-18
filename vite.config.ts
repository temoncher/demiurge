/* eslint-disable @typescript-eslint/naming-convention */
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';
import { VitePWA, ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '/',
  includeAssets: ['favicon.svg', 'robots.txt'],
  manifest: {
    name: 'Demiurge',
    short_name: 'Demiurge',
    description: "We don't play gods here",
    theme_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png', // <== don't add slash, for testing
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png', // <== don't remove slash, for testing
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png', // <== don't add slash, for testing
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
  },
};

const replaceOptions = {
  __BUILD_DATE__: new Date().toString(),
};
const claims = process.env.CLAIMS === 'true';
const reload = process.env.RELOAD_SW === 'true';

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src';
  pwaOptions.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts';
  pwaOptions.strategies = 'injectManifest';
  (pwaOptions.manifest as Partial<ManifestOptions>).name = 'PWA Inject Manifest';
  (pwaOptions.manifest as Partial<ManifestOptions>).short_name = 'PWA Inject';
}

if (claims) pwaOptions.registerType = 'autoUpdate';

// @ts-expect-error typescript complains about adding a field, because it is not declared on `replaceOptions`
if (reload) replaceOptions.__RELOAD_SW__ = 'true';

const config: UserConfig = {
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
  plugins: [react(), tsconfigPaths(), VitePWA(pwaOptions), replace(replaceOptions)],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
};

export default config;
