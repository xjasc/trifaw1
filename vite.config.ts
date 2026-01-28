import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        id: 'trifaw.com.br',
        name: 'TRIFAW ENGENHARIA - SGI',
        short_name: 'SGI TRIFAW',
        description: 'Sistema Integrado de Gestão - Trifaw Engenharia',
        lang: 'pt-BR',
        dir: 'ltr',
        theme_color: '#022c22',
        background_color: '#022c22',
        display: 'standalone',
        display_override: ['tabbed', 'window-controls-overlay', 'standalone', 'minimal-ui'] as any,
        categories: ['business', 'productivity', 'utilities'],
        iarc_rating_id: '',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Início',
            url: '/',
            icons: [{ src: 'https://cdn-icons-png.flaticon.com/512/3898/3898078.png', sizes: '512x512' }]
          },
          {
            name: 'Meus Projetos',
            short_name: 'Projetos',
            url: '/?view=projects',
            icons: [{ src: 'https://cdn-icons-png.flaticon.com/512/3891/3891392.png', sizes: '512x512' }]
          }
        ],
        widgets: [
          {
            name: 'Resumo TRIFAW',
            short_name: 'SGI',
            description: 'Resumo rápido de projetos ativos',
            tag: 'trifaw-summary',
            ms_ac_template: 'summary-template.json',
            data: 'summary-data.json',
            type: 'application/json',
            screenshots: [{ src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop', sizes: '400x400', type: 'image/jpeg' }]
          }
        ],
        edge_side_panel: {
          preferred_width: 400
        },
        note_taking: {
          new_note_url: '/?view=projects&action=new'
        },
        launch_handler: {
          client_mode: ['navigate-existing', 'always']
        } as any,
        share_target: {
          action: '/share',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        protocol_handlers: [
          {
            protocol: 'web+trifaw',
            url: '/?url=%s'
          }
        ],
        file_handlers: [
          {
            action: '/',
            accept: {
              'application/pdf': ['.pdf'],
              'image/*': ['.jpg', '.jpeg', '.png']
            }
          }
        ],
        scope_extensions: [
          { origin: 'https://trifaw-engenharia---sgi.web.app' },
          { origin: 'https://trifaw-engenharia---sgi.firebaseapp.com' },
          { origin: 'https://trifaw.com.br' }
        ],
        handle_links: 'auto',
        capture_links: 'none',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3898/3898078.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3898/3898078.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1280',
            sizes: '1280x853',
            type: 'image/jpeg',
            form_factor: 'wide',
            label: 'Dashboard SGI'
          },
          {
            src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=720&h=1280',
            sizes: '720x1280',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Login Mobile'
          }
        ],
        prefer_related_applications: true,
        related_applications: [
          {
            platform: 'webapp',
            url: 'https://trifaw-engenharia---sgi.web.app/manifest.json'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});