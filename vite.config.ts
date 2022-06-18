/* eslint-disable @typescript-eslint/naming-convention */
import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
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

const config: UserConfig = {
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
  plugins: [react(), tsconfigPaths(), VitePWA(pwaOptions)],
};

export default config;
