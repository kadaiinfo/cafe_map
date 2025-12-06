import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.jpg', 'logo_fill.svg'],
      manifest: {
        name: 'Cafe Map - 鹿児島ご飯屋さんマップ',
        short_name: 'Cafe Map',
        description: '鹿児島のご飯屋さんを地図で探せるアプリ',
        theme_color: 'transparent',
        background_color: '#f0ede4',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/scontent\.cdninstagram\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'instagram-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1週間
              }
            }
          }
        ]
      }
    })
  ],
})
