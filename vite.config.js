import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Redirige las llamadas /api al backend Spring Boot (miralib_backend) en el puerto 8080.
    // Así el navegador ve todo como mismo origen y no se necesita configurar CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom', // Configura jsdom como entorno
    globals: true,        // Permite usar describe, it, expect sin importarlos cada vez
    setupFiles: './setupTests.js', // Archivo de configuración global que crearemos
  },
});
