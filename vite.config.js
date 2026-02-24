import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Multi-page application entry points
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'src/pages/products.html'),
        productDetail: resolve(__dirname, 'src/pages/product-detail.html'),
        cart: resolve(__dirname, 'src/pages/cart.html'),
        checkout: resolve(__dirname, 'src/pages/checkout.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        account: resolve(__dirname, 'src/pages/account.html'),
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
