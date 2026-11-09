import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/assets/legacy-tools/',
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../site/assets/legacy-tools'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/legacy-tools.tsx'),
      output: {
        entryFileNames: 'legacy-tools.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'legacy-tools[extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
