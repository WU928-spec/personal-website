import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('gray-matter') ||
              id.includes('katex') ||
              id.includes('react-markdown') ||
              id.includes('remark-') ||
              id.includes('rehype-')
            ) {
              return 'markdown-vendor'
            }
            if (id.includes('chinese-days')) return 'calendar-vendor'
            if (id.includes('framer-motion')) return 'motion-vendor'
            if (id.includes('@supabase/supabase-js')) return 'supabase-vendor'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
