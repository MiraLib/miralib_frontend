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
    coverage: {
      provider: 'v8',
      // Se mide todo src/ (también los archivos sin pruebas) para que el porcentaje sea real
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/main.jsx'],
      reporter: ['text', 'html', 'clover', 'json'],
      // Mínimos de aceptación del documento de cobertura: `npm run coverage` falla si no se cumplen
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
});
