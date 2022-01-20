/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: { enabled: process.env.CI === 'true' },
    testTimeout: 100000,
    threads: false,
  },
});
