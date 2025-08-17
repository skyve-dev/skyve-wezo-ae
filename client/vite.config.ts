import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use VITE_APP_BASE from environment or default to '/'
  const base = env.VITE_APP_BASE || '/'
  
  return {
    base: base.endsWith('/') ? base : `${base}/`,
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: 3001,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})