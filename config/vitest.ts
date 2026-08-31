import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(import.meta.dirname, '../tests/setup.ts')],
    include: [resolve(import.meta.dirname, '../tests/**/*.{test,spec}.{ts,tsx}')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/domain/**/*.ts']
    }
  }
});
