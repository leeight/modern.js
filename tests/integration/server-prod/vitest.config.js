/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: { enabled: false },
    testTimeout: 100000,
    threads: false,
  },
});
