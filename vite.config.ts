import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/google-sheets': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-sheets/, '/macros/s/AKfycbxOvY-9Zlw5pxKs5bRImqWUh0Dbd0L2FRhylVtkbcDNWfAf8YU53um8cWYfbLIR4fc/exec'),
      },
    },
  },
});
