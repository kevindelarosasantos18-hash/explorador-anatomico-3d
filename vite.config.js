import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  server: {
    port: 5173
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.ico', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Explorador Anatómico 3D',
        short_name: 'Anatomía 3D',
        description: 'Visor 3D interactivo del cuerpo humano: piel, músculos, esqueleto, órganos y cerebro, en versión masculina y femenina.',
        lang: 'es',
        theme_color: '#0A1018',
        background_color: '#0A1018',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Los .glb de músculos/esqueleto pesan más que el límite por
        // defecto de Workbox (2MiB) — hay que subirlo para que los
        // precachee en vez de ignorarlos silenciosamente.
        globPatterns: ['**/*.{js,css,html,glb,wasm,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ]
});
