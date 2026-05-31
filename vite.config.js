import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/world-cup-simulator/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['.ngrok-free.app'],
  },
}));
