import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  // La app se publica en https://marcos-romano.github.io/quitos-rm/
  base: '/quitos-rm/',
  plugins: [
    react(),
    VitePWA({
      // La versión nueva se aplica solo cuando el usuario toca "Actualizar" (ver UpdatePrompt).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/quitos-rm/',
        name: 'quitos_RM',
        short_name: 'quitos_RM',
        description: 'Planificación y registro de rutinas de gimnasio.',
        lang: 'es-AR',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A0B0F',
        theme_color: '#0A0B0F',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Todo lo necesario para abrir la app sin conexión, incluida la tipografía.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
})
