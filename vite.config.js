import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  optimizeDeps: {
    entries: ['index.html', 'src/main.js'], // explicitly scan only these files for pre-bundling
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {
      ignored: ['**/Wechatsync/**', '**/dist/**', '**/dist_electron/**', '**/*.tmp/**']
    }
  }
})
