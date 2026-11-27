import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    rollupOptions: isSsrBuild ? {} : {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        workshops: fileURLToPath(new URL('./workshops/index.html', import.meta.url)),
      },
    },
  },
}))
