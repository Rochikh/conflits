import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/conflits/',
  define: {
    'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(process.env.VITE_OPENROUTER_API_KEY),
  },
})
