import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// "base" es la carpeta desde la que se sirve el sitio. En GitHub Pages el sitio
// vive en https://<usuario>.github.io/imoovie-front/, o sea dentro de una
// subcarpeta. Al compilar (build) se usa esa subcarpeta; en desarrollo (npm run
// dev) se sigue usando la raíz, así que localhost:5173 funciona igual que antes.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/imoovie-front/' : '/',
}))
