import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // OneDrive locks atomic-write temp files (*.tmpdir) during saves, which
      // crashes chokidar's native watcher with EBUSY. Polling + ignoring the
      // temp pattern keeps the dev server alive.
      usePolling: true,
      interval: 300,
      ignored: ['**/node_modules/**', '**/.git/**', '**/*.tmpdir/**'],
    },
  },
});
