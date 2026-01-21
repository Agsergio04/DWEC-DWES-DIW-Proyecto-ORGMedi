import { defineConfig } from 'vitest/config';
import angular from '@angular/build';
import path from 'path';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      exclude: [
        'node_modules/',
        'src/test.ts',
        '**/*.spec.ts',
        '**/index.ts',
      ],
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
