import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'assets': path.resolve(__dirname, './src/assets'),
    },
  },
  optimizeDeps: {
    exclude: ['figma:asset'],
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'resolve-figma-assets',
          resolveId(source) {
            if (source.startsWith('figma:asset/')) {
              const file = source.replace('figma:asset/', '')
              return path.resolve(__dirname, `./src/assets/${file}`)
            }
            return null
          }
        }
      ]
    }
  }
})
