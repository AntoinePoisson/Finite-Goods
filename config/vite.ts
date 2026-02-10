import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function normaliseBase(value: string | undefined) {
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  root: resolve(import.meta.dirname, '../src'),
  publicDir: resolve(import.meta.dirname, '../public'),
  base: normaliseBase(process.env.PAGES_BASE_PATH),
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 4173 },
  build: {
    outDir: resolve(import.meta.dirname, '../dist'),
    emptyOutDir: true,
    target: 'es2022',
    assetsDir: 'assets',
    sourcemap: true,
    // one css file is easier to inline in postbuild, dont split it
    cssCodeSplit: false
  }
});
