import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Multi-page application entry points
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Add additional pages here as your app grows, e.g.:
        // about: resolve(__dirname, 'src/pages/about.html'),
        // contact: resolve(__dirname, 'src/pages/contact.html'),
      },
    },
    outDir: 'dist',
  },
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './assets'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
