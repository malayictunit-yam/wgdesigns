import { defineConfig } from '@tanstack/start/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite' // 👈 Add this import

export default defineConfig({
  vite: {
    plugins: [
      tsconfigPaths(),
      nitro({ preset: 'vercel' }) // 👈 Explicitly tell Nitro to build for Vercel
    ],
  },
})
