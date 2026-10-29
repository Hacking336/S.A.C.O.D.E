import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub project pages serve the build from /S.A.C.O.D.E/, so the production
 * bundle is built against that prefix while the dev server keeps serving from
 * the root. Set VITE_BASE=/ for a build that runs on a custom domain.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.VITE_BASE || '/S.A.C.O.D.E/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
}))
