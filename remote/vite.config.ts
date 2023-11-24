/// <reference types='vitest' />
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  cacheDir: '../node_modules/.vite/remote-1',
  server: {
    port: 3001,
    host: 'localhost',
  },
  preview: {
    port: 3001,
    host: 'localhost',
  },
  plugins: [
    react(),
    federation({
      name: "remote",
      exposes: {
        './Module': join(__dirname, './src/remote-entry')
      },
      shared: ['react','react-dom']
    }),
    nxViteTsPaths(),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  test: {
    globals: true,
    cache: {
      dir: '../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
