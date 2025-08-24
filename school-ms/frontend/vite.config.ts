import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable JSX and TypeScript type checking
      babel: {
        plugins: []
      },
      jsxRuntime: 'automatic'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },  // Configure base path for production build to work with Spring Boot
  base: '/',
  server: {
    port: 5173, // Vite's default port
    host: true, // Listen on all network interfaces and show network URLs
    strictPort: false, // Try other ports if 5173 is taken
    open: true, // Automatically open browser
    proxy: {
      // Proxy API requests to Spring Boot backend during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
  // Do not force Content-Type headers here; let the browser set them (especially for FormData uploads)
  // If you need Accept, set it per-request in the client instead of globally at the proxy.
        // Don't rewrite the path - keep /api prefix for Spring Boot
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate source maps for production builds
    sourcemap: true,
    // Optimize chunks
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
});