import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served under /apps/scale-of-everything/ when embedded on jakeparr.dev
// (see scripts/build-projects.mjs in that repo). Still works standalone at /
// for local dev via `npm run dev`.
export default defineConfig({
  base: '/apps/scale-of-everything/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
