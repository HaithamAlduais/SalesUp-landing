import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* mode 'wp' builds the WordPress-theme flavor (scripts/build-wp-theme.mjs):
   assets served from the theme directory, manifest emitted so
   functions.php can enqueue the hashed files */
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    manifest: mode === 'wp',
  },
}))
