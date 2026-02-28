import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      include: [/\.(js|jsx|ts|tsx)$/],
      exclude: [/node_modules/],
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        numbersToExpressions: true,
        simplify: true,
        stringArray: true,
        stringArrayThreshold: 0.5,
        splitStrings: false,
        unicodeEscapeSequence: false
      }
    })
  ],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['xlsx', 'lucide-react', '@google/generative-ai'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
