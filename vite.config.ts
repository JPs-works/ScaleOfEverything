import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Served under /apps/scale-of-everything/ when embedded on jakeparr.dev
// (see scripts/build-projects.mjs in that repo). Asset URLs are built from
// import.meta.env.BASE_URL, so nothing may hard-code "/models/..." paths.
export default defineConfig({
  base: '/apps/scale-of-everything/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    // The lazily loaded 3D chunk (three.js + React Three Fiber + drei) is
    // ~1 MB minified on its own and loads after the DOM shell has painted;
    // the entry chunk stays small. Raise the warning threshold accordingly.
    chunkSizeWarningLimit: 1200,
  },
});
