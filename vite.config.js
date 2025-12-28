import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false, // Não falha se a porta estiver em uso
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})

