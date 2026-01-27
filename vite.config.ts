import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  optimizeDeps: {
    exclude: ['./services/storage.ts', 'services/storage']
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
});