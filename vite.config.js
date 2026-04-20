import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifestFilename: 'manifest.json',
      manifest: {
        name: '水伴 AquaMate',
        short_name: '水伴',
        description: '雙人連線喝水追蹤器',
        theme_color: '#0a1628',
        background_color: '#020d1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
                  icons: [
            { src: '/icon.svg', sizes: '192x192 512x512', type: 'image/svg+xml' },
            { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
          ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
