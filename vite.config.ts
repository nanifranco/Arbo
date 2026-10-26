import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// La entrada de desarrollo es dev.html (`npm run dev` → abrir /dev.html).
// `npm run build` genera un solo HTML autocontenido y lo copia como index.html
// en dist/ y en la raíz del repo, para que GitHub Pages funcione tanto en modo
// "GitHub Actions" como en modo "Deploy from a branch".
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { rollupOptions: { input: 'dev.html' } },
  server: { open: '/dev.html' },
})
