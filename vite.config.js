import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // 相対パスで出力する。GitHub Pages のサブパス
  //   https://<ユーザー名>.github.io/benkyoujikan/
  // でも、ルート直下の公開でも、設定を変えずにそのまま動く。
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // PWA化。manifest.json と Service Worker を自動生成する。
    // vite-plugin-pwa / workbox はどちらも MIT ライセンスで無料。
    // ビルド時にファイルを吐くだけで、外部サービスへの通信も課金も発生しない。
    VitePWA({
      // 更新があっても勝手にリロードせず、画面で知らせて選んでもらう。
      // 記録の入力途中に突然リロードされるのを避けるため。
      registerType: 'prompt',
      injectRegister: null,
      manifest: {
        name: '勉強時間管理',
        short_name: '勉強時間',
        description: '日々の勉強時間を記録して可視化するアプリ',
        lang: 'ja',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        background_color: '#070b14',
        theme_color: '#070b14',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // オフラインで動かすため、ビルド成果物を一通りキャッシュする。
        // Firestore への通信はキャッシュ対象外(SDK が自前でオフライン処理する)。
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
        suppressWarnings: true,
      },
    }),
  ],
  server: {
    host: true, // 同一Wi-Fi内のスマホから開発サーバーへアクセスするため
  },
})
