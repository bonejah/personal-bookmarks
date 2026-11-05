import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts because vitest bundles its own Vite types,
// which conflict with the project's Vite 8 plugin types during `tsc -b`.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
