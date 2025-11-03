import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          tensorflow: ['@tensorflow/tfjs'],
          maplibre: ['maplibre-gl'],
          chart: ['chart.js'],
        },
      },
    },
  },
})
