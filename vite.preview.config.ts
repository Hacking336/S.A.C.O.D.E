/**
 * Cloud-preview-only config (not part of the app). It reuses vite.config.ts and
 * merely allows this chat's *.style.dev preview hostname, which Vite's dev
 * server blocks by default. Run it with:
 *
 *   PREVIEW_HOST=<hostname> npx vite --config vite.preview.config.ts --port 3001
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    allowedHosts: process.env.PREVIEW_HOST ? [process.env.PREVIEW_HOST] : [],
  },
})
