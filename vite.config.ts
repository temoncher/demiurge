import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: UserConfig = {
  plugins: [react(), tsconfigPaths()],
};

export default config;
