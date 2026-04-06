import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('scheduler')
          ) {
            return 'vendor-react'
          }
          if (
            id.includes('@tanstack/react-query') ||
            id.includes('axios') ||
            id.includes('zustand')
          ) {
            return 'vendor-data'
          }
          if (id.includes('@dnd-kit')) {
            return 'vendor-dnd'
          }
          if (
            id.includes('recharts') ||
            id.includes('echarts') ||
            id.includes('d3-')
          ) {
            return 'vendor-chart'
          }
          return 'vendor'
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
