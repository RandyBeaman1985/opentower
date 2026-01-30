import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@simulation': resolve(__dirname, 'src/simulation'),
      '@buildings': resolve(__dirname, 'src/buildings'),
      '@transport': resolve(__dirname, 'src/transport'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@events': resolve(__dirname, 'src/events'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@rendering': resolve(__dirname, 'src/rendering'),
      '@interfaces': resolve(__dirname, 'src/interfaces'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  worker: {
    format: 'es',
  },
  server: {
    headers: {
      // Required for SharedArrayBuffer (Web Workers with shared memory)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
