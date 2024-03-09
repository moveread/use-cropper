import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/use-cropper/',
  build: {
    rollupOptions: {
      external: ['fabric'],
      output: {
        paths: {
          fabric: 'https://cdn.jsdelivr.net/npm/fabric@5.3.0/+esm'
        }
      },
    },
    },
})
