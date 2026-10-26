import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` genera un solo index.html autocontenido (útil para compartir el prototipo).
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
})
