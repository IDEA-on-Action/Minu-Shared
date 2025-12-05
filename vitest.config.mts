import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    // 메모리 최적화 및 순차 실행 (OOM 및 axe 동시 실행 방지)
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true,
      },
    },
    isolate: true,
    fileParallelism: false,
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    testTimeout: 60000,
    teardownTimeout: 10000,
    // 테스트 순차 실행 (axe 동시 실행 방지)
    sequence: {
      concurrent: false,
    },
    deps: {
      optimizer: {
        web: {
          include: ['react', 'react-dom'],
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/index.ts',
        '**/*.d.ts',
        '**/types/**',
        '**/styles/**', // Tailwind 설정 파일 제외
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
